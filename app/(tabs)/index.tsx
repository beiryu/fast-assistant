import { TranslationPopup } from '@/components/TranslationPopup';
import { Spacing } from '@/constants/theme';
import { useIsFocused } from '@react-navigation/native';
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
  const isFocused = useIsFocused();

  return (
    <View style={styles.container}>
      {isFocused && <TranslationPopup />}
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
  },
});
