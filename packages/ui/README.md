# @exam-quest/ui

The design system. All colours, type, spacing, radii and motion live here, and nowhere else.

## Tokens

| Module              | What it holds                                                       |
| ------------------- | ------------------------------------------------------------------- |
| `tokens/palette`    | Raw brand colours. Never used directly by components.               |
| `tokens/scale`      | `space` (4 pt grid), `radius`, `borderWidth`, `size` (touch target) |
| `tokens/typography` | Font families and the text style scale                              |
| `tokens/motion`     | Animation durations                                                 |

## Themes

Three themes share the same semantic colour roles (`background`, `surface`, `text`, `textMuted`,
`primary`/`onPrimary`, `accent`/`onAccent`, `success*`, `warning*`, `danger*`, `focusRing`…):

- `light`: the default gamified look
- `dark`: follows the phone's dark mode
- `calm`: calm mode, with no game layer (`theme.playful === false`)

Every text/background pair is tested against WCAG 2.2 AA (4.5:1 for text, 3:1 for focus rings
and meaningful UI) in `src/theme/__tests__/themes.test.ts`. Adding a theme or changing a colour
that breaks a pair fails CI.

## Usage

```tsx
import { ThemeProvider, makeStyles, useTheme, useReducedMotion } from '@exam-quest/ui';

const useStyles = makeStyles((t) => ({
  card: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    padding: t.space[4],
  },
  title: { ...t.textStyle.heading, color: t.colors.text },
}));
```

- Wrap the app in `<ThemeProvider appearance="system" calm={false}>`.
- Use `useTheme()` for values outside styles (for example `theme.playful` to hide XP in calm mode).
- Use `useReducedMotion()` to skip animations when the student asks the phone to reduce motion.

## Coming next

Core components (Text, Button, Card, Chip, ProgressBar, Sheet, TabBar, Toggle…) with previews.
