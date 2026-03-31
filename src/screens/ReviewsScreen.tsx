import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useDataStore } from '../store/dataStore';
import { logSearch } from '../db/queries';
import { logReviewSearch } from '../db/queries';

type ReviewsRouteProp = RouteProp<{ Reviews: { hotelId: string } }, 'Reviews'>;

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
}

export default function ReviewsScreen() {
  const route = useRoute<ReviewsRouteProp>();
  const { hotelId } = route.params;
  const { hotels } = useDataStore();
  const hotel = hotels.find((h: any) => h.id === hotelId);

  const reviews: Review[] = hotel?.reviews ?? [];
  const [keyword, setKeyword] = useState('');
  const [activeKeyword, setActiveKeyword] = useState('');

  const filtered = useMemo(() => {
    if (!activeKeyword) return reviews;
    return reviews.filter(r =>
      r.text.toLowerCase().includes(activeKeyword.toLowerCase())
    );
  }, [reviews, activeKeyword]);

  const handleSearch = async () => {
    const kw = keyword.trim();
    if (!kw) return;
    setActiveKeyword(kw);
    const matches = reviews.filter(r =>
      r.text.toLowerCase().includes(kw.toLowerCase())
    );
    try {
      await logReviewSearch(hotelId, kw, matches.length);
      await logSearch({
        search_type: 'review_keyword',
        query_params: JSON.stringify({ hotel_id: hotelId, keyword: kw }),
        result_count: matches.length,
      });
    } catch (e) {}
  };

  const clearFilter = () => {
    setKeyword('');
    setActiveKeyword('');
  };

  return (
    <View style={styles.container} testID="reviews_section">
      <Text style={styles.title}>{hotel?.name ?? 'Hotel'} Reviews</Text>

      <View style={styles.searchRow}>
        <TextInput
          testID="review_search_input"
          style={styles.searchInput}
          placeholder="Search reviews..."
          placeholderTextColor="#999"
          value={keyword}
          onChangeText={setKeyword}
        />
        <TouchableOpacity
          testID="review_keyword_filter_button"
          style={styles.searchBtn}
          onPress={handleSearch}
        >
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {activeKeyword !== '' && (
        <View style={styles.filterBar}>
          <Text testID="filtered_review_count_label" style={styles.filterText}>
            {filtered.length} review(s) match "{activeKeyword}"
          </Text>
          <TouchableOpacity testID="clear_review_filter" onPress={clearFilter}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        testID="reviews_list"
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View testID={`review_item_${item.id}`} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.author}>{item.author}</Text>
              <Text style={styles.rating}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</Text>
            </View>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.reviewText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 20, fontWeight: '700', padding: 16, color: '#1a1a1a' },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
  searchInput: {
    flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff',
    fontSize: 15, color: '#1a1a1a',
  },
  searchBtn: {
    backgroundColor: '#1976D2', borderRadius: 8,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: '700' },
  filterBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#e3f2fd', marginTop: 8,
  },
  filterText: { fontSize: 13, color: '#1565c0', fontWeight: '600' },
  clearText: { fontSize: 13, color: '#c62828', fontWeight: '600' },
  listContent: { padding: 12, gap: 8 },
  reviewCard: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  author: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  rating: { fontSize: 14, color: '#f9a825' },
  date: { fontSize: 12, color: '#999', marginTop: 2 },
  reviewText: { fontSize: 14, color: '#333', marginTop: 6, lineHeight: 20 },
});
