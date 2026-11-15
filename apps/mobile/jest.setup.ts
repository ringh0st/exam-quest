// Safe-area metrics are unknown in tests, so use the library's own mock (it renders children
// immediately with fixed insets).
jest.mock(
  'react-native-safe-area-context',
  () =>
    jest.requireActual<{ default: unknown }>('react-native-safe-area-context/jest/mock').default,
);
