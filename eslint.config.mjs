// Shared ESLint config for every workspace. `npm run lint` runs `eslint .` inside each workspace,
// and ESLint finds this file by walking up from there.
import expoConfig from 'eslint-config-expo/flat.js';
import reactNative from 'eslint-plugin-react-native';

const designSystemMessage =
  'Use the matching component from @exam-quest/ui. It handles tokens, touch target size and accessibility.';

export default [
  ...expoConfig,
  {
    ignores: [
      '**/node_modules/**',
      '**/.expo/**',
      '**/coverage/**',
      '**/dist/**',
      '**/expo-env.d.ts',
    ],
  },
  {
    plugins: { 'react-native': reactNative },
    rules: {
      // No hard-coded design values: colours and sizes come from design tokens.
      'react-native/no-color-literals': 'error',
      'react-native/no-inline-styles': 'error',
      'react-native/no-unused-styles': 'error',
      'react-native/no-single-element-style-arrays': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.object.name='StyleSheet'][callee.property.name='create'] Property[value.type='Literal'][value.value>1]",
          message:
            'No hard-coded sizes in styles. Use spacing, size and radius tokens from @exam-quest/ui.',
        },
      ],

      // No hard-coded copy: every user-facing string comes from the translation files.
      'react/jsx-no-literals': ['error', { noStrings: true, ignoreProps: true }],

      // Type safety.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    // App code builds UI only from design-system components, never from raw touchables or images.
    files: ['apps/**/*.{ts,tsx}'],
    ignores: ['**/__tests__/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: [
                'Button',
                'Image',
                'Pressable',
                'TouchableHighlight',
                'TouchableOpacity',
                'TouchableWithoutFeedback',
              ],
              message: designSystemMessage,
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/__tests__/**', '**/*.test.{ts,tsx}', '**/jest.setup.ts'],
    languageOptions: {
      globals: { jest: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly' },
    },
  },
];
