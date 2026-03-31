import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { insertCompensationClaim } from '../db/queries';
import { generateReferenceNumber } from '../utils/referenceNumber';

type ClaimRouteProp = RouteProp<{ CompensationClaim: { bookingReference: string; delayMinutes: number } }, 'CompensationClaim'>;

export default function CompensationClaimScreen() {
  const navigation = useNavigation();
  const route = useRoute<ClaimRouteProp>();
  const { bookingReference, delayMinutes: initialDelay } = route.params;

  const [delayInput, setDelayInput] = useState(String(initialDelay));
  const [description, setDescription] = useState('');
  const [claimRef, setClaimRef] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const mins = parseInt(delayInput, 10);
    if (!mins || mins <= 0) {
      Alert.alert('Error', 'Please enter a valid delay duration');
      return;
    }
    const ref = `CLM-${Date.now().toString(36).toUpperCase()}`;
    try {
      await insertCompensationClaim(bookingReference, mins, ref);
      setClaimRef(ref);
      setSubmitted(true);
    } catch (e) {
      Alert.alert('Error', 'Failed to submit claim');
    }
  };

  if (submitted) {
    return (
      <View style={styles.container} testID="claim_submitted_screen">
        <View style={styles.successCard}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Claim Submitted</Text>
          <Text style={styles.successSubtitle}>Your compensation claim has been filed.</Text>
          <View style={styles.refCard}>
            <Text style={styles.refLabel}>Claim Reference</Text>
            <Text testID="claim_reference_number_label" style={styles.refNumber}>{claimRef}</Text>
          </View>
          <Text style={styles.detail}>Booking: {bookingReference}</Text>
          <Text style={styles.detail}>Delay: {delayInput} minutes</Text>
          <TouchableOpacity
            testID="claim_done_button"
            style={styles.doneBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="compensation_claim_screen">
      <Text style={styles.title}>File Compensation Claim</Text>
      <Text style={styles.subtitle}>Booking: {bookingReference}</Text>

      <Text style={styles.label}>Delay Duration (minutes) *</Text>
      <TextInput
        testID="claim_delay_duration_input"
        style={styles.input}
        placeholder="e.g. 180"
        placeholderTextColor="#999"
        value={delayInput}
        onChangeText={setDelayInput}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        testID="claim_description_input"
        style={[styles.input, styles.textArea]}
        placeholder="Describe the circumstances..."
        placeholderTextColor="#999"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        testID="claim_submit_button"
        style={styles.submitBtn}
        onPress={handleSubmit}
      >
        <Text style={styles.submitBtnText}>Submit Claim</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff',
    fontSize: 16, color: '#1a1a1a',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: '#1976D2', borderRadius: 8, paddingVertical: 14,
    alignItems: 'center', marginTop: 24,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  successCard: { alignItems: 'center', padding: 32, marginTop: 40 },
  successEmoji: { fontSize: 64, marginBottom: 12 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  successSubtitle: { fontSize: 14, color: '#777', marginTop: 4 },
  refCard: {
    backgroundColor: '#e3f2fd', borderRadius: 12, padding: 20,
    alignItems: 'center', width: '100%', marginVertical: 20,
  },
  refLabel: { fontSize: 12, color: '#666', letterSpacing: 1 },
  refNumber: { fontSize: 20, fontWeight: '900', color: '#1565c0', marginTop: 6 },
  detail: { fontSize: 14, color: '#555', marginTop: 4 },
  doneBtn: {
    backgroundColor: '#1976D2', borderRadius: 8, paddingVertical: 14,
    paddingHorizontal: 32, marginTop: 24,
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
