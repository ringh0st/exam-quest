import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '../../lib/id';
import { examSchema, newExamSchema, type Exam, type NewExam } from './model';

export interface ExamsState {
  exams: Exam[];
  /** Validates and saves a new exam; returns it. Throws if the input is invalid. */
  addExam: (input: NewExam) => Exam;
  removeExam: (id: string) => void;
}

export const useExams = create<ExamsState>()(
  persist(
    (set) => ({
      exams: [],
      addExam: (input) => {
        const exam: Exam = {
          ...newExamSchema.parse(input),
          id: createId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ exams: [...state.exams, exam] }));
        return exam;
      },
      removeExam: (id) => set((state) => ({ exams: state.exams.filter((exam) => exam.id !== id) })),
    }),
    {
      name: 'exams',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ exams }) => ({ exams }),
      // Saved data is untrusted: keep only exams that still match the schema.
      merge: (persisted, current) => {
        const saved = (persisted as { exams?: unknown } | undefined)?.exams;
        const exams = Array.isArray(saved)
          ? saved.flatMap((item) => {
              const parsed = examSchema.safeParse(item);
              return parsed.success ? [parsed.data] : [];
            })
          : [];
        return { ...current, exams };
      },
    },
  ),
);

export function useExam(id: string): Exam | undefined {
  return useExams((state) => state.exams.find((exam) => exam.id === id));
}
