/** Subjects a student can pick. Country packs choose which ones they offer, in order. */
export const subjectIds = [
  'motherTongue',
  'finnish',
  'swedish',
  'english',
  'german',
  'french',
  'spanish',
  'math',
  'physics',
  'chemistry',
  'biology',
  'geography',
  'history',
  'socialStudies',
  'religion',
  'ethics',
  'philosophy',
  'psychology',
  'healthEducation',
] as const;

export type SubjectId = (typeof subjectIds)[number];
