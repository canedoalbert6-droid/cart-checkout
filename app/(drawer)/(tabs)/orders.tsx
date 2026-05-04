import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';

import { useAuth } from '@/src/context/AuthContext';
import { fetchOrders } from '@/src/services/ordersApi';
import { Order } from '@/src/types';

function OrderCard({ item, index }: { item: Order; index: number }) {
  const isConfirmed = item.status === 'CONFIRMED';
  return (
    <Animated.View entering={FadeInUp.delay(index * 80)} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdRow}>
          <FontAwesome name="hashtag" size={12} color="#6366F1" />
          <Text style={styles.orderId}>{item.id.slice(0, 8).toUpperCase()}</Text>
        </View>
        <Text style={styles.orderDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.orderInfo}>
        <View>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>${item.total.toFixed(2)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isConfirmed ? '#DCFCE7' : '#FEF3C7' }]}>
          <View style={[styles.statusDot, { backgroundColor: isConfirmed ? '#22C55E' : '#F59E0B' }]} />
          <Text style={[styles.statusText, { color: isConfirmed ? '#166534' : '#92400E' }]}>
            {item.status}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOrders(user.uid);
      setOrders(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
        <Text style={styles.headerSubtitle}>Your purchase history</Text>
      </View>

      {/* Loading state */}
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Fetching your orders…</Text>
        </View>
      )}

      {/* Error state */}
      {!loading && error && (
        <View style={styles.center}>
          <FontAwesome name="exclamation-triangle" size={48} color="#FCA5A5" />
          <Text style={styles.stateTitle}>Something went wrong</Text>
          <Text style={styles.stateSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadOrders}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Data / Empty state */}
      {!loading && !error && (
        <FlatList
          data={orders}
          renderItem={({ item, index }) => <OrderCard item={item} index={index} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <FontAwesome name="history" size={56} color="#CBD5E1" />
              <Text style={styles.stateTitle}>No orders yet</Text>
              <Text style={styles.stateSubtitle}>Complete a checkout to see your order history.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 24, paddingTop: 12 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#1E293B' },
  headerSubtitle: { fontSize: 16, color: '#64748B', marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { marginTop: 16, color: '#94A3B8', fontSize: 14 },
  stateTitle: { fontSize: 20, fontWeight: '700', color: '#334155', marginTop: 20 },
  stateSubtitle: { fontSize: 14, color: '#94A3B8', marginTop: 6, textAlign: 'center' },
  retryBtn: {
    marginTop: 24, backgroundColor: '#6366F1',
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 20,
  },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  list: { padding: 16, paddingTop: 0, flexGrow: 1 },
  orderCard: {
    backgroundColor: '#fff', padding: 20, borderRadius: 24, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  orderId: { fontSize: 14, fontWeight: '700', color: '#1E293B', letterSpacing: 1 },
  orderDate: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  orderInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  statLabel: { fontSize: 12, fontWeight: '600', color: '#94A3B8', marginBottom: 2 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12, gap: 6,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
});
