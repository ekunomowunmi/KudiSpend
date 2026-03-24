import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { SQLiteDatabase, ResultSet } from 'react-native-sqlite-storage';
import { initializeDatabase } from './index';

export type Transaction = {
  id: string;
  amount: number;
  type: string;
  category: string;
  note: string | null;
  createdAt: string;
  synced: number;
};

export type Profile = {
  id: string;
  monthlyIncome: number;
};

const PROFILE_ID = 'default-profile';

async function getDatabase(): Promise<SQLiteDatabase> {
  return initializeDatabase();
}

function mapRows<T>(result: ResultSet): T[] {
  const rows: T[] = [];
  for (let index = 0; index < result.rows.length; index += 1) {
    rows.push(result.rows.item(index) as T);
  }
  return rows;
}

export async function addExpense(
  amount: number,
  category: string,
  note: string = '',
): Promise<void> {
  const db = await getDatabase();
  const id = uuidv4();
  const createdAt = dayjs().toISOString();

  await db.executeSql(
    `
      INSERT INTO transactions (id, amount, type, category, note, createdAt, synced)
      VALUES (?, ?, 'expense', ?, ?, ?, 0);
    `,
    [id, amount, category, note, createdAt],
  );
}

export async function getTodayExpenses(): Promise<Transaction[]> {
  const db = await getDatabase();
  const start = dayjs().startOf('day').toISOString();
  const end = dayjs().endOf('day').toISOString();

  const [result] = await db.executeSql(
    `
      SELECT id, amount, type, category, note, createdAt, synced
      FROM transactions
      WHERE createdAt >= ? AND createdAt <= ?
      ORDER BY createdAt DESC;
    `,
    [start, end],
  );

  return mapRows<Transaction>(result);
}

export async function getMonthlyExpenses(): Promise<Transaction[]> {
  const db = await getDatabase();
  const start = dayjs().startOf('month').toISOString();
  const end = dayjs().endOf('month').toISOString();

  const [result] = await db.executeSql(
    `
      SELECT id, amount, type, category, note, createdAt, synced
      FROM transactions
      WHERE createdAt >= ? AND createdAt <= ?
      ORDER BY createdAt DESC;
    `,
    [start, end],
  );

  return mapRows<Transaction>(result);
}

export async function getUnsyncedTransactions(): Promise<Transaction[]> {
  const db = await getDatabase();
  const [result] = await db.executeSql(
    `
      SELECT id, amount, type, category, note, createdAt, synced
      FROM transactions
      WHERE synced = 0
      ORDER BY createdAt ASC;
    `,
  );

  return mapRows<Transaction>(result);
}

export async function markTransactionsSynced(ids: string[]): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  const db = await getDatabase();
  const placeholders = ids.map(() => '?').join(', ');

  await db.executeSql(
    `
      UPDATE transactions
      SET synced = 1
      WHERE id IN (${placeholders});
    `,
    ids,
  );
}

export async function saveMonthlyIncome(amount: number): Promise<void> {
  const db = await getDatabase();

  await db.executeSql(
    `
      INSERT OR REPLACE INTO profile (id, monthlyIncome)
      VALUES (?, ?);
    `,
    [PROFILE_ID, amount],
  );
}

export async function getProfile(): Promise<Profile | null> {
  const db = await getDatabase();

  const [result] = await db.executeSql(
    `
      SELECT id, monthlyIncome
      FROM profile
      WHERE id = ?
      LIMIT 1;
    `,
    [PROFILE_ID],
  );

  const rows = mapRows<Profile>(result);
  return rows[0] ?? null;
}
