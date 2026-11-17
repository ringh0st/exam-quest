import { Button, ErrorText, Screen, Text, TextField, makeStyles } from '@exam-quest/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, View } from 'react-native';

import { appConfig } from '../config/appConfig';
import { isValidCode, isValidEmail, normalizeEmail } from '../features/auth/validation';
import { sendSignInCode, verifySignInCode, type AuthFailure } from '../services/auth';

type Step = 'email' | 'code';
type Problem = AuthFailure | 'emailInvalid' | 'codeInvalid';

const digits = appConfig.auth.codeLength;

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/me');
}

export default function SignInScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const problemText = (value: Problem) => {
    switch (value) {
      case 'emailInvalid':
        return t('auth.emailInvalid');
      case 'codeInvalid':
        return t('auth.codeInvalid', { digits });
      default:
        return t(`auth.errors.${value}`);
    }
  };

  const sendCode = async (resend: boolean) => {
    setNotice(null);
    if (!isValidEmail(email)) {
      setProblem('emailInvalid');
      return;
    }
    setBusy(true);
    const result = await sendSignInCode(email);
    setBusy(false);
    if (!result.ok) {
      setProblem(result.reason);
      return;
    }
    setProblem(null);
    setCode('');
    setStep('code');
    if (resend) {
      setNotice(t('auth.resent'));
      AccessibilityInfo.announceForAccessibility(t('auth.resent'));
    }
  };

  const verify = async () => {
    setNotice(null);
    if (!isValidCode(code)) {
      setProblem('codeInvalid');
      return;
    }
    setBusy(true);
    const result = await verifySignInCode(email, code);
    setBusy(false);
    if (!result.ok) {
      setProblem(result.reason);
      return;
    }
    AccessibilityInfo.announceForAccessibility(t('auth.signedIn'));
    close();
  };

  const error = problem ? problemText(problem) : undefined;
  // Field-specific problems show on the field; the rest show above the buttons.
  const fieldError = problem === 'emailInvalid' || problem === 'codeInvalid' ? error : undefined;
  const formError = fieldError ? undefined : error;

  return (
    <Screen>
      {step === 'email' ? (
        <>
          <Text variant="title">{t('auth.title')}</Text>
          <Text>{t('auth.intro', { digits })}</Text>
          <TextField
            label={t('auth.email')}
            hint={t('auth.emailHint')}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setProblem(null);
            }}
            error={fieldError}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="send"
            onSubmitEditing={() => void sendCode(false)}
          />
          {formError ? <ErrorText>{formError}</ErrorText> : null}
          <View style={styles.actions}>
            <Button
              label={t('auth.sendCode')}
              onPress={() => void sendCode(false)}
              loading={busy}
              fullWidth
            />
            <Button label={t('auth.cancel')} variant="quiet" onPress={close} />
          </View>
        </>
      ) : (
        <>
          <Text variant="title">{t('auth.codeTitle')}</Text>
          <Text>{t('auth.codeIntro', { digits, email: normalizeEmail(email) })}</Text>
          <TextField
            label={t('auth.code')}
            value={code}
            onChangeText={(value) => {
              setCode(value);
              setProblem(null);
            }}
            error={fieldError}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={digits + 2}
            returnKeyType="done"
            onSubmitEditing={() => void verify()}
          />
          {formError ? <ErrorText>{formError}</ErrorText> : null}
          {notice ? <Text color="textMuted">{notice}</Text> : null}
          <View style={styles.actions}>
            <Button
              label={t('auth.verify')}
              onPress={() => void verify()}
              loading={busy}
              fullWidth
            />
            <Button
              label={t('auth.resend')}
              variant="secondary"
              onPress={() => void sendCode(true)}
              disabled={busy}
            />
            <Button
              label={t('auth.changeEmail')}
              variant="quiet"
              onPress={() => {
                setStep('email');
                setProblem(null);
                setNotice(null);
              }}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const useStyles = makeStyles((theme) => ({
  actions: { gap: theme.space[3] },
}));
