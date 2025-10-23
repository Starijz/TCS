import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.teamsorter.app',
  appName: 'Team Color Sorter',
  webDir: 'www',
  // Fix: Removed deprecated 'bundledWebRuntime' property which is no longer in CapacitorConfig.
};

export default config;
