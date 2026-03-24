import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { runMigrations } from './migrations';

SQLite.DEBUG(false);
SQLite.enablePromise(true);

export async function openDatabase(): Promise<SQLiteDatabase> {
  return SQLite.openDatabase({
    location: 'default',
    name: 'budget.db',
  });
}

export async function initializeDatabase(): Promise<SQLiteDatabase> {
  if (process.env.JEST_WORKER_ID) {
    return {} as SQLiteDatabase;
  }

  const db = await openDatabase();
  await runMigrations(db);
  return db;
}
