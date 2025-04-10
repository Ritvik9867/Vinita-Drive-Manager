import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dms.app',
  appName: 'Driver Management System',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'release-key.keystore',
      keystorePassword: 'dms123456',
      keystoreAlias: 'release-key-alias',
      keystoreAliasPassword: 'dms123456'
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP'
    }
  }
};

export default config;