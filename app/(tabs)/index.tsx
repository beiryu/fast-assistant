import { TranslationPopup } from '@/components/TranslationPopup';
import { Platform, StyleSheet, View } from 'react-native';

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

  return (
    <View style={styles.container}>
      <TranslationPopup />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 0,
    ...(Platform.OS === 'web' && {
      // @ts-ignore - CSS for web/Electron
      background: 'transparent',
    }),
  },
});
