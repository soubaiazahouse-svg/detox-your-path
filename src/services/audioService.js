import { Audio } from 'expo-av';

// ─── Audio Mode Setup ────────────────────────────────────────────────────────
// CRITICAL for EAS APK: must call this before any Audio.Sound operations.
// Without this, audio silently fails on Android production builds.
export const initAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  } catch (err) {
    console.warn('[AudioService] setAudioModeAsync failed:', err);
  }
};

// ─── Sound Instance Manager ───────────────────────────────────────────────────
let _sound = null;

export const unloadCurrentSound = async () => {
  if (_sound) {
    try {
      const status = await _sound.getStatusAsync();
      if (status.isLoaded) {
        await _sound.stopAsync();
        await _sound.unloadAsync();
      }
    } catch (_) {}
    _sound = null;
  }
};

// ─── Load & Play ─────────────────────────────────────────────────────────────
export const loadAndPlayTrack = async (uri, onStatusUpdate) => {
  await unloadCurrentSound();

  const { sound } = await Audio.Sound.createAsync(
    { uri },
    {
      shouldPlay: true,
      isLooping: false,
      progressUpdateIntervalMillis: 500,
      positionMillis: 0,
    },
    onStatusUpdate
  );

  _sound = sound;
  return sound;
};

// ─── Playback Controls ────────────────────────────────────────────────────────
export const pauseSound = async () => {
  if (_sound) {
    try {
      const status = await _sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await _sound.pauseAsync();
      }
    } catch (err) {
      console.warn('[AudioService] pauseSound error:', err);
    }
  }
};

export const resumeSound = async () => {
  if (_sound) {
    try {
      const status = await _sound.getStatusAsync();
      if (status.isLoaded && !status.isPlaying) {
        await _sound.playAsync();
      }
    } catch (err) {
      console.warn('[AudioService] resumeSound error:', err);
    }
  }
};

export const seekTo = async (positionMillis) => {
  if (_sound) {
    try {
      await _sound.setPositionAsync(positionMillis);
    } catch (err) {
      console.warn('[AudioService] seekTo error:', err);
    }
  }
};

export const setVolume = async (volume) => {
  if (_sound) {
    try {
      await _sound.setVolumeAsync(volume);
    } catch (err) {
      console.warn('[AudioService] setVolume error:', err);
    }
  }
};

export const getCurrentSound = () => _sound;

// ─── Format Helpers ───────────────────────────────────────────────────────────
export const formatDuration = (millis) => {
  if (!millis || isNaN(millis)) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
