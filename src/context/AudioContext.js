import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import TrackPlayer, {
  useProgress,
  usePlaybackState,
  State,
  Event,
} from 'react-native-track-player';
import { initAudio, loadQueue, setRepeat, formatDuration } from '../services/audioService';
import { getTrackUrl } from '../constants/tracks';

const AudioCtx = createContext(null);

const PREVIEW_MS = 30000;

const buildRNTPItem = (track) => ({
  id: track.id,
  url: getTrackUrl(track.file),
  title: track.title,
  artist: 'AZA HOUSE',
  genre: track.category,
});

export const AudioProvider = ({ children, isSubscribed, onSubscriptionRequired, onTrackPlay }) => {
  const { position, duration } = useProgress(500); // seconds
  const playbackState = usePlaybackState();

  const isPlaying  = playbackState.state === State.Playing;
  const isLoading  = [State.Loading, State.Buffering, State.Connecting].includes(playbackState.state);

  const [currentTrack, setCurrentTrack]       = useState(null);
  const [queue, setQueue]                     = useState([]);
  const [queueIndex, setQueueIndex]           = useState(0);
  const [isRepeat, setIsRepeat]               = useState(false);
  const [isShuffle, setIsShuffle]             = useState(false);
  const [isPreviewEnded, setIsPreviewEnded]   = useState(false);
  const [error, setError]                     = useState(null);
  const [sleepTimerRemaining, setSleep]       = useState(null);

  const isSubRef     = useRef(isSubscribed);
  isSubRef.current   = isSubscribed;
  const sleepRef     = useRef(null);
  const initRef      = useRef(false);

  useEffect(() => () => { if (sleepRef.current) clearInterval(sleepRef.current); }, []);

  const positionMs = Math.round(position * 1000);
  const durationMs = Math.round(duration * 1000);

  // Preview enforcement
  useEffect(() => {
    if (!isSubRef.current && positionMs >= PREVIEW_MS && isPlaying) {
      TrackPlayer.pause();
      setIsPreviewEnded(true);
      if (onSubscriptionRequired) onSubscriptionRequired();
    }
  }, [positionMs, isPlaying]);

  // Queue-ended → auto-repeat if enabled
  useEffect(() => {
    const sub = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
      if (isRepeat && currentTrack) {
        TrackPlayer.seekTo(0).then(() => TrackPlayer.play());
      }
    });
    return () => sub.remove();
  }, [isRepeat, currentTrack]);

  const ensureInit = async () => {
    if (initRef.current) return;
    await initAudio();
    initRef.current = true;
  };

  const playTrack = useCallback(async (track, trackQueue = null) => {
    try {
      setError(null);
      setIsPreviewEnded(false);
      await ensureInit();

      const q = trackQueue || [track];
      const idx = q.findIndex(t => t.id === track.id);
      const safeIdx = idx >= 0 ? idx : 0;

      setQueue(q);
      setQueueIndex(safeIdx);
      setCurrentTrack(q[safeIdx]);

      await loadQueue(q.map(buildRNTPItem), safeIdx);

      if (onTrackPlay) onTrackPlay(track.id);
    } catch (err) {
      setError(err.message);
    }
  }, [onTrackPlay]);

  const togglePlayPause = useCallback(async () => {
    if (isPreviewEnded && !isSubRef.current) {
      if (onSubscriptionRequired) onSubscriptionRequired();
      return;
    }
    if (isPlaying) await TrackPlayer.pause();
    else await TrackPlayer.play();
  }, [isPlaying, isPreviewEnded]);

  const handleNext = useCallback(async () => {
    if (!queue.length) return;
    const nextIdx = isShuffle
      ? Math.floor(Math.random() * queue.length)
      : (queueIndex + 1) % queue.length;
    setQueueIndex(nextIdx);
    setCurrentTrack(queue[nextIdx]);
    await TrackPlayer.skip(nextIdx);
    await TrackPlayer.play();
    if (onTrackPlay) onTrackPlay(queue[nextIdx].id);
  }, [queue, queueIndex, isShuffle, onTrackPlay]);

  const handlePrev = useCallback(async () => {
    if (!queue.length) return;
    if (positionMs > 3000) { await TrackPlayer.seekTo(0); return; }
    const prevIdx = queueIndex === 0 ? queue.length - 1 : queueIndex - 1;
    setQueueIndex(prevIdx);
    setCurrentTrack(queue[prevIdx]);
    await TrackPlayer.skip(prevIdx);
    await TrackPlayer.play();
  }, [queue, queueIndex, positionMs]);

  const handleSeek = useCallback(async (millis) => {
    if (!isSubRef.current && millis > PREVIEW_MS) {
      if (onSubscriptionRequired) onSubscriptionRequired();
      return;
    }
    await TrackPlayer.seekTo(millis / 1000);
  }, []);

  const stopAudio = useCallback(async () => {
    await TrackPlayer.reset();
    setCurrentTrack(null);
    setIsPreviewEnded(false);
    cancelSleepTimer();
  }, []);

  const toggleRepeat = useCallback(() => {
    setIsRepeat(v => { setRepeat(!v); return !v; });
  }, []);

  const toggleShuffle = () => setIsShuffle(v => !v);

  const activateSleepTimer = useCallback((minutes) => {
    if (sleepRef.current) clearInterval(sleepRef.current);
    if (!minutes) { setSleep(null); return; }
    let s = minutes * 60;
    setSleep(s);
    sleepRef.current = setInterval(() => {
      s -= 1;
      if (s <= 0) {
        clearInterval(sleepRef.current);
        sleepRef.current = null;
        setSleep(null);
        TrackPlayer.pause();
      } else {
        setSleep(s);
      }
    }, 1000);
  }, []);

  const cancelSleepTimer = useCallback(() => {
    if (sleepRef.current) clearInterval(sleepRef.current);
    sleepRef.current = null;
    setSleep(null);
  }, []);

  const sleepTimerStr = sleepTimerRemaining
    ? `${Math.floor(sleepTimerRemaining / 60)}:${String(sleepTimerRemaining % 60).padStart(2, '0')}`
    : null;

  return (
    <AudioCtx.Provider value={{
      currentTrack,
      isPlaying,
      isLoading,
      positionMillis: positionMs,
      durationMillis: durationMs,
      progress: durationMs > 0 ? positionMs / durationMs : 0,
      error,
      isRepeat,
      isShuffle,
      isPreviewEnded,
      queue,
      sleepTimerRemaining,
      sleepTimerStr,
      playTrack,
      togglePlayPause,
      handleNext,
      handlePrev,
      handleSeek,
      stopAudio,
      toggleRepeat,
      toggleShuffle,
      activateSleepTimer,
      cancelSleepTimer,
      positionStr: formatDuration(positionMs),
      durationStr: formatDuration(durationMs),
      previewLimitStr: formatDuration(PREVIEW_MS),
    }}>
      {children}
    </AudioCtx.Provider>
  );
};

export const useAudio = () => {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
};
