import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.opportunityiq.app',
  appName: 'OpportunityIQ',
  webDir: 'out',           // Next.js static export output dir

  server: {
    // For development: point to your Next.js dev server
    // Comment out for production builds
    // url: 'http://192.168.1.x:3000',
    // cleartext: true,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0A1628',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#0A1628',
      overlaysWebView: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#F59E0B',
      sound: 'beep.wav',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },

  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: true,
    backgroundColor: '#0A1628',
    preferredContentMode: 'mobile',
  },

  android: {
    allowMixedContent: false,
    backgroundColor: '#0A1628',
    captureInput: true,
    webContentsDebuggingEnabled: false, // set true during development
  },
};

export default config;
