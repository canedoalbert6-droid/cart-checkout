import React, { useState, useRef } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useCart } from '../src/context/CartContext';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Shop Offline',
    description: 'Add items to your cart even without an internet connection. We queue everything locally.',
    icon: 'wifi',
    color: '#007AFF',
  },
  {
    id: '2',
    title: 'Smart Sync',
    description: 'Reconnect and watch your cart sync automatically. We handle price changes and stock conflicts for you.',
    icon: 'refresh',
    color: '#34C759',
  },
  {
    id: '3',
    title: 'Safe Checkout',
    description: 'Secure multi-step checkout with full order history and real-time conflict resolution.',
    icon: 'check-circle',
    color: '#5856D6',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);
  const router = useRouter();
  const { completeOnboarding } = useCart();

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = async () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await completeOnboarding();
      router.replace('/(drawer)' as any);
    }
  };

  const skip = async () => {
    await completeOnboarding();
    router.replace('/(drawer)' as any);
  };

  const renderItem = ({ item, index }: { item: typeof SLIDES[0], index: number }) => {
    return (
      <View style={[styles.slide, { backgroundColor: '#fff' }]}>
        <Animated.View 
          style={[
            styles.iconContainer, 
            { 
              backgroundColor: item.color + '20',
              transform: [{
                scale: scrollX.interpolate({
                  inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                  outputRange: [0.8, 1, 0.8],
                  extrapolate: 'clamp'
                })
              }]
            }
          ]}
        >
          <FontAwesome name={item.icon as any} size={100} color={item.color} />
        </Animated.View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={skip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      
      <View style={{ flex: 3 }}>
        <FlatList
          data={SLIDES}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <Paginator data={SLIDES} scrollX={scrollX} />

      <TouchableOpacity style={styles.nextButton} onPress={scrollTo}>
        <Text style={styles.nextButtonText}>
          {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const Paginator = ({ data, scrollX }: { data: any[], scrollX: Animated.Value }) => {
  return (
    <View style={styles.paginatorContainer}>
      {data.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 20, 10],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return <Animated.View style={[styles.dot, { width: dotWidth, opacity }]} key={i.toString()} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  paginatorContainer: {
    flexDirection: 'row',
    height: 64,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginHorizontal: 8,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    width: width * 0.8,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 50,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    zIndex: 10,
  },
  skipText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
});
