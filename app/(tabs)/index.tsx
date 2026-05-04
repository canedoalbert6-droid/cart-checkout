import { StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, Pressable } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { Product } from '../../src/types';
import { getDB } from '../../src/db/sqlite';
import { useCart } from '../../src/context/CartContext';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem, items } = useCart();

  const fetchProducts = async () => {
    const db = getDB();
    if (!db) return;
    const result = await db.getAllAsync<Product>('SELECT * FROM products');
    setProducts(result);
  };

  const seedProducts = async () => {
    const db = getDB();
    if (!db) return;
    const count = await db.getFirstAsync<{count: number}>('SELECT COUNT(*) as count FROM products');
    if (count?.count === 0) {
      const initialProducts = [
        { id: '1', name: 'Premium Coffee', price: 15.99, stock: 10, image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=400&auto=format&fit=crop' },
        { id: '2', name: 'Organic Matcha', price: 24.50, stock: 5, image_url: 'https://images.unsplash.com/photo-1582793988951-9aed55099991?q=80&w=400&auto=format&fit=crop' },
        { id: '3', name: 'Dark Chocolate', price: 8.00, stock: 20, image_url: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?q=80&w=400&auto=format&fit=crop' },
        { id: '4', name: 'Almond Milk', price: 4.25, stock: 0, image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=400&auto=format&fit=crop' },
        { id: '5', name: 'Honey Granola', price: 12.99, stock: 15, image_url: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=400&auto=format&fit=crop' },
        { id: '6', name: 'Cold Brew', price: 6.50, stock: 8, image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=400&auto=format&fit=crop' },
      ];

      for (const p of initialProducts) {
        await db.runAsync(
          'INSERT INTO products (id, name, price, stock, image_url, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          [p.id, p.name, p.price, p.stock, p.image_url, Date.now()]
        );
      }
      fetchProducts();
    }
  };

  useEffect(() => {
    seedProducts();
    fetchProducts();
  }, []);

  const ProductCard = ({ item, index }: { item: Product, index: number }) => {
    const scale = useSharedValue(1);
    const cartItem = items.find(i => i.product_id === item.id);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const onPressIn = () => (scale.value = withSpring(0.95));
    const onPressOut = () => (scale.value = withSpring(1));

    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 100)}
        style={[styles.cardContainer, animatedStyle]}
      >
        <Pressable 
          onPressIn={onPressIn} 
          onPressOut={onPressOut}
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
              onPress={() => {
                if (item.stock > 0) {
                  addItem(item, 1);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              }}
              disabled={item.stock === 0}
            >
              <FontAwesome name="plus" size={14} color="#fff" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discovery</Text>
        <Text style={styles.headerSubtitle}>Find your favorite items today</Text>
      </View>
      <FlatList
        data={products}
        renderItem={({ item, index }) => <ProductCard item={item} index={index} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
  },
  cardContainer: {
    flex: 0.5,
    padding: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#F1F5F9',
  },
  cardContent: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6366F1',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  outOfStockText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  badge: {
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
});
