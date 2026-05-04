import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useCart } from '../../src/context/CartContext';
import { useEffect } from 'react';
import Animated, { FadeIn, ZoomIn, FadeInDown } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';

export default function ConfirmationScreen() {
  const router = useRouter();
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View entering={ZoomIn.duration(800)} style={styles.successIcon}>
        <FontAwesome name="check" size={50} color="#fff" />
      </Animated.View>
      
      <Animated.Text entering={FadeIn.delay(400)} style={styles.title}>
        Payment Successful!
      </Animated.Text>
      
      <Animated.Text entering={FadeInDown.delay(600)} style={styles.subtitle}>
        Your order is being prepared and will be delivered shortly.
      </Animated.Text>

      <Animated.View entering={FadeInUp.delay(1000)} style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.primaryButtonText}>Back to Shop</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/(tabs)/orders')}>
          <Text style={styles.secondaryButtonText}>View Order History</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

import { FadeInUp } from 'react-native-reanimated';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  actions: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '700',
  },
});
