import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSearchStore } from '../store/searchStore';
import { logSearch } from '../db/queries';
import { filterHotels } from '../utils/filterEngine';
import { useDataStore } from '../store/dataStore';
import DatePickerInput from '../components/DatePickerInput';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function HotelSearchScreen() {
  const navigation = useNavigation<NavProp>();
  const { hotelSearch, setHotelSearch } = useSearchStore();
  const { hotels } = useDataStore();

  const [city, setCity] = useState(hotelSearch.city);
  const [checkIn, setCheckIn] = useState(hotelSearch.checkIn);
  const [checkOut, setCheckOut] = useState(hotelSearch.checkOut);
  const [guests, setGuests] = useState(String(hotelSearch.guests));

  const handleSearch = async () => {
    const guestsNum = parseInt(guests, 10) || 1;
    setHotelSearch({ city, checkIn, checkOut, guests: guestsNum });
    const results = filterHotels(hotels, { city });
    try {
      await logSearch({
        search_type: 'hotel',
        query_params: JSON.stringify({ city, checkIn, checkOut, guests: guestsNum }),
        result_count: results.length,
      });
    } catch (e) {
      // db not yet ready on first launch, ignore
    }
    navigation.navigate('Results', { type: 'hotel' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Search Hotels</Text>

      <Text style={styles.label}>Destination City</Text>
      <TextInput placeholderTextColor="#999"
        testID="hotel_search_input"
        style={styles.input}
        placeholder="e.g. San Francisco"
        value={city}
        onChangeText={setCity}
        autoCorrect={false}
      />

      <Text style={styles.label}>Check-in Date</Text>
      <DatePickerInput
        testID="checkin_date_picker"
        value={checkIn}
        placeholder="Select check-in date"
        onDateChange={setCheckIn}
      />

      <Text style={styles.label}>Check-out Date</Text>
      <DatePickerInput
        testID="checkout_date_picker"
        value={checkOut}
        placeholder="Select check-out date"
        onDateChange={setCheckOut}
      />

      <Text style={styles.label}>Guests</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          testID="guest_count_decrement"
          style={styles.stepBtn}
          onPress={() => setGuests(String(Math.max(1, parseInt(guests, 10) - 1)))}
        >
          <Text style={styles.stepBtnText}>-</Text>
        </TouchableOpacity>
        <TextInput placeholderTextColor="#999"
          testID="guest_count_stepper"
          style={styles.stepperInput}
          keyboardType="numeric"
          value={guests}
          onChangeText={setGuests}
        />
        <TouchableOpacity
          testID="guest_count_increment"
          style={styles.stepBtn}
          onPress={() => setGuests(String(parseInt(guests, 10) + 1))}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        testID="search_button"
        style={styles.searchButton}
        onPress={handleSearch}
      >
        <Text style={styles.searchButtonText}>Search Hotels</Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="my_bookings_button"
        style={styles.myBookingsButton}
        onPress={() => navigation.navigate('MyBookings')}
      >
        <Text style={styles.myBookingsText}>My Bookings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, color: '#1a1a1a' },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#fff', fontSize: 16, color: '#1a1a1a',
  },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1976D2', alignItems: 'center', justifyContent: 'center',
  },
  stepBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  stepperInput: {
    flex: 1, textAlign: 'center', borderWidth: 1,
    borderColor: '#ccc', borderRadius: 8, paddingVertical: 8, fontSize: 16,
    backgroundColor: '#fff', color: '#1a1a1a',
  },
  searchButton: {
    backgroundColor: '#1976D2', borderRadius: 8, paddingVertical: 14,
    alignItems: 'center', marginTop: 24,
  },
  searchButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  myBookingsButton: {
    borderWidth: 1, borderColor: '#1976D2', borderRadius: 8,
    paddingVertical: 12, alignItems: 'center', marginTop: 12,
  },
  myBookingsText: { color: '#1976D2', fontSize: 15, fontWeight: '600' },
});
