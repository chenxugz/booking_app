import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { getDatabase } from './database';

export interface Booking {
  id?: number;
  booking_type: string;
  reference_number: string;
  item_id: string;
  item_name: string;
  user_name?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  room_type?: string;
  seat_class?: string;
  extras?: string;
  promo_code?: string;
  total_price?: number;
  status?: string;
  created_at?: number;
}

export interface SearchLog {
  search_type: string;
  query_params: string;
  result_count: number;
  selected_item_id?: string;
}

export async function insertBooking(booking: Booking): Promise<void> {
  const db = await getDatabase();
  await db.executeSql(
    `INSERT INTO bookings (booking_type, reference_number, item_id, item_name, user_name, check_in, check_out, guests, room_type, seat_class, extras, promo_code, total_price, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      booking.booking_type,
      booking.reference_number,
      booking.item_id,
      booking.item_name,
      booking.user_name ?? null,
      booking.check_in ?? null,
      booking.check_out ?? null,
      booking.guests ?? null,
      booking.room_type ?? null,
      booking.seat_class ?? null,
      booking.extras ?? null,
      booking.promo_code ?? null,
      booking.total_price ?? null,
      booking.status ?? 'confirmed',
    ]
  );
}

export async function getAllBookings(): Promise<Booking[]> {
  const db = await getDatabase();
  const [results] = await db.executeSql(
    'SELECT * FROM bookings ORDER BY created_at DESC'
  );
  const bookings: Booking[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    bookings.push(results.rows.item(i));
  }
  return bookings;
}

export async function logSearch(log: SearchLog): Promise<void> {
  const db = await getDatabase();
  await db.executeSql(
    `INSERT INTO search_log (search_type, query_params, result_count, selected_item_id) VALUES (?, ?, ?, ?)`,
    [log.search_type, log.query_params, log.result_count, log.selected_item_id ?? null]
  );
}
