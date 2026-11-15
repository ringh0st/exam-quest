import { Pressable, View } from 'react-native';

import { makeStyles } from '../theme/makeStyles';
import { Button } from './Button';
import { Text } from './Text';

export interface CalendarDay {
  /** Stable key, e.g. an ISO date. */
  key: string;
  /** Visible day number. */
  label: string;
  /** Full description for screen readers, e.g. "Friday, November 20: Biology test". */
  accessibilityLabel: string;
  /** Has events (shown with a dot and bold text, not colour alone). */
  marked: boolean;
  selected: boolean;
  today: boolean;
}

export interface MonthCalendarProps {
  /** e.g. "November 2026" */
  title: string;
  /** Short weekday names in display order, e.g. ["Mon", …]. */
  weekdayLabels: readonly string[];
  /** Weeks of 7 cells; `null` for days outside the month. */
  weeks: readonly (readonly (CalendarDay | null)[])[];
  onSelectDay: (key: string) => void;
  previousLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onNext: () => void;
}

export function MonthCalendar({
  title,
  weekdayLabels,
  weeks,
  onSelectDay,
  previousLabel,
  nextLabel,
  onPrevious,
  onNext,
}: MonthCalendarProps) {
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Button label={previousLabel} variant="quiet" onPress={onPrevious} />
        <Text variant="heading" align="center">
          {title}
        </Text>
        <Button label={nextLabel} variant="quiet" onPress={onNext} />
      </View>

      <View
        style={styles.row}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        {weekdayLabels.map((weekday) => (
          <View key={weekday} style={styles.cell}>
            <Text variant="caption" color="textMuted" align="center">
              {weekday}
            </Text>
          </View>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.row}>
          {week.map((day, dayIndex) =>
            day ? (
              <Pressable
                key={day.key}
                onPress={() => onSelectDay(day.key)}
                accessibilityRole="button"
                accessibilityLabel={day.accessibilityLabel}
                accessibilityState={{ selected: day.selected }}
                style={({ pressed }) => [
                  styles.cell,
                  styles.day,
                  day.today && styles.today,
                  day.selected && styles.selected,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  variant={day.marked ? 'bodyStrong' : 'body'}
                  color={day.selected ? 'onPrimary' : 'text'}
                  align="center"
                >
                  {day.label}
                </Text>
                <View
                  style={[
                    styles.dot,
                    day.marked ? (day.selected ? styles.dotOnSelected : styles.dotMarked) : null,
                  ]}
                />
              </Pressable>
            ) : (
              <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.cell} />
            ),
          )}
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { gap: t.space[1] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  row: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  day: {
    minHeight: t.size.minTouchTarget,
    borderRadius: t.radius.md,
    borderWidth: t.borderWidth.regular,
    borderColor: 'transparent',
    paddingVertical: t.space[1],
  },
  today: { borderColor: t.colors.focusRing },
  selected: { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
  pressed: { opacity: 0.85 },
  dot: {
    width: t.space[1] + t.space[1] / 2,
    height: t.space[1] + t.space[1] / 2,
    borderRadius: t.radius.pill,
  },
  dotMarked: { backgroundColor: t.colors.accent },
  dotOnSelected: { backgroundColor: t.colors.onPrimary },
}));
