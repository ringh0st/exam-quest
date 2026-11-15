import { render, screen } from '@testing-library/react-native';
import { View } from 'react-native';

import { makeStyles } from '../makeStyles';
import { ThemeProvider } from '../ThemeProvider';
import { darkTheme, lightTheme } from '../themes';

const useStyles = makeStyles((theme) => ({
  box: { backgroundColor: theme.colors.surface, padding: theme.space[4] },
}));

function Box() {
  const styles = useStyles();
  return <View testID="box" style={styles.box} />;
}

describe('makeStyles', () => {
  it.each([
    ['light', lightTheme.colors.surface],
    ['dark', darkTheme.colors.surface],
  ] as const)('builds styles from the %s theme', async (appearance, surface) => {
    await render(
      <ThemeProvider appearance={appearance}>
        <Box />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('box')).toHaveStyle({ backgroundColor: surface, padding: 16 });
  });
});
