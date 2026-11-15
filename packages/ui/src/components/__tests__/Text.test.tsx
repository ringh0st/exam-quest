import { render, screen } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { calmTheme, lightTheme } from '../../theme/themes';
import { textStyle } from '../../tokens/typography';
import { Text } from '../Text';

describe('Text', () => {
  it('marks title variants as headers for screen readers', async () => {
    await render(<Text variant="title">Today</Text>);
    expect(screen.getByRole('header', { name: 'Today' })).toBeOnTheScreen();
  });

  it('does not mark body text as a header', async () => {
    await render(<Text>Plain</Text>);
    expect(screen.queryByRole('header')).toBeNull();
  });

  it('uses the font face and colour of the active theme', async () => {
    await render(
      <ThemeProvider calm>
        <Text variant="bodyStrong" color="textMuted">
          Calm
        </Text>
      </ThemeProvider>,
    );
    expect(screen.getByText('Calm')).toHaveStyle({
      fontFamily: calmTheme.fonts.bold,
      color: calmTheme.colors.textMuted,
    });
  });

  it('scales line height with the system font size', async () => {
    jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({
      width: 390,
      height: 844,
      scale: 3,
      fontScale: 2,
    });
    await render(<Text>Large</Text>);
    expect(screen.getByText('Large')).toHaveStyle({
      lineHeight: textStyle.body.lineHeight * 2,
      fontFamily: lightTheme.fonts.regular,
    });
  });
});
