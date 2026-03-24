import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  getUnsyncedTransactions,
  markTransactionsSynced,
  Transaction,
} from '../db/queries';

type SyncTransactionsResult = {
  syncedCount: number;
};

type SupabaseConfig = {
  supabaseAnonKey: string;
  supabaseUrl: string;
};

export function createSupabaseClient(config: SupabaseConfig): SupabaseClient {
  return createClient(config.supabaseUrl, config.supabaseAnonKey);
}

function mapTransactionForSupabase(transaction: Transaction): Transaction {
  return {
    amount: transaction.amount,
    category: transaction.category,
    createdAt: transaction.createdAt,
    id: transaction.id,
    note: transaction.note,
    synced: transaction.synced,
    type: transaction.type,
  };
}

export async function syncTransactions(
  supabase: SupabaseClient,
): Promise<SyncTransactionsResult> {
  const pendingTransactions = await getUnsyncedTransactions();

  if (pendingTransactions.length === 0) {
    return {syncedCount: 0};
  }

  const payload = pendingTransactions.map(mapTransactionForSupabase);
  const {error} = await supabase
    .from('transactions')
    .upsert(payload, {onConflict: 'id'});

  if (error) {
    throw new Error(`Supabase sync failed: ${error.message}`);
  }

  await markTransactionsSynced(pendingTransactions.map(item => item.id));

  return {syncedCount: pendingTransactions.length};
}

// Manual trigger entrypoint for callers (e.g. a button handler or background task)
export async function triggerManualSync(
  supabase: SupabaseClient,
): Promise<SyncTransactionsResult> {
  return syncTransactions(supabase);
}
