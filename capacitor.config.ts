import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ionic-app-base',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  },
  server: {
    androidScheme: 'https',
    allowNavigation: ['*'] // Add this line
  },
  android: {
    allowMixedContent: true // Add this line
  }
};

export default config;
