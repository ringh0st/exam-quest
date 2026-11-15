import type { CountryPack } from './types';

/**
 * Finland. Sources: Data Protection Act 1050/2018 (digital consent age 13), LOPS 2021 and
 * OPS 2014 (grades 4–10), Matriculation Examination Board (grades L–I), Basic Education Act
 * amendment in force 1 Aug 2025 (phones in lessons).
 *
 * Help resources must be re-verified before launch (see the launch checklist).
 */
export const fi: CountryPack = {
  code: 'FI',
  minimumAge: 13,
  guardianApprovalForPurchasesUnder: 18,
  schoolTypes: ['lowerSecondary', 'upperSecondary', 'vocational'],
  subjects: [
    'finnish',
    'swedish',
    'english',
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
    'german',
    'french',
    'spanish',
  ],
  grades: {
    course: { min: 4, max: 10, pass: 5 },
    finalExam: ['L', 'E', 'M', 'C', 'B', 'A', 'I'],
  },
  schoolHours: { start: '08:00', end: '15:00' },
  weekStartsOn: 1,
  hasExamWeeks: true,
  helpResources: [
    { id: 'emergency', name: '112', kind: 'emergency', phone: '112' },
    { id: 'mieli', name: 'MIELI Crisis Helpline', kind: 'phone', phone: '09 2525 0111' },
    { id: 'sekasin', name: 'Sekasin chat', kind: 'chat', url: 'https://sekasin.fi' },
    { id: 'school', name: 'School nurse or kuraattori', kind: 'school' },
  ],
};
