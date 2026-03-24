import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { addExpense } from '../db/queries';
import { useUIStore } from '../store/useUIStore';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AddExpense'>;

const CATEGORIES = ['food', 'transport', 'bills', 'other'] as const;

export function AddExpenseScreen({navigation}: Props): React.JSX.Element {
  const {selectedCategory, setSelectedCategory} = useUIStore();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const activeCategory = selectedCategory ?? 'food';

  const parsedAmount = useMemo(() => Number(amount), [amount]);
  const canSubmit = parsedAmount > 0 && !isSaving;

  const handleSubmit = async (): Promise<void> => {
    if (!canSubmit) {
      return;
    }

    setIsSaving(true);
    try {
      await addExpense(parsedAmount, activeCategory, note.trim());
      navigation.goBack();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Amount</Text>
      <TextInput
        keyboardType="decimal-pad"
        onChangeText={setAmount}
        placeholder="0.00"
        style={styles.input}
        value={amount}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryRow}>
        {CATEGORIES.map(category => {
          const isActive = category === activeCategory;
          return (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[styles.categoryButton, isActive && styles.categoryActive]}>
              <Text
                style={[
                  styles.categoryText,
                  isActive && styles.categoryTextActive,
                ]}>
                {category}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Note (optional)</Text>
      <TextInput
        onChangeText={setNote}
        placeholder="Add a note"
        style={styles.input}
        value={note}
      />

      <Pressable
        disabled={!canSubmit}
        onPress={handleSubmit}
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}>
        <Text style={styles.submitButtonText}>
          {isSaving ? 'Saving...' : 'Save Expense'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F8FA',
    flex: 1,
    padding: 20,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryActive: {
    backgroundColor: '#111827',
  },
  categoryText: {
    color: '#111827',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 10,
    marginTop: 24,
    paddingVertical: 14,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
