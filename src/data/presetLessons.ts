import { Lesson } from '../types';

export const PRESET_LESSONS: Lesson[] = [
  // EASY LEVEL (Beginner practice)
  {
    id: 'easy_1',
    title: 'Home Row Exploration',
    text: 'all sad dads shall fall ask a lad to add a salad dad ask lasses for a glass all lads add fall salads dad falls as fast as a sad glass all sad lads shall fall ask a lad to add salad a sad dad shall fall ask all for glass',
    difficulty: 'easy',
    source: 'Home Row Drills'
  },
  {
    id: 'easy_2',
    title: 'The Quick Brown Fox',
    text: 'the quick brown fox jumps over the lazy dog they swim in deep blue rivers when the hot summer begins we enjoy walking through the dense green forests early in the morning every single day is another wonderful opportunity to learn touch typing perfectly and enjoy life',
    difficulty: 'easy',
    source: 'Standard Pangrams'
  },
  {
    id: 'easy_3',
    title: 'Simple Flow Practice',
    text: 'practice makes perfect and that is the only way to get better at anything you do when you focus on accuracy the speed will naturally follow along with your hard work pay attention to each key before you press it and keep your fingers relaxed on the keyboard guide row',
    difficulty: 'easy',
    source: 'Typing Flow Pro'
  },

  // MEDIUM LEVEL (Standard punctuation, numbers, capitals)
  {
    id: 'medium_1',
    title: 'Digital Technology in Modern India',
    text: 'India has witnessed an unprecedented digital revolution in the last decade. With the introduction of high-speed 5G networks, affordable smartphones, and digital payment systems like UPI, millions of rural households now have access to online public services. From digital banking to e-education, technology is deeply transforming the Indian economy to create millions of new jobs.',
    difficulty: 'medium',
    source: 'Indian Economy News'
  },
  {
    id: 'medium_2',
    title: 'The Art of Effective Communication',
    text: 'Good writing is not just about using complex vocabulary words; it is about putting simple words together in a highly structured and elegant way. Clear communications help teams collaborate seamlessly across multiple time-zones. Always remember to proofread your emails and official documents carefully before clicking that shiny "Send" button!',
    difficulty: 'medium',
    source: 'Business Communication Guide'
  },
  {
    id: 'medium_3',
    title: 'History of Printing Press',
    text: 'The movable print machinery was invented by Johannes Gutenberg around the year 1439. This major invention played an extremely critical role in the development of the Renaissance, the Reformation, and the Age of Enlightenment. It spread knowledge rapidly to the masses and forever changed how human civilization records and shares thoughts across generations.',
    difficulty: 'medium',
    source: 'Historical Archives'
  },

  // HARD LEVEL (Complex tokens, numbers, brackets, punctuation)
  {
    id: 'hard_1',
    title: 'Programming Basics (Syntax & Keyboards)',
    text: 'const typingSpeed = (totalChars / 5) * (60 / totalSeconds); if (accuracyRate >= 95.00 && typingSpeed >= 35.5) { console.log(`Congratulations! User qualified with WPM: ${typingSpeed.toFixed(2)} [Accuracy: ${accuracyRate}%]`); } else { console.warn("Failed exam rules. Please press [BACKSPACE] and practice again!"); }',
    difficulty: 'hard',
    source: 'Coding & Keyboard Drills'
  },
  {
    id: 'hard_2',
    title: 'Global Climate Agreement and Targets',
    text: 'Under the Paris Agreement (signed in December 2015), over 190 countries committed to restrict global warming to well-below 2.0 degrees C (preferably 1.5 degrees C) compared to pre-industrial baselines. The targets require a combined reduction of greenhouse gases by 45% before 2030, which many nations are struggling to execute without shifting 80% grid power to green renewables.',
    difficulty: 'hard',
    source: 'Environmental Science Journal'
  },

  // GOVERNMENT EXAM SIMULATIONS (SSC CHSL, Clerk Exams, High Courts)
  {
    id: 'exam_1',
    title: 'SSC CHSL Mock Test (Section 1 - Polity)',
    text: 'The Constitution of India is the supreme law of the sovereign democratic republic. It was adopted by the Constituent Assembly on 26th November 1949 and became fully effective on 26th January 1950, a day celebrated nationally as Republic Day. Our constitution is the longest written supreme charter of any country globally, containing 395 articles in 22 parts and 8 schedules at its inception. It provides for a quasi-federal system of governance with absolute separation of powers between the legislature, the executive, and the sovereign judiciary to protect democratic liberties.',
    difficulty: 'exam',
    source: 'SSC CHSL Exam Prep'
  },
  {
    id: 'exam_2',
    title: 'High Court Clerk Mock Test (Legal Prose)',
    text: 'In the Court of Judicial Magistrate (First Class) of the State of Bihar, the petitioner has filed an application under Section 482 of the Code of Criminal Procedure, 1973, seeking the absolute quashing of the First Information Report (FIR No. 234/2024 dated 12.04.2024) registered for the alleged offenses punishable under Section 420 and Section 120-B of the Indian Penal Code, 1860. The learned counsel for the petitioner argued vehemently that the dispute in question is purely civil in character, arising out of a breach of contract dated 15.01.2022, and lacks the necessary mens rea or criminal intent to stand a judicial trial.',
    difficulty: 'exam',
    source: 'District Court Exam Prep'
  },
  {
    id: 'exam_3',
    title: 'Central Government Clerk Mock (General Administration)',
    text: 'The official duties of a Lower Division Clerk involves the precise maintenance of daily diary registers, recording incoming and outgoing mail dispatches, scanning physical documents for the digital e-Office file indexing system, and crafting brief draft replies for routine administrative inquiries. A minimum training standard of 30WPM or 35WPM (with an error margin not exceeding 5.00 percent) is strictly enforced in these computer-based typing skill assessments to ensure rapid government clearance speeds.',
    difficulty: 'exam',
    source: 'LDC General Exam'
  }
];
