import { fontFaces } from '@exam-quest/ui';

import { fontAssets } from '../fonts';

it('loads a font file for every face the design system uses', () => {
  const used = Object.values(fontFaces).flatMap((faces) => Object.values(faces));
  expect(Object.keys(fontAssets).sort()).toEqual([...new Set(used)].sort());
});
