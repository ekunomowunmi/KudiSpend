import { create } from 'zustand';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

type Expense = {
  amount: number;
  category: string;
  createdAt: string;
  id: string;
  note?: string;
};

type BudgetStore = {
  addExpense: (expense: Omit<Expense, 'createdAt' | 'id'>) => void;
  expenses: Expense[];
};

export const useBudgetStore = create<BudgetStore>(set => ({
  addExpense: expense =>
    set(state => ({
      expenses: [
        ...state.expenses,
        {
          ...expense,
          createdAt: dayjs().toISOString(),
          id: uuidv4(),
        },
      ],
    })),
  expenses: [],
}));
