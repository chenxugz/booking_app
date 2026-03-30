import { create } from 'zustand';

export interface HotelSearch {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface FlightLeg {
  origin: string;
  destination: string;
  date: string;
}

export interface FlightSearch {
  origin: string;
  destination: string;
  date: string;
  returnDate: string;
  passengers: number;
  tripType: 'one_way' | 'round_trip' | 'multi_city';
  legs: FlightLeg[];
}

export interface RestaurantSearch {
  city: string;
  date: string;
  time: string;
  partySize: number;
}

interface SearchStore {
  hotelSearch: HotelSearch;
  flightSearch: FlightSearch;
  restaurantSearch: RestaurantSearch;
  setHotelSearch: (search: Partial<HotelSearch>) => void;
  setFlightSearch: (search: Partial<FlightSearch>) => void;
  setRestaurantSearch: (search: Partial<RestaurantSearch>) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  hotelSearch: {
    city: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
  },
  flightSearch: {
    origin: '',
    destination: '',
    date: '',
    returnDate: '',
    passengers: 1,
    tripType: 'one_way',
    legs: [{ origin: '', destination: '', date: '' }],
  },
  restaurantSearch: {
    city: '',
    date: '',
    time: '',
    partySize: 2,
  },
  setHotelSearch: (search) => set((state) => ({ hotelSearch: { ...state.hotelSearch, ...search } })),
  setFlightSearch: (search) => set((state) => ({ flightSearch: { ...state.flightSearch, ...search } })),
  setRestaurantSearch: (search) => set((state) => ({ restaurantSearch: { ...state.restaurantSearch, ...search } })),
}));
