import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDownloadLog, logSearch } from '../db/queries';

interface DownloadEntry {
  reference_number: string;
  downloaded_at: number;
}

export default function ExpenseFolderScreen() {
  const [receipts, setReceipts] = useState<DownloadEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      getDownloadLog().then((logs) => {
        setReceipts(logs);
        logSearch({
          search_type: 'expense_folder_view',
          query_params: JSON.stringify({ receipts_count: logs.length }),
          result_count: logs.length,
        }).catch(() => {});
      }).catch(() => setReceipts([]));
    }, [])
  );

  return (
    <View style={styles.container} testID="expense_folder_screen">
      <Text style={styles.title}>Expense Reports</Text>
      <Text style={styles.subtitle}>{receipts.length} receipt(s) downloaded</Text>

      {receipts.length === 0 ? (
        <View testID="no_receipts_state" style={styles.empty}>
          <Text style={styles.emptyText}>No receipts downloaded yet</Text>
        </View>
      ) : (
        <FlatList
          testID="receipts_list"
          data={receipts}
          keyExtractor={(item) => item.reference_number}
          renderItem={({ item }) => (
            <View testID={`receipt_item_${item.reference_number}`} style={styles.card}>
              <Text style={styles.refNum}>{item.reference_number}</Text>
              <Text style={styles.date}>
                Downloaded: {new Date(item.downloaded_at * 1000).toLocaleDateString()}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: '700', padding: 16, paddingBottom: 4, color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#666', paddingHorizontal: 16, paddingBottom: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
  listContent: { padding: 12, gap: 8 },
  card: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  refNum: { fontSize: 15, fontWeight: '700', color: '#1976D2', fontFamily: 'monospace' },
  date: { fontSize: 13, color: '#888', marginTop: 4 },
});
