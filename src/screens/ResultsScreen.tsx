import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Modal, ScrollView, Switch,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useDataStore } from '../store/dataStore';
import { useSearchStore } from '../store/searchStore';
import {
  filterHotels, filterFlights, filterRestaurants,
  sortHotels, sortFlights, sortRestaurants, SortOption,
} from '../utils/filterEngine';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'Results'>;

export default function ResultsScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { type } = route.params;

  const { hotels, flights, restaurants } = useDataStore();
  const { hotelSearch, flightSearch, restaurantSearch } = useSearchStore();

  const [sortOption, setSortOption] = useState<SortOption>('price_asc');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Hotel filters
  const [maxPrice, setMaxPriceState] = useState<number | undefined>(undefined);
  const [minStars, setMinStarsState] = useState<number | undefined>(undefined);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Flight filters
  const [stopsFilter, setStopsFilter] = useState<number | undefined>(undefined);
  const [minDeptHour, setMinDeptHour] = useState<number | undefined>(undefined);
  const [maxDeptHour, setMaxDeptHour] = useState<number | undefined>(undefined);

  // Restaurant filters
  const [cuisineFilter, setCuisineFilter] = useState<string | undefined>(undefined);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [priceTierFilter, setPriceTierFilter] = useState<number | undefined>(undefined);
  const [restaurantAmenities, setRestaurantAmenities] = useState<string[]>([]);

  const results = useMemo(() => {
    if (type === 'hotel') {
      const filtered = filterHotels(hotels, {
        city: hotelSearch.city,
        maxPrice,
        minStars,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
      });
      return sortHotels(filtered, sortOption);
    } else if (type === 'flight') {
      const filtered = filterFlights(flights, {
        origin: flightSearch.origin.toUpperCase() || undefined,
        destination: flightSearch.destination.toUpperCase() || undefined,
        date: flightSearch.date || undefined,
        stops: stopsFilter,
        minDepartureHour: minDeptHour,
        maxDepartureHour: maxDeptHour,
      });
      return sortFlights(filtered, sortOption);
    } else {
      const filtered = filterRestaurants(restaurants, {
        cuisine: cuisineFilter,
        minRating,
        priceTier: priceTierFilter,
        amenities: restaurantAmenities.length > 0 ? restaurantAmenities : undefined,
        minPartySize: restaurantSearch.partySize,
      });
      return sortRestaurants(filtered, sortOption);
    }
  }, [type, hotels, flights, restaurants, hotelSearch, flightSearch, restaurantSearch,
      sortOption, maxPrice, minStars, selectedAmenities, stopsFilter, minDeptHour, maxDeptHour,
      cuisineFilter, minRating, priceTierFilter, restaurantAmenities]);

  const toggleAmenity = useCallback((amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  }, []);

  const toggleRestaurantAmenity = useCallback((amenity: string) => {
    setRestaurantAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  }, []);

  const renderHotelCard = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      testID={`hotel_card_${item.id}`}
      style={styles.card}
      onPress={() => navigation.navigate('Detail', { type: 'hotel', itemId: item.id })}
    >
      <View style={styles.cardImagePlaceholder}>
        <Text style={styles.cardImageText}>🏨</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.city} • {item.star_rating}★</Text>
        <Text style={styles.cardMeta}>{item.review_score}/5 ({item.review_count} reviews)</Text>
        <Text style={styles.cardAmenities}>{item.amenities.slice(0, 3).join(' • ')}</Text>
        <View style={styles.cardPriceRow}>
          <Text style={styles.cardPrice}>${item.price_per_night}/night</Text>
          {!item.availability && (
            <Text testID={`hotel_unavailable_${item.id}`} style={styles.unavailableTag}>Unavailable</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  const renderFlightCard = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      testID={`flight_card_${item.id}`}
      style={styles.card}
      onPress={() => navigation.navigate('Detail', { type: 'flight', itemId: item.id })}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.airline} · {item.flight_number}</Text>
        <Text style={styles.cardSubtitle}>{item.origin} → {item.destination}</Text>
        <Text style={styles.cardMeta}>{item.departure_time} – {item.arrival_time} · {item.stops === 0 ? 'Non-stop' : `${item.stops} stop${item.stops > 1 ? 's' : ''}`}</Text>
        <Text style={styles.cardMeta}>{Math.floor(item.duration_minutes / 60)}h {item.duration_minutes % 60}m · {item.available_seats} seats left</Text>
        <Text style={styles.cardPrice}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  const renderRestaurantCard = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      testID={`restaurant_card_${item.id}`}
      style={styles.card}
      onPress={() => navigation.navigate('Detail', { type: 'restaurant', itemId: item.id })}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.cuisine} · {'$'.repeat(item.price_tier)}</Text>
        <Text style={styles.cardMeta}>{item.rating}★ ({item.review_count} reviews)</Text>
        <Text style={styles.cardAmenities}>{item.dietary.slice(0, 2).join(' • ')}</Text>
        <Text style={styles.cardMeta}>Max party: {item.max_party_size}</Text>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  const renderItem = type === 'hotel' ? renderHotelCard : type === 'flight' ? renderFlightCard : renderRestaurantCard;

  const sortOptions: { label: string; value: SortOption }[] = type === 'hotel'
    ? [
        { label: 'Price: Low to High', value: 'price_asc' },
        { label: 'Price: High to Low', value: 'price_desc' },
        { label: 'Rating', value: 'rating_desc' },
        { label: 'Best Value', value: 'best_value' },
        { label: 'Most Reviewed', value: 'review_count_desc' },
      ]
    : type === 'flight'
    ? [
        { label: 'Price: Low to High', value: 'price_asc' },
        { label: 'Price: High to Low', value: 'price_desc' },
        { label: 'Fastest', value: 'duration_asc' },
      ]
    : [
        { label: 'Rating', value: 'rating_desc' },
        { label: 'Price: Low to High', value: 'price_asc' },
        { label: 'Most Reviewed', value: 'review_count_desc' },
      ];

  return (
    <View style={styles.container} testID="results_screen">
      <View style={styles.toolbar}>
        <Text testID="results_count" style={styles.resultsCount}>{results.length} results</Text>
        <View style={styles.toolbarActions}>
          <TouchableOpacity
            testID="filter_button"
            style={styles.toolbarBtn}
            onPress={() => setFilterModalVisible(true)}
          >
            <Text style={styles.toolbarBtnText}>Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="sort_button"
            style={styles.toolbarBtn}
            onPress={() => setSortModalVisible(true)}
          >
            <Text style={styles.toolbarBtnText}>Sort</Text>
          </TouchableOpacity>
        </View>
      </View>

      {results.length === 0 ? (
        <View testID="empty_state" style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No results found</Text>
          <Text style={styles.emptyStateSubtext}>Try adjusting your filters or search criteria</Text>
        </View>
      ) : (
        <FlatList
          testID="results_list"
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Filter Modal */}
      <Modal
        testID="filter_modal"
        visible={filterModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity testID="filter_close_button" onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {type === 'hotel' && (
              <>
                <Text style={styles.filterSectionTitle}>Max Price / Night</Text>
                {[100, 150, 200, 300, 500].map(p => (
                  <TouchableOpacity
                    key={p}
                    testID={`filter_price_${p}`}
                    style={[styles.filterChip, maxPrice === p && styles.filterChipActive]}
                    onPress={() => setMaxPriceState(maxPrice === p ? undefined : p)}
                  >
                    <Text style={[styles.filterChipText, maxPrice === p && styles.filterChipTextActive]}>
                      Under ${p}
                    </Text>
                  </TouchableOpacity>
                ))}

                <Text style={styles.filterSectionTitle}>Min Star Rating</Text>
                {[2, 3, 4, 5].map(s => (
                  <TouchableOpacity
                    key={s}
                    testID={`filter_stars_${s}`}
                    style={[styles.filterChip, minStars === s && styles.filterChipActive]}
                    onPress={() => setMinStarsState(minStars === s ? undefined : s)}
                  >
                    <Text style={[styles.filterChipText, minStars === s && styles.filterChipTextActive]}>
                      {s}★ & Up
                    </Text>
                  </TouchableOpacity>
                ))}

                <Text style={styles.filterSectionTitle}>Amenities</Text>
                {['pool', 'gym', 'free_wifi', 'pet_friendly', 'free_parking', 'breakfast', 'spa'].map(a => (
                  <View key={a} style={styles.switchRow}>
                    <Text style={styles.switchLabel}>{a.replace(/_/g, ' ')}</Text>
                    <Switch
                      testID={`filter_${a}`}
                      value={selectedAmenities.includes(a)}
                      onValueChange={() => toggleAmenity(a)}
                    />
                  </View>
                ))}
              </>
            )}

            {type === 'flight' && (
              <>
                <Text style={styles.filterSectionTitle}>Stops</Text>
                {[{ label: 'Non-stop', value: 0 }, { label: '1 Stop', value: 1 }, { label: '2+ Stops', value: 2 }].map(s => (
                  <TouchableOpacity
                    key={s.value}
                    testID={`filter_stops_${s.value}`}
                    style={[styles.filterChip, stopsFilter === s.value && styles.filterChipActive]}
                    onPress={() => setStopsFilter(stopsFilter === s.value ? undefined : s.value)}
                  >
                    <Text style={[styles.filterChipText, stopsFilter === s.value && styles.filterChipTextActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}

                <Text style={styles.filterSectionTitle}>Departure Time</Text>
                {[
                  { label: 'Morning (6am-12pm)', min: 6, max: 12 },
                  { label: 'Afternoon (12pm-6pm)', min: 12, max: 18 },
                  { label: 'Evening (6pm-12am)', min: 18, max: 24 },
                ].map(t => (
                  <TouchableOpacity
                    key={t.label}
                    testID={`filter_departure_${t.min}_${t.max}`}
                    style={[styles.filterChip, minDeptHour === t.min && styles.filterChipActive]}
                    onPress={() => {
                      if (minDeptHour === t.min) {
                        setMinDeptHour(undefined);
                        setMaxDeptHour(undefined);
                      } else {
                        setMinDeptHour(t.min);
                        setMaxDeptHour(t.max);
                      }
                    }}
                  >
                    <Text style={[styles.filterChipText, minDeptHour === t.min && styles.filterChipTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {type === 'restaurant' && (
              <>
                <Text style={styles.filterSectionTitle}>Cuisine</Text>
                {['Japanese', 'Italian', 'Chinese', 'Mexican', 'American', 'French', 'Thai', 'Indian'].map(c => (
                  <TouchableOpacity
                    key={c}
                    testID={`filter_cuisine_${c.toLowerCase()}`}
                    style={[styles.filterChip, cuisineFilter === c && styles.filterChipActive]}
                    onPress={() => setCuisineFilter(cuisineFilter === c ? undefined : c)}
                  >
                    <Text style={[styles.filterChipText, cuisineFilter === c && styles.filterChipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}

                <Text style={styles.filterSectionTitle}>Min Rating</Text>
                {[3.5, 4.0, 4.5].map(r => (
                  <TouchableOpacity
                    key={r}
                    testID={`filter_rating_${r}`}
                    style={[styles.filterChip, minRating === r && styles.filterChipActive]}
                    onPress={() => setMinRating(minRating === r ? undefined : r)}
                  >
                    <Text style={[styles.filterChipText, minRating === r && styles.filterChipTextActive]}>{r}★ & Up</Text>
                  </TouchableOpacity>
                ))}

                <Text style={styles.filterSectionTitle}>Amenities</Text>
                {['outdoor_seating', 'valet_parking', 'private_dining'].map(a => (
                  <View key={a} style={styles.switchRow}>
                    <Text style={styles.switchLabel}>{a.replace(/_/g, ' ')}</Text>
                    <Switch
                      testID={`filter_${a}`}
                      value={restaurantAmenities.includes(a)}
                      onValueChange={() => toggleRestaurantAmenity(a)}
                    />
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        testID="sort_modal"
        visible={sortModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort By</Text>
            <TouchableOpacity testID="sort_close_button" onPress={() => setSortModalVisible(false)}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {sortOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                testID={`sort_option_${opt.value}`}
                style={[styles.sortOption, sortOption === opt.value && styles.sortOptionActive]}
                onPress={() => { setSortOption(opt.value); setSortModalVisible(false); }}
              >
                <Text style={[styles.sortOptionText, sortOption === opt.value && styles.sortOptionTextActive]}>
                  {opt.label}
                </Text>
                {sortOption === opt.value && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  toolbar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  resultsCount: { fontSize: 14, color: '#666' },
  toolbarActions: { flexDirection: 'row', gap: 8 },
  toolbarBtn: {
    paddingHorizontal: 16, paddingVertical: 6,
    borderWidth: 1, borderColor: '#1976D2', borderRadius: 20,
  },
  toolbarBtnText: { color: '#1976D2', fontWeight: '600', fontSize: 13 },
  listContent: { padding: 12, gap: 10 },
  card: {
    backgroundColor: '#fff', borderRadius: 12,
    overflow: 'hidden', elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    flexDirection: 'row',
  },
  cardImagePlaceholder: {
    width: 80, backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center',
  },
  cardImageText: { fontSize: 32 },
  cardContent: { flex: 1, padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  cardSubtitle: { fontSize: 13, color: '#555', marginTop: 2 },
  cardMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  cardAmenities: { fontSize: 11, color: '#aaa', marginTop: 4 },
  cardPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  cardPrice: { fontSize: 16, fontWeight: '700', color: '#1976D2' },
  unavailableTag: {
    fontSize: 11, color: '#fff', backgroundColor: '#d32f2f',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyStateText: { fontSize: 18, fontWeight: '700', color: '#666' },
  emptyStateSubtext: { fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center' },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalClose: { fontSize: 16, color: '#1976D2', fontWeight: '600' },
  modalContent: { flex: 1, padding: 16 },
  filterSectionTitle: { fontSize: 15, fontWeight: '700', marginTop: 16, marginBottom: 8, color: '#333' },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#ccc', marginBottom: 8, alignSelf: 'flex-start',
  },
  filterChipActive: { backgroundColor: '#1976D2', borderColor: '#1976D2' },
  filterChipText: { color: '#555', fontSize: 13 },
  filterChipTextActive: { color: '#fff' },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  switchLabel: { fontSize: 14, color: '#333', textTransform: 'capitalize' },
  sortOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  sortOptionActive: { backgroundColor: '#e3f2fd' },
  sortOptionText: { fontSize: 15, color: '#333' },
  sortOptionTextActive: { color: '#1976D2', fontWeight: '700' },
  checkmark: { fontSize: 16, color: '#1976D2' },
});
