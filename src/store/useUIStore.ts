import { create } from 'zustand';

type UIStore = {
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
};

export const useUIStore = create<UIStore>(set => ({
  selectedCategory: null,
  setSelectedCategory: category => set({selectedCategory: category}),
}));
