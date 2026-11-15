import '../../i18n';

import { render, screen, userEvent } from '@testing-library/react-native';

import en from '../../i18n/locales/en.json';
import ComponentPreviewScreen from '../dev/components';

describe('Component preview', () => {
  it('renders the design system components with accessible roles', async () => {
    await render(<ComponentPreviewScreen />);
    expect(screen.getByRole('header', { name: en.dev.components.title })).toBeOnTheScreen();
    expect(screen.getAllByRole('button', { name: en.dev.components.startLevel })).toHaveLength(2);
    expect(screen.getAllByRole('progressbar', { name: en.dev.components.readiness })).toHaveLength(
      2,
    );
  });

  it('switches to calm mode', async () => {
    const user = userEvent.setup();
    await render(<ComponentPreviewScreen />);
    await user.press(screen.getByRole('switch', { name: en.dev.components.calmMode }));
    expect(screen.getByRole('switch', { name: en.dev.components.calmMode })).toBeChecked();
  });
});
