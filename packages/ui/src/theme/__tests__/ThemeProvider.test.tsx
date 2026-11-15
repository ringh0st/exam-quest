import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ThemeProvider, resolveTheme, useTheme } from '../ThemeProvider';

describe('resolveTheme', () => {
  it('follows the system scheme by default', () => {
    expect(resolveTheme({ appearance: 'system', calm: false, systemScheme: 'dark' }).name).toBe(
      'dark',
    );
    expect(resolveTheme({ appearance: 'system', calm: false, systemScheme: 'light' }).name).toBe(
      'light',
    );
    expect(resolveTheme({ appearance: 'system', calm: false, systemScheme: null }).name).toBe(
      'light',
    );
  });

  it("lets the student's choice override the system", () => {
    expect(resolveTheme({ appearance: 'light', calm: false, systemScheme: 'dark' }).name).toBe(
      'light',
    );
  });

  it('uses the calm theme, without game elements, in calm mode', () => {
    const theme = resolveTheme({ appearance: 'dark', calm: true, systemScheme: 'dark' });
    expect(theme.name).toBe('calm');
    expect(theme.playful).toBe(false);
  });
});

function ThemeName() {
  const theme = useTheme();
  return <Text>{theme.name}</Text>;
}

describe('ThemeProvider', () => {
  it('provides the resolved theme to components', async () => {
    await render(
      <ThemeProvider appearance="dark">
        <ThemeName />
      </ThemeProvider>,
    );
    expect(screen.getByText('dark')).toBeOnTheScreen();
  });

  it('falls back to the light theme without a provider', async () => {
    await render(<ThemeName />);
    expect(screen.getByText('light')).toBeOnTheScreen();
  });
});
