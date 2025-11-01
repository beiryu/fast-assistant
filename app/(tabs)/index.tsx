import { Platform } from 'react-native';
import { TranslationPopup } from '@/components/TranslationPopup';

declare global {
  interface Window {
    electronAPI?: {
      getSetting: (key: string) => Promise<any>;
      setSetting: (key: string, value: any) => Promise<void>;
      getAllSettings: () => Promise<any>;
      platform: string;
      hideWindow: () => Promise<void>;
      onWindowVisibilityChange: (callback: (isVisible: boolean) => void) => void;
    };
  }
}

export default function HomeScreen() {
  // For desktop (Electron), show TranslationPopup directly
  // For mobile, this will be handled differently in future sprints
  const isElectron = Platform.OS === 'web' && typeof window !== 'undefined' && window.electronAPI;

  if (isElectron || Platform.OS === 'web') {
    return <TranslationPopup />;
  }

  // Mobile screens will be implemented in later sprints
  return <TranslationPopup />;
}
