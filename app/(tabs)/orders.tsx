import { StyleSheet, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { Order } from '../../src/types';
import { getDB } from '../../src/db/sqlite';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    const db = getDB();
    if (!db) return;
    const result = await db.getAllAsync<Order>('SELECT * FROM orders ORDER BY created_at DESC');
    setOrders(result);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const OrderCard = ({ item, index }: { item: Order, index: number }) => (
    <Animated.View 
      entering={FadeInUp.delay(index * 100)}
      style={styles.orderCard}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <FontAwesome name="hashtag" size={12} color="#6366F1" />
          <Text style={styles.orderId}>{item.id.slice(0, 8).toUpperCase()}</Text>
        </View>
        <Text style={styles.orderDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.orderInfo}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>${item.total.toFixed(2)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'CONFIRMED' ? '#DCFCE7' : '#FEF3C7' }]}>
          <View style={[styles.statusDot, { backgroundColor: item.status === 'CONFIRMED' ? '#22C55E' : '#F59E0B' }]} />
          <Text style={[styles.statusText, { color: item.status === 'CONFIRMED' ? '#166534' : '#92400E' }]}>
            {item.status}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
        <Text style={styles.headerSubtitle}>History of your purchases</Text>
      </View>
      <FlatList
        data={orders}
        renderItem={({ item, index }) => <OrderCard item={item} index={index} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="history" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No orders found.</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 1,
  },
  orderDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  stat: {
    backgroundColor: 'transparent',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    backgroundColor: 'transparent',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
