import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dbService } from '@/lib/database';
import { Translation } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import { useHistoryStore } from '@/stores/historyStore';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Clipboard,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ITEMS_PER_PAGE = 50;

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const {
    translations,
    searchQuery,
    setTranslations,
  } = useHistoryStore();

  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load translations from database
  const loadTranslations = useCallback(
    async (reset: boolean = false) => {
      try {
        // Only set loading state when loading more (not on initial load or refresh)
        if (!reset) {
          setIsLoadingMore(true);
        }
        
        const currentOffset = reset ? 0 : offset;
        let results: Translation[];

        if (searchQuery.trim()) {
          // Search mode
          results = await dbService.searchTranslations(searchQuery, ITEMS_PER_PAGE);
          setHasMore(false); // No pagination for search
        } else {
          // Normal pagination
          results = await dbService.getTranslations(ITEMS_PER_PAGE, currentOffset);
          setHasMore(results.length === ITEMS_PER_PAGE);
        }

        if (reset) {
          setTranslations(results);
          setOffset(ITEMS_PER_PAGE);
        } else {
          // Use functional update to avoid dependency on translations
          const newTranslations = [...translations, ...results];
          setTranslations(newTranslations);
          setOffset(currentOffset + results.length);
        }
      } catch (error) {
        console.error('Error loading translations:', error);
      } finally {
        setIsLoadingMore(false);
      }
    },
    [offset, searchQuery, setTranslations, translations]
  );

  // Initial load
  useEffect(() => {
    loadTranslations(true);
  }, [loadTranslations]);

  // Refresh when screen comes into focus (e.g., after navigating from Translate tab)
  useFocusEffect(
    useCallback(() => {
      // Refresh data when screen is focused, but only if not currently loading
      if (!isLoadingMore && !isRefreshing) {
        loadTranslations(true);
      }
    }, [isLoadingMore, isRefreshing, loadTranslations])
  );

  // Load more when reaching end
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && !isRefreshing && hasMore && !searchQuery.trim()) {
      loadTranslations(false);
    }
  }, [isLoadingMore, isRefreshing, hasMore, searchQuery, loadTranslations]);

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setOffset(0);
    setHasMore(true);
    try {
      const results = await dbService.getTranslations(ITEMS_PER_PAGE, 0);
      setHasMore(results.length === ITEMS_PER_PAGE);
      setTranslations(results);
      setOffset(ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error refreshing translations:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [setTranslations]);

  // Copy to clipboard
  const handleCopy = useCallback(async (text: string, type: 'input' | 'output') => {
    try {
      await Clipboard.setString(text);
      // You could add a toast notification here
      console.log(`Copied ${type} to clipboard`);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Translation }) => {
      return (
        <View
          style={[
            styles.translationItem,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
          ]}
        >
          <View style={styles.translationContent}>
            {/* Input */}
            <View style={styles.textSection}>
              <Text style={[styles.text, { color: colors.textPrimary }]} numberOfLines={3}>
                {item.input_text}
              </Text>
            </View>

            {/* Output */}
            <View style={styles.textSection}>
              <Text style={[styles.text, { color: colors.textSecondary }]} numberOfLines={3}>
                {item.output_text}
              </Text>
            </View>

            {/* Footer with timestamp and delete */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.copyButtonSmall}
                onPress={() => handleCopy(item.output_text, 'output')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <IconSymbol name="doc.on.doc" size={12} color={colors.textTertiary} />
                <Text style={[styles.copyText, { color: colors.textTertiary }]}>Copy</Text>
              </TouchableOpacity>
              <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
                {formatRelativeTime(item.created_at)}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [isDark, colors, handleCopy]
  );

  const renderFooter = useCallback(() => {
    // Only show loading indicator when loading more (infinite scroll), not on initial load
    if (!isLoadingMore || searchQuery.trim()) {
      return null;
    }
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.tint} />
      </View>
    );
  }, [isLoadingMore, searchQuery, colors.tint]);

  const renderEmpty = useCallback(() => {
    // Don't show empty state while loading more, but show it if list is empty and not loading
    if (isLoadingMore) {
      return null;
    }
    return (
      <View style={styles.emptyContainer}>
        <IconSymbol name="clock" size={48} color={colors.textTertiary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {searchQuery.trim() ? 'No translations found' : 'No translation history yet'}
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
          {searchQuery.trim()
            ? 'Try a different search term'
            : 'Your translations will appear here'}
        </Text>
      </View>
    );
  }, [isLoadingMore, searchQuery, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Translation List */}
      <FlashList
        data={translations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        // estimatedItemSize={180}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.tint} />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: Spacing.xl,
  },
  listContent: {
    padding: Spacing.md,
    paddingTop: Spacing.xs,
  },
  translationItem: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  translationContent: {
    padding: Spacing.md,
  },
  textSection: {
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs / 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  text: {
    fontSize: FontSize.base,
    marginBottom: Spacing.xs,
  },
  copyButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs / 2,
  },
  copyText: {
    fontSize: FontSize.xs,
    marginLeft: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  timestamp: {
    fontSize: FontSize.xs,
  },
  footerLoader: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});

