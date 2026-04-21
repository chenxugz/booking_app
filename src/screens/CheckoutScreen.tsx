import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useBookingStore } from '../store/bookingStore';
import { useSearchStore } from '../store/searchStore';
import { insertBooking } from '../db/queries';
import { generateReferenceNumber } from '../utils/referenceNumber';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'Checkout'>;

const PROMO_CODES: Record<string, number> = {
  SAVE10: 0.10,
  SAVE20: 0.20,
  VIP15: 0.15,
};

export default function CheckoutScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { draft, setDraft, setConfirmed } = useBookingStore();
  const { hotelSearch, flightSearch, restaurantSearch } = useSearchStore();

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

  if (!draft) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No booking in progress.</Text>
      </View>
    );
  }

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!draft.guestName.trim()) newErrors.guestName = 'Full name is required';
    if (!draft.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(draft.email)) newErrors.email = 'Invalid email address';
    if (!draft.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (draft.type === 'hotel' && !draft.roomType) newErrors.roomType = 'Please select a room type';
    if (draft.type === 'flight' && !draft.seatClass) newErrors.seatClass = 'Please select a seat class';
    if (draft.type === 'restaurant' && !draft.timeSlot) newErrors.timeSlot = 'Please select a time slot';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const applyPromo = () => {
    const discount = PROMO_CODES[promoInput.toUpperCase()];
    if (discount) {
      setDraft({ promoCode: promoInput.toUpperCase(), promoApplied: true });
      setPromoMessage(`Promo applied! ${(discount * 100).toFixed(0)}% off`);
    } else {
      setPromoMessage('Invalid promo code');
    }
  };

  const computeTotal = (): number => {
    let base = 0;
    if (draft.type === 'hotel') {
      const nights = hotelSearch.checkIn && hotelSearch.checkOut
        ? Math.max(1, (new Date(hotelSearch.checkOut).getTime() - new Date(hotelSearch.checkIn).getTime()) / 86400000)
        : 1;
      base = draft.item.price_per_night * nights * (hotelSearch.guests || 1);
    } else if (draft.type === 'flight') {
      base = draft.item.price * (flightSearch.passengers || 1);
      if (draft.baggageAdded) base += 35 * (flightSearch.passengers || 1);
    } else {
      base = draft.item.price_tier * 30 * (restaurantSearch.partySize || 2);
    }
    if (draft.promoApplied && PROMO_CODES[draft.promoCode]) {
      base = base * (1 - PROMO_CODES[draft.promoCode]);
    }
    return Math.round(base * 100) / 100;
  };

  const handleConfirm = async () => {
    const total = computeTotal();
    const refNum = generateReferenceNumber(
      draft.type === 'hotel' ? 'HOTEL' : draft.type === 'flight' ? 'FLIGHT' : 'RESTAURANT'
    );

    const extrasObj: Record<string, any> = {};
    if (draft.type === 'flight') {
      if (draft.baggageAdded) extrasObj.baggage = true;
      if (draft.seatPreference) extrasObj.seat_preference = draft.seatPreference;
      if (draft.mealPreference) extrasObj.meal_preference = draft.mealPreference;
    }

    const booking = {
      booking_type: draft.type,
      reference_number: refNum,
      item_id: draft.item.id,
      item_name: draft.type === 'hotel' ? draft.item.name
        : draft.type === 'flight' ? `${draft.item.airline} ${draft.item.flight_number}`
        : draft.item.name,
      user_name: draft.guestName,
      user_email: draft.email,
      user_phone: draft.phone,
      check_in: draft.type === 'hotel' ? hotelSearch.checkIn
        : draft.type === 'flight' ? draft.item.date
        : draft.timeSlot,
      check_out: draft.type === 'hotel' ? hotelSearch.checkOut : undefined,
      guests: draft.type === 'hotel' ? hotelSearch.guests
        : draft.type === 'flight' ? flightSearch.passengers
        : restaurantSearch.partySize,
      room_type: draft.type === 'hotel' ? draft.roomType : undefined,
      seat_class: draft.type === 'flight' ? draft.seatClass : undefined,
      extras: Object.keys(extrasObj).length > 0 ? JSON.stringify(extrasObj) : undefined,
      promo_code: draft.promoApplied ? draft.promoCode : undefined,
      total_price: total,
      status: 'confirmed',
    };

    try {
      await insertBooking(booking);
      setConfirmed({ ...booking, refNum });
      navigation.replace('Confirmation');
    } catch (e) {
      Alert.alert('Error', 'Failed to save booking. Please try again.');
    }
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3) { handleConfirm(); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  return (
    <View style={styles.container}>
      {/* Step Indicator */}
      <View style={styles.stepIndicator} testID="checkout_step_indicator">
        {[1, 2, 3].map(s => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepCircle, step >= s && styles.stepCircleActive]}>
              <Text style={[styles.stepNumber, step >= s && styles.stepNumberActive]}>{s}</Text>
            </View>
            <Text style={[styles.stepLabel, step === s && styles.stepLabelActive]}>
              {s === 1 ? 'Guest Info' : s === 2 ? 'Preferences' : 'Confirm'}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {step === 1 && (
          <Step1GuestInfo draft={draft} setDraft={setDraft} errors={errors} />
        )}
        {step === 2 && (
          <Step2Preferences
            draft={draft}
            setDraft={setDraft}
            errors={errors}
            promoInput={promoInput}
            setPromoInput={setPromoInput}
            promoMessage={promoMessage}
            applyPromo={applyPromo}
          />
        )}
        {step === 3 && (
          <Step3Review
            draft={draft}
            total={computeTotal()}
            hotelSearch={hotelSearch}
            flightSearch={flightSearch}
            restaurantSearch={restaurantSearch}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            testID="checkout_back_button"
            style={styles.backButton}
            onPress={() => { setErrors({}); setStep(s => s - 1); }}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          testID={step === 3 ? 'confirm_booking_button' : 'checkout_next_button'}
          style={styles.nextButton}
          onPress={nextStep}
        >
          <Text style={styles.nextButtonText}>
            {step === 3 ? 'Confirm Booking' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Step1GuestInfo({ draft, setDraft, errors }: any) {
  return (
    <>
      <Text style={styles.sectionTitle}>Guest Information</Text>
      <Text style={styles.label}>Full Name *</Text>
      <TextInput placeholderTextColor="#999"
        testID="guest_name_input"
        style={[styles.input, errors.guestName && styles.inputError]}
        placeholder="John Doe"
        value={draft.guestName}
        onChangeText={(v: string) => setDraft({ guestName: v })}
      />
      {errors.guestName && <Text testID="error_guest_name" style={styles.errorMsg}>{errors.guestName}</Text>}

      <Text style={styles.label}>Email *</Text>
      <TextInput placeholderTextColor="#999"
        testID="guest_email_input"
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="john@example.com"
        value={draft.email}
        onChangeText={(v: string) => setDraft({ email: v })}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text testID="error_email" style={styles.errorMsg}>{errors.email}</Text>}

      <Text style={styles.label}>Phone *</Text>
      <TextInput placeholderTextColor="#999"
        testID="guest_phone_input"
        style={[styles.input, errors.phone && styles.inputError]}
        placeholder="+1 555 000 0000"
        value={draft.phone}
        onChangeText={(v: string) => setDraft({ phone: v })}
        keyboardType="phone-pad"
      />
      {errors.phone && <Text testID="error_phone" style={styles.errorMsg}>{errors.phone}</Text>}
    </>
  );
}

function Step2Preferences({ draft, setDraft, errors, promoInput, setPromoInput, promoMessage, applyPromo }: any) {
  if (draft.type === 'hotel') {
    return (
      <>
        <Text style={styles.sectionTitle}>Room Selection</Text>
        {draft.item.room_types.map((r: string) => (
          <TouchableOpacity
            key={r}
            testID={`room_type_option_${r.toLowerCase().replace(/\s+/g, '_')}`}
            style={[styles.optionCard, draft.roomType === r && styles.optionCardActive]}
            onPress={() => setDraft({ roomType: r })}
          >
            <Text style={[styles.optionText, draft.roomType === r && styles.optionTextActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
        {errors.roomType && <Text testID="error_room_type" style={styles.errorMsg}>{errors.roomType}</Text>}
        <PromoSection promoInput={promoInput} setPromoInput={setPromoInput} promoMessage={promoMessage} applyPromo={applyPromo} />
      </>
    );
  }

  if (draft.type === 'flight') {
    return (
      <>
        <Text style={styles.sectionTitle}>Seat Class</Text>
        {draft.item.seat_classes.map((c: string) => (
          <TouchableOpacity
            key={c}
            testID={`seat_class_option_${c.toLowerCase()}`}
            style={[styles.optionCard, draft.seatClass === c && styles.optionCardActive]}
            onPress={() => setDraft({ seatClass: c })}
          >
            <Text style={[styles.optionText, draft.seatClass === c && styles.optionTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
        {errors.seatClass && <Text testID="error_seat_class" style={styles.errorMsg}>{errors.seatClass}</Text>}

        <Text style={styles.sectionTitle}>Seat Preference</Text>
        {['window', 'aisle', 'middle'].map(p => (
          <TouchableOpacity
            key={p}
            testID={`seat_pref_${p}`}
            style={[styles.optionCard, draft.seatPreference === p && styles.optionCardActive]}
            onPress={() => setDraft({ seatPreference: p })}
          >
            <Text style={[styles.optionText, draft.seatPreference === p && styles.optionTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Meal Preference</Text>
        {draft.item.meal_options.map((m: string) => (
          <TouchableOpacity
            key={m}
            testID={`meal_pref_${m}`}
            style={[styles.optionCard, draft.mealPreference === m && styles.optionCardActive]}
            onPress={() => setDraft({ mealPreference: m })}
          >
            <Text style={[styles.optionText, draft.mealPreference === m && styles.optionTextActive]}>{m.replace(/_/g, ' ')}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          testID="add_baggage_button"
          style={[styles.optionCard, draft.baggageAdded && styles.optionCardActive]}
          onPress={() => setDraft({ baggageAdded: !draft.baggageAdded })}
        >
          <Text style={[styles.optionText, draft.baggageAdded && styles.optionTextActive]}>
            {draft.baggageAdded ? '✓ ' : '+ '}Add Checked Baggage ($35)
          </Text>
        </TouchableOpacity>
        <PromoSection promoInput={promoInput} setPromoInput={setPromoInput} promoMessage={promoMessage} applyPromo={applyPromo} />
      </>
    );
  }

  // Restaurant
  return (
    <>
      <Text style={styles.sectionTitle}>Select Time Slot</Text>
      <View style={styles.slotsGrid}>
        {draft.item.availability_slots.map((slot: string) => (
          <TouchableOpacity
            key={slot}
            testID={`time_slot_option_${slot.replace(':', '_')}`}
            style={[styles.slotChip, draft.timeSlot === slot && styles.slotChipActive]}
            onPress={() => setDraft({ timeSlot: slot })}
          >
            <Text style={[styles.slotText, draft.timeSlot === slot && styles.slotTextActive]}>{slot}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.timeSlot && <Text testID="error_time_slot" style={styles.errorMsg}>{errors.timeSlot}</Text>}
      <PromoSection promoInput={promoInput} setPromoInput={setPromoInput} promoMessage={promoMessage} applyPromo={applyPromo} />
    </>
  );
}

function PromoSection({ promoInput, setPromoInput, promoMessage, applyPromo }: any) {
  return (
    <>
      <Text style={styles.sectionTitle}>Promo Code</Text>
      <View style={styles.promoRow}>
        <TextInput placeholderTextColor="#999"
          testID="promo_code_input"
          style={[styles.input, styles.promoInput]}
          placeholder="Enter code"
          value={promoInput}
          onChangeText={setPromoInput}
          autoCapitalize="characters"
        />
        <TouchableOpacity testID="apply_promo_button" style={styles.promoButton} onPress={applyPromo}>
          <Text style={styles.promoButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
      {promoMessage ? (
        <Text testID="promo_message" style={[styles.promoMsg, promoMessage.includes('Invalid') && styles.promoMsgError]}>
          {promoMessage}
        </Text>
      ) : null}
    </>
  );
}

function Step3Review({ draft, total, hotelSearch, flightSearch, restaurantSearch }: any) {
  return (
    <>
      <Text style={styles.sectionTitle}>Booking Summary</Text>
      <View style={styles.summaryCard}>
        <SummaryRow label="Type" value={draft.type.toUpperCase()} />
        <SummaryRow label="Name" value={draft.item.name || `${draft.item.airline} ${draft.item.flight_number}`} />
        {draft.type === 'hotel' && (
          <>
            <SummaryRow label="Room" value={draft.roomType} />
            <SummaryRow label="Check-in" value={hotelSearch.checkIn} />
            <SummaryRow label="Check-out" value={hotelSearch.checkOut} />
            <SummaryRow label="Guests" value={String(hotelSearch.guests)} />
          </>
        )}
        {draft.type === 'flight' && (
          <>
            <SummaryRow label="Route" value={`${draft.item.origin} → ${draft.item.destination}`} />
            <SummaryRow label="Date" value={draft.item.date} />
            <SummaryRow label="Seat Class" value={draft.seatClass} />
            <SummaryRow label="Passengers" value={String(flightSearch.passengers)} />
            {draft.baggageAdded && <SummaryRow label="Baggage" value="Added (+$35/person)" />}
          </>
        )}
        {draft.type === 'restaurant' && (
          <>
            <SummaryRow label="Time" value={draft.timeSlot} />
            <SummaryRow label="Party Size" value={String(restaurantSearch.partySize)} />
          </>
        )}
        <SummaryRow label="Guest Name" value={draft.guestName} />
        <SummaryRow label="Email" value={draft.email} />
        {draft.promoApplied && <SummaryRow label="Promo Code" value={draft.promoCode} />}
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text testID="total_price_display" style={styles.totalValue}>${total.toFixed(2)}</Text>
      </View>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  stepIndicator: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  stepItem: { flex: 1, alignItems: 'center' },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: { backgroundColor: '#1976D2' },
  stepNumber: { fontSize: 13, fontWeight: '700', color: '#999' },
  stepNumberActive: { color: '#fff' },
  stepLabel: { fontSize: 11, color: '#999' },
  stepLabelActive: { color: '#1976D2', fontWeight: '700' },
  content: { flex: 1 },
  contentInner: { padding: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginTop: 16, marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 4, marginTop: 10 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', fontSize: 16, color: '#1a1a1a',
  },
  inputError: { borderColor: '#d32f2f' },
  errorMsg: { color: '#d32f2f', fontSize: 12, marginTop: 2 },
  errorText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#666' },
  optionCard: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 14, marginBottom: 8, backgroundColor: '#fff',
  },
  optionCardActive: { borderColor: '#1976D2', backgroundColor: '#e3f2fd' },
  optionText: { fontSize: 14, color: '#555' },
  optionTextActive: { color: '#1976D2', fontWeight: '700' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff',
  },
  slotChipActive: { backgroundColor: '#1976D2', borderColor: '#1976D2' },
  slotText: { fontSize: 14, color: '#555' },
  slotTextActive: { color: '#fff', fontWeight: '700' },
  promoRow: { flexDirection: 'row', gap: 8 },
  promoInput: { flex: 1 },
  promoButton: {
    backgroundColor: '#1976D2', borderRadius: 8,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  promoButtonText: { color: '#fff', fontWeight: '700' },
  promoMsg: { fontSize: 13, color: '#2e7d32', marginTop: 4 },
  promoMsgError: { color: '#d32f2f' },
  summaryCard: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  summaryLabel: { fontSize: 13, color: '#888' },
  summaryValue: { fontSize: 13, color: '#1a1a1a', fontWeight: '600', flex: 1, textAlign: 'right' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 16, padding: 16,
    backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0',
  },
  totalLabel: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  totalValue: { fontSize: 24, fontWeight: '800', color: '#1976D2' },
  footer: {
    flexDirection: 'row', gap: 10, padding: 16,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee',
  },
  backButton: {
    flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    paddingVertical: 14, alignItems: 'center',
  },
  backButtonText: { color: '#555', fontSize: 15, fontWeight: '600' },
  nextButton: {
    flex: 2, backgroundColor: '#1976D2', borderRadius: 8,
    paddingVertical: 14, alignItems: 'center',
  },
  nextButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
