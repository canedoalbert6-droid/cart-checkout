import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet, FlatList, Image, TouchableOpacity,
  Pressable, View, ActivityIndicator, Text, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DocumentSnapshot } from 'firebase/firestore';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useCart } from '@/src/context/CartContext';
import { fetchProducts, fetchMoreProducts } from '@/src/services/productsApi';
import { Product } from '@/src/types';

const { width } = Dimensions.get('window');

// --- Skeleton card for loading state ---
function SkeletonCard() {
  return (
    <View style={[styles.cardContainer, { flex: 0.5 }]}>
      <View style={styles.card}>
        <View style={[styles.image, { backgroundColor: '#E2E8F0' }]} />
        <View style={{ padding: 12, gap: 8 }}>
          <View style={{ height: 14, backgroundColor: '#E2E8F0', borderRadius: 6, width: '70%' }} />
          <View style={{ height: 18, backgroundColor: '#E2E8F0', borderRadius: 6, width: '40%' }} />
          <View style={{ height: 38, backgroundColor: '#E2E8F0', borderRadius: 14 }} />
        </View>
      </View>
    </View>
  );
}

// --- Product Card ---
function ProductCard({ item, index }: { item: Product; index: number }) {
  const { addItem, items } = useCart();
  const router = useRouter();
  const scale = useSharedValue(1);
  const cartItem = items.find(i => i.product_id === item.id);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 80)} style={styles.cardContainer}>
      <Animated.View style={animatedStyle}>
        <Pressable
          onPressIn={() => (scale.value = withSpring(0.96))}
          onPressOut={() => (scale.value = withSpring(1))}
          onPress={() => router.push(`/product/${item.id}` as any)}
          style={styles.card}
        >
          <Image source={{ uri: item.image_url }} style={styles.image} />
          {item.stock === 0 && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
          <View style={styles.cardContent}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              {cartItem && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartItem.quantity}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[styles.addButton, item.stock === 0 && styles.disabledButton]}
              disabled={item.stock === 0}
              onPress={() => {
                addItem(item, 1);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
            >
              <FontAwesome name="plus" size={13} color="#fff" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

// --- Main Screen ---
export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFirst = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const page = await fetchProducts();
      setProducts(page.products);
      setLastDoc(page.lastDoc);
      setHasMore(page.hasMore);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !lastDoc) return;
    try {
      setLoadingMore(true);
      const page = await fetchMoreProducts(lastDoc);
      setProducts(prev => [...prev, ...page.products]);
      setLastDoc(page.lastDoc);
      setHasMore(page.hasMore);
    } catch (e: any) {
      console.error('loadMore failed', e);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, lastDoc]);

  useEffect(() => { loadFirst(); }, [loadFirst]);

  // Loading state — skeleton grid
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>Find your favorite items today</Text>
        </View>
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          renderItem={() => <SkeletonCard />}
          keyExtractor={(i) => String(i)}
          numColumns={2}
          contentContainerStyle={styles.list}
          scrollEnabled={false}
        />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <FontAwesome name="exclamation-triangle" size={48} color="#FCA5A5" />
        <Text style={styles.stateTitle}>Something went wrong</Text>
        <Text style={styles.stateSubtitle}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadFirst}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Find your favorite items today</Text>
      </View>

      <FlatList
        data={products}
        renderItem={({ item, index }) => <ProductCard item={item} index={index} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore
            ? <ActivityIndicator color="#6366F1" style={{ marginVertical: 16 }} />
            : null
        }
        // Empty state
        ListEmptyComponent={
          <View style={styles.center}>
            <FontAwesome name="inbox" size={56} color="#CBD5E1" />
            <Text style={styles.stateTitle}>No products found</Text>
            <Text style={styles.stateSubtitle}>Check back later for new arrivals.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  header: { padding: 24, paddingTop: 12 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#1E293B' },
  headerSubtitle: { fontSize: 16, color: '#64748B', marginTop: 4 },
  stateTitle: { fontSize: 20, fontWeight: '700', color: '#334155', marginTop: 20 },
  stateSubtitle: { fontSize: 14, color: '#94A3B8', marginTop: 6, textAlign: 'center' },
  retryBtn: {
    marginTop: 24, backgroundColor: '#6366F1',
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 20,
  },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  list: { padding: 16 },
  cardContainer: { flex: 0.5, padding: 8 },
  card: {
    backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
  },
  image: { width: '100%', height: 140, backgroundColor: '#F1F5F9' },
  outOfStockBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 8,
  },
  outOfStockText: { fontSize: 10, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  cardContent: { padding: 12 },
  name: { fontSize: 15, fontWeight: '700', color: '#334155' },
  priceRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 4, marginBottom: 10,
  },
  price: { fontSize: 18, fontWeight: '800', color: '#6366F1' },
  badge: {
    backgroundColor: '#8B5CF6', borderRadius: 10,
    minWidth: 20, height: 20, justifyContent: 'center',
    alignItems: 'center', paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  addButton: {
    flexDirection: 'row', backgroundColor: '#6366F1',
    paddingVertical: 10, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  disabledButton: { backgroundColor: '#CBD5E1' },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
