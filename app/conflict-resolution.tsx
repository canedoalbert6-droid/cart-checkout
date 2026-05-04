import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useCart } from '../src/context/CartContext';

export default function ConflictResolutionScreen() {
  const router = useRouter();
  const { operations } = useCart();
  
  // Filter for operations with conflicts
  const conflictingOps = operations.filter(op => op.conflict);

  const resolveConflict = (opId: string, strategy: 'ACCEPT' | 'CANCEL') => {
    // In a real app, this would update the SQLite DB and trigger another sync
    console.log(`Resolving conflict ${opId} with strategy ${strategy}`);
    // Mocking resolution: just close for now
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.description}>
          Some items in your cart had changes while you were offline. Please review and resolve them.
        </Text>

        {conflictingOps.length === 0 ? (
          <Text style={styles.emptyText}>No active conflicts found.</Text>
        ) : (
          conflictingOps.map((op) => (
            <View key={op.id} style={styles.conflictCard}>
              <Text style={styles.itemTitle}>Product: {op.product_id}</Text>
              <Text style={styles.conflictType}>Issue: {op.conflict}</Text>
              
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={[styles.button, styles.acceptButton]} 
                  onPress={() => resolveConflict(op.id, 'ACCEPT')}
                >
                  <Text style={styles.buttonText}>Accept Change</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => resolveConflict(op.id, 'CANCEL')}
                >
                  <Text style={styles.buttonText}>Remove Item</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  conflictCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  conflictType: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 0.48,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  closeButton: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
  },
});
