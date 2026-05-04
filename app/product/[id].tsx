import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { fetchProductById } from '../../src/services/productsApi';
import { useCart } from '../../src/context/CartContext';
import { Product } from '../../src/types';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addItem, items } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cartItem = items.find(i => i.product_id === id);

  useEffect(() => {
    if (!id) return;
    fetchProductById(id)
      .then(p => {
        setProduct(p);
        if (!p) setError('Product not found.');
      })
      .catch(e => setError(e.message ?? 'Failed to load product.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading product…</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.center}>
        <FontAwesome name="exclamation-triangle" size={48} color="#FCA5A5" />
        <Text style={styles.errorTitle}>Not Found</Text>
        <Text style={styles.errorSubtitle}>{error ?? 'This product does not exist.'}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={20} color="#1E293B" />
      </TouchableOpacity>

      <Image source={{ uri: product.image_url }} style={styles.image} />

      {isOutOfStock && (
        <View style={styles.outOfStockBanner}>
          <Text style={styles.outOfStockText}>Out of Stock</Text>
        </View>
      )}

      <View style={styles.details}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        <View style={styles.stockRow}>
          <FontAwesome
            name={isOutOfStock ? 'times-circle' : 'check-circle'}
            size={14}
            color={isOutOfStock ? '#EF4444' : '#22C55E'}
          />
          <Text style={[styles.stockText, { color: isOutOfStock ? '#EF4444' : '#22C55E' }]}>
            {isOutOfStock ? 'Unavailable' : `${product.stock} in stock`}
          </Text>
        </View>

        {cartItem && (
          <View style={styles.inCartBadge}>
            <FontAwesome name="shopping-cart" size={13} color="#6366F1" />
            <Text style={styles.inCartText}>{cartItem.quantity} already in your cart</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.addBtn, isOutOfStock && styles.addBtnDisabled]}
          disabled={isOutOfStock}
          onPress={() => {
            addItem(product, 1);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
        >
          <FontAwesome name="plus" size={16} color="#fff" />
          <Text style={styles.addBtnText}>
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { marginTop: 16, color: '#94A3B8', fontSize: 14 },
  errorTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginTop: 20 },
  errorSubtitle: { fontSize: 14, color: '#94A3B8', marginTop: 6, textAlign: 'center' },
  backBtn: {
    marginTop: 24, backgroundColor: '#6366F1',
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 20,
  },
  backBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  backIcon: {
    position: 'absolute', top: 56, left: 24, zIndex: 10,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  image: { width: '100%', height: 300, backgroundColor: '#F1F5F9' },
  outOfStockBanner: {
    backgroundColor: '#FEF2F2', padding: 12, alignItems: 'center',
  },
  outOfStockText: { color: '#EF4444', fontWeight: '700', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  details: { padding: 24 },
  name: { fontSize: 26, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  price: { fontSize: 32, fontWeight: '800', color: '#6366F1', marginBottom: 12 },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  stockText: { fontSize: 14, fontWeight: '600' },
  inCartBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EEF2FF', padding: 12, borderRadius: 12, marginBottom: 16,
  },
  inCartText: { color: '#6366F1', fontWeight: '700', fontSize: 13 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#6366F1', paddingVertical: 20, borderRadius: 24,
  },
  addBtnDisabled: { backgroundColor: '#CBD5E1' },
  addBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
