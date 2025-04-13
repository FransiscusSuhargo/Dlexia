import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ionic-app-base',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
