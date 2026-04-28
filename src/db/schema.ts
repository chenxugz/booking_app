import { SQLiteDatabase } from 'react-native-sqlite-storage';

export async function createTables(db: SQLiteDatabase): Promise<void> {
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_type TEXT NOT NULL,
      reference_number TEXT UNIQUE NOT NULL,
      item_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      user_name TEXT,
      user_email TEXT,
      user_phone TEXT,
      check_in TEXT,
      check_out TEXT,
      guests INTEGER,
      room_type TEXT,
      seat_class TEXT,
      extras TEXT,
      promo_code TEXT,
      total_price REAL,
      status TEXT DEFAULT 'confirmed',
      created_at INTEGER DEFAULT (strftime('%s','now'))
    )
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS search_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      search_type TEXT NOT NULL,
      query_params TEXT NOT NULL,
      result_count INTEGER,
      selected_item_id TEXT,
      timestamp INTEGER DEFAULT (strftime('%s','now'))
    )
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS download_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_number TEXT,
      downloaded_at INTEGER DEFAULT (strftime('%s','now'))
    )
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS review_searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hotel_id TEXT,
      keyword TEXT,
      match_count INTEGER,
      searched_at INTEGER DEFAULT (strftime('%s','now'))
    )
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS compensation_claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_reference TEXT,
      delay_minutes INTEGER,
      description TEXT,
      claim_reference TEXT,
      submitted_at INTEGER DEFAULT (strftime('%s','now'))
    )
  `);
}
