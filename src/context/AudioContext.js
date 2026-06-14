import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  loadAndPlayTrack,
  pauseSound,
  resumeSound,
  seekTo,
  unloadCurrentSound,
  initAudio,
  formatDuration,
} from '../services/audioService';
import { getTrackUrl } from '../constants/tracks';

const AudioContext = createContext(null);

const PREVIEW_LIMIT_MS = 30000; // 30 seconds free preview

export const AudioProvider = ({ children, isSubscribed, onSubscriptionRequired }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [error, setError] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isPreviewEnded, setIsPreviewEnded] = useState(false);

  const audioInitRef = useRef(false);
  const isSubscribedRef = useRef(isSubscribed);
  isSubscribedRef.current = isSubscribed;

  const ensureAudioInit = async () => {
    if (!audioInitRef.current) {
      await initAudio();
      audioInitRef.current = true;
    }
  };

  const onPlaybackStatusUpdate = useCallback((status) => {
    if (!status.isLoaded) {
      if (status.error) {
        setError(status.error);
        setIsPlaying(false);
        setIsLoading(false);
      }
      return;
    }

    setIsPlaying(status.isPlaying);
    setIsLoading(status.isBuffering);
    setPositionMillis(status.positionMillis ?? 0);
    setDurationMillis(status.durationMillis ?? 0);
    setError(null);

    // Enforce 30-second preview for non-subscribers
    if (!isSubscribedRef.current && status.positionMillis >= PREVIEW_LIMIT_MS && status.isPlaying) {
      pauseSound();
      setIsPreviewEnded(true);
      if (onSubscriptionRequired) onSubscriptionRequired();
      return;
    }

    if (status.didJustFinish) {
      if (isRepeat) {
        seekTo(0);
      } else {
        handleNext();
      }
    }
  }, [isRepeat, queueIndex, queue]);

  const playTrack = useCallback(async (track, trackQueue = null) => {
    try {
      setError(null);
      setIsLoading(true);
      setIsPreviewEnded(false);
      setCurrentTrack(track);

      if (trackQueue) {
        setQueue(trackQueue);
        const idx = trackQueue.findIndex((t) => t.id === track.id);
        setQueueIndex(idx >= 0 ? idx : 0);
      }

      await ensureAudioInit();
      const uri = getTrackUrl(track.file);
      await loadAndPlayTrack(uri, onPlaybackStatusUpdate);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [onPlaybackStatusUpdate]);

  const togglePlayPause = useCallback(async () => {
    if (isPreviewEnded && !isSubscribedRef.current) {
      if (onSubscriptionRequired) onSubscriptionRequired();
      return;
    }
    if (isPlaying) {
      await pauseSound();
    } else {
      await resumeSound();
    }
  }, [isPlaying, isPreviewEnded]);

  const handleNext = useCallback(async () => {
    if (!queue.length) return;
    let nextIdx;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = (queueIndex + 1) % queue.length;
    }
    const nextTrack = queue[nextIdx];
    if (nextTrack) {
      setQueueIndex(nextIdx);
      await playTrack(nextTrack, queue);
    }
  }, [queue, queueIndex, isShuffle, playTrack]);

  const handlePrev = useCallback(async () => {
    if (!queue.length) return;
    if (positionMillis > 3000) {
      await seekTo(0);
      return;
    }
    const prevIdx = queueIndex === 0 ? queue.length - 1 : queueIndex - 1;
    const prevTrack = queue[prevIdx];
    if (prevTrack) {
      setQueueIndex(prevIdx);
      await playTrack(prevTrack, queue);
    }
  }, [queue, queueIndex, positionMillis, playTrack]);

  const handleSeek = useCallback(async (millis) => {
    if (!isSubscribedRef.current && millis > PREVIEW_LIMIT_MS) {
      if (onSubscriptionRequired) onSubscriptionRequired();
      return;
    }
    await seekTo(millis);
    setPositionMillis(millis);
  }, []);

  const stopAudio = useCallback(async () => {
    await unloadCurrentSound();
    setCurrentTrack(null);
    setIsPlaying(false);
    setPositionMillis(0);
    setDurationMillis(0);
    setIsPreviewEnded(false);
  }, []);

  const toggleRepeat = () => setIsRepeat((v) => !v);
  const toggleShuffle = () => setIsShuffle((v) => !v);

  const progress = durationMillis > 0 ? positionMillis / durationMillis : 0;

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        positionMillis,
        durationMillis,
        progress,
        error,
        isRepeat,
        isShuffle,
        isPreviewEnded,
        queue,
        playTrack,
        togglePlayPause,
        handleNext,
        handlePrev,
        handleSeek,
        stopAudio,
        toggleRepeat,
        toggleShuffle,
        positionStr: formatDuration(positionMillis),
        durationStr: formatDuration(durationMillis),
        previewLimitStr: formatDuration(PREVIEW_LIMIT_MS),
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
};
