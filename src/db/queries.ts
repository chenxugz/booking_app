import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { getDatabase } from './database';

export interface Booking {
  id?: number;
  booking_type: string;
  reference_number: string;
  item_id: string;
  item_name: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
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
    `INSERT INTO bookings (booking_type, reference_number, item_id, item_name, user_name, user_email, user_phone, check_in, check_out, guests, room_type, seat_class, extras, promo_code, total_price, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      booking.booking_type,
      booking.reference_number,
      booking.item_id,
      booking.item_name,
      booking.user_name ?? null,
      booking.user_email ?? null,
      booking.user_phone ?? null,
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

export async function logDownload(referenceNumber: string): Promise<void> {
  const db = await getDatabase();
  await db.executeSql(
    'INSERT INTO download_log (reference_number) VALUES (?)',
    [referenceNumber]
  );
}

export async function getDownloadLog(): Promise<Array<{reference_number: string; downloaded_at: number}>> {
  const db = await getDatabase();
  const [results] = await db.executeSql(
    'SELECT * FROM download_log ORDER BY downloaded_at DESC'
  );
  const logs: Array<{reference_number: string; downloaded_at: number}> = [];
  for (let i = 0; i < results.rows.length; i++) {
    logs.push(results.rows.item(i));
  }
  return logs;
}

export async function logReviewSearch(hotelId: string, keyword: string, matchCount: number): Promise<void> {
  const db = await getDatabase();
  await db.executeSql(
    'INSERT INTO review_searches (hotel_id, keyword, match_count) VALUES (?, ?, ?)',
    [hotelId, keyword, matchCount]
  );
}

export async function insertCompensationClaim(
  bookingReference: string,
  delayMinutes: number,
  claimReference: string
): Promise<void> {
  const db = await getDatabase();
  await db.executeSql(
    'INSERT INTO compensation_claims (booking_reference, delay_minutes, claim_reference) VALUES (?, ?, ?)',
    [bookingReference, delayMinutes, claimReference]
  );
}

export async function getCompensationClaims(): Promise<Array<{booking_reference: string; delay_minutes: number; claim_reference: string; submitted_at: number}>> {
  const db = await getDatabase();
  const [results] = await db.executeSql(
    'SELECT * FROM compensation_claims ORDER BY submitted_at DESC'
  );
  const claims: Array<{booking_reference: string; delay_minutes: number; claim_reference: string; submitted_at: number}> = [];
  for (let i = 0; i < results.rows.length; i++) {
    claims.push(results.rows.item(i));
  }
  return claims;
}

export async function insertMockBookingsForExpenseTest(): Promise<void> {
  const db = await getDatabase();
  const now = Math.floor(Date.now() / 1000);
  const types = ['hotel', 'flight', 'restaurant'];
  const names = ['Grand Pacific Hotel', 'United Airlines UA 487', 'Sakura Garden', 'Hilton Downtown', 'Delta DL 302', 'La Trattoria', 'Marina Bay Inn', 'JetBlue B6 100', 'Thai Orchid', 'Airport Lodge'];
  for (let i = 0; i < 10; i++) {
    const monthsAgo = i; // 0 to 9 months ago
    const ts = now - (monthsAgo * 30 * 24 * 3600);
    const type = types[i % 3];
    const ref = `BOOK-${type.toUpperCase()}-MOCK${String(i + 1).padStart(2, '0')}`;
    const price = 100 + (i * 50);
    await db.executeSql(
      `INSERT OR IGNORE INTO bookings (booking_type, reference_number, item_id, item_name, user_name, total_price, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, ref, `${type}_00${(i % 5) + 1}`, names[i], 'Test User', price, i === 4 ? 'delayed' : 'confirmed', ts]
    );
  }
}

export async function updateBookingStatus(referenceNumber: string, status: string, extras?: string): Promise<void> {
  const db = await getDatabase();
  if (extras) {
    await db.executeSql(
      'UPDATE bookings SET status = ?, extras = ? WHERE reference_number = ?',
      [status, extras, referenceNumber]
    );
  } else {
    await db.executeSql(
      'UPDATE bookings SET status = ? WHERE reference_number = ?',
      [status, referenceNumber]
    );
  }
}
