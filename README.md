# Student Mobile App

react-native application for Student Marketplace.

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run the App**
   ```bash
   npx expo start
   ```
   *Note: Since this app uses Native Modules (Radar, SecureStore), it may not work fully in Expo Go.*

## Development Build (Recommended)
This app uses `react-native-radar` which requires native code.

1. **Prebuild**
   ```bash
   npx expo prebuild
   ```

2. **Run on Android/iOS**
   ```bash
   npx expo run:android
   # or
   npx expo run:ios
   ```

## Environment
Create `.env` file with:
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=...
EXPO_PUBLIC_RADAR_PUBLISHABLE_KEY=...
EXPO_PUBLIC_API_URL=http://your-machine-ip:3000
```
