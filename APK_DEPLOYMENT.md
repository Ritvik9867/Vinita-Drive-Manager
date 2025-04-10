# Converting Web App to Android APK

## Prerequisites
1. Install Android Studio
2. Install Java Development Kit (JDK)
3. Set up Android SDK

## Setup Capacitor

1. Install Capacitor dependencies:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

2. Initialize Capacitor in your project:
```bash
npx cap init "Driver Management System" "com.dms.app" --web-dir="dist"
```

3. Add Android platform:
```bash
npx cap add android
```

## Configure Android Settings

1. Update capacitor.config.ts:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dms.app',
  appName: 'Driver Management System',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: 'release-key.keystore',
      keystorePassword: 'your-keystore-password',
      keystoreAlias: 'release-key-alias',
      keystoreAliasPassword: 'your-alias-password'
    }
  }
};

export default config;
```

2. Update vite.config.js to ensure proper build:
```javascript
export default defineConfig({
  // ... existing config
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

## Build and Generate APK

1. Build your web app:
```bash
npm run build
```

2. Sync web code to Android:
```bash
npx cap sync android
```

3. Open Android Studio:
```bash
npx cap open android
```

4. Generate Debug APK:
- In Android Studio, go to Build > Build Bundle(s) / APK(s) > Build APK(s)
- The APK will be generated in `android/app/build/outputs/apk/debug/`

5. Generate Release APK:
- Create a keystore:
```bash
keytool -genkey -v -keystore release-key.keystore -alias release-key-alias -keyalg RSA -keysize 2048 -validity 10000
```
- In Android Studio, go to Build > Generate Signed Bundle / APK
- Choose APK and follow the signing process
- The signed APK will be in `android/app/build/outputs/apk/release/`

## Testing the APK

1. Install on Android device:
- Enable "Unknown sources" in device settings
- Transfer and install the APK

2. Test functionality:
- Verify all features work offline
- Test Google Apps Script integration
- Check native device features

## Troubleshooting

1. Build Issues:
- Clean project in Android Studio
- Delete android/app/build folder
- Run `npx cap sync` again

2. Runtime Issues:
- Check Android Logcat for errors
- Verify all permissions in AndroidManifest.xml
- Test network connectivity

3. Performance Issues:
- Enable ProGuard for release builds
- Optimize image assets
- Implement lazy loading

## Distribution

1. Google Play Store:
- Create Developer account
- Follow Play Console submission guidelines
- Submit signed APK/Bundle

2. Alternative Distribution:
- Host APK on your website
- Use enterprise distribution
- Implement auto-updates