import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { insertBooking } from '../db/queries';
import { generateReferenceNumber } from '../utils/referenceNumber';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type BulkRouteProp = RouteProp<{ BulkBooking: { hotelId: string; hotelName: string; pricePerNight: number; roomTypes: string[] } }, 'BulkBooking'>;

interface RoomEntry {
  guestName: string;
  roomType: string;
}

export default function BulkBookingScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<BulkRouteProp>();
  const { hotelId, hotelName, pricePerNight, roomTypes } = route.params;

  const [rooms, setRooms] = useState<RoomEntry[]>([
    { guestName: '', roomType: roomTypes[0] || 'Standard' },
  ]);
  const [corporateCard, setCorporateCard] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRefs, setBookingRefs] = useState<string[]>([]);

  const addRoom = () => {
    if (rooms.length >= 10) return;
    setRooms(prev => [...prev, { guestName: '', roomType: roomTypes[0] || 'Standard' }]);
  };

  const updateRoom = (index: number, field: keyof RoomEntry, value: string) => {
    setRooms(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const removeRoom = (index: number) => {
    if (rooms.length <= 1) return;
    setRooms(prev => prev.filter((_, i) => i !== index));
  };

  const totalPrice = rooms.length * pricePerNight;

  const handleConfirmAll = async () => {
    if (!corporateCard.trim()) {
      Alert.alert('Error', 'Please enter corporate card number');
      return;
    }
    const emptyName = rooms.findIndex(r => !r.guestName.trim());
    if (emptyName >= 0) {
      Alert.alert('Error', `Please enter guest name for Room ${emptyName + 1}`);
      return;
    }

    const refs: string[] = [];
    try {
      for (let i = 0; i < rooms.length; i++) {
        const ref = generateReferenceNumber('HOTEL');
        refs.push(ref);
        await insertBooking({
          booking_type: 'hotel',
          reference_number: ref,
          item_id: hotelId,
          item_name: hotelName,
          user_name: rooms[i].guestName,
          room_type: rooms[i].roomType,
          guests: 1,
          extras: JSON.stringify({ corporate_card: corporateCard, room_index: i + 1 }),
          total_price: pricePerNight,
          status: 'confirmed',
        });
      }
      setBookingRefs(refs);
      setConfirmed(true);
    } catch (e) {
      Alert.alert('Error', 'Failed to save bookings');
    }
  };

  if (confirmed) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="bulk_booking_summary_screen">
        <Text style={styles.successEmoji}>✅</Text>
        <Text style={styles.title}>All {bookingRefs.length} Rooms Booked!</Text>
        <Text style={styles.subtitle}>{hotelName}</Text>
        {bookingRefs.map((ref, i) => (
          <View key={ref} style={styles.refRow}>
            <Text style={styles.refLabel}>Room {i + 1}: {rooms[i]?.guestName}</Text>
            <Text style={styles.refNum}>{ref}</Text>
          </View>
        ))}
        <Text style={styles.totalText}>Total: ${(bookingRefs.length * pricePerNight).toFixed(2)}</Text>
        <TouchableOpacity
          testID="bulk_booking_done_button"
          style={styles.doneBtn}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Text style={styles.doneBtnText}>View My Bookings</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Bulk Booking — {hotelName}</Text>
      <Text style={styles.subtitle}>${pricePerNight}/night per room · {rooms.length} room(s)</Text>

      {rooms.map((room, index) => (
        <View key={index} style={styles.roomCard} testID={`bulk_room_${index}`}>
          <View style={styles.roomHeader}>
            <Text style={styles.roomTitle}>Room {index + 1}</Text>
            {rooms.length > 1 && (
              <TouchableOpacity onPress={() => removeRoom(index)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.label}>Guest Name *</Text>
          <TextInput
            testID={`guest_name_input_${index}`}
            style={styles.input}
            placeholder="Employee name"
            placeholderTextColor="#999"
            value={room.guestName}
            onChangeText={(v) => updateRoom(index, 'guestName', v)}
          />
          <Text style={styles.label}>Room Type</Text>
          <View style={styles.roomTypeRow}>
            {roomTypes.map(rt => (
              <TouchableOpacity
                key={rt}
                testID={`room_type_selector_${index}_${rt.toLowerCase().replace(/\s+/g, '_')}`}
                style={[styles.rtChip, room.roomType === rt && styles.rtChipActive]}
                onPress={() => updateRoom(index, 'roomType', rt)}
              >
                <Text style={[styles.rtText, room.roomType === rt && styles.rtTextActive]}>
                  {rt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {rooms.length < 10 && (
        <TouchableOpacity testID="add_another_room_button" style={styles.addBtn} onPress={addRoom}>
          <Text style={styles.addBtnText}>+ Add Another Room</Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.label, { marginTop: 20 }]}>Corporate Card Number *</Text>
      <TextInput
        testID="corporate_card_input"
        style={styles.input}
        placeholder="e.g. 4242 4242 4242 4242"
        placeholderTextColor="#999"
        value={corporateCard}
        onChangeText={setCorporateCard}
        keyboardType="numeric"
      />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total ({rooms.length} rooms)</Text>
        <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        testID="confirm_all_rooms_button"
        style={styles.confirmBtn}
        onPress={handleConfirmAll}
      >
        <Text style={styles.confirmBtnText}>Confirm All {rooms.length} Rooms</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 16 },
  roomCard: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  roomTitle: { fontSize: 15, fontWeight: '700', color: '#1976D2' },
  removeText: { color: '#c62828', fontSize: 13, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 4, marginTop: 8 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff',
    fontSize: 15, color: '#1a1a1a',
  },
  roomTypeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  rtChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: '#ccc',
  },
  rtChipActive: { backgroundColor: '#1976D2', borderColor: '#1976D2' },
  rtText: { fontSize: 12, color: '#555' },
  rtTextActive: { color: '#fff', fontWeight: '700' },
  addBtn: {
    borderWidth: 1, borderColor: '#1976D2', borderRadius: 8, borderStyle: 'dashed',
    paddingVertical: 12, alignItems: 'center', marginBottom: 8,
  },
  addBtnText: { color: '#1976D2', fontSize: 14, fontWeight: '600' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, padding: 14, backgroundColor: '#fff', borderRadius: 10,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#1976D2' },
  confirmBtn: {
    backgroundColor: '#1976D2', borderRadius: 10, paddingVertical: 16,
    alignItems: 'center', marginTop: 16, marginBottom: 32,
  },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  successEmoji: { fontSize: 64, textAlign: 'center', marginTop: 24, marginBottom: 8 },
  refRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  refLabel: { fontSize: 13, color: '#555' },
  refNum: { fontSize: 13, fontWeight: '700', color: '#1976D2', fontFamily: 'monospace' },
  totalText: { fontSize: 20, fontWeight: '800', color: '#1976D2', textAlign: 'center', marginTop: 16 },
  doneBtn: {
    backgroundColor: '#1976D2', borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', marginTop: 24,
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
