import { SQLiteDatabase } from 'react-native-sqlite-storage';

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      amount REAL,
      type TEXT,
      category TEXT,
      note TEXT,
      createdAt TEXT,
      synced INTEGER DEFAULT 0
    );
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS profile (
      id TEXT PRIMARY KEY,
      monthlyIncome REAL
    );
  `);
}
