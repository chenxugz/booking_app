import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSearchStore, FlightLeg } from '../store/searchStore';
import { logSearch } from '../db/queries';
import { filterFlights } from '../utils/filterEngine';
import { useDataStore } from '../store/dataStore';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function FlightSearchScreen() {
  const navigation = useNavigation<NavProp>();
  const { flightSearch, setFlightSearch } = useSearchStore();
  const { flights } = useDataStore();

  const [origin, setOrigin] = useState(flightSearch.origin);
  const [destination, setDestination] = useState(flightSearch.destination);
  const [date, setDate] = useState(flightSearch.date);
  const [returnDate, setReturnDate] = useState(flightSearch.returnDate);
  const [passengers, setPassengers] = useState(String(flightSearch.passengers));
  const [tripType, setTripType] = useState<'one_way' | 'round_trip' | 'multi_city'>(flightSearch.tripType);
  const [legs, setLegs] = useState<FlightLeg[]>(
    flightSearch.legs.length > 0
      ? flightSearch.legs
      : [{ origin: '', destination: '', date: '' }]
  );

  const updateLeg = (index: number, field: keyof FlightLeg, value: string) => {
    setLegs(prev => prev.map((leg, i) => i === index ? { ...leg, [field]: value } : leg));
  };

  const addLeg = () => {
    const lastLeg = legs[legs.length - 1];
    setLegs(prev => [...prev, { origin: lastLeg.destination, destination: '', date: '' }]);
  };

  const removeLeg = (index: number) => {
    if (legs.length <= 2) return;
    setLegs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSearch = async () => {
    const passengersNum = parseInt(passengers, 10) || 1;

    if (tripType === 'multi_city') {
      setFlightSearch({ origin: legs[0].origin, destination: legs[0].destination, date: legs[0].date, passengers: passengersNum, tripType, legs });
      // Search using the first leg for initial results
      const results = filterFlights(flights, {
        origin: legs[0].origin.toUpperCase() || undefined,
        destination: legs[0].destination.toUpperCase() || undefined,
        date: legs[0].date || undefined,
      });
      try {
        await logSearch({
          search_type: 'flight',
          query_params: JSON.stringify({ tripType, legs, passengers: passengersNum }),
          result_count: results.length,
        });
      } catch (e) {}
    } else {
      setFlightSearch({ origin, destination, date, returnDate, passengers: passengersNum, tripType, legs: [] });
      const results = filterFlights(flights, { origin: origin.toUpperCase(), destination: destination.toUpperCase(), date });
      try {
        await logSearch({
          search_type: 'flight',
          query_params: JSON.stringify({ origin, destination, date, returnDate, passengers: passengersNum, tripType }),
          result_count: results.length,
        });
      } catch (e) {}
    }
    navigation.navigate('Results', { type: 'flight' });
  };

  const switchToMultiCity = () => {
    setTripType('multi_city');
    if (legs.length < 2) {
      setLegs([
        { origin: origin || '', destination: destination || '', date: date || '' },
        { origin: destination || '', destination: '', date: '' },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Search Flights</Text>

      <View style={styles.tripTypeRow}>
        <TouchableOpacity
          testID="trip_type_one_way"
          style={[styles.tripTypeBtn, tripType === 'one_way' && styles.tripTypeBtnActive]}
          onPress={() => setTripType('one_way')}
        >
          <Text style={[styles.tripTypeText, tripType === 'one_way' && styles.tripTypeTextActive]}>One Way</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="trip_type_round_trip"
          style={[styles.tripTypeBtn, tripType === 'round_trip' && styles.tripTypeBtnActive]}
          onPress={() => setTripType('round_trip')}
        >
          <Text style={[styles.tripTypeText, tripType === 'round_trip' && styles.tripTypeTextActive]}>Round Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="trip_type_multi_city"
          style={[styles.tripTypeBtn, tripType === 'multi_city' && styles.tripTypeBtnActive]}
          onPress={switchToMultiCity}
        >
          <Text style={[styles.tripTypeText, tripType === 'multi_city' && styles.tripTypeTextActive]}>Multi-City</Text>
        </TouchableOpacity>
      </View>

      {tripType !== 'multi_city' ? (
        <>
          <Text style={styles.label}>From (Airport Code)</Text>
          <TextInput placeholderTextColor="#999"
            testID="flight_origin_input"
            style={styles.input}
            placeholder="e.g. SFO"
            value={origin}
            onChangeText={setOrigin}
            autoCapitalize="characters"
            maxLength={3}
          />

          <Text style={styles.label}>To (Airport Code)</Text>
          <TextInput placeholderTextColor="#999"
            testID="flight_destination_input"
            style={styles.input}
            placeholder="e.g. JFK"
            value={destination}
            onChangeText={setDestination}
            autoCapitalize="characters"
            maxLength={3}
          />

          <Text style={styles.label}>Departure Date</Text>
          <TextInput placeholderTextColor="#999"
            testID="flight_departure_date"
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
          />

          {tripType === 'round_trip' && (
            <>
              <Text style={styles.label}>Return Date</Text>
              <TextInput placeholderTextColor="#999"
                testID="flight_return_date"
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={returnDate}
                onChangeText={setReturnDate}
              />
            </>
          )}
        </>
      ) : (
        <>
          {legs.map((leg, index) => (
            <View key={index} style={styles.legCard} testID={`multi_city_leg_${index + 1}`}>
              <View style={styles.legHeader}>
                <Text style={styles.legTitle}>Flight {index + 1}</Text>
                {legs.length > 2 && (
                  <TouchableOpacity
                    testID={`remove_leg_${index + 1}`}
                    onPress={() => removeLeg(index)}
                    style={styles.removeLegBtn}
                  >
                    <Text style={styles.removeLegText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.label}>From</Text>
              <TextInput placeholderTextColor="#999"
                testID={`multi_city_origin_${index + 1}`}
                style={styles.input}
                placeholder="e.g. SFO"
                value={leg.origin}
                onChangeText={(v) => updateLeg(index, 'origin', v)}
                autoCapitalize="characters"
                maxLength={3}
              />

              <Text style={styles.label}>To</Text>
              <TextInput placeholderTextColor="#999"
                testID={`multi_city_destination_${index + 1}`}
                style={styles.input}
                placeholder="e.g. JFK"
                value={leg.destination}
                onChangeText={(v) => {
                  updateLeg(index, 'destination', v);
                  if (index < legs.length - 1) {
                    updateLeg(index + 1, 'origin', v);
                  }
                }}
                autoCapitalize="characters"
                maxLength={3}
              />

              <Text style={styles.label}>Date</Text>
              <TextInput placeholderTextColor="#999"
                testID={`multi_city_date_${index + 1}`}
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={leg.date}
                onChangeText={(v) => updateLeg(index, 'date', v)}
              />
            </View>
          ))}

          {legs.length < 6 && (
            <TouchableOpacity
              testID="add_flight_leg"
              style={styles.addLegButton}
              onPress={addLeg}
            >
              <Text style={styles.addLegText}>+ Add Another Flight</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <Text style={styles.label}>Passengers</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          testID="passenger_count_decrement"
          style={styles.stepBtn}
          onPress={() => setPassengers(String(Math.max(1, parseInt(passengers, 10) - 1)))}
        >
          <Text style={styles.stepBtnText}>-</Text>
        </TouchableOpacity>
        <TextInput placeholderTextColor="#999"
          testID="passenger_count_stepper"
          style={styles.stepperInput}
          keyboardType="numeric"
          value={passengers}
          onChangeText={setPassengers}
        />
        <TouchableOpacity
          testID="passenger_count_increment"
          style={styles.stepBtn}
          onPress={() => setPassengers(String(parseInt(passengers, 10) + 1))}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        testID="search_button"
        style={styles.searchButton}
        onPress={handleSearch}
      >
        <Text style={styles.searchButtonText}>Search Flights</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16, color: '#1a1a1a' },
  tripTypeRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  tripTypeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: '#ccc', alignItems: 'center',
    backgroundColor: '#fff',
  },
  tripTypeBtnActive: { backgroundColor: '#1976D2', borderColor: '#1976D2' },
  tripTypeText: { color: '#555', fontWeight: '600', fontSize: 13 },
  tripTypeTextActive: { color: '#fff' },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#fff', fontSize: 16, color: '#1a1a1a',
  },
  legCard: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12,
    marginTop: 12, borderWidth: 1, borderColor: '#e0e0e0',
  },
  legHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 4,
  },
  legTitle: { fontSize: 15, fontWeight: '700', color: '#1976D2' },
  removeLegBtn: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6, backgroundColor: '#ffebee',
  },
  removeLegText: { color: '#c62828', fontSize: 12, fontWeight: '600' },
  addLegButton: {
    borderWidth: 1, borderColor: '#1976D2', borderRadius: 8, borderStyle: 'dashed',
    paddingVertical: 12, alignItems: 'center', marginTop: 12,
  },
  addLegText: { color: '#1976D2', fontSize: 14, fontWeight: '600' },
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
