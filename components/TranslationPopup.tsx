import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Platform,
  Keyboard,
} from 'react-native';
import { useTranslationStore } from '@/stores/translationStore';

interface TranslationPopupProps {
  onClose?: () => void;
}

const MAX_CHARACTERS = 500;
const MIN_INPUT_HEIGHT = 100;
const MAX_INPUT_HEIGHT = 240; // Approximately 10 lines (20px per line + padding)
const LINE_HEIGHT = 24;

export const TranslationPopup: React.FC<TranslationPopupProps> = ({ onClose }) => {
  const inputRef = useRef<TextInput>(null);
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);
  const { 
    currentInput, 
    currentOutput, 
    isLoading, 
    error,
    setInput, 
    setOutput, 
    setLoading,
    setError,
    reset 
  } = useTranslationStore();

  // Auto-focus input when component mounts
  useEffect(() => {
    // Small delay to ensure window is fully visible
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(focusTimer);
  }, []);

  // Handle window visibility changes (when shown via hotkey)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.electronAPI) {
      // Listen to Electron window visibility changes
      const handleVisibilityChange = (isVisible: boolean) => {
        if (isVisible) {
          // Window just became visible - focus input after a brief delay
          setTimeout(() => {
            inputRef.current?.focus();
          }, 50);
        }
      };

      window.electronAPI.onWindowVisibilityChange(handleVisibilityChange);

      // Also handle window focus events as fallback
      const handleFocus = () => {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      };

      window.addEventListener('focus', handleFocus);
      
      return () => {
        window.removeEventListener('focus', handleFocus);
        // Note: Electron IPC listeners need to be cleaned up via removeListener
        // but the contextBridge handles this automatically
      };
    }
  }, []);

  const handleTranslate = async () => {
    if (!currentInput.trim()) return;
    
    setLoading(true);
    setError(null);
    
    // TODO: Implement translation API call in US-1.3
    // For now, just show placeholder
    setTimeout(() => {
      setOutput('Translation will be implemented in US-1.3');
      setLoading(false);
    }, 500);
  };

  const handleCopy = async () => {
    if (!currentOutput || Platform.OS === 'web') {
      if (Platform.OS === 'web' && currentOutput) {
        await navigator.clipboard.writeText(currentOutput);
        // TODO: Show toast notification
      }
    }
    // TODO: Implement clipboard for mobile in future
  };

  const handleClose = () => {
    Keyboard.dismiss();
    
    // If in Electron, hide the window via IPC
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.hideWindow();
    } else {
      onClose?.();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.popup}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>QuickTranslate</Text>
          {onClose && (
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Type mixed Vietnamese-English..."
            placeholderTextColor="#9CA3AF"
            value={currentInput}
            onChangeText={setInput}
            multiline
            autoFocus
            autoCapitalize="sentences"
            autoCorrect={true}
            textAlignVertical="top"
            maxLength={500}
          />
          {currentInput.length > 0 && (
            <TouchableOpacity 
              onPress={() => setInput('')} 
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Translate Button */}
        <TouchableOpacity
          onPress={handleTranslate}
          disabled={isLoading || !currentInput.trim()}
          style={[
            styles.translateButton,
            (isLoading || !currentInput.trim()) && styles.translateButtonDisabled
          ]}
        >
          <Text style={styles.translateButtonText}>
            {isLoading ? 'Translating...' : 'Translate'}
          </Text>
        </TouchableOpacity>

        {/* Output Section */}
        {currentOutput && (
          <View style={styles.outputSection}>
            <View style={styles.outputHeader}>
              <Text style={styles.outputLabel}>Translation:</Text>
              <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
                <Text style={styles.copyButtonText}>📋 Copy</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.outputContainer}>
              <Text style={styles.outputText}>{currentOutput}</Text>
            </View>
          </View>
        )}

        {/* Footer Hint */}
        <Text style={styles.footerHint}>
          {Platform.OS === 'web' && typeof window !== 'undefined' && window.electronAPI
            ? 'Press Cmd/Ctrl+Shift+T to toggle'
            : 'Press Esc to close'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popup: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    minHeight: 100,
    maxHeight: 200,
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    color: '#6B7280',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  translateButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  translateButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  translateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  outputSection: {
    marginBottom: 12,
  },
  outputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  outputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  copyButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  copyButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  outputContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
  },
  outputText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
  },
  footerHint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});

