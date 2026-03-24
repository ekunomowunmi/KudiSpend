import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useFocusEffect } from '@react-navigation/native';
import {
  getMonthlyExpenses,
  getProfile,
  getTodayExpenses,
  Transaction,
} from '../db/queries';

type BudgetStatus = 'within_budget' | 'over_budget';

type UseBudgetResult = {
  dailyBudget: number;
  todaySpent: number;
  remainingToday: number;
  monthlySpent: number;
  remainingMonth: number;
  budgetStatus: BudgetStatus;
};

export function useBudget(): UseBudgetResult {
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [todayExpenses, setTodayExpenses] = useState<Transaction[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<Transaction[]>([]);

  const loadBudgetData = useCallback(async (): Promise<void> => {
    const [profile, today, monthly] = await Promise.all([
      getProfile(),
      getTodayExpenses(),
      getMonthlyExpenses(),
    ]);

    setMonthlyIncome(profile?.monthlyIncome ?? 0);
    setTodayExpenses(today);
    setMonthlyExpenses(monthly);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initialLoad = async (): Promise<void> => {
      try {
        await loadBudgetData();
      } catch {
        if (isMounted) {
          setMonthlyIncome(0);
          setTodayExpenses([]);
          setMonthlyExpenses([]);
        }
      }
    };

    initialLoad().catch(() => {
      if (isMounted) {
        setMonthlyIncome(0);
        setTodayExpenses([]);
        setMonthlyExpenses([]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [loadBudgetData]);

  useFocusEffect(
    useCallback(() => {
      loadBudgetData().catch(() => {
        setMonthlyIncome(0);
        setTodayExpenses([]);
        setMonthlyExpenses([]);
      });
    }, [loadBudgetData]),
  );

  const daysInCurrentMonth = useMemo(() => dayjs().daysInMonth(), []);

  const todaySpent = useMemo(
    () => todayExpenses.reduce((sum, item) => sum + item.amount, 0),
    [todayExpenses],
  );

  const monthlySpent = useMemo(
    () => monthlyExpenses.reduce((sum, item) => sum + item.amount, 0),
    [monthlyExpenses],
  );

  const dailyBudget = useMemo(
    () => monthlyIncome / daysInCurrentMonth,
    [monthlyIncome, daysInCurrentMonth],
  );

  const remainingToday = useMemo(
    () => dailyBudget - todaySpent,
    [dailyBudget, todaySpent],
  );

  const remainingMonth = useMemo(
    () => monthlyIncome - monthlySpent,
    [monthlyIncome, monthlySpent],
  );

  const budgetStatus: BudgetStatus = useMemo(
    () => (monthlySpent <= monthlyIncome ? 'within_budget' : 'over_budget'),
    [monthlySpent, monthlyIncome],
  );

  return {
    budgetStatus,
    dailyBudget,
    monthlySpent,
    remainingMonth,
    remainingToday,
    todaySpent,
  };
}
