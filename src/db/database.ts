import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { createTables } from './schema';

SQLite.enablePromise(true);

let db: SQLiteDatabase | null = null;

export async function openDatabase(): Promise<SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabase({ name: 'booking_benchmark.db', location: 'default' });
  await createTables(db);
  return db;
}

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (!db) return openDatabase();
  return db;
}
