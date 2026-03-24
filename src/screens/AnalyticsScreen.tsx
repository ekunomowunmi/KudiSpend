import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMonthlyExpenses, Transaction } from '../db/queries';

export function AnalyticsScreen(): React.JSX.Element {
  const [monthlyExpenses, setMonthlyExpenses] = useState<Transaction[]>([]);

  useFocusEffect(
    useCallback(() => {
      getMonthlyExpenses()
        .then(expenses => {
          setMonthlyExpenses(expenses);
        })
        .catch(() => {
          setMonthlyExpenses([]);
        });
    }, []),
  );

  const totalSpent = useMemo(
    () => monthlyExpenses.reduce((sum, item) => sum + item.amount, 0),
    [monthlyExpenses],
  );

  const categoryBreakdown = useMemo(() => {
    const grouped = monthlyExpenses.reduce<Record<string, number>>(
      (accumulator, transaction) => {
        const key = transaction.category || 'other';
        accumulator[key] = (accumulator[key] ?? 0) + transaction.amount;
        return accumulator;
      },
      {},
    );

    return Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  }, [monthlyExpenses]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionLabel}>Total spent this month</Text>
      <Text style={styles.totalAmount}>${totalSpent.toFixed(2)}</Text>

      <Text style={styles.sectionLabel}>Category breakdown</Text>
      {categoryBreakdown.length === 0 ? (
        <Text style={styles.emptyText}>No expenses this month yet.</Text>
      ) : (
        categoryBreakdown.map(([category, amount]) => (
          <View key={category} style={styles.row}>
            <Text style={styles.categoryText}>{category}</Text>
            <Text style={styles.amountText}>${amount.toFixed(2)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F8FA',
    flexGrow: 1,
    padding: 20,
  },
  sectionLabel: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
  },
  totalAmount: {
    color: '#111827',
    fontSize: 36,
    fontWeight: '600',
    marginBottom: 20,
    marginTop: 6,
  },
  row: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  categoryText: {
    color: '#111827',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  amountText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 10,
  },
});
