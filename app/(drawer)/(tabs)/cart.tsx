import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useCart } from '@/src/context/CartContext';
import { getDB } from '@/src/db/sqlite';
import { Product } from '@/src/types';

function CartItemRow({ item, index, products }: { item: any; index: number; products: Product[] }) {
  const { removeItem, updateQuantity } = useCart();
  const product = products.find(p => p.id === item.product_id);

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 80)}
      exiting={FadeOutLeft}
      layout={Layout.springify()}
      style={styles.cartItem}
    >
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{product?.name ?? item.product_id}</Text>
        <Text style={styles.itemPrice}>${item.price_at_add.toFixed(2)} each</Text>
      </View>
      <View style={styles.rightSection}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => {
              updateQuantity(item.product_id, Math.max(0, item.quantity - 1));
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <FontAwesome name="minus" size={12} color="#475569" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => {
              updateQuantity(item.product_id, item.quantity + 1);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <FontAwesome name="plus" size={12} color="#475569" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => {
            removeItem(item.product_id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }}
        >
          <FontAwesome name="trash-o" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export default function CartScreen() {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  // Load product names from SQLite for display
  useEffect(() => {
    const db = getDB();
    if (!db) return;
    db.getAllAsync<Product>('SELECT * FROM products').then(setProducts).catch(console.error);
  }, []);

  const total = items.reduce((sum, item) => sum + item.quantity * item.price_at_add, 0);

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Add some items before checking out.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/checkout/address');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={() => {
            clearCart();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        renderItem={({ item, index }) => (
          <CartItemRow item={item} index={index} products={products} />
        )}
        keyExtractor={(item) => item.product_id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="shopping-basket" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>Your cart is empty.</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(drawer)')}>
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Checkout Now</Text>
            <FontAwesome name="arrow-right" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 24, paddingTop: 12,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#1E293B' },
  clearAllText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
  list: { padding: 16, paddingTop: 0, flexGrow: 1 },
  cartItem: {
    backgroundColor: '#fff', padding: 16, borderRadius: 24,
    marginBottom: 16, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  itemPrice: { fontSize: 14, color: '#64748B' },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  quantityContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F1F5F9', borderRadius: 16, padding: 4,
  },
  qtyButton: {
    width: 32, height: 32, backgroundColor: '#fff', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  quantity: { marginHorizontal: 12, fontSize: 16, fontWeight: '700', color: '#1E293B' },
  removeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { alignItems: 'center', paddingTop: 80, flex: 1 },
  emptyText: { marginTop: 24, fontSize: 18, fontWeight: '600', color: '#94A3B8' },
  shopBtn: { marginTop: 32, backgroundColor: '#6366F1', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20 },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  footer: {
    padding: 24, paddingBottom: 40,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05, shadowRadius: 20, elevation: 10,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#64748B' },
  totalValue: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  checkoutButton: {
    flexDirection: 'row', backgroundColor: '#6366F1',
    paddingVertical: 18, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  checkoutButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
