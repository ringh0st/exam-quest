import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { useExams } from '../../features/exams/store';
import en from '../../i18n/locales/en.json';

beforeEach(async () => {
  await AsyncStorage.clear();
  useExams.setState({ exams: [] });
});

async function addBiologyExamForTomorrow() {
  const user = userEvent.setup();
  const router = await renderRouter('./src/app', { initialUrl: '/exams' });

  await user.press(await screen.findByRole('button', { name: en.exams.add }));
  await user.press(await screen.findByRole('button', { name: en.subjects.biology }));
  await user.press(screen.getByRole('button', { name: en.exams.new.tomorrow }));
  await user.type(screen.getByLabelText(en.exams.new.topic), 'Photosynthesis');
  await user.press(screen.getByRole('button', { name: en.exams.new.save }));
  return { user, router };
}

describe('exams', () => {
  it('adds an exam in three taps and shows it as next up', async () => {
    const { router } = await addBiologyExamForTomorrow();

    expect(router.getPathname()).toBe('/exams');
    expect(await screen.findByText(en.exams.nextUp)).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: new RegExp(`^${en.subjects.biology}, .*, Tomorrow$`) }),
    ).toBeOnTheScreen();
    expect(useExams.getState().exams).toEqual([
      expect.objectContaining({
        subject: { kind: 'known', id: 'biology' },
        topic: 'Photosynthesis',
      }),
    ]);
  });

  it('explains what is missing instead of saving an incomplete exam', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/exams/new' });

    await user.press(await screen.findByRole('button', { name: en.exams.new.save }));
    expect(screen.getAllByRole('alert')).toHaveLength(2);
    expect(screen.getByText(en.exams.new.subjectError)).toBeOnTheScreen();
    expect(screen.getByText(en.exams.new.dateError)).toBeOnTheScreen();
    expect(useExams.getState().exams).toEqual([]);
  });

  it('requires a name for a custom subject', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/exams/new' });

    await user.press(await screen.findByRole('button', { name: en.exams.new.other }));
    await user.press(screen.getByRole('button', { name: en.exams.new.nextWeek }));
    await user.press(screen.getByRole('button', { name: en.exams.new.save }));
    expect(screen.getByText(en.exams.new.customSubjectError)).toBeOnTheScreen();

    await user.type(screen.getByLabelText(en.exams.new.customSubject), 'Music');
    await user.press(screen.getByRole('button', { name: en.exams.new.save }));
    expect(useExams.getState().exams).toEqual([
      expect.objectContaining({ subject: { kind: 'custom', name: 'Music' } }),
    ]);
  });

  it('deletes an exam only after confirming', async () => {
    const { user, router } = await addBiologyExamForTomorrow();

    await user.press(
      await screen.findByRole('button', { name: new RegExp(`^${en.subjects.biology}, `) }),
    );
    expect(router.getPathname()).toMatch(/^\/exams\/.+/);
    expect(await screen.findByText('Photosynthesis')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: en.exams.detail.delete }));
    await user.press(screen.getByRole('button', { name: en.exams.detail.keep }));
    expect(useExams.getState().exams).toHaveLength(1);

    await user.press(screen.getByRole('button', { name: en.exams.detail.delete }));
    await user.press(screen.getByRole('button', { name: en.exams.detail.deleteConfirm }));
    expect(useExams.getState().exams).toEqual([]);
    expect(router.getPathname()).toBe('/exams');
  });
});
