import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.educational.app',
  appName: 'Educational App',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
