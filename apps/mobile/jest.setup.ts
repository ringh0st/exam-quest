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
