// Safe-area metrics are unknown in tests, so use the library's own mock (it renders children
// immediately with fixed insets).
jest.mock(
  'react-native-safe-area-context',
  () =>
    jest.requireActual<{ default: unknown }>('react-native-safe-area-context/jest/mock').default,
);

// In-memory AsyncStorage provided by the library.
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// expo-crypto's native module is not available in Jest; Node provides the same UUID function.
jest.mock('expo-crypto', () => ({
  ...jest.requireActual<object>('expo-crypto'),
  randomUUID: () => jest.requireActual<{ randomUUID: () => string }>('crypto').randomUUID(),
}));

// Native notification scheduling is not available in Jest. Tests can inspect these mocks.
jest.mock('./src/services/notifications', () => ({
  configureNotificationHandler: jest.fn(),
  ensureNotificationPermission: jest.fn(() => Promise.resolve(true)),
  replaceScheduledNotifications: jest.fn(() => Promise.resolve()),
  cancelScheduledNotifications: jest.fn(() => Promise.resolve()),
}));

// The backend is not reachable in Jest. Tests drive sign-in through these mocks; by default the
// student is signed out and every call succeeds.
jest.mock('./src/services/auth', () => ({
  sendSignInCode: jest.fn(() => Promise.resolve({ ok: true })),
  verifySignInCode: jest.fn(() => Promise.resolve({ ok: true })),
  signOut: jest.fn(() => Promise.resolve()),
  onSessionChange: jest.fn((callback: (user: null) => void) => {
    callback(null);
    return () => undefined;
  }),
}));

jest.mock('./src/services/profile', () => ({
  fetchTermsAcceptedAt: jest.fn(() => Promise.resolve('2099-01-01T00:00:00Z')),
  acceptTerms: jest.fn(() => Promise.resolve(true)),
}));
