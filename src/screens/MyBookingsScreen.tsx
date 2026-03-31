import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getAllBookings, Booking, logDownload, insertMockBookingsForExpenseTest } from '../db/queries';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function MyBookingsScreen() {
  const navigation = useNavigation<NavProp>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'all' | 'hotel' | 'flight' | 'restaurant'>('all');
  const [loading, setLoading] = useState(false);
  const [downloadedRefs, setDownloadedRefs] = useState<Set<string>>(new Set());

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      await insertMockBookingsForExpenseTest();
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

  const handleDownloadReceipt = async (refNum: string) => {
    try {
      await logDownload(refNum);
      setDownloadedRefs(prev => new Set(prev).add(refNum));
      Alert.alert('Receipt Downloaded', `Receipt for ${refNum} saved to Expense Reports.`);
    } catch (e) {
      Alert.alert('Error', 'Failed to download receipt');
    }
  };

  const handleFileCompensation = (item: Booking) => {
    let delayMinutes = 180;
    try {
      const extras = item.extras ? JSON.parse(item.extras) : {};
      if (extras.delay_minutes) delayMinutes = extras.delay_minutes;
    } catch (e) {}
    navigation.navigate('CompensationClaim', {
      bookingReference: item.reference_number,
      delayMinutes,
    });
  };

  const renderItem = ({ item }: { item: Booking }) => {
    const isDelayed = item.status === 'delayed';
    const isDownloaded = downloadedRefs.has(item.reference_number);

    return (
      <View testID={`booking_card_${item.reference_number}`} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.typeTag}>{item.booking_type?.toUpperCase()}</Text>
          <View style={styles.statusRow}>
            {isDelayed && (
              <Text testID="flight_delayed_badge" style={styles.delayedBadge}>DELAYED</Text>
            )}
            <Text style={[styles.status, isDelayed && styles.statusDelayed]}>
              {item.status}
            </Text>
          </View>
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

        <View style={styles.actionRow}>
          <TouchableOpacity
            testID={`download_receipt_button_${item.reference_number}`}
            style={[styles.actionBtn, isDownloaded && styles.actionBtnDone]}
            onPress={() => handleDownloadReceipt(item.reference_number)}
          >
            <Text style={[styles.actionBtnText, isDownloaded && styles.actionBtnTextDone]}>
              {isDownloaded ? 'Downloaded' : 'Download Receipt'}
            </Text>
          </TouchableOpacity>

          {isDelayed && item.booking_type === 'flight' && (
            <TouchableOpacity
              testID="file_compensation_claim_button"
              style={styles.compensationBtn}
              onPress={() => handleFileCompensation(item)}
            >
              <Text style={styles.compensationBtnText}>File Claim</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const filterOptions: Array<{ label: string; value: typeof filter }> = [
    { label: 'All', value: 'all' },
    { label: 'Hotels', value: 'hotel' },
    { label: 'Flights', value: 'flight' },
    { label: 'Restaurants', value: 'restaurant' },
  ];

  return (
    <View style={styles.container} testID="my_bookings_screen">
      <View style={styles.topBar}>
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
        <TouchableOpacity
          testID="expense_folder_button"
          style={styles.expenseBtn}
          onPress={() => navigation.navigate('ExpenseFolder')}
        >
          <Text style={styles.expenseBtnText}>Expense Reports</Text>
        </TouchableOpacity>
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
  topBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: '#ccc',
  },
  filterChipActive: { backgroundColor: '#1976D2', borderColor: '#1976D2' },
  filterChipText: { fontSize: 13, color: '#555' },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },
  expenseBtn: {
    marginHorizontal: 12, marginBottom: 10, paddingVertical: 8,
    backgroundColor: '#e8f5e9', borderRadius: 8, alignItems: 'center',
    borderWidth: 1, borderColor: '#c8e6c9',
  },
  expenseBtnText: { color: '#2e7d32', fontWeight: '700', fontSize: 13 },
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
  statusRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  status: { fontSize: 11, color: '#2e7d32', fontWeight: '700' },
  statusDelayed: { color: '#e65100' },
  delayedBadge: {
    fontSize: 10, fontWeight: '800', color: '#fff', backgroundColor: '#e65100',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  itemName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  refNum: { fontSize: 12, color: '#999', marginTop: 2, fontFamily: 'monospace' },
  detail: { fontSize: 13, color: '#666', marginTop: 2 },
  total: { fontSize: 18, fontWeight: '800', color: '#1976D2', marginTop: 8 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 6,
    borderWidth: 1, borderColor: '#1976D2', alignItems: 'center',
  },
  actionBtnDone: { borderColor: '#4caf50', backgroundColor: '#e8f5e9' },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: '#1976D2' },
  actionBtnTextDone: { color: '#2e7d32' },
  compensationBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 6,
    backgroundColor: '#ff6f00', alignItems: 'center',
  },
  compensationBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#666' },
  emptySubtext: { fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center' },
});
