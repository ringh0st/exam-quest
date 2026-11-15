import { render, screen } from '@testing-library/react-native';

import { ErrorText } from '../ErrorText';

it('is announced as an alert', async () => {
  await render(<ErrorText>Choose a date</ErrorText>);
  expect(screen.getByRole('alert')).toHaveTextContent('Choose a date');
});
