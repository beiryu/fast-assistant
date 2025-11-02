import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, FontSize, FontWeight, LineHeight, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { translationEngine, TranslationError } from '@/lib/translationEngine';
import { useTranslationStore } from '@/stores/translationStore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Clipboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface TranslationPopupProps {
  onClose?: () => void;
}

const MAX_CHARACTERS = 500;
const INPUT_HEIGHT = 36; // Single line input height - reduced

export const TranslationPopup: React.FC<TranslationPopupProps> = ({ onClose }) => {
  const colorScheme = useColorScheme();
  // Better dark mode detection for web/Electron - check system preference
  const [isDark, setIsDark] = useState(colorScheme === 'dark');
  
  // Detect system dark mode preference on web/Electron
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
      
      // Set initial value
      setIsDark(mediaQuery.matches || colorScheme === 'dark');
      
      // Listen for changes (modern browsers)
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    } else {
      setIsDark(colorScheme === 'dark');
    }
  }, [colorScheme]);
  
  const colors = Colors[isDark ? 'dark' : 'light'];
  
  const inputRef = useRef<TextInput>(null);
  
  const { 
    currentInput, 
    currentOutput, 
    isLoading, 
    error,
    setInput, 
    setOutput, 
    setLoading,
    setError,
  } = useTranslationStore();

  // Auto-focus input when component mounts
  useEffect(() => {
    // Small delay to ensure window is fully visible
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(focusTimer);
  }, []);


  const handleCopy = useCallback(async () => {
    if (!currentOutput) return;

    try {
      if (Platform.OS === 'web') {
        // Web platform: use Clipboard API
        await navigator.clipboard.writeText(currentOutput);
      } else {
        // Mobile platform: use React Native Clipboard
        Clipboard.setString(currentOutput);
      }
      
      // Copy successful - no notification
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setError('Failed to copy to clipboard. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  }, [currentOutput, setError]);


  // Keyboard shortcuts: Enter to translate, Cmd/Ctrl+C to copy
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
        // Cmd/Ctrl + C to copy (only when output exists and not typing in input)
        if ((e.metaKey || e.ctrlKey) && e.key === 'c' && currentOutput && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleCopy();
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
  }, [isLoading, currentInput, currentOutput, error, setLoading, setError, setOutput, handleCopy]);

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


  const handleTranslate = async () => {
    const inputText = currentInput.trim();
    if (!inputText) {
      setError('Please enter some text to translate');
      return;
    }
    
    setLoading(true);
    setError(null);
    setOutput(''); // Clear previous output (US-1.4: clears when new input entered)
    
    try {
      const result = await translationEngine.translate(inputText);
      
      // Check if result was cached
      if (result.cached) {
        console.log('Translation served from cache');
      }
      
      // Update output with translation
      setOutput(result.output);
      setLoading(false);

      // Note: Translation is already saved to DB by translationEngine
      // We just need to refresh the history list, which happens automatically
      // when the screen is focused (via useFocusEffect in history.tsx)
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


  return (
    <View 
      style={[
        styles.popup, 
        { 
          backgroundColor: isDark 
            ? 'rgba(30, 30, 35, 0.85)' 
            : 'rgba(255, 255, 255, 0.9)',
          borderWidth: 1,
          borderColor: isDark 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)',
          ...(Platform.OS === 'web' && {
            // @ts-ignore - CSS backdrop-filter for macOS glass effect
            backdropFilter: 'blur(0px) saturate(200%)',
            WebkitBackdropFilter: 'blur(60px) saturate(200%)',
          }),
        }, 
        Shadows.lg
      ]}
    >
        {/* Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={[
                styles.input, 
                { 
                  borderColor: isDark 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'rgba(0, 0, 0, 0.1)',
                  color: colors.textPrimary,
                }
              ]}
              placeholder="Enter text to translate..."
              placeholderTextColor={colors.textTertiary}
              value={currentInput}
              onChangeText={handleInputChange}
              onSubmitEditing={handleTranslate}
              returnKeyType="send"
              autoFocus
              autoCapitalize="sentences"
              autoCorrect={true}
              maxLength={MAX_CHARACTERS}
              keyboardType="default"
            />
            <TouchableOpacity
              onPress={handleTranslate}
              disabled={isLoading || !currentInput.trim()}
              style={[
                styles.sendButton,
                { 
                  marginLeft: Spacing.sm,
                }
              ]}
              activeOpacity={0.8}
            >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <IconSymbol 
                name="paperplane.fill" 
                size={16} 
                color={!currentInput.trim() ? colors.textTertiary : colors.primary} 
              />
            )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Display */}
        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2', borderColor: colors.error }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : null}

        {/* Output Section - Simple text display */}
        {currentOutput ? (
          <View style={styles.outputSection}>
            <View style={styles.outputHeader}>
              <View style={[
                styles.outputTextContainer, 
                { 
                  borderColor: isDark 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'rgba(0, 0, 0, 0.1)',
                }
              ]}>
                <Text style={[styles.outputText, { color: colors.textSecondary }]} selectable>
                  {currentOutput}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={handleCopy} 
                style={[
                  styles.copyButton,
                  { 
                    marginLeft: Spacing.xs,
                  }
                ]}
                activeOpacity={0.8}
              >
              <IconSymbol 
                name="doc.on.doc" 
                size={16} 
                color={colors.textSecondary} 
              />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Footer Hint */}
        <Text style={[styles.footerHint, { color: colors.textTertiary }]}>
          Cmd/Ctrl+Enter to translate • Cmd/Ctrl+C to copy
        </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  popup: {
    width: '100%',
    maxWidth: 520,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    margin: 0,
    marginBottom: 0,
    alignSelf: 'center',
    ...Shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 0,
    minHeight: 24,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.xxl * LineHeight.tight,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
  },
  inputSection: {
    marginBottom: 0,
    marginTop: 0,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * LineHeight.tight,
    height: INPUT_HEIGHT,
    backgroundColor: 'transparent',
  },
  sendButton: {
    width: INPUT_HEIGHT,
    height: INPUT_HEIGHT,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterCounterWrapper: {
    marginTop: 2,
    alignItems: 'flex-end',
  },
  characterCounter: {
    fontSize: 10,
  },
  errorContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  errorText: {
    fontSize: FontSize.xs,
  },
  outputSection: {
    marginBottom: 0,
    marginTop: Spacing.sm,
  },
  outputHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  outputTextContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    backgroundColor: 'transparent',
  },
  outputText: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * LineHeight.tight,
  },
  copyButton: {
    width: INPUT_HEIGHT,
    height: INPUT_HEIGHT,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  footerHint: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: Spacing.xs,
    opacity: 0.7,
  },
});

