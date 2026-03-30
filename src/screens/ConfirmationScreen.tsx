import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useBookingStore } from '../store/bookingStore';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ConfirmationScreen() {
  const navigation = useNavigation<NavProp>();
  const { confirmedBooking, clearDraft } = useBookingStore();

  if (!confirmedBooking) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No booking found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="confirmation_screen">
      <View style={styles.successIcon}>
        <Text style={styles.successEmoji}>✅</Text>
      </View>
      <Text style={styles.title}>Booking Confirmed!</Text>
      <Text style={styles.subtitle}>Your booking has been successfully processed.</Text>

      <View style={styles.refCard}>
        <Text style={styles.refLabel}>Reference Number</Text>
        <Text testID="reference_number" style={styles.refNumber}>{confirmedBooking.reference_number}</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Booking Details</Text>
        <SummaryRow label="Type" value={confirmedBooking.booking_type?.toUpperCase()} />
        <SummaryRow label="Item" value={confirmedBooking.item_name} />
        {confirmedBooking.user_name && <SummaryRow label="Guest" value={confirmedBooking.user_name} />}
        {confirmedBooking.check_in && <SummaryRow label="Check-in / Date" value={confirmedBooking.check_in} />}
        {confirmedBooking.check_out && <SummaryRow label="Check-out" value={confirmedBooking.check_out} />}
        {confirmedBooking.guests && <SummaryRow label="Guests" value={String(confirmedBooking.guests)} />}
        {confirmedBooking.room_type && <SummaryRow label="Room" value={confirmedBooking.room_type} />}
        {confirmedBooking.seat_class && <SummaryRow label="Seat Class" value={confirmedBooking.seat_class} />}
        {confirmedBooking.promo_code && <SummaryRow label="Promo" value={confirmedBooking.promo_code} />}
        <View style={styles.divider} />
        <SummaryRow label="Total Paid" value={`$${confirmedBooking.total_price?.toFixed(2)}`} bold />
        <SummaryRow label="Status" value="Confirmed" bold />
      </View>

      <TouchableOpacity
        testID="view_my_bookings_button"
        style={styles.primaryButton}
        onPress={() => {
          clearDraft();
          navigation.navigate('MyBookings');
        }}
      >
        <Text style={styles.primaryButtonText}>View My Bookings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="book_another_button"
        style={styles.secondaryButton}
        onPress={() => {
          clearDraft();
          navigation.navigate('HomeTabs', undefined);
        }}
      >
        <Text style={styles.secondaryButtonText}>Book Another</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowValueBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20, alignItems: 'center' },
  successIcon: { marginTop: 24, marginBottom: 12 },
  successEmoji: { fontSize: 72 },
  title: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#777', textAlign: 'center', marginTop: 6, marginBottom: 24 },
  refCard: {
    backgroundColor: '#e3f2fd', borderRadius: 12, padding: 20,
    alignItems: 'center', width: '100%', marginBottom: 20,
    borderWidth: 1, borderColor: '#bbdefb',
  },
  refLabel: { fontSize: 12, color: '#666', letterSpacing: 1, textTransform: 'uppercase' },
  refNumber: { fontSize: 22, fontWeight: '900', color: '#1565c0', marginTop: 6, letterSpacing: 2 },
  summaryCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    width: '100%', borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 24,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  rowLabel: { fontSize: 13, color: '#888' },
  rowValue: { fontSize: 13, color: '#1a1a1a' },
  rowValueBold: { fontWeight: '700', color: '#1976D2' },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 8 },
  primaryButton: {
    backgroundColor: '#1976D2', borderRadius: 10,
    paddingVertical: 15, paddingHorizontal: 32, width: '100%',
    alignItems: 'center', marginBottom: 12,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    borderWidth: 1, borderColor: '#1976D2', borderRadius: 10,
    paddingVertical: 13, paddingHorizontal: 32, width: '100%', alignItems: 'center',
  },
  secondaryButtonText: { color: '#1976D2', fontSize: 16, fontWeight: '600' },
  errorText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#666' },
});
