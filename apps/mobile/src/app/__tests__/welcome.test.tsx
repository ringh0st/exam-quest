import { userEvent } from '@testing-library/react-native';
import { act, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { setSessionUser, useSession } from '../../features/auth/session';
import en from '../../i18n/locales/en.json';
import { signOut } from '../../services/auth';
import { acceptTerms } from '../../services/profile';

const acceptMock = jest.mocked(acceptTerms);
const student = { id: 'u1', email: 'aino@example.fi' };

beforeEach(() => {
  jest.clearAllMocks();
  useSession.setState({ status: 'loading' }, true);
});

async function arriveNeedingConsent() {
  const user = userEvent.setup();
  await renderRouter('./src/app', { initialUrl: '/me' });
  await act(async () => setSessionUser(student, 'needed'));
  await waitFor(() => expect(screen).toHavePathname('/welcome'));
  return user;
}

describe('welcome step', () => {
  it('sends a signed-in student who has not accepted the terms to the welcome step', async () => {
    await arriveNeedingConsent();
    expect(screen.getByRole('header', { name: en.welcome.title })).toBeOnTheScreen();
  });

  it('records consent once all three boxes are ticked', async () => {
    const user = await arriveNeedingConsent();

    await user.press(screen.getByRole('checkbox', { name: "I'm 13 or older." }));
    await user.press(screen.getByRole('checkbox', { name: en.welcome.upload }));
    await user.press(screen.getByRole('checkbox', { name: en.welcome.terms }));
    await user.press(screen.getByRole('button', { name: en.welcome.continue }));

    expect(acceptMock).toHaveBeenCalledWith('u1');
    await waitFor(() => expect(screen).toHavePathname('/'));
    const state = useSession.getState();
    expect(state.status === 'signedIn' && state.consent).toBe('given');
  });

  it('explains what is missing instead of continuing', async () => {
    const user = await arriveNeedingConsent();

    await user.press(screen.getByRole('checkbox', { name: "I'm 13 or older." }));
    await user.press(screen.getByRole('button', { name: en.welcome.continue }));

    expect(await screen.findByRole('alert')).toHaveTextContent(en.welcome.missing);
    expect(acceptMock).not.toHaveBeenCalled();
  });

  it('keeps the student on the step when saving fails', async () => {
    acceptMock.mockResolvedValueOnce(false);
    const user = await arriveNeedingConsent();
    for (const name of ["I'm 13 or older.", en.welcome.upload, en.welcome.terms]) {
      await user.press(screen.getByRole('checkbox', { name }));
    }
    await user.press(screen.getByRole('button', { name: en.welcome.continue }));

    expect(await screen.findByRole('alert')).toHaveTextContent(en.welcome.saveFailed);
    expect(screen).toHavePathname('/welcome');
  });

  it('lets a student under 13 sign out', async () => {
    const user = await arriveNeedingConsent();

    await user.press(screen.getByRole('button', { name: "I'm under 13" }));
    expect(
      screen.getByRole('header', { name: 'Quest Note is for students 13 and older' }),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: en.welcome.signOut }));

    expect(signOut).toHaveBeenCalled();
    expect(acceptMock).not.toHaveBeenCalled();
  });
});
