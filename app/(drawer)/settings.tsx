import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { getDB } from '../../src/db/sqlite';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleClearData = () => {
    Alert.alert(
      'Clear Local Data',
      'This will delete all locally cached products, cart operations, and orders. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear', style: 'destructive',
          onPress: async () => {
            const db = getDB();
            if (!db) return;
            await db.execAsync('DELETE FROM cart_operations; DELETE FROM cart_items; DELETE FROM orders;');
            Alert.alert('Done', 'Local data has been cleared.');
          },
        },
      ]
    );
  };

  const SettingRow = ({
    icon, iconColor, label, subtitle, right
  }: { icon: string; iconColor: string; label: string; subtitle?: string; right: React.ReactNode }) => (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: iconColor + '20' }]}>
        <FontAwesome name={icon as any} size={16} color={iconColor} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Settings</Text>

      {/* Preferences */}
      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.card}>
        <SettingRow
          icon="bell" iconColor="#6366F1"
          label="Notifications"
          subtitle="Push alerts for order updates"
          right={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E2E8F0', true: '#A5B4FC' }}
              thumbColor={notificationsEnabled ? '#6366F1' : '#94A3B8'}
            />
          }
        />
        <View style={styles.divider} />
        <SettingRow
          icon="moon-o" iconColor="#8B5CF6"
          label="Dark Mode"
          subtitle="Appearance preference"
          right={
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: '#E2E8F0', true: '#A5B4FC' }}
              thumbColor={darkModeEnabled ? '#6366F1' : '#94A3B8'}
            />
          }
        />
      </View>

      {/* Data */}
      <Text style={styles.sectionTitle}>Data</Text>
      <View style={styles.card}>
        <SettingRow
          icon="database" iconColor="#F59E0B"
          label="Clear Local Data"
          subtitle="Remove cached cart & orders from device"
          right={
            <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData}>
              <Text style={styles.dangerBtnText}>Clear</Text>
            </TouchableOpacity>
          }
        />
      </View>

      {/* About */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.card}>
        <SettingRow
          icon="info-circle" iconColor="#64748B"
          label="App Version"
          right={<Text style={styles.versionText}>{Constants.expoConfig?.version ?? '1.0.0'}</Text>}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="code" iconColor="#64748B"
          label="Built With"
          right={<Text style={styles.versionText}>Expo + Firebase</Text>}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 24 },
  pageTitle: { fontSize: 32, fontWeight: '800', color: '#1E293B', marginBottom: 24, marginTop: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, marginBottom: 24,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  rowSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 64 },
  dangerBtn: { backgroundColor: '#FEF2F2', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA' },
  dangerBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 13 },
  versionText: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
});
