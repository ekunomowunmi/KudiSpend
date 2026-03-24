import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBudget } from '../hooks/useBudget';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

function formatAmount(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function DashboardScreen({navigation}: Props): React.JSX.Element {
  const {budgetStatus, monthlySpent, remainingMonth, remainingToday} = useBudget();
  const statusLabel =
    budgetStatus === 'within_budget' ? 'Within budget' : 'Over budget';

  return (
    <View style={styles.container}>
      <Text style={styles.amount}>{formatAmount(remainingToday)}</Text>
      <Text style={styles.subtitle}>Left today</Text>

      <View style={styles.card}>
        <Text style={styles.rowLabel}>Monthly remaining</Text>
        <Text style={styles.rowValue}>{formatAmount(remainingMonth)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.rowLabel}>Monthly spent</Text>
        <Text style={styles.rowValue}>{formatAmount(monthlySpent)}</Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Budget status</Text>
        <Text
          style={[
            styles.statusValue,
            budgetStatus === 'within_budget'
              ? styles.statusGood
              : styles.statusOver,
          ]}>
          {statusLabel}
        </Text>
      </View>

      <Pressable
        onPress={() => navigation.navigate('AddExpense')}
        style={styles.button}>
        <Text style={styles.buttonText}>Add Expense</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F8FA',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  amount: {
    color: '#111827',
    fontSize: 42,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 16,
    marginBottom: 24,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 14,
  },
  rowLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  rowValue: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 6,
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  statusLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  statusGood: {
    color: '#16A34A',
  },
  statusOver: {
    color: '#DC2626',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 10,
    marginTop: 28,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
