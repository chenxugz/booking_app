import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useDataStore } from '../store/dataStore';
import { useBookingStore } from '../store/bookingStore';
import { logSearch } from '../db/queries';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'Detail'>;

export default function DetailScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { type, itemId } = route.params;
  const { hotels, flights, restaurants } = useDataStore();
  const { initDraft } = useBookingStore();

  const item = type === 'hotel'
    ? hotels.find(h => h.id === itemId)
    : type === 'flight'
    ? flights.find(f => f.id === itemId)
    : restaurants.find(r => r.id === itemId);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Item not found</Text>
      </View>
    );
  }

  const handleBookNow = async () => {
    if (type === 'hotel' && !item.availability) {
      Alert.alert(
        'Not Available',
        'Sorry, this hotel is currently unavailable for booking.',
        [{ text: 'OK' }]
      );
      return;
    }
    try {
      await logSearch({
        search_type: type,
        query_params: JSON.stringify({ action: 'view_detail', item_id: itemId }),
        result_count: 1,
        selected_item_id: itemId,
      });
    } catch (e) {}
    initDraft(type, item);
    navigation.navigate('Checkout', { type });
  };

  const handleViewReviews = () => {
    navigation.navigate('Reviews', { hotelId: itemId });
  };

  const handleBulkBooking = () => {
    navigation.navigate('BulkBooking', {
      hotelId: item.id,
      hotelName: item.name,
      pricePerNight: item.price_per_night,
      roomTypes: item.room_types,
    });
  };

  const handleViewBaggagePolicy = async () => {
    try {
      await logSearch({
        search_type: 'baggage_policy_view',
        query_params: JSON.stringify({ airline: item.airline, flight_id: itemId }),
        result_count: 1,
      });
    } catch (e) {}
  };

  const handleViewMenu = async () => {
    try {
      await logSearch({
        search_type: 'menu_view',
        query_params: JSON.stringify({ restaurant_id: itemId, section: 'seasonal_specials' }),
        result_count: item.seasonal_specials?.length ?? 0,
      });
    } catch (e) {}
  };

  return (
    <ScrollView style={styles.container} testID="detail_screen">
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>
          {type === 'hotel' ? '🏨' : type === 'flight' ? '✈️' : '🍽️'}
        </Text>
      </View>

      <View style={styles.content}>
        {type === 'hotel' && <HotelDetail item={item} />}
        {type === 'flight' && <FlightDetail item={item} onViewBaggage={handleViewBaggagePolicy} />}
        {type === 'restaurant' && <RestaurantDetail item={item} onViewMenu={handleViewMenu} />}

        {type === 'hotel' && !item.availability && (
          <View testID="unavailable_notice" style={styles.unavailableBanner}>
            <Text style={styles.unavailableText}>This hotel is currently unavailable</Text>
          </View>
        )}

        {type === 'hotel' && item.reviews && item.reviews.length > 0 && (
          <TouchableOpacity
            testID="view_reviews_button"
            style={styles.secondaryButton}
            onPress={handleViewReviews}
          >
            <Text style={styles.secondaryButtonText}>
              View All Reviews ({item.reviews.length})
            </Text>
          </TouchableOpacity>
        )}

        {type === 'hotel' && item.availability && (
          <TouchableOpacity
            testID="bulk_booking_button"
            style={styles.secondaryButton}
            onPress={handleBulkBooking}
          >
            <Text style={styles.secondaryButtonText}>Bulk Booking (Corporate)</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          testID="book_now_button"
          style={[styles.bookButton, type === 'hotel' && !item.availability && styles.bookButtonDisabled]}
          onPress={handleBookNow}
        >
          <Text style={styles.bookButtonText}>
            {type === 'hotel' && !item.availability ? 'Unavailable' : 'Book Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function HotelDetail({ item }: { item: any }) {
  return (
    <>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.subtitle}>{item.city} · {item.star_rating}★</Text>
      <Text style={styles.address}>{item.address}</Text>
      <View style={styles.statsRow}>
        <Text style={styles.stat}>{item.review_score}/5 ({item.review_count} reviews)</Text>
        <Text style={styles.stat}>{item.distance_to_union_square_miles}mi from Union Square</Text>
      </View>
      <Text style={styles.sectionTitle}>Price</Text>
      <Text style={styles.price}>${item.price_per_night}/night</Text>
      <Text style={styles.policy}>Cancellation: {item.cancellation_policy}</Text>
      <Text style={styles.sectionTitle}>Room Types</Text>
      {item.room_types.map((r: string) => (
        <Text key={r} testID={`room_type_${r.toLowerCase().replace(/\s+/g, '_')}`} style={styles.listItem}>• {r}</Text>
      ))}
      <Text style={styles.sectionTitle}>Amenities</Text>
      <View style={styles.amenitiesWrap}>
        {item.amenities.map((a: string) => (
          <View key={a} style={styles.amenityTag}>
            <Text style={styles.amenityText}>{a.replace(/_/g, ' ')}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

function FlightDetail({ item, onViewBaggage }: { item: any; onViewBaggage: () => void }) {
  const bp = item.baggage_policy;
  useEffect(() => {
    if (bp) onViewBaggage();
  }, []);
  return (
    <>
      <Text style={styles.title}>{item.airline}</Text>
      <Text style={styles.subtitle}>{item.flight_number} · {item.date}</Text>
      <View style={styles.flightRoute}>
        <View style={styles.flightEndpoint}>
          <Text style={styles.airportCode}>{item.origin}</Text>
          <Text style={styles.flightTime}>{item.departure_time}</Text>
        </View>
        <Text style={styles.flightArrow}>→</Text>
        <View style={styles.flightEndpoint}>
          <Text style={styles.airportCode}>{item.destination}</Text>
          <Text style={styles.flightTime}>{item.arrival_time}</Text>
        </View>
      </View>
      <Text style={styles.listItem}>Duration: {Math.floor(item.duration_minutes / 60)}h {item.duration_minutes % 60}m</Text>
      <Text style={styles.listItem}>Stops: {item.stops === 0 ? 'Non-stop' : `${item.stops} stop(s)`}</Text>
      <Text style={styles.listItem}>Available seats: {item.available_seats}</Text>
      <Text style={styles.listItem}>Baggage included: {item.baggage_included ? 'Yes' : 'No'}</Text>
      <Text style={styles.sectionTitle}>Seat Classes</Text>
      {item.seat_classes.map((c: string) => (
        <Text key={c} testID={`seat_class_${c.toLowerCase()}`} style={styles.listItem}>• {c}</Text>
      ))}
      <Text style={styles.sectionTitle}>Meal Options</Text>
      {item.meal_options.map((m: string) => (
        <Text key={m} style={styles.listItem}>• {m.replace(/_/g, ' ')}</Text>
      ))}

      {bp && (
        <View testID="flight_detail_baggage_tab">
          <Text style={styles.sectionTitle}>Baggage Policy</Text>
          <View testID={`baggage_policy_airline_${item.airline.toLowerCase().replace(/\s+/g, '_')}`} style={styles.baggageCard}>
            <Text testID="personal_item_dimensions_label" style={styles.listItem}>
              Personal Item: max {bp.personal_item_max_cm}
            </Text>
            <Text testID="carry_on_dimensions_label" style={styles.listItem}>
              Carry-on: max {bp.carry_on_max_cm}
            </Text>
            <Text testID="checked_bag_fee_label" style={styles.listItem}>
              Checked bag fee: {bp.checked_bag_fee === 0 ? 'Free!' : `$${bp.checked_bag_fee}`}
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.price}>${item.price}</Text>
    </>
  );
}

function RestaurantDetail({ item, onViewMenu }: { item: any; onViewMenu: () => void }) {
  const hasOysters = item.seasonal_specials?.some(
    (s: any) => s.item.toLowerCase().includes('oyster')
  );
  useEffect(() => {
    if (item.seasonal_specials && item.seasonal_specials.length > 0) onViewMenu();
  }, []);
  return (
    <>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.subtitle}>{item.cuisine} · {'$'.repeat(item.price_tier)}</Text>
      <Text style={styles.address}>{item.address}</Text>
      <Text style={styles.stat}>{item.rating}★ ({item.review_count} reviews)</Text>
      <Text style={styles.listItem}>Hours: {item.open_time} – {item.close_time}</Text>
      <Text style={styles.listItem}>Max party size: {item.max_party_size}</Text>
      <Text style={styles.sectionTitle}>Available Time Slots</Text>
      <View style={styles.slotsWrap}>
        {item.availability_slots.map((slot: string) => (
          <View key={slot} testID={`time_slot_${slot.replace(':', '_')}`} style={styles.slotChip}>
            <Text style={styles.slotText}>{slot}</Text>
          </View>
        ))}
      </View>

      {item.seasonal_specials && item.seasonal_specials.length > 0 && (
        <View testID="restaurant_menu_tab">
          <Text style={styles.sectionTitle}>Seasonal Specials</Text>
          {hasOysters && (
            <View testID="has_oysters_badge" style={styles.oysterBadge}>
              <Text style={styles.oysterBadgeText}>Has Oysters</Text>
            </View>
          )}
          <View testID="seasonal_specials_section">
            {item.seasonal_specials.map((s: any) => (
              <View
                key={s.item}
                testID={`menu_item_${s.item.toLowerCase().replace(/\s+/g, '_')}`}
                style={styles.menuItemRow}
              >
                <Text style={styles.menuItemName}>{s.item}</Text>
                <Text style={styles.menuItemPrice}>${s.price.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Dietary Options</Text>
      <View style={styles.amenitiesWrap}>
        {item.dietary.map((d: string) => (
          <View key={d} style={styles.amenityTag}>
            <Text style={styles.amenityText}>{d.replace(/_/g, ' ')}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Amenities</Text>
      <View style={styles.amenitiesWrap}>
        {item.amenities.map((a: string) => (
          <View key={a} style={styles.amenityTag}>
            <Text style={styles.amenityText}>{a.replace(/_/g, ' ')}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imagePlaceholder: {
    height: 200, backgroundColor: '#e3f2fd',
    alignItems: 'center', justifyContent: 'center',
  },
  imagePlaceholderText: { fontSize: 64 },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  subtitle: { fontSize: 15, color: '#555', marginTop: 4 },
  address: { fontSize: 13, color: '#888', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  stat: { fontSize: 13, color: '#666' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginTop: 20, marginBottom: 8 },
  price: { fontSize: 22, fontWeight: '800', color: '#1976D2', marginTop: 8 },
  policy: { fontSize: 13, color: '#888', marginTop: 4 },
  listItem: { fontSize: 14, color: '#555', marginVertical: 2 },
  amenitiesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityTag: {
    backgroundColor: '#e3f2fd', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12,
  },
  amenityText: { fontSize: 12, color: '#1976D2' },
  flightRoute: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 16 },
  flightEndpoint: { alignItems: 'center' },
  airportCode: { fontSize: 28, fontWeight: '800', color: '#1a1a1a' },
  flightTime: { fontSize: 14, color: '#555', marginTop: 4 },
  flightArrow: { fontSize: 24, color: '#aaa' },
  slotsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: {
    backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8,
  },
  slotText: { fontSize: 13, color: '#2e7d32', fontWeight: '600' },
  unavailableBanner: {
    backgroundColor: '#ffebee', padding: 12, borderRadius: 8, marginVertical: 12,
    borderWidth: 1, borderColor: '#ef9a9a',
  },
  unavailableText: { color: '#c62828', fontWeight: '700', textAlign: 'center' },
  secondaryButton: {
    borderWidth: 1, borderColor: '#1976D2', borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', marginTop: 12,
  },
  secondaryButtonText: { color: '#1976D2', fontSize: 15, fontWeight: '600' },
  bookButton: {
    backgroundColor: '#1976D2', borderRadius: 10, paddingVertical: 16,
    alignItems: 'center', marginTop: 12, marginBottom: 32,
  },
  bookButtonDisabled: { backgroundColor: '#bdbdbd' },
  bookButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  errorText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#666' },
  baggageCard: {
    backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  oysterBadge: {
    backgroundColor: '#fff3e0', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, alignSelf: 'flex-start', marginBottom: 8,
    borderWidth: 1, borderColor: '#ffe0b2',
  },
  oysterBadgeText: { fontSize: 12, color: '#e65100', fontWeight: '700' },
  menuItemRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  menuItemName: { fontSize: 14, color: '#333' },
  menuItemPrice: { fontSize: 14, fontWeight: '700', color: '#1976D2' },
});
