import { StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useCart } from '../../src/context/CartContext';
import { useRouter } from 'expo-router';
import { getDB } from '../../src/db/sqlite';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

export default function SummaryScreen() {
  const { items } = useCart();
  const router = useRouter();

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price_at_add, 0);
  };

  const handlePlaceOrder = async () => {
    const db = getDB();
    if (!db) return;
    const orderId = uuidv4();
    const total = calculateTotal();
    const itemsJson = JSON.stringify(items);

    try {
      await db.runAsync(
        'INSERT INTO orders (id, items_json, total, status, created_at) VALUES (?, ?, ?, ?, ?)',
        [orderId, itemsJson, total, 'PENDING', Date.now()]
      );
      router.push('/checkout/confirmation');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to place order.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Review Order</Text>
          <Text style={styles.subtitle}>Check your items one last time</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({items.length})</Text>
          {items.map((item, index) => (
            <Animated.View 
              entering={FadeInRight.delay(index * 100)} 
              key={item.product_id} 
              style={styles.itemRow}
            >
              <View style={styles.itemIcon}>
                <FontAwesome name="shopping-bag" size={16} color="#6366F1" />
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>Item ID: {item.product_id}</Text>
                <Text style={styles.itemQty}>Quantity: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>${(item.quantity * item.price_at_add).toFixed(2)}</Text>
            </Animated.View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${calculateTotal().toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={[styles.summaryValue, { color: '#22C55E' }]}>FREE</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handlePlaceOrder}>
          <Text style={styles.buttonText}>Confirm & Pay</Text>
          <FontAwesome name="check" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemQty: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  summaryBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#6366F1',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
});
