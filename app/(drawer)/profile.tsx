import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Profile</Text>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          {user?.photoURL
            ? <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            : <Text style={styles.initials}>{initials}</Text>}
        </View>
        <Text style={styles.name}>{user?.displayName ?? 'Shopper'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Info Cards */}
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <FontAwesome name="user" size={16} color="#6366F1" />
          <Text style={styles.cardLabel}>User ID</Text>
          <Text style={styles.cardValue} numberOfLines={1}>{user?.uid?.slice(0, 12)}…</Text>
        </View>
        <View style={[styles.cardRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9' }]}>
          <FontAwesome name="envelope" size={16} color="#6366F1" />
          <Text style={styles.cardLabel}>Email</Text>
          <Text style={styles.cardValue} numberOfLines={1}>{user?.email}</Text>
        </View>
        <View style={[styles.cardRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9' }]}>
          <FontAwesome name="shield" size={16} color="#22C55E" />
          <Text style={styles.cardLabel}>Account Status</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>Active</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <FontAwesome name="sign-out" size={18} color="#EF4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 24 },
  pageTitle: { fontSize: 32, fontWeight: '800', color: '#1E293B', marginBottom: 32, marginTop: 8 },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, overflow: 'hidden',
  },
  avatar: { width: 96, height: 96 },
  initials: { fontSize: 36, fontWeight: '800', color: '#6366F1' },
  name: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  email: { fontSize: 14, color: '#64748B', marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    marginBottom: 24,
  },
  cardRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16,
  },
  cardLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#475569' },
  cardValue: { fontSize: 13, color: '#94A3B8', maxWidth: '40%' },
  verifiedBadge: {
    backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  verifiedText: { color: '#166534', fontSize: 12, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    backgroundColor: '#FEF2F2', borderRadius: 20, paddingVertical: 18,
    borderWidth: 1, borderColor: '#FECACA',
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },
});
