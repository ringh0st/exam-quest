import '../../i18n';

import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import en from '../../i18n/locales/en.json';
import HomeScreen from '../index';

describe('HomeScreen', () => {
  it('shows the app title as an accessible header', async () => {
    await render(
      <SafeAreaProvider>
        <HomeScreen />
      </SafeAreaProvider>,
    );

    expect(screen.getByRole('header', { name: en.home.title })).toBeOnTheScreen();
  });
});
