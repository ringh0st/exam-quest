import { Ionicons } from '@expo/vector-icons';
import { makeStyles, useTheme } from '@exam-quest/ui';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

type IconName = ComponentProps<typeof Ionicons>['name'];

const tabIcons = {
  index: ['map-outline', 'map'],
  exams: ['calendar-outline', 'calendar'],
  squad: ['people-outline', 'people'],
  me: ['person-circle-outline', 'person-circle'],
} as const satisfies Record<string, readonly [IconName, IconName]>;

export default function TabsLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        tabBarAllowFontScaling: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.quests'),
          tabBarIcon: (props) => <TabIcon name="index" {...props} />,
        }}
      />
      <Tabs.Screen
        name="exams"
        options={{
          title: t('tabs.exams'),
          tabBarIcon: (props) => <TabIcon name="exams" {...props} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: t('tabs.add'),
          tabBarIcon: () => (
            <View style={styles.addIcon}>
              <Ionicons name="camera" color={theme.colors.onAccent} size={theme.size.icon.md} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="squad"
        options={{
          title: t('tabs.squad'),
          tabBarIcon: (props) => <TabIcon name="squad" {...props} />,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{ title: t('tabs.me'), tabBarIcon: (props) => <TabIcon name="me" {...props} /> }}
      />
    </Tabs>
  );
}

/** Outline icon normally, filled when the tab is selected. Decorative: the tab label names it. */
function TabIcon({
  name,
  focused,
  size,
}: {
  name: keyof typeof tabIcons;
  focused: boolean;
  size: number;
}) {
  const theme = useTheme();
  return (
    <Ionicons
      name={tabIcons[name][focused ? 1 : 0]}
      color={focused ? theme.colors.primary : theme.colors.textMuted}
      size={size}
    />
  );
}

const useStyles = makeStyles((theme) => ({
  bar: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border,
    borderTopWidth: theme.borderWidth.regular,
  },
  label: { fontFamily: theme.fonts.medium },
  addIcon: {
    width: theme.size.minTouchTarget,
    height: theme.size.minTouchTarget,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
