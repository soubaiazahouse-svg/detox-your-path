import TrackPlayer, {
  Capability,
  AppKilledPlaybackBehavior,
  RepeatMode,
} from 'react-native-track-player';

let _ready = false;

export const initAudio = async () => {
  if (_ready) return;
  try {
    await TrackPlayer.setupPlayer({ autoHandleInterruptions: true });
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.Stop,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
      progressUpdateEventInterval: 0.5,
    });
    _ready = true;
  } catch (err) {
    // setupPlayer throws if called more than once — safe to ignore
    _ready = true;
  }
};

export const loadQueue = async (tracks, startIndex = 0) => {
  await TrackPlayer.reset();
  await TrackPlayer.add(tracks);
  if (startIndex > 0) await TrackPlayer.skip(startIndex);
  await TrackPlayer.play();
};

export const setRepeat = (on) =>
  TrackPlayer.setRepeatMode(on ? RepeatMode.Track : RepeatMode.Off);

export const formatDuration = (millis) => {
  if (!millis || isNaN(millis)) return '0:00';
  const s = Math.floor(millis / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
