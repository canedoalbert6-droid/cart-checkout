import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

function DrawerToggle() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={{ marginLeft: 16 }}
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
    >
      <FontAwesome name="bars" size={22} color="#6366F1" />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#6366F1',
          shadowOpacity: 0.08,
          shadowRadius: 20,
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: { backgroundColor: '#F8FAFC', elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { fontWeight: '800', color: '#1E293B', fontSize: 18 },
        headerLeft: () => <DrawerToggle />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <TabBarIcon name="th-large" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-cart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <TabBarIcon name="list-alt" color={color} />,
        }}
      />
    </Tabs>
  );
}
