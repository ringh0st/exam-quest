import AsyncStorage from '@react-native-async-storage/async-storage';

import { useExams } from '../store';

beforeEach(async () => {
  await AsyncStorage.clear();
  useExams.setState({ exams: [] });
});

describe('exams store', () => {
  it('adds a validated exam with an id and saves it', async () => {
    const exam = useExams.getState().addExam({
      subject: { kind: 'known', id: 'biology' },
      topic: 'Photosynthesis',
      date: '2026-11-20',
    });

    expect(exam.id).toEqual(expect.any(String));
    expect(useExams.getState().exams).toEqual([exam]);
    const saved = JSON.parse((await AsyncStorage.getItem('exams')) ?? '{}') as {
      state: { exams: unknown[] };
    };
    expect(saved.state.exams).toHaveLength(1);
  });

  it('rejects invalid input', () => {
    expect(() =>
      useExams.getState().addExam({ subject: { kind: 'custom', name: '' }, date: '2026-11-20' }),
    ).toThrow();
    expect(useExams.getState().exams).toEqual([]);
  });

  it('removes an exam', () => {
    const exam = useExams
      .getState()
      .addExam({ subject: { kind: 'known', id: 'math' }, date: '2026-11-26' });
    useExams.getState().removeExam(exam.id);
    expect(useExams.getState().exams).toEqual([]);
  });

  it('drops corrupted saved exams when loading', async () => {
    await AsyncStorage.setItem(
      'exams',
      JSON.stringify({
        version: 1,
        state: {
          exams: [
            {
              id: 'ok',
              subject: { kind: 'known', id: 'history' },
              date: '2026-12-03',
              createdAt: '2026-11-01T00:00:00Z',
            },
            { id: 'bad', subject: { kind: 'known', id: 'alchemy' }, date: 'soon' },
          ],
        },
      }),
    );
    await useExams.persist.rehydrate();
    expect(useExams.getState().exams.map((exam) => exam.id)).toEqual(['ok']);
  });
});
