// Global type declarations for Electron API exposed via preload script

interface ElectronAPI {
  getSetting: (key: string) => Promise<any>;
  setSetting: (key: string, value: any) => Promise<void>;
  getAllSettings: () => Promise<any>;
  platform: string;
  hideWindow: () => Promise<void>;
  onWindowVisibilityChange: (callback: (isVisible: boolean) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export { };

