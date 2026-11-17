import { userEvent } from '@testing-library/react-native';
import { act, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { setSessionUser } from '../../features/auth/session';
import en from '../../i18n/locales/en.json';
import { sendSignInCode, signOut, verifySignInCode } from '../../services/auth';

const sendMock = jest.mocked(sendSignInCode);
const verifyMock = jest.mocked(verifySignInCode);

beforeEach(() => {
  jest.clearAllMocks();
});

async function openSignIn() {
  const user = userEvent.setup();
  await renderRouter('./src/app', { initialUrl: '/me' });
  await user.press(await screen.findByRole('button', { name: en.me.account.signIn }));
  return user;
}

describe('sign-in', () => {
  it('signs in with an emailed code and returns to Me', async () => {
    const user = await openSignIn();

    await user.type(screen.getByLabelText(en.auth.email), ' Aino@Example.fi ');
    await user.press(screen.getByRole('button', { name: en.auth.sendCode }));

    expect(sendMock).toHaveBeenCalledWith(' Aino@Example.fi ');
    expect(await screen.findByText(/aino@example\.fi/)).toBeOnTheScreen();

    await user.type(screen.getByLabelText(en.auth.code), '123 456');
    await user.press(screen.getByRole('button', { name: en.auth.verify }));

    expect(verifyMock).toHaveBeenCalledWith(' Aino@Example.fi ', '123 456');
    await waitFor(() => expect(screen).toHavePathname('/me'));
  });

  it('explains a mistyped email instead of sending', async () => {
    const user = await openSignIn();

    await user.type(screen.getByLabelText(en.auth.email), 'aino@');
    await user.press(screen.getByRole('button', { name: en.auth.sendCode }));

    expect(await screen.findByRole('alert')).toHaveTextContent(en.auth.emailInvalid);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('explains a wrong or expired code and lets the student get a new one', async () => {
    verifyMock.mockResolvedValueOnce({ ok: false, reason: 'invalidCode' });
    const user = await openSignIn();
    await user.type(screen.getByLabelText(en.auth.email), 'aino@example.fi');
    await user.press(screen.getByRole('button', { name: en.auth.sendCode }));

    await user.type(await screen.findByLabelText(en.auth.code), '000000');
    await user.press(screen.getByRole('button', { name: en.auth.verify }));
    expect(await screen.findByRole('alert')).toHaveTextContent(en.auth.errors.invalidCode);

    await user.press(screen.getByRole('button', { name: en.auth.resend }));
    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(await screen.findByText(en.auth.resent)).toBeOnTheScreen();
  });

  it('asks for the full code before checking it', async () => {
    const user = await openSignIn();
    await user.type(screen.getByLabelText(en.auth.email), 'aino@example.fi');
    await user.press(screen.getByRole('button', { name: en.auth.sendCode }));

    await user.type(await screen.findByLabelText(en.auth.code), '123');
    await user.press(screen.getByRole('button', { name: en.auth.verify }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Enter the 6-digit code from the email.',
    );
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('shows when sending is rate limited', async () => {
    sendMock.mockResolvedValueOnce({ ok: false, reason: 'rateLimited' });
    const user = await openSignIn();
    await user.type(screen.getByLabelText(en.auth.email), 'aino@example.fi');
    await user.press(screen.getByRole('button', { name: en.auth.sendCode }));

    expect(await screen.findByRole('alert')).toHaveTextContent(en.auth.errors.rateLimited);
  });
});

describe('account card', () => {
  it('shows who is signed in and signs out', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/me' });
    act(() => setSessionUser({ id: 'u1', email: 'aino@example.fi' }));

    expect(await screen.findByText('Signed in as aino@example.fi')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: en.me.account.signOut }));
    expect(signOut).toHaveBeenCalled();
  });
});
