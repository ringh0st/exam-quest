import { Button, Card, Checkbox, ErrorText, Screen, Text, makeStyles } from '@exam-quest/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, View } from 'react-native';

import { getCountryPack } from '../countries';
import { setConsent, useSession } from '../features/auth/session';
import { useSettings } from '../features/settings/store';
import { signOut } from '../services/auth';
import { acceptTerms } from '../services/profile';

const pointKeys = ['ai', 'private', 'delete'] as const;

/** First step after signing in: age confirmation, responsibility for uploads, and the terms. */
export default function WelcomeScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const session = useSession();
  const age = getCountryPack(useSettings((state) => state.country)).minimumAge;
  const [ageOk, setAgeOk] = useState(false);
  const [uploadOk, setUploadOk] = useState(false);
  const [termsOk, setTermsOk] = useState(false);
  const [problem, setProblem] = useState<'missing' | 'saveFailed' | null>(null);
  const [saving, setSaving] = useState(false);
  const [underAge, setUnderAge] = useState(false);

  const leave = () => {
    void signOut();
    router.replace('/');
  };

  const confirm = async () => {
    if (session.status !== 'signedIn') return;
    if (!ageOk || !uploadOk || !termsOk) {
      setProblem('missing');
      return;
    }
    setSaving(true);
    const saved = await acceptTerms(session.user.id);
    setSaving(false);
    if (!saved) {
      setProblem('saveFailed');
      return;
    }
    setConsent('given');
    AccessibilityInfo.announceForAccessibility(t('welcome.done'));
    router.replace('/');
  };

  if (underAge) {
    return (
      <Screen>
        <Text variant="title">{t('welcome.underAgeTitle', { age })}</Text>
        <Text>{t('welcome.underAgeBody')}</Text>
        <View style={styles.actions}>
          <Button label={t('welcome.signOut')} onPress={leave} fullWidth />
          <Button label={t('welcome.back')} variant="quiet" onPress={() => setUnderAge(false)} />
        </View>
      </Screen>
    );
  }

  const check = (setter: (value: boolean) => void) => (value: boolean) => {
    setter(value);
    setProblem(null);
  };

  return (
    <Screen>
      <Text variant="title">{t('welcome.title')}</Text>
      <Text>{t('welcome.intro')}</Text>

      <Card>
        <Text variant="heading">{t('welcome.pointsTitle')}</Text>
        {pointKeys.map((key) => (
          <Text key={key}>{t(`welcome.points.${key}`)}</Text>
        ))}
      </Card>

      <View>
        <Checkbox
          label={t('welcome.age', { age })}
          checked={ageOk}
          onCheckedChange={check(setAgeOk)}
        />
        <Checkbox
          label={t('welcome.upload')}
          description={t('welcome.uploadHint')}
          checked={uploadOk}
          onCheckedChange={check(setUploadOk)}
        />
        <Checkbox
          label={t('welcome.terms')}
          checked={termsOk}
          onCheckedChange={check(setTermsOk)}
        />
      </View>

      {problem ? <ErrorText>{t(`welcome.${problem}`)}</ErrorText> : null}

      <View style={styles.actions}>
        <Button
          label={t('welcome.continue')}
          onPress={() => void confirm()}
          loading={saving}
          fullWidth
        />
        <Button
          label={t('welcome.underAge', { age })}
          variant="quiet"
          onPress={() => setUnderAge(true)}
        />
      </View>
    </Screen>
  );
}

const useStyles = makeStyles((theme) => ({
  actions: { gap: theme.space[3] },
}));
