# AZA — Sound Healing App Setup Guide

## Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Expo account: `azasou86`

## 1. Install Dependencies
```bash
npm install
```

## 2. Configure Supabase

Get your credentials from https://app.supabase.com → Settings → API

Edit `src/constants/config.js`:
```js
export const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### Supabase Auth Setup
In your Supabase dashboard:
1. Go to Authentication → Settings
2. Enable Email/Password sign-in
3. (Optional) Disable email confirmation for testing

## 3. EAS Login & Build APK

```bash
# Login to Expo
eas login  # use credentials: azasou86

# Set EAS project (run once)
eas init --id YOUR_EAS_PROJECT_ID

# Build APK (preview = internal APK)
eas build -p android --profile preview

# Or production APK:
eas build -p android --profile production
```

## 4. Audio Playback Fix (Already Applied)

The audio fix for EAS APK is implemented in:
- `app.json` — expo-av plugin + Android permissions
- `src/services/audioService.js` — `Audio.setAudioModeAsync()` called before playback
- `src/context/AudioContext.js` — proper sound lifecycle management

Key fix in `audioService.js`:
```js
await Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: true,
  playsInSilentModeIOS: true,
  interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
  interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
});
```

Key fix in `app.json`:
```json
"plugins": [["expo-av", { "microphonePermission": "..." }]],
"android": {
  "permissions": ["RECORD_AUDIO", "MODIFY_AUDIO_SETTINGS", "FOREGROUND_SERVICE"]
}
```

## 5. Audio Tracks on Cloudflare R2

Base URL: `https://pub-296ac8e5f201453fbddfdbd8902dad2f.r2.dev/`

Files expected:
- drift.mp3, joy.mp3, reset.mp3, for-love.mp3, deep-focus.mp3
- back-to-center.mp3, quietly.mp3, creative-space.mp3, deep-peace.mp3, this-moment.mp3

## 6. Bilingual Support

The app supports Arabic (RTL) and English. Language can be switched in Settings.
All strings are in `src/constants/strings.js`.

## App Screens
- Onboarding (3 slides) → Auth (Login/Signup) → Main App
- Home, Music (search/filter), Meditate (breath timer), Settings
- Full Player, Mini Player (persistent), Subscription, Legal (Terms/Privacy)

## Rights
© AZA HOUSE COMPANY — All rights reserved.
