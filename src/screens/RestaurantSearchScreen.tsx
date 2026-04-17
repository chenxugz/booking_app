import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSearchStore } from '../store/searchStore';
import { logSearch } from '../db/queries';
import { filterRestaurants } from '../utils/filterEngine';
import { useDataStore } from '../store/dataStore';
import DatePickerInput from '../components/DatePickerInput';
import TimePickerInput from '../components/TimePickerInput';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function RestaurantSearchScreen() {
  const navigation = useNavigation<NavProp>();
  const { restaurantSearch, setRestaurantSearch } = useSearchStore();
  const { restaurants } = useDataStore();

  const [city, setCity] = useState(restaurantSearch.city);
  const [date, setDate] = useState(restaurantSearch.date);
  const [time, setTime] = useState(restaurantSearch.time);
  const [partySize, setPartySize] = useState(String(restaurantSearch.partySize));

  const handleSearch = async () => {
    const partySizeNum = parseInt(partySize, 10) || 2;
    setRestaurantSearch({ city, date, time, partySize: partySizeNum });
    const results = filterRestaurants(restaurants, { minPartySize: partySizeNum });
    try {
      await logSearch({
        search_type: 'restaurant',
        query_params: JSON.stringify({ city, date, time, partySize: partySizeNum }),
        result_count: results.length,
      });
    } catch (e) {}
    navigation.navigate('Results', { type: 'restaurant' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Find Restaurants</Text>

      <Text style={styles.label}>City</Text>
      <TextInput placeholderTextColor="#999"
        testID="restaurant_search_input"
        style={styles.input}
        placeholder="e.g. San Francisco"
        value={city}
        onChangeText={setCity}
        autoCorrect={false}
      />

      <Text style={styles.label}>Date</Text>
      <DatePickerInput
        testID="restaurant_date_picker"
        value={date}
        placeholder="Select date"
        onDateChange={setDate}
        minimumDate={new Date()}
      />

      <Text style={styles.label}>Time</Text>
      <TimePickerInput
        testID="restaurant_time_picker"
        value={time}
        placeholder="Select time"
        onTimeChange={setTime}
      />

      <Text style={styles.label}>Party Size</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          testID="party_size_decrement"
          style={styles.stepBtn}
          onPress={() => setPartySize(String(Math.max(1, parseInt(partySize, 10) - 1)))}
        >
          <Text style={styles.stepBtnText}>-</Text>
        </TouchableOpacity>
        <TextInput placeholderTextColor="#999"
          testID="party_size_stepper"
          style={styles.stepperInput}
          keyboardType="numeric"
          value={partySize}
          onChangeText={setPartySize}
        />
        <TouchableOpacity
          testID="party_size_increment"
          style={styles.stepBtn}
          onPress={() => setPartySize(String(parseInt(partySize, 10) + 1))}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        testID="search_button"
        style={styles.searchButton}
        onPress={handleSearch}
      >
        <Text style={styles.searchButtonText}>Find Restaurants</Text>
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
});
