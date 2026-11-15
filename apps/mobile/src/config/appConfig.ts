/**
 * Product limits and rules in one place. Later these come from the backend (so they can change
 * without an app release); these values are the defaults.
 */
export const appConfig = {
  plans: {
    free: { scansPerWeek: 3, tutorMessagesPerDay: 10, practiceTests: 1 },
  },
  notifications: {
    /** Product rule: at most one reminder a day. */
    maxPerDay: 1,
    /** Default quiet hours (local time, 24 h). The student can change them. */
    quietHours: { start: '22:00', end: '07:00' },
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
