export interface HotelFilters {
  city?: string;
  maxPrice?: number;
  minStars?: number;
  amenities?: string[];
  maxDistanceMiles?: number;
  availability?: boolean;
}

export interface FlightFilters {
  origin?: string;
  destination?: string;
  date?: string;
  stops?: number;
  minDepartureHour?: number;
  maxDepartureHour?: number;
  maxDurationMinutes?: number;
  maxPrice?: number;
}

export interface RestaurantFilters {
  cuisine?: string;
  minRating?: number;
  priceTier?: number;
  amenities?: string[];
  dietary?: string[];
  minPartySize?: number;
  openAfterHour?: string;
  openDay?: string;
}

export type SortOption = 'price_asc' | 'price_desc' | 'rating_desc' | 'review_count_desc' | 'best_value' | 'duration_asc';

export function filterHotels(hotels: any[], filters: HotelFilters): any[] {
  return hotels.filter(h => {
    if (filters.city && !h.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.maxPrice !== undefined && h.price_per_night > filters.maxPrice) return false;
    if (filters.minStars !== undefined && h.star_rating < filters.minStars) return false;
    if (filters.availability !== undefined && h.availability !== filters.availability) return false;
    if (filters.maxDistanceMiles !== undefined && h.distance_to_union_square_miles > filters.maxDistanceMiles) return false;
    if (filters.amenities && filters.amenities.length > 0) {
      if (!filters.amenities.every(a => h.amenities.includes(a))) return false;
    }
    return true;
  });
}

export function sortHotels(hotels: any[], sort: SortOption): any[] {
  const sorted = [...hotels];
  switch (sort) {
    case 'price_asc': return sorted.sort((a, b) => a.price_per_night - b.price_per_night);
    case 'price_desc': return sorted.sort((a, b) => b.price_per_night - a.price_per_night);
    case 'rating_desc': return sorted.sort((a, b) => b.review_score - a.review_score);
    case 'review_count_desc': return sorted.sort((a, b) => b.review_count - a.review_count);
    case 'best_value': return sorted.sort((a, b) => (b.review_score / b.price_per_night) - (a.review_score / a.price_per_night));
    default: return sorted;
  }
}

export function filterFlights(flights: any[], filters: FlightFilters): any[] {
  return flights.filter(f => {
    if (filters.origin && f.origin !== filters.origin) return false;
    if (filters.destination && f.destination !== filters.destination) return false;
    if (filters.date && f.date !== filters.date) return false;
    if (filters.stops !== undefined && f.stops !== filters.stops) return false;
    if (filters.maxDurationMinutes !== undefined && f.duration_minutes > filters.maxDurationMinutes) return false;
    if (filters.maxPrice !== undefined && f.price > filters.maxPrice) return false;
    if (filters.minDepartureHour !== undefined || filters.maxDepartureHour !== undefined) {
      const hour = parseInt(f.departure_time.split(':')[0], 10);
      if (filters.minDepartureHour !== undefined && hour < filters.minDepartureHour) return false;
      if (filters.maxDepartureHour !== undefined && hour >= filters.maxDepartureHour) return false;
    }
    return true;
  });
}

export function sortFlights(flights: any[], sort: SortOption): any[] {
  const sorted = [...flights];
  switch (sort) {
    case 'price_asc': return sorted.sort((a, b) => a.price - b.price);
    case 'price_desc': return sorted.sort((a, b) => b.price - a.price);
    case 'duration_asc': return sorted.sort((a, b) => a.duration_minutes - b.duration_minutes);
    default: return sorted;
  }
}

export function filterRestaurants(restaurants: any[], filters: RestaurantFilters): any[] {
  return restaurants.filter(r => {
    if (filters.cuisine && r.cuisine.toLowerCase() !== filters.cuisine.toLowerCase()) return false;
    if (filters.minRating !== undefined && r.rating < filters.minRating) return false;
    if (filters.priceTier !== undefined && r.price_tier !== filters.priceTier) return false;
    if (filters.minPartySize !== undefined && r.max_party_size < filters.minPartySize) return false;
    if (filters.amenities && filters.amenities.length > 0) {
      if (!filters.amenities.every(a => r.amenities.includes(a))) return false;
    }
    if (filters.dietary && filters.dietary.length > 0) {
      if (!filters.dietary.every(d => r.dietary.includes(d))) return false;
    }
    if (filters.openDay && !r.open_days.includes(filters.openDay)) return false;
    if (filters.openAfterHour) {
      if (r.close_time <= filters.openAfterHour) return false;
    }
    return true;
  });
}

export function sortRestaurants(restaurants: any[], sort: SortOption): any[] {
  const sorted = [...restaurants];
  switch (sort) {
    case 'price_asc': return sorted.sort((a, b) => a.price_tier - b.price_tier);
    case 'price_desc': return sorted.sort((a, b) => b.price_tier - a.price_tier);
    case 'rating_desc': return sorted.sort((a, b) => b.rating - a.rating);
    case 'review_count_desc': return sorted.sort((a, b) => b.review_count - a.review_count);
    default: return sorted;
  }
}
