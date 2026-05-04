import { StyleSheet, FlatList, TouchableOpacity, Alert, Pressable } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useCart } from '../../src/context/CartContext';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function CartScreen() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const router = useRouter();

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price_at_add, 0);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Add some items before checking out.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/checkout/address');
  };

  const CartItemRow = ({ item, index }: { item: any, index: number }) => (
    <Animated.View 
      entering={FadeInRight.delay(index * 100)}
      exiting={FadeOutLeft}
      layout={Layout.springify()}
      style={styles.cartItem}
    >
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>Item ID: {item.product_id}</Text>
        <Text style={styles.itemPrice}>${item.price_at_add.toFixed(2)}</Text>
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
        renderItem={({ item, index }) => <CartItemRow item={item} index={index} />}
        keyExtractor={(item) => item.product_id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="shopping-basket" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>Your cart is empty.</Text>
            <TouchableOpacity 
              style={styles.shopNowButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.shopNowButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.list}
      />
      
      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
  },
  clearAllText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 14,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  cartItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
  },
  qtyButton: {
    width: 32,
    height: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quantity: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  removeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
  shopNowButton: {
    marginTop: 32,
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
  },
  shopNowButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
