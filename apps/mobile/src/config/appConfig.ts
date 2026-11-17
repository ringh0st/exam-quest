/**
 * Product limits and rules in one place. Later these come from the backend (so they can change
 * without an app release); these values are the defaults.
 */
export const appConfig = {
  legal: {
    /**
     * Date the terms last changed in a way students must agree to again. Anyone who accepted
     * before this date is asked again on their next visit.
     */
    termsUpdatedAt: '2026-11-17',
  },
  auth: {
    /** Length of the one-time sign-in code sent by email (matches the Supabase email setting). */
    codeLength: 6,
  },
  plans: {
    free: { scansPerWeek: 3, tutorMessagesPerDay: 10, practiceTests: 1 },
  },
  notifications: {
    /** Product rule: at most one reminder a day. */
    maxPerDay: 1,
    /** Default quiet hours (local time, 24 h). The student can change them. */
    quietHours: { start: '22:00', end: '07:00' },
    /** Time of the exam-morning warm-up reminder (after quiet hours, before school). */
    examMorningTime: '07:30',
    /** Study reminder times the student can choose from. */
    studyTimeOptions: ['16:00', '17:00', '18:00', '19:00', '20:00'],
    defaultStudyTime: '17:00',
    /** Reminders a number of days before each exam, closest first (0 = exam morning). */
    daysBefore: [0, 1, 3, 7],
    /** How far ahead reminders are scheduled. Rescheduled whenever the app opens. */
    horizonDays: 30,
  },
  streaks: {
    /** Streaks are weekly with rest days, never daily. */
    defaultWeeklyGoalDays: 5,
    weeklyGoalOptions: [3, 5, 7],
  },
  scan: {
    /** Long edge after resizing a photo on the phone, in pixels (keeps AI image cost down). */
    maxImageEdgePx: 2576,
    maxPagesPerScan: 20,
  },
} as const;

export type AppConfig = typeof appConfig;
