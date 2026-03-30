import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllBookings, Booking } from '../db/queries';

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'all' | 'hotel' | 'flight' | 'restaurant'>('all');
  const [loading, setLoading] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllBookings();
      setBookings(all);
    } catch (e) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadBookings(); }, [loadBookings]));

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.booking_type === filter);

  const renderItem = ({ item }: { item: Booking }) => (
    <View testID={`booking_card_${item.reference_number}`} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.typeTag}>{item.booking_type?.toUpperCase()}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
      <Text style={styles.itemName}>{item.item_name}</Text>
      <Text testID={`ref_num_${item.reference_number}`} style={styles.refNum}>{item.reference_number}</Text>
      {item.user_name && <Text style={styles.detail}>Guest: {item.user_name}</Text>}
      {item.check_in && <Text style={styles.detail}>Date: {item.check_in}</Text>}
      {item.check_out && <Text style={styles.detail}>Check-out: {item.check_out}</Text>}
      {item.room_type && <Text style={styles.detail}>Room: {item.room_type}</Text>}
      {item.seat_class && <Text style={styles.detail}>Class: {item.seat_class}</Text>}
      {item.guests != null && <Text style={styles.detail}>Guests: {item.guests}</Text>}
      {item.promo_code && <Text style={styles.detail}>Promo: {item.promo_code}</Text>}
      <Text style={styles.total}>${item.total_price?.toFixed(2)}</Text>
    </View>
  );

  const filterOptions: Array<{ label: string; value: typeof filter }> = [
    { label: 'All', value: 'all' },
    { label: 'Hotels', value: 'hotel' },
    { label: 'Flights', value: 'flight' },
    { label: 'Restaurants', value: 'restaurant' },
  ];

  return (
    <View style={styles.container} testID="my_bookings_screen">
      <View style={styles.filterRow}>
        {filterOptions.map(opt => (
          <TouchableOpacity
            key={opt.value}
            testID={`filter_${opt.value}`}
            style={[styles.filterChip, filter === opt.value && styles.filterChipActive]}
            onPress={() => setFilter(opt.value)}
          >
            <Text style={[styles.filterChipText, filter === opt.value && styles.filterChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 && !loading ? (
        <View testID="no_bookings_state" style={styles.empty}>
          <Text style={styles.emptyText}>No bookings found</Text>
          <Text style={styles.emptySubtext}>Your confirmed bookings will appear here</Text>
        </View>
      ) : (
        <FlatList
          testID="bookings_list"
          data={filtered}
          keyExtractor={(item) => item.reference_number}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadBookings} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filterRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: '#ccc',
  },
  filterChipActive: { backgroundColor: '#1976D2', borderColor: '#1976D2' },
  filterChipText: { fontSize: 13, color: '#555' },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },
  listContent: { padding: 12, gap: 10 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  typeTag: {
    fontSize: 11, fontWeight: '700', color: '#1976D2',
    backgroundColor: '#e3f2fd', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  status: { fontSize: 11, color: '#2e7d32', fontWeight: '700' },
  itemName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  refNum: { fontSize: 12, color: '#999', marginTop: 2, fontFamily: 'monospace' },
  detail: { fontSize: 13, color: '#666', marginTop: 2 },
  total: { fontSize: 18, fontWeight: '800', color: '#1976D2', marginTop: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#666' },
  emptySubtext: { fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center' },
});
