import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useCart } from '../context/CartContext';

export const OfflineBanner = () => {
  const { isOffline, isSyncing } = useCart();
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (isOffline || isSyncing) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, isSyncing]);

  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateY }] },
        !isOffline && isSyncing && styles.syncingContainer
      ]}
    >
      <Text style={styles.text}>
        {isOffline ? 'You are offline. Operations will be queued.' : 'Syncing with server...'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: '#FF9500',
    padding: 8,
    paddingTop: 48, // Increased for status bar safety
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  syncingContainer: {
    backgroundColor: '#007AFF',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
