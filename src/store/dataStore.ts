import { create } from 'zustand';
import hotels from '../data/hotels.json';
import flights from '../data/flights.json';
import restaurants from '../data/restaurants.json';

interface DataStore {
  hotels: any[];
  flights: any[];
  restaurants: any[];
}

export const useDataStore = create<DataStore>(() => ({
  hotels: hotels as any[],
  flights: flights as any[],
  restaurants: restaurants as any[],
}));
