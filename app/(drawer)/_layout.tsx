import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';

function CustomDrawerContent(props: any) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* User Profile Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.avatarCircle}>
          {user?.photoURL
            ? <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            : <FontAwesome name="user" size={28} color="#6366F1" />}
        </View>
        <Text style={styles.displayName} numberOfLines={1}>
          {user?.displayName ?? 'Shopper'}
        </Text>
        <Text style={styles.emailText} numberOfLines={1}>
          {user?.email ?? ''}
        </Text>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Logout at bottom */}
      <View style={styles.drawerFooter}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <FontAwesome name="sign-out" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerActiveTintColor: '#6366F1',
          drawerActiveBackgroundColor: '#EEF2FF',
          drawerInactiveTintColor: '#475569',
          drawerLabelStyle: { fontSize: 15, fontWeight: '600' },
          drawerStyle: { width: 280 },
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: 'Home',
            drawerIcon: ({ color }) => <FontAwesome name="home" size={20} color={color} />,
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: 'Profile',
            drawerIcon: ({ color }) => <FontAwesome name="user-circle" size={20} color={color} />,
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: 'Settings',
            drawerIcon: ({ color }) => <FontAwesome name="cog" size={20} color={color} />,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, overflow: 'hidden',
  },
  avatar: { width: 64, height: 64 },
  displayName: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
  emailText: { fontSize: 13, color: '#64748B', marginTop: 2 },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FEF2F2', padding: 14, borderRadius: 16,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});
