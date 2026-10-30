export const HOMEPAGE_PRICING = {
  receptionToYear3: {
    title: 'Reception to Year 3',
    subtitle: 'N12,000 per hour, billed every four weeks.',
    options: [
      { hours: '3 Hours Per Week', ngn: 'N144,000 / four weeks' },
      { hours: '4 Hours Per Week', ngn: 'N192,000 / four weeks' },
      { hours: '5 Hours Per Week', ngn: 'N240,000 / four weeks' },
    ],
    bonus: '1-hour FREE monthly assessment session for two subjects of your choice.',
  },
  year4To5ElevenPlus: {
    title: 'Year 4 and 5 (11+ Preparation Classes)',
    options: [
      'Option 1: One-on-One Classes',
      'Option 2: Group Class (Max of 6 learners) - N160,000/month',
    ],
    groupDetails: [
      'Subjects: Maths, English, Verbal & Non-Verbal Reasoning',
      'Schedule: Twice weekly',
      'Days: Monday & Thursday',
      'Time: 5:00 PM - 8:00 PM',
      'Continuous assessments after every class',
      'Monthly mock examination',
    ],
    parentOptions: [
      '11+ Combined Package: One-on-One classes + Group Class (N256,000/month).',
      '11+ Group Class only: N160,000/month.',
      'One-on-One class only Package: One-on-One classes for all 4 subjects.',
    ],
  },
  year5To6Sat: {
    title: 'Year 5 and 6 (SAT Preparation Classes)',
    options: [
      'Option 1: One-on-One Classes',
      'Option 2: Group Class (Max of 6 learners) - N160,000/month',
      'Subjects: Maths (Paper 1 Arithmetic, Papers 2 & 3 Reasoning), English (Reading and SPaG - Spelling, Punctuation and Grammar), and Science.',
    ],
  },
  examPackagePrices: {
    elevenPlusGroup: 'N160,000/month',
    elevenPlusCombined: 'N256,000/month',
    satGroup: 'N160,000/month',
  },
  year4To11: {
    title: 'Year 4 - Year 11',
    subtitle: 'N12,000 per hour, billed every four weeks.',
    options: [
      { hours: '3 Hours Per Week', ngn: 'N144,000 / four weeks' },
      { hours: '4 Hours Per Week', ngn: 'N192,000 / four weeks' },
      { hours: '5 Hours Per Week', ngn: 'N240,000 / four weeks' },
      { hours: '6 Hours Per Week', ngn: 'N288,000 / four weeks' },
    ],
    bonuses: [
      'Bonus A: 2-hour FREE group classes on any two subjects (Language, Science or English).',
      'Bonus B: 1-hour FREE monthly assessment session for two subjects of your choice.',
    ],
  },
  subjectsOffered: [
    'Maths',
    'English',
    'Verbal & Non-Verbal Reasoning',
    'Biology',
    'Chemistry',
    'Physics',
    'ICT',
    'Yoruba',
    'French',
    'Igbo',
  ],
  examsPrepared: [
    '11+',
    'GCSE',
    'SATs',
    'National 5 exam',
    'Other entrance and academic examinations',
  ],
  ageGroup: ['Ages 3 - 16 years', 'Nursery to Year 11 / S4'],
} as const;

export const PRICING_KNOWLEDGE_BLOCK = `
-- Reception - Year 3 (One-on-One Classes) --
N12,000 per hour, billed every four weeks.
* 3 Hours/Week -> N144,000 / four weeks
* 4 Hours/Week -> N192,000 / four weeks
* 5 Hours/Week -> N240,000 / four weeks
Bonus: 1-hour FREE monthly assessment session for two subjects of your choice.

-- Year 4 and 5 (11+ Preparation Classes) --
Option 1: One-on-One Classes.
Option 2: Group Class (max 6 learners) -> N160,000/month.
Group class details:
* Subjects: Maths, English, Verbal & Non-Verbal Reasoning
* Schedule: Twice weekly
* Days: Monday & Thursday
* Time: 5:00 PM - 8:00 PM
* Continuous assessments after every class
* Monthly mock examination
Parent package options:
* 11+ Combined Package (One-on-One + Group) -> N256,000/month
* 11+ Group Class only -> N160,000/month
* One-on-One class only package for all 4 subjects

-- Year 5 and 6 (SAT Preparation Classes) --
Option 1: One-on-One Classes.
Option 2: Group Class (max 6 learners) -> N160,000/month.
Subjects: Maths (Paper 1 Arithmetic, Papers 2 & 3 Reasoning), English (Reading and SPaG - Spelling, Punctuation and Grammar), and Science.

-- Year 4 - Year 11 (General / Flexible Subjects) --
N12,000 per hour, billed every four weeks.
* 3 Hours/Week -> N144,000 / four weeks
* 4 Hours/Week -> N192,000 / four weeks
* 5 Hours/Week -> N240,000 / four weeks
* 6 Hours/Week -> N288,000 / four weeks
* GCSE One-on-One support follows the Year 4 - Year 11 plans above.
Bonus A: 2-hour FREE group classes on any two subjects (Language, Science or English).
Bonus B: 1-hour FREE monthly assessment session for two subjects of your choice.
`.trim();