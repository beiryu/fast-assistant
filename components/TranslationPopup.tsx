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
import { translationEngine, TranslationError } from '@/lib/translationEngine';

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

  // Reset input height when input is cleared
  useEffect(() => {
    if (currentInput.length === 0) {
      setInputHeight(MIN_INPUT_HEIGHT);
    }
  }, [currentInput]);

  // Keyboard shortcut: Enter to translate (Cmd/Ctrl+Enter)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Cmd/Ctrl + Enter to translate
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          e.preventDefault();
          if (!isLoading && currentInput.trim()) {
            // Call translate function
            const inputText = currentInput.trim();
            if (inputText) {
              setLoading(true);
              setError(null);
              setOutput('');
              
              translationEngine.translate(inputText)
                .then(result => {
                  setOutput(result.output);
                  setLoading(false);
                })
                .catch(err => {
                  setLoading(false);
                  if (err instanceof TranslationError) {
                    let errorMessage = err.message;
                    if (err.retryable) {
                      errorMessage += ' You can try again in a moment.';
                    }
                    setError(errorMessage);
                  } else {
                    setError(err.message || 'Translation failed. Please try again.');
                  }
                });
            }
          }
        }
        // Escape to clear error or close
        if (e.key === 'Escape') {
          if (error) {
            setError(null);
          } else if (Platform.OS === 'web' && typeof window !== 'undefined' && window.electronAPI) {
            window.electronAPI.hideWindow();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isLoading, currentInput, error, setLoading, setError, setOutput]);

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

  const handleInputChange = (text: string) => {
    // Enforce character limit
    if (text.length <= MAX_CHARACTERS) {
      setInput(text);
    } else {
      // If user tries to paste text exceeding limit, truncate it
      const truncated = text.substring(0, MAX_CHARACTERS);
      setInput(truncated);
      setError(`Character limit reached. Maximum ${MAX_CHARACTERS} characters allowed.`);
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    // Calculate height based on content
    // Add padding (12 top + 12 bottom = 24) and some extra for better UX
    // Limit to MAX_INPUT_HEIGHT (approximately 10 lines)
    const contentHeight = height;
    const padding = 24; // 12px top + 12px bottom
    const newHeight = Math.max(
      MIN_INPUT_HEIGHT,
      Math.min(MAX_INPUT_HEIGHT, contentHeight + padding)
    );
    setInputHeight(newHeight);
  };

  const handleTranslate = async () => {
    const inputText = currentInput.trim();
    if (!inputText) {
      setError('Please enter some text to translate');
      return;
    }
    
    setLoading(true);
    setError(null);
    setOutput(''); // Clear previous output
    
    try {
      const result = await translationEngine.translate(inputText);
      
      // Check if result was cached
      if (result.cached) {
        console.log('Translation served from cache');
      }
      
      // Update output with translation
      setOutput(result.output);
      setLoading(false);
    } catch (error) {
      console.error('Translation error:', error);
      setLoading(false);
      
      // Handle different error types with user-friendly messages
      if (error instanceof TranslationError) {
        let errorMessage = error.message;
        
        // Add retry suggestion for retryable errors
        if (error.retryable) {
          errorMessage += ' You can try again in a moment.';
        }
        
        setError(errorMessage);
      } else if (error instanceof Error) {
        setError(error.message || 'Translation failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
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
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { height: inputHeight }]}
              placeholder="Type your message in Vietnamese, English, or mixed... (e.g., Tôi muốn confirm về meeting tomorrow)"
              placeholderTextColor="#9CA3AF"
              value={currentInput}
              onChangeText={handleInputChange}
              onContentSizeChange={handleContentSizeChange}
              multiline
              autoFocus
              autoCapitalize="sentences"
              autoCorrect={true}
              textAlignVertical="top"
              maxLength={MAX_CHARACTERS}
              // Ensure proper handling of Vietnamese characters
              keyboardType="default"
            />
            {currentInput.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  setInput('');
                  setInputHeight(MIN_INPUT_HEIGHT);
                }} 
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          {/* Character Counter */}
          <View style={styles.characterCounterWrapper}>
            <Text 
              style={[
                styles.characterCounter,
                currentInput.length >= MAX_CHARACTERS && styles.characterCounterWarning,
                currentInput.length > MAX_CHARACTERS * 0.9 && styles.characterCounterNearLimit
              ]}
            >
              {currentInput.length} / {MAX_CHARACTERS} characters
              {currentInput.length > 0 && (
                <Text style={styles.characterCounterRemaining}>
                  {' '}({MAX_CHARACTERS - currentInput.length} remaining)
                </Text>
              )}
            </Text>
          </View>
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

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingSpinner} />
            <Text style={styles.loadingText}>Translating your text...</Text>
          </View>
        )}

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
            ? 'Press Cmd/Ctrl+Shift+T to toggle • Cmd/Ctrl+Enter to translate'
            : 'Press Esc to close • Cmd/Ctrl+Enter to translate'}
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
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    lineHeight: LINE_HEIGHT,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    minHeight: MIN_INPUT_HEIGHT,
    maxHeight: MAX_INPUT_HEIGHT,
  },
  characterCounterWrapper: {
    marginTop: 6,
    alignItems: 'flex-end',
  },
  characterCounter: {
    fontSize: 12,
    color: '#6B7280',
  },
  characterCounterNearLimit: {
    color: '#F59E0B', // Amber for warning
  },
  characterCounterWarning: {
    color: '#DC2626', // Red for limit reached
    fontWeight: '600',
  },
  characterCounterRemaining: {
    fontSize: 11,
    color: '#9CA3AF',
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderTopColor: '#2563EB',
    borderRadius: 8,
    marginRight: 8,
    // Animation will be handled by platform (web has CSS animation)
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

