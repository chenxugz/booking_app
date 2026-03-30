import { create } from 'zustand';

export interface BookingDraft {
  type: 'hotel' | 'flight' | 'restaurant';
  item: any;
  guestName: string;
  email: string;
  phone: string;
  // Hotel specific
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  // Flight specific
  seatClass: string;
  mealPreference: string;
  seatPreference: string;
  baggageAdded: boolean;
  // Restaurant specific
  timeSlot: string;
  partySize: number;
  // Common
  extras: string[];
  promoCode: string;
  promoApplied: boolean;
  totalPrice: number;
}

interface BookingStore {
  draft: BookingDraft | null;
  confirmedBooking: any | null;
  setDraft: (draft: Partial<BookingDraft>) => void;
  initDraft: (type: 'hotel' | 'flight' | 'restaurant', item: any) => void;
  clearDraft: () => void;
  setConfirmed: (booking: any) => void;
}

const emptyDraft: Omit<BookingDraft, 'type' | 'item'> = {
  guestName: '',
  email: '',
  phone: '',
  roomType: '',
  checkIn: '',
  checkOut: '',
  guests: 1,
  seatClass: 'Economy',
  mealPreference: 'standard',
  seatPreference: '',
  baggageAdded: false,
  timeSlot: '',
  partySize: 2,
  extras: [],
  promoCode: '',
  promoApplied: false,
  totalPrice: 0,
};

export const useBookingStore = create<BookingStore>((set) => ({
  draft: null,
  confirmedBooking: null,
  setDraft: (updates) =>
    set((state) => ({
      draft: state.draft ? { ...state.draft, ...updates } : null,
    })),
  initDraft: (type, item) =>
    set(() => ({
      draft: { ...emptyDraft, type, item },
    })),
  clearDraft: () => set(() => ({ draft: null })),
  setConfirmed: (booking) => set(() => ({ confirmedBooking: booking })),
}));
