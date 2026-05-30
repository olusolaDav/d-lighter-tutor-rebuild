export const HOMEPAGE_PRICING = {
  receptionToYear3: {
    title: 'Reception - Year 3',
    subtitle: 'Flexible subject options available.',
    options: [
      { hours: '3 Hours Per Week', ngn: 'N120,000/month', gbp: 'GBP75/month' },
      { hours: '4 Hours Per Week', ngn: 'N160,000/month', gbp: 'GBP99/month' },
      { hours: '5 Hours Per Week', ngn: 'N200,000/month', gbp: 'GBP125/month' },
    ],
    bonus: '1-hour FREE monthly assessment session for two subjects of your choice.',
  },
  year4To5ElevenPlus: {
    title: 'Year 4 and 5 (11+ Preparation Classes)',
    options: [
      'Option 1: One-on-One Classes',
      'Option 2: Group Class (Max of 6 learners) - GBP65 or N100,000/month',
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
      'Combine Package: One-on-One classes (2 subjects / 2 hours per week) with Group Class subscription (GBP113 or N180,000/month).',
      'Group Class only Package: GBP65 or N100,000/month.',
      'One-on-One class only Package: One-on-One classes for all 4 subjects.',
    ],
  },
  year5To6Sat: {
    title: 'Year 5 and 6 (SAT Preparation Classes)',
    options: [
      'Option 1: One-on-One Classes',
      'Option 2: Group Class (Max of 6 learners) - GBP65 or N100,000/month',
      'Subjects: Maths (Paper 1 Arithmetic, Papers 2 & 3 Reasoning), English (Reading and SPaG - Spelling, Punctuation and Grammar), and Science.',
    ],
  },
  year4To11: {
    title: 'Year 4 - Year 11',
    subtitle: 'Flexible subject options available.',
    options: [
      { hours: '3 Hours Per Week', ngn: 'N144,000/month', gbp: 'GBP86/month' },
      { hours: '4 Hours Per Week', ngn: 'N170,000/month', gbp: 'GBP105/month' },
      { hours: '5 Hours Per Week', ngn: 'N210,000/month', gbp: 'GBP130/month' },
      { hours: '6 Hours Per Week', ngn: 'N240,000/month', gbp: 'GBP145/month' },
      { hours: '8 Hours Per Week', ngn: 'N320,000/month', gbp: 'GBP196/month' },
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
Flexible subject options available.
* 3 Hours/Week -> N120,000/month or GBP75/month
* 4 Hours/Week -> N160,000/month or GBP99/month
* 5 Hours/Week -> N200,000/month or GBP125/month
Bonus: 1-hour FREE monthly assessment session for two subjects of your choice.

-- Year 4 and 5 (11+ Preparation Classes) --
Option 1: One-on-One Classes.
Option 2: Group Class (max 6 learners) -> GBP65 or N100,000/month.
Group class details:
* Subjects: Maths, English, Verbal & Non-Verbal Reasoning
* Schedule: Twice weekly
* Days: Monday & Thursday
* Time: 5:00 PM - 8:00 PM
* Continuous assessments after every class
* Monthly mock examination
Parent package options:
* Combine Package (One-on-One 2 subjects / 2 hours per week + Group subscription) -> GBP113 or N180,000/month
* Group Class only -> GBP65 or N100,000/month
* One-on-One class only package for all 4 subjects

-- Year 5 and 6 (SAT Preparation Classes) --
Option 1: One-on-One Classes.
Option 2: Group Class (max 6 learners) -> GBP65 or N100,000/month.
Subjects: Maths (Paper 1 Arithmetic, Papers 2 & 3 Reasoning), English (Reading and SPaG - Spelling, Punctuation and Grammar), and Science.

-- Year 4 - Year 11 (General / Flexible Subjects) --
Flexible subject options available.
* 3 Hours/Week -> N144,000/month (GBP86/month)
* 4 Hours/Week -> N170,000/month (GBP105/month)
* 5 Hours/Week -> N210,000/month (GBP130/month)
* 6 Hours/Week -> N240,000/month (GBP145/month)
* 8 Hours/Week -> N320,000/month (GBP196/month)
Bonus A: 2-hour FREE group classes on any two subjects (Language, Science or English).
Bonus B: 1-hour FREE monthly assessment session for two subjects of your choice.
`.trim();