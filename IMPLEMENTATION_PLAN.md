# FocusFlow: Student of Knowledge - Implementation Plan

**Project:** Transform FocusFlow into "FocusFlow: Student of Knowledge"
**Target Audience:** Islamic knowledge seekers and SOK Academy students
**Timeline:** 3 months (Phase 1 MVP)
**Last Updated:** 2025-11-13

---

## Table of Contents
1. [Phase 1: MVP (Core Transformation)](#phase-1-mvp-core-transformation)
2. [Phase 2: Enhanced Features](#phase-2-enhanced-features)
3. [Phase 3: Advanced Platform](#phase-3-advanced-platform)
4. [Technical Architecture Changes](#technical-architecture-changes)
5. [Testing & Quality Assurance](#testing--quality-assurance)
6. [Timeline & Milestones](#timeline--milestones)
7. [Risk Management](#risk-management)

---

# Phase 1: MVP (Core Transformation)
**Duration:** 8 weeks
**Goal:** Launch functional Islamic student tracking app with core features

## Week 1-2: Foundation & Refactoring

### 1.1 Code Architecture Refactoring
**Priority:** CRITICAL - Must be done first

**Current Problem:** 1,852-line index.tsx is unmaintainable

**Tasks:**
- [ ] Create modular component structure
  ```
  src/
  ├── features/
  │   ├── profiles/
  │   │   ├── ProfileSelector.tsx
  │   │   ├── ProfileCreation.tsx
  │   │   ├── ProfileSwitcher.tsx
  │   │   └── hooks/
  │   │       ├── useProfile.ts
  │   │       └── useProfileManagement.ts
  │   ├── activities/
  │   │   ├── ActivityList.tsx
  │   │   ├── ActivityCard.tsx
  │   │   ├── ActivityModal.tsx
  │   │   └── hooks/
  │   │       ├── useActivities.ts
  │   │       └── useActivityCompletion.ts
  │   ├── analytics/
  │   │   └── [keep existing structure]
  │   └── onboarding/
  │       ├── WelcomeScreen.tsx
  │       └── OnboardingFlow.tsx
  ├── lib/
  │   ├── types/
  │   │   ├── profile.types.ts
  │   │   ├── activity.types.ts
  │   │   └── analytics.types.ts
  │   ├── constants/
  │   │   ├── islamicCategories.ts
  │   │   ├── profileTemplates.ts
  │   │   └── motivationalContent.ts
  │   └── utils/
  │       ├── hijriCalendar.ts
  │       └── quranUtils.ts
  ```

- [ ] Extract 5 main features from index.tsx:
  1. Profile management (lines 658-1046)
  2. Activity management (lines 1203-1430)
  3. Modal components (lines 468-656, 1482-1811)
  4. Data persistence (lines 279-336)
  5. App initialization (lines 683-715)

- [ ] Set up state management with Zustand
  ```typescript
  // src/store/appStore.ts
  interface AppStore {
    profiles: Record<string, IslamicProfile>;
    currentProfile: string | null;
    setCurrentProfile: (id: string) => void;
    // ... other state
  }
  ```

**Deliverable:** Clean, modular codebase ready for Islamic features

---

### 1.2 Islamic Data Models
**Priority:** CRITICAL

**Tasks:**
- [ ] Define new TypeScript interfaces in `src/lib/types/`

```typescript
// src/lib/types/islamic.types.ts

export type IslamicProfileType =
  | "full_time_talib"
  | "working_professional"
  | "rabbat_usra"
  | "university_student"
  | "limited_availability"
  | "flexible_schedule"
  | "custom";

export interface IslamicProfile {
  id: string;
  name: string;
  type: IslamicProfileType;
  avatar: string;
  created: string;

  // Islamic-specific fields
  studyLevel: "beginner" | "intermediate" | "advanced";
  currentSubjects: IslamicSubject[];
  teachers: Teacher[];
  quranProgress: QuranProgress;

  // Existing fields (adapted)
  activities: Record<string, IslamicActivity>;
  dailyRecords: Record<string, DailyRecord>;
  streaks: StreakData;
  preferences: StudentPreferences;
}

export interface IslamicSubject {
  id: string;
  name: string;
  category: SubjectCategory;
  currentBook?: string;
  currentPage?: number;
  totalPages?: number;
  teacher?: string;
  classSchedule?: string;
  notes: string;
}

export type SubjectCategory =
  // Foundational Sciences
  | "qawaid_fiqhiyah"
  | "usul_fiqh"
  | "usul_tafsir"
  | "mustalah_hadith"
  | "arabic_language"
  // Core Objective Sciences
  | "aqidah"
  | "fiqh"
  | "tafsir"
  | "hadith"
  // Practice & Application
  | "memorization"
  | "revision"
  | "note_taking"
  | "qa_sessions";

export interface IslamicActivity {
  id: string;
  name: string;
  duration: number;
  startTime: number | null;
  color: string;
  icon: string;
  category: SubjectCategory;

  // Islamic-specific fields
  subjectId?: string; // links to IslamicSubject
  isRevision: boolean;
  bookReference?: string;
  pageNumbers?: string;
  teacherSession?: boolean;
}

export interface QuranProgress {
  memorizedAyahs: MemorizedAyah[];
  currentSurah: number;
  currentAyah: number;
  revisionSchedule: RevisionEntry[];
  totalMemorized: number; // total ayahs
  lastRevisionDate: string;
}

export interface MemorizedAyah {
  surahNumber: number;
  ayahNumber: number;
  memorizedDate: string;
  lastReviewedDate: string;
  reviewCount: number;
  mastery: "learning" | "memorized" | "mastered";
}

export interface RevisionEntry {
  date: string;
  surahNumber: number;
  ayahRange: [number, number];
  completed: boolean;
  quality: 1 | 2 | 3 | 4 | 5; // 1=struggled, 5=perfect
}

export interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  contactInfo?: string;
  schedule: ClassSchedule[];
}

export interface ClassSchedule {
  day: string;
  time: string;
  subject: string;
  location?: string;
}

export interface StudentPreferences extends ProfilePreferences {
  prayerReminders: boolean;
  prayerTimes?: PrayerTimes;
  quranRevisionReminders: boolean;
  preferredRevisionTime: string;
  hijriCalendar: boolean;
  arabicInterface: boolean;
}

export interface PrayerTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}
```

- [ ] Create migration utility to convert old data (for testing)
- [ ] Add validation functions for all new interfaces
- [ ] Write unit tests for data models

**Deliverable:** Complete TypeScript type system for Islamic features

---

### 1.3 Islamic Content Database
**Priority:** CRITICAL

**Tasks:**
- [ ] Create motivational content JSON file

```typescript
// src/lib/constants/motivationalContent.ts

export const QURAN_QUOTES = [
  {
    id: 1,
    arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    transliteration: "Wa qul Rabbi zidni 'ilma",
    translation: "And say: My Lord, increase me in knowledge",
    reference: "Qur'an 20:114",
    context: "streak_milestone"
  },
  // ... 20+ more quotes
];

export const HADITH_QUOTES = [
  {
    id: 1,
    arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ",
    transliteration: "Man salaka tareeqan yaltamisu feehi 'ilman...",
    translation: "Whoever travels a path in search of knowledge, Allah makes easy for him a path to Paradise",
    reference: "Sahih Muslim 2699",
    narrator: "Abu Hurayrah",
    book: "Sahih Muslim",
    context: "daily_motivation"
  },
  // ... 30+ authentic hadith
];

export const WISDOM_QUOTES = [
  {
    id: 1,
    text: "The beginning of knowledge is the intention, its middle is attentive listening, its end is memorization, and its fruit is teaching and acting upon it.",
    attribution: "Classical Scholars",
    context: "lesson_completion"
  },
  // ... 15+ wisdom quotes
];
```

- [ ] Create Islamic profile templates

```typescript
// src/lib/constants/profileTemplates.ts

export const ISLAMIC_PROFILE_TEMPLATES: Record<IslamicProfileType, ProfileTemplate> = {
  full_time_talib: {
    name: "Full-Time Talib al-'Ilm",
    description: "Dedicated to 4-8 hours daily, 12-20 lessons per week",
    icon: "📚",
    color: "#059669", // Islamic green
    defaultActivities: [
      {
        name: "Morning Adhkar & Qur'an",
        duration: 30,
        category: "memorization",
        icon: "📖",
        startTime: 360, // 6 AM
      },
      {
        name: "Qawa'id al-Fiqhiyah",
        duration: 90,
        category: "qawaid_fiqhiyah",
        icon: "⚖️",
        startTime: 540, // 9 AM
      },
      {
        name: "Usul al-Fiqh",
        duration: 90,
        category: "usul_fiqh",
        icon: "🏛️",
        startTime: 630, // 10:30 AM
      },
      {
        name: "Arabic Grammar",
        duration: 60,
        category: "arabic_language",
        icon: "🔤",
        startTime: 780, // 1 PM
      },
      {
        name: "Aqidah Class",
        duration: 90,
        category: "aqidah",
        icon: "✨",
        startTime: 840, // 2 PM
      },
      {
        name: "Hadith Study",
        duration: 90,
        category: "hadith",
        icon: "📜",
        startTime: 930, // 3:30 PM
      },
      {
        name: "Tafsir Class",
        duration: 90,
        category: "tafsir",
        icon: "📕",
        startTime: 1020, // 5 PM
      },
      {
        name: "Evening Qur'an Revision",
        duration: 60,
        category: "revision",
        icon: "🔄",
        startTime: 1140, // 7 PM
      },
      {
        name: "Note Review & Memorization",
        duration: 60,
        category: "note_taking",
        icon: "📝",
        startTime: 1200, // 8 PM
      },
      {
        name: "Evening Adhkar",
        duration: 15,
        category: "revision",
        icon: "🤲",
        startTime: 1260, // 9 PM
      }
    ],
    preferences: {
      completionGoal: 80,
      weeklyGoal: 15,
      workingHours: { start: "06:00", end: "21:00" }
    }
  },

  working_professional: {
    name: "Working Professional",
    description: "Balancing 1-2 hours daily, 5-7 lessons per week",
    icon: "💼",
    color: "#3B82F6",
    defaultActivities: [
      {
        name: "Morning Adhkar & Qur'an",
        duration: 20,
        category: "memorization",
        icon: "📖",
        startTime: 360,
      },
      {
        name: "Arabic Lesson",
        duration: 30,
        category: "arabic_language",
        icon: "🔤",
        startTime: 420,
      },
      {
        name: "Fiqh Class (Evening)",
        duration: 60,
        category: "fiqh",
        icon: "⚖️",
        startTime: 1140,
      },
      {
        name: "Hadith Reading",
        duration: 30,
        category: "hadith",
        icon: "📜",
        startTime: 1200,
      },
      {
        name: "Weekly Revision",
        duration: 60,
        category: "revision",
        icon: "🔄",
        startTime: 600, // Saturday morning
      },
      {
        name: "Evening Adhkar",
        duration: 10,
        category: "revision",
        icon: "🤲",
        startTime: 1260,
      }
    ],
    preferences: {
      completionGoal: 70,
      weeklyGoal: 6,
      workingHours: { start: "06:00", end: "22:00" }
    }
  },

  rabbat_usra: {
    name: "Rabbat al-Usra (Homemaker)",
    description: "Flexible 1-2 hours split sessions, 5-7 lessons/week",
    icon: "🏡",
    color: "#EC4899",
    defaultActivities: [
      {
        name: "Morning Adhkar & Qur'an",
        duration: 20,
        category: "memorization",
        icon: "📖",
        startTime: 360,
      },
      {
        name: "Aqidah Study",
        duration: 30,
        category: "aqidah",
        icon: "✨",
        startTime: 600,
      },
      {
        name: "Tafsir Reading",
        duration: 30,
        category: "tafsir",
        icon: "📕",
        startTime: 840,
      },
      {
        name: "Online Fiqh Class",
        duration: 45,
        category: "fiqh",
        icon: "⚖️",
        startTime: 900,
      },
      {
        name: "Qur'an Revision",
        duration: 30,
        category: "revision",
        icon: "🔄",
        startTime: 1140,
      },
      {
        name: "Evening Adhkar",
        duration: 10,
        category: "revision",
        icon: "🤲",
        startTime: 1260,
      }
    ],
    preferences: {
      completionGoal: 70,
      weeklyGoal: 6,
      workingHours: { start: "06:00", end: "22:00" }
    }
  },

  university_student: {
    name: "University/College Student",
    description: "1.5-3 hours daily, 6-10 lessons per week",
    icon: "🎓",
    color: "#8B5CF6",
    defaultActivities: [
      {
        name: "Morning Adhkar & Qur'an",
        duration: 20,
        category: "memorization",
        icon: "📖",
        startTime: 360,
      },
      {
        name: "Arabic Lesson",
        duration: 45,
        category: "arabic_language",
        icon: "🔤",
        startTime: 420,
      },
      {
        name: "Aqidah Class",
        duration: 60,
        category: "aqidah",
        icon: "✨",
        startTime: 1020,
      },
      {
        name: "Hadith Study",
        duration: 45,
        category: "hadith",
        icon: "📜",
        startTime: 1140,
      },
      {
        name: "Evening Revision",
        duration: 30,
        category: "revision",
        icon: "🔄",
        startTime: 1200,
      },
      {
        name: "Q&A Session",
        duration: 30,
        category: "qa_sessions",
        icon: "❓",
        startTime: 1260,
      },
      {
        name: "Evening Adhkar",
        duration: 10,
        category: "revision",
        icon: "🤲",
        startTime: 1320,
      }
    ],
    preferences: {
      completionGoal: 75,
      weeklyGoal: 8,
      workingHours: { start: "06:00", end: "23:00" }
    }
  },

  limited_availability: {
    name: "Limited Availability Seeker",
    description: "30-60 minutes daily, 3-5 lessons per week",
    icon: "⏱️",
    color: "#F59E0B",
    defaultActivities: [
      {
        name: "Morning Adhkar & Qur'an",
        duration: 15,
        category: "memorization",
        icon: "📖",
        startTime: 360,
      },
      {
        name: "Arabic Quick Lesson",
        duration: 20,
        category: "arabic_language",
        icon: "🔤",
        startTime: 420,
      },
      {
        name: "Fiqh Reading",
        duration: 30,
        category: "fiqh",
        icon: "⚖️",
        startTime: 1200,
      },
      {
        name: "Weekly Revision",
        duration: 45,
        category: "revision",
        icon: "🔄",
        startTime: 600,
      },
      {
        name: "Evening Adhkar",
        duration: 10,
        category: "revision",
        icon: "🤲",
        startTime: 1260,
      }
    ],
    preferences: {
      completionGoal: 60,
      weeklyGoal: 4,
      workingHours: { start: "06:00", end: "22:00" }
    }
  },

  flexible_schedule: {
    name: "Flexible Schedule",
    description: "Variable daily time, 7-12 lessons per week",
    icon: "🔄",
    color: "#10B981",
    defaultActivities: [
      {
        name: "Morning Adhkar & Qur'an",
        duration: 25,
        category: "memorization",
        icon: "📖",
        startTime: null,
      },
      {
        name: "Arabic Grammar",
        duration: 60,
        category: "arabic_language",
        icon: "🔤",
        startTime: null,
      },
      {
        name: "Usul al-Fiqh",
        duration: 75,
        category: "usul_fiqh",
        icon: "🏛️",
        startTime: null,
      },
      {
        name: "Aqidah Study",
        duration: 60,
        category: "aqidah",
        icon: "✨",
        startTime: null,
      },
      {
        name: "Hadith Class",
        duration: 60,
        category: "hadith",
        icon: "📜",
        startTime: null,
      },
      {
        name: "Tafsir Reading",
        duration: 45,
        category: "tafsir",
        icon: "📕",
        startTime: null,
      },
      {
        name: "Revision Session",
        duration: 45,
        category: "revision",
        icon: "🔄",
        startTime: null,
      },
      {
        name: "Note Review",
        duration: 30,
        category: "note_taking",
        icon: "📝",
        startTime: null,
      },
      {
        name: "Evening Adhkar",
        duration: 10,
        category: "revision",
        icon: "🤲",
        startTime: null,
      }
    ],
    preferences: {
      completionGoal: 75,
      weeklyGoal: 10,
      workingHours: { start: "00:00", end: "23:59" }
    }
  },

  custom: {
    name: "Custom/Personalized",
    description: "Fully customizable schedule and subjects",
    icon: "⚙️",
    color: "#6B7280",
    defaultActivities: [
      {
        name: "Morning Adhkar & Qur'an",
        duration: 20,
        category: "memorization",
        icon: "📖",
        startTime: null,
      },
      {
        name: "Islamic Study",
        duration: 60,
        category: "custom",
        icon: "📚",
        startTime: null,
      },
      {
        name: "Evening Adhkar",
        duration: 10,
        category: "revision",
        icon: "🤲",
        startTime: null,
      }
    ],
    preferences: {
      completionGoal: 70,
      weeklyGoal: 7,
      workingHours: { start: "06:00", end: "22:00" }
    }
  }
};
```

- [ ] Create subject category definitions

```typescript
// src/lib/constants/islamicCategories.ts

export const SUBJECT_CATEGORIES = {
  // Foundational Sciences
  qawaid_fiqhiyah: {
    name: "Qawa'id al-Fiqhiyah",
    nameArabic: "القواعد الفقهية",
    description: "Legal Maxims",
    color: "#059669",
    icon: "⚖️",
    type: "foundational"
  },
  usul_fiqh: {
    name: "Usul al-Fiqh",
    nameArabic: "أصول الفقه",
    description: "Principles of Jurisprudence",
    color: "#0891B2",
    icon: "🏛️",
    type: "foundational"
  },
  usul_tafsir: {
    name: "Usul al-Tafsir",
    nameArabic: "أصول التفسير",
    description: "Principles of Interpretation",
    color: "#7C3AED",
    icon: "📘",
    type: "foundational"
  },
  mustalah_hadith: {
    name: "Mustalah al-Hadith",
    nameArabic: "مصطلح الحديث",
    description: "Hadith Terminology",
    color: "#DC2626",
    icon: "🔖",
    type: "foundational"
  },
  arabic_language: {
    name: "Arabic Language",
    nameArabic: "اللغة العربية",
    description: "Grammar, Morphology, Rhetoric",
    color: "#EA580C",
    icon: "🔤",
    type: "foundational"
  },

  // Core Objective Sciences
  aqidah: {
    name: "Aqidah/Tawheed",
    nameArabic: "العقيدة والتوحيد",
    description: "Islamic Creed",
    color: "#D97706",
    icon: "✨",
    type: "core"
  },
  fiqh: {
    name: "Fiqh",
    nameArabic: "الفقه",
    description: "Practical Jurisprudence",
    color: "#16A34A",
    icon: "⚖️",
    type: "core"
  },
  tafsir: {
    name: "Tafsir",
    nameArabic: "التفسير",
    description: "Qur'anic Exegesis",
    color: "#2563EB",
    icon: "📕",
    type: "core"
  },
  hadith: {
    name: "Hadith",
    nameArabic: "الحديث",
    description: "Prophetic Traditions",
    color: "#7C2D12",
    icon: "📜",
    type: "core"
  },

  // Practice & Application
  memorization: {
    name: "Memorization",
    nameArabic: "الحفظ",
    description: "Qur'an, Hadith, Texts",
    color: "#BE185D",
    icon: "📖",
    type: "practice"
  },
  revision: {
    name: "Revision",
    nameArabic: "المراجعة",
    description: "Daily & Comprehensive Review",
    color: "#0D9488",
    icon: "🔄",
    type: "practice"
  },
  note_taking: {
    name: "Note-Taking",
    nameArabic: "تدوين الملاحظات",
    description: "Study Notes & Bookmarks",
    color: "#7C3AED",
    icon: "📝",
    type: "practice"
  },
  qa_sessions: {
    name: "Q&A Sessions",
    nameArabic: "جلسات الأسئلة",
    description: "Questions with Teachers",
    color: "#4F46E5",
    icon: "❓",
    type: "practice"
  }
};
```

- [ ] Create streak milestone messages

```typescript
// src/lib/constants/streakMilestones.ts

export const STREAK_MILESTONES = {
  1: {
    title: "First Step! 🌱",
    message: "Every journey begins with a single step. May Allah bless your pursuit of knowledge.",
    hadith: {
      text: "The best of you are those who learn the Qur'an and teach it.",
      reference: "Sahih al-Bukhari 5027"
    }
  },
  3: {
    title: "Three Days Strong! 🌿",
    message: "You're building consistency. Keep going, student of knowledge!",
    verse: {
      arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
      translation: "Indeed, with hardship comes ease.",
      reference: "Qur'an 94:6"
    }
  },
  7: {
    title: "One Week Complete! 🌳",
    message: "A full week of dedication. You're establishing a beautiful habit.",
    hadith: {
      text: "Whoever travels a path in search of knowledge, Allah makes easy for him a path to Paradise.",
      reference: "Sahih Muslim 2699"
    }
  },
  14: {
    title: "Two Weeks! 🌟",
    message: "Your commitment is inspiring. Knowledge is being built brick by brick.",
    verse: {
      arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
      translation: "And say: My Lord, increase me in knowledge.",
      reference: "Qur'an 20:114"
    }
  },
  30: {
    title: "One Month Milestone! 🏅",
    message: "SubhanAllah! A full month of consistent learning. This is true dedication.",
    hadith: {
      text: "The most beloved deeds to Allah are those that are most consistent, even if they are small.",
      reference: "Sahih al-Bukhari 6464"
    }
  },
  40: {
    title: "40 Days of Consistency! 💎",
    message: "The scholars say consistency for 40 days establishes a habit. You've done it!",
    wisdom: "The beginning of knowledge is the intention, and its fruit is acting upon it."
  },
  100: {
    title: "100 Days! 🎯",
    message: "A hundred days of seeking knowledge. You're truly embodying the spirit of a Talib al-'Ilm.",
    verse: {
      arabic: "يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ",
      translation: "Allah will raise those who have believed among you and those who were given knowledge, by degrees.",
      reference: "Qur'an 58:11"
    }
  },
  365: {
    title: "One Full Year! 🌟✨🎊",
    message: "MashaAllah! A complete year of consistent knowledge-seeking. You've achieved something remarkable. May Allah preserve your knowledge and make it beneficial.",
    hadith: {
      text: "Knowledge from which no benefit is derived is like a treasure from which nothing is spent in the cause of Allah.",
      reference: "At-Tirmidhi"
    }
  }
};
```

**Deliverable:** Complete content database ready for integration

---

## Week 3-4: Core UI Transformation

### 2.1 App Rebranding
**Priority:** HIGH

**Tasks:**
- [ ] Update app metadata
  ```typescript
  // src/pages/_app.tsx
  <Head>
    <title>FocusFlow: Student of Knowledge</title>
    <meta name="description" content="Your companion in the journey of seeking 'Ilm" />
    <meta name="keywords" content="Islamic studies, knowledge seeking, talib al-ilm, SOK Academy" />
  </Head>
  ```

- [ ] Update theme with Islamic colors
  ```css
  /* src/styles/globals.css */
  :root {
    --islamic-green: 142 71% 45%; /* #059669 */
    --islamic-gold: 43 96% 56%; /* #F59E0B */
    --primary: var(--islamic-green);
    --accent: var(--islamic-gold);
    /* ... rest of theme */
  }
  ```

- [ ] Update welcome screen
  - Replace hero image with Islamic-themed illustration
  - Update tagline: "Your companion in the journey of seeking 'Ilm"
  - Add subtitle: "Track your path in seeking sacred knowledge"
  - Remove "Beat the Scroll, Build Focus" messaging

- [ ] Update logo/favicon (if exists)

**Deliverable:** Fully rebranded app identity

---

### 2.2 Profile System Overhaul
**Priority:** CRITICAL

**Tasks:**
- [ ] Replace ProfileSelector component
  - Remove old 6 profile types
  - Add 7 new Islamic profile types
  - Update profile cards with Islamic descriptions
  - Add Islamic-themed avatars/emojis

- [ ] Update ProfileCreation modal
  - Simplified name + avatar selection
  - Profile type selection with detailed descriptions
  - Optional: Study level selection (beginner/intermediate/advanced)
  - Auto-populate with Islamic activity template

- [ ] Create profile type selection UI
  ```tsx
  // src/features/profiles/ProfileTypeSelector.tsx
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Object.entries(ISLAMIC_PROFILE_TEMPLATES).map(([key, template]) => (
      <Card
        key={key}
        className="cursor-pointer hover:border-islamic-green"
        onClick={() => selectProfile(key)}
      >
        <div className="text-4xl">{template.icon}</div>
        <h3>{template.name}</h3>
        <p className="text-sm text-muted-foreground">{template.description}</p>
        <div className="flex gap-2 mt-2">
          <Badge>{template.defaultActivities.length} Activities</Badge>
          <Badge>{template.preferences.weeklyGoal} Lessons/Week</Badge>
        </div>
      </Card>
    ))}
  </div>
  ```

- [ ] Update profile data persistence
  - Migrate profile creation to use new IslamicProfile type
  - Add migration warning if old profiles exist
  - Clear old data on first launch

**Deliverable:** Functional 7-profile system

---

### 2.3 Activity System Transformation
**Priority:** CRITICAL

**Tasks:**
- [ ] Update ActivityList component
  - Replace "Activities" header with "Lessons & Studies"
  - Update category grouping to Islamic categories
  - Add subject type badges (Foundational/Core/Practice)

- [ ] Update ActivityCard component
  - Display subject category with Arabic name
  - Add book/page reference display
  - Add teacher name if applicable
  - Show revision badge for revision activities

- [ ] Update ActivityModal (Add/Edit)
  - Replace category dropdown with Islamic categories
  - Add optional fields:
    - Subject reference (book name)
    - Page numbers
    - Teacher name
    - Is this a revision session? (checkbox)
  - Update duration presets (15, 30, 45, 60, 90, 120 minutes)

- [ ] Update completion tracking
  - Add quality rating (1-5) for revision sessions
  - Add notes field for key takeaways
  - Add page progress tracking

**Deliverable:** Fully Islamic activity tracking system

---

### 2.4 Onboarding Experience
**Priority:** HIGH

**Tasks:**
- [ ] Create new WelcomeScreen component
  ```tsx
  // src/features/onboarding/WelcomeScreen.tsx
  <div className="text-center space-y-6">
    <div className="text-6xl">📚</div>
    <h1 className="text-4xl font-bold text-islamic-green">
      FocusFlow: Student of Knowledge
    </h1>
    <p className="text-xl text-muted-foreground">
      Your companion in the journey of seeking 'Ilm
    </p>
    <p className="text-lg">
      Track your path in seeking sacred knowledge
    </p>
    <Card className="bg-islamic-green/5 border-islamic-green/20 p-6">
      <p className="italic text-lg">
        "Whoever travels a path in search of knowledge, Allah makes easy for him a path to Paradise."
      </p>
      <p className="text-sm mt-2 text-muted-foreground">
        - Sahih Muslim 2699
      </p>
    </Card>
    <Button size="lg" onClick={startOnboarding}>
      Begin Your Journey
    </Button>
  </div>
  ```

- [ ] Add post-profile-selection encouragement
  - Display profile-specific message after creation
  - Show sample weekly schedule preview
  - Add quick tutorial highlighting key features

- [ ] Create optional tutorial overlay
  - Highlight activity tracking
  - Show how to mark lessons complete
  - Explain streak system
  - Show analytics dashboard access

**Deliverable:** Islamic-themed onboarding flow

---

## Week 5-6: Analytics & Visualization

### 3.1 Update Analytics Dashboard
**Priority:** HIGH

**Tasks:**
- [ ] Update terminology throughout analytics
  - "Activities" → "Lessons"
  - "Tasks" → "Studies"
  - "Categories" → "Subjects"
  - "Completion Rate" → "Lesson Completion"
  - "Focused Time" → "Study Time"

- [ ] Update StatsGrid component
  - Replace generic productivity metrics
  - Add Islamic-specific metrics:
    - Total Study Time (al-Waqt al-Mukhassas)
    - Lessons Completed (ad-Durus al-Mukmalah)
    - Current Streak (at-Tasalsul al-Hali)
    - Perfect Days (al-Ayyam al-Kamilah)
    - Foundational Sciences Balance
    - Core Sciences Balance
    - Revision Frequency
    - Memorization Progress (if tracked)

- [ ] Update CategoryBreakdown chart
  - Group by subject type (Foundational/Core/Practice)
  - Use Islamic category colors
  - Add Arabic category names in tooltips

- [ ] Update ActivityLeaderboard
  - Show top lessons by completion rate
  - Add teacher name column
  - Add book reference column
  - Sort by study time, completion, or quality rating

- [ ] Add new Quran Progress widget (if user tracks it)
  ```tsx
  <Card>
    <CardHeader>
      <CardTitle>Qur'an Progress</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div>
          <span className="text-sm">Memorized:</span>
          <span className="font-bold ml-2">{memorizedAyahs} Ayahs</span>
        </div>
        <div>
          <span className="text-sm">Current Surah:</span>
          <span className="font-bold ml-2">Surah {currentSurah}</span>
        </div>
        <div>
          <span className="text-sm">Last Revision:</span>
          <span className="font-bold ml-2">{lastRevision}</span>
        </div>
      </div>
    </CardContent>
  </Card>
  ```

**Deliverable:** Islamic analytics dashboard

---

### 3.2 Streak System Enhancement
**Priority:** HIGH

**Tasks:**
- [ ] Update streak calculation logic
  - Consider day "complete" if completion goal met
  - Add "near miss" protection (90% completion = streak continues)
  - Add weekend flexibility option

- [ ] Implement milestone celebrations
  - Trigger modal on milestone days (1, 3, 7, 14, 30, 40, 100, 365)
  - Display milestone message from STREAK_MILESTONES
  - Show hadith/verse/wisdom quote
  - Add confetti animation (optional)
  - Add social share option

- [ ] Add streak protection warnings
  - Show warning notification if streak at risk
  - Display at 6 PM if no lessons completed
  - Gentle reminder, not pushy

**Deliverable:** Motivating streak system

---

## Week 7: Sharing & Content

### 4.1 Sharing Feature Redesign
**Priority:** MEDIUM

**Tasks:**
- [ ] Create three share templates

```typescript
// src/features/sharing/shareTemplates.ts

export const generateShareText = (
  profile: IslamicProfile,
  template: "detailed" | "milestone" | "private"
) => {
  const today = new Date().toLocaleDateString();
  const stats = calculateTodayStats(profile);

  if (template === "detailed") {
    return `📚 FocusFlow: Student of Knowledge

🗓️ ${today}
👤 ${profile.name}
📊 ${stats.completionRate}% Lesson Completion
🔥 ${profile.streaks.current} Day Streak
⏱️ ${stats.totalTime} Study Time

Top Subjects Today:
${stats.topSubjects.map(s => `• ${s.name} - ${s.time}`).join('\n')}

"Whoever travels a path in search of knowledge, Allah makes easy for him a path to Paradise."
- Sahih Muslim 2699

#StudentOfKnowledge #IslamicStudies #FocusFlow`;
  }

  if (template === "milestone") {
    return `🌟 Alhamdulillah! Milestone Achieved!

${profile.streaks.current} days of consistent Islamic studies
${stats.totalLessonsCompleted} lessons completed
${stats.totalStudyHours} hours of knowledge-seeking

"And say: My Lord, increase me in knowledge."
- Qur'an 20:114

#StudentOfKnowledge #IslamicStudies`;
  }

  if (template === "private") {
    return `📖 Seeking Knowledge Daily

"Whoever travels a path in search of knowledge, Allah makes easy for him a path to Paradise."
- Sahih Muslim 2699

Tracking my Islamic studies journey with FocusFlow
#StudentOfKnowledge`;
  }
};
```

- [ ] Create ShareModal component
  - Three buttons for each template type
  - Preview of share text
  - Copy to clipboard functionality
  - Web Share API integration (mobile)
  - Option to include/exclude personal stats

- [ ] Add quick share button to main dashboard
  - Small share icon in top right
  - Opens share modal

**Deliverable:** Three-tier sharing system

---

### 4.2 Study Tips & Guide
**Priority:** MEDIUM

**Tasks:**
- [ ] Create StudyGuide page/modal
  ```tsx
  // src/features/guide/StudyGuide.tsx
  <Accordion type="multiple">
    <AccordionItem value="daily-lessons">
      <AccordionTrigger>
        How many lessons should I aim for daily?
      </AccordionTrigger>
      <AccordionContent>
        This depends on your life circumstance:

        • **Full-Time Talib**: 12-20 lessons/week (4-8 hours daily)
        • **Working Professional**: 5-7 lessons/week (1-2 hours daily)
        • **University Student**: 6-10 lessons/week (1.5-3 hours daily)
        • **Limited Availability**: 3-5 lessons/week (30-60 minutes daily)

        The Prophet ﷺ said: "Take on only as much as you can do, for Allah does not get tired (of giving reward) until you get tired." - Bukhari & Muslim
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="balance">
      <AccordionTrigger>
        How do I balance Foundational and Core Sciences?
      </AccordionTrigger>
      <AccordionContent>
        **Ideal Balance:**
        • 40% Foundational Sciences (Arabic, Usul, Qawa'id)
        • 40% Core Sciences (Aqidah, Fiqh, Tafsir, Hadith)
        • 20% Practice (Memorization, Revision, Notes)

        **Why Foundational First?**
        The scholars say: "Arabic is the key to understanding, Usul is the key to extracting rulings."

        **Check your balance** in the Analytics > Overview tab.
      </AccordionContent>
    </AccordionItem>

    {/* ... 10+ more Q&A sections */}
  </Accordion>
  ```

- [ ] Add content for all FAQ sections from modify.md
  - Daily lesson recommendations
  - Subject balancing
  - Handling missed days
  - Revision scheduling
  - Note-taking methods
  - Memorization techniques
  - Resource integration
  - Avoiding burnout
  - Knowledge-seeking philosophy

- [ ] Add navigation link to guide
  - Small "?" icon in top navigation
  - Or "Study Guide" button in settings

**Deliverable:** Comprehensive study guide

---

## Week 8: Polish & Testing

### 5.1 Notifications System (Basic)
**Priority:** MEDIUM

**Tasks:**
- [ ] Implement browser notification permission request
  - Request on first app load (with explanation)
  - Store permission in settings

- [ ] Add scheduled lesson reminders
  - Check activities with startTime
  - Trigger notification 10 minutes before
  - Customizable in settings

- [ ] Add daily goal reminders
  - Morning reminder (8 AM): "Begin your day with knowledge"
  - Evening reminder (8 PM): "Complete your daily lessons"
  - Only if lessons incomplete

- [ ] Add streak protection warning
  - Trigger at 6 PM if no lessons completed
  - Gentle message: "Your {X} day streak is at risk. Complete at least one lesson today!"

- [ ] Make all notifications optional
  - Settings page with toggle for each type
  - Default: ALL OFF (user opt-in)
  - Custom time settings

**Deliverable:** Basic notification system

---

### 5.2 Settings Page Update
**Priority:** LOW

**Tasks:**
- [ ] Update settings terminology
  - "Daily Goal" → "Daily Lesson Goal"
  - Add "Preferred Study Times"
  - Add "Notification Preferences" section

- [ ] Add Islamic-specific settings
  - [ ] Hijri Calendar Display (toggle)
  - [ ] Prayer Time Reminders (toggle)
  - [ ] Arabic Interface (Phase 2 - placeholder for now)
  - [ ] Preferred Translation (Sahih International, etc.)

- [ ] Add data management section
  - [ ] Export Data (JSON)
  - [ ] Import Data (JSON)
  - [ ] Delete All Data (with confirmation)

**Deliverable:** Updated settings page

---

### 5.3 Performance & Optimization
**Priority:** MEDIUM

**Tasks:**
- [ ] Code splitting for analytics dashboard
  ```typescript
  // src/pages/index.tsx
  const DashboardLayout = dynamic(() => import('@/components/dashboard/DashboardLayout'), {
    loading: () => <Spinner />,
  });
  ```

- [ ] Optimize localStorage writes
  - Already has 500ms debounce (keep it)
  - Add compression for large datasets (optional)

- [ ] Add offline capability (PWA)
  - Create manifest.json
  - Add service worker for offline caching
  - Sync data when online

- [ ] Performance testing
  - Test with 1000+ daily records
  - Test with 100+ activities
  - Optimize any slow operations

**Deliverable:** Fast, offline-capable app

---

### 5.4 Content Review & Testing
**Priority:** CRITICAL

**Tasks:**
- [ ] Content Accuracy Review
  - [ ] Verify all Qur'an translations (Sahih International)
  - [ ] Verify all hadith references (Sunnah.com)
  - [ ] Check Arabic transliterations
  - [ ] Ensure Islamic terminology accuracy

- [ ] Alpha Testing (Internal)
  - [ ] Test all 7 profile types
  - [ ] Test activity creation/completion
  - [ ] Test analytics calculations
  - [ ] Test streak logic
  - [ ] Test sharing functionality
  - [ ] Test data persistence
  - [ ] Test on mobile devices
  - [ ] Test in different browsers

- [ ] Beta Testing (SOK Academy Students)
  - [ ] Recruit 5-10 students
  - [ ] Provide testing instructions
  - [ ] Collect feedback via form
  - [ ] Fix critical issues
  - [ ] Document common questions

**Deliverable:** Tested, reviewed MVP

---

# Phase 1 Deliverables Summary

At the end of Phase 1 (Week 8), the app should have:

✅ **Complete Rebranding**
- New name, tagline, subtitle
- Islamic color theme (green/gold)
- Islamic visual identity

✅ **7 Islamic Profile Types**
- Full-Time Talib al-'Ilm
- Working Professional
- Rabbat al-Usra (Homemaker)
- University/College Student
- Limited Availability Seeker
- Flexible Schedule
- Custom/Personalized

✅ **Islamic Activity System**
- 13 subject categories (Foundational, Core, Practice)
- Pre-configured activity templates for each profile
- Subject-specific tracking (book, page, teacher)
- Revision session tracking

✅ **Islamic Content Integration**
- 20+ Qur'an quotes
- 30+ authenticated hadith
- 15+ wisdom quotes
- Streak milestone messages
- Profile-specific encouragement

✅ **Updated Analytics**
- Islamic terminology throughout
- Subject balance metrics
- Lesson completion tracking
- Study time visualization
- Streak history

✅ **Sharing Feature**
- Three templates (Detailed, Milestone, Private)
- Islamic quotes in shares
- Privacy controls

✅ **Study Guide**
- 10+ FAQ sections
- Best practices for Islamic studies
- Subject balancing advice
- Revision strategies

✅ **Basic Notifications**
- Browser notifications
- Lesson reminders
- Daily goal reminders
- Streak protection warnings
- User opt-in required

✅ **Performance**
- Offline capability (PWA)
- Fast loading
- Mobile-responsive
- Cross-browser tested

---

# Phase 2: Enhanced Features
**Duration:** 6-8 weeks
**Goal:** Add advanced Islamic features and community elements

## Overview

Phase 2 builds on the MVP with:
- Full Arabic interface support
- Hijri calendar integration
- Advanced Qur'an tracking
- Teacher collaboration features
- Enhanced analytics
- Mobile app preparation

## Key Features

### 2.1 Full Arabic Language Support
**Duration:** 2 weeks

**Tasks:**
- [ ] Implement next-i18next
- [ ] Create Arabic translation files for all UI strings
- [ ] Add RTL (right-to-left) layout support
- [ ] Add Arabic font support (Noto Naskh Arabic, Amiri)
- [ ] Add language switcher in settings
- [ ] Test all UI components in Arabic

**Technical:**
```typescript
// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar'],
  },
  react: {
    useSuspense: false,
  },
};
```

---

### 2.2 Hijri Calendar Integration
**Duration:** 1 week

**Tasks:**
- [ ] Install hijri-date library
- [ ] Create calendar conversion utilities
- [ ] Add Hijri date display option (toggle in settings)
- [ ] Show dual dates (Gregorian + Hijri) throughout app
- [ ] Update analytics to support Hijri date ranges
- [ ] Add Islamic month/year milestones

**Features:**
- Display: "Monday, 5 Jumada al-Thani 1446 (13 November 2024)"
- Calendar view with Islamic dates
- Ramadan/special month highlighting

---

### 2.3 Advanced Qur'an Tracking
**Duration:** 2 weeks

**Tasks:**
- [ ] Create dedicated Qur'an Tracker component
  - Surah-by-surah progress visualization
  - Ayah-level memorization tracking
  - Revision schedule generator (spaced repetition)
  - Mastery level indicator (Learning/Memorized/Mastered)

- [ ] Add Qur'an-specific analytics
  - Total ayahs memorized
  - Current memorization rate (ayahs/week)
  - Revision frequency
  - Mastery distribution chart

- [ ] Implement revision reminders
  - Smart scheduling based on memorization date
  - Spaced repetition algorithm (1 day, 3 days, 7 days, 14 days, 30 days)
  - Customizable intervals

**UI Example:**
```tsx
<QuranTracker>
  <SurahList>
    {surahs.map(surah => (
      <SurahCard
        number={surah.number}
        name={surah.name}
        memorized={surah.memorizedAyahs}
        total={surah.totalAyahs}
        lastReviewed={surah.lastReviewed}
      />
    ))}
  </SurahList>

  <RevisionSchedule>
    {upcomingReviews.map(review => (
      <RevisionItem
        surah={review.surah}
        ayahs={review.ayahRange}
        dueDate={review.dueDate}
        priority={review.priority}
      />
    ))}
  </RevisionSchedule>
</QuranTracker>
```

---

### 2.4 Teacher & Class Management
**Duration:** 2 weeks

**Tasks:**
- [ ] Create Teacher Profile system
  - Add teacher (name, subjects, contact)
  - Assign subjects to teachers
  - Track class schedules

- [ ] Add Class Schedule component
  - Weekly calendar view
  - Link activities to specific classes
  - Attendance tracking
  - Class notes integration

- [ ] Teacher-specific analytics
  - Lessons per teacher
  - Subject progress by teacher
  - Class attendance rate

- [ ] Add "Ask Teacher" feature
  - Quick note-taking for questions
  - Tag questions by subject/teacher
  - Export questions for class

**Data Model:**
```typescript
interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  contactInfo?: string;
  schedule: ClassSchedule[];
}

interface ClassSchedule {
  id: string;
  teacherId: string;
  day: string;
  time: string;
  subject: string;
  location?: string;
  recurring: boolean;
}

interface ClassNote {
  id: string;
  classScheduleId: string;
  date: string;
  topic: string;
  notes: string;
  questions: string[];
}
```

---

### 2.5 Enhanced Analytics
**Duration:** 1 week

**Tasks:**
- [ ] Add "Subject Deep Dive" view
  - Click any subject to see detailed breakdown
  - Time spent on each book
  - Page progress tracking
  - Quality ratings over time

- [ ] Add "Teacher Performance" view
  - Lessons attended per teacher
  - Subject mastery by teacher
  - Class attendance rate

- [ ] Add "Weekly/Monthly Goals" system
  - Set custom goals per subject
  - Track progress toward goals
  - Goal completion celebrations

- [ ] Add data export options
  - Export analytics to PDF
  - Export activity log to CSV
  - Export for accountability partner/teacher

---

### 2.6 Social & Community Features (Basic)
**Duration:** 2 weeks

**Tasks:**
- [ ] Add "Accountability Partner" feature
  - Generate shareable progress report URL
  - Partner can view (read-only) your progress
  - Weekly automatic updates via email (optional)

- [ ] Add "Study Group" feature
  - Create/join study groups
  - Shared goals and milestones
  - Group leaderboard (optional, can be anonymous)

- [ ] Add achievement badges
  - Unlock badges for milestones
  - Display badges on profile
  - Share badges socially

---

### 2.7 Mobile App Preparation
**Duration:** 2 weeks

**Tasks:**
- [ ] Enhance PWA capabilities
  - Full offline support
  - Install prompts
  - Push notification infrastructure

- [ ] Design for mobile-first
  - Optimize touch targets
  - Improve mobile navigation
  - Add swipe gestures

- [ ] Prepare backend infrastructure
  - Set up cloud sync (Firebase/Supabase)
  - User authentication system
  - Real-time sync across devices

---

# Phase 3: Advanced Platform
**Duration:** 8-12 weeks
**Goal:** Transform into comprehensive Islamic learning platform

## Overview

Phase 3 transforms the app into a full-fledged platform with:
- Native mobile apps (iOS/Android)
- SOK Academy integration
- AI-powered recommendations
- Advanced book/resource tracking
- Community features
- Teacher dashboard

## Key Features (High-Level)

### 3.1 Native Mobile Apps
- React Native or Flutter implementation
- Push notifications
- Offline-first architecture
- Device-specific optimizations

### 3.2 SOK Academy Integration
- Direct integration with SOK Academy courses
- Sync class schedules automatically
- Access course materials
- Submit assignments
- Track grades

### 3.3 AI-Powered Features
- Personalized study recommendations
- Optimal revision scheduling
- Subject balance suggestions
- Burnout prevention alerts
- Learning pattern analysis

### 3.4 Advanced Book Tracking
- Digital bookshelf
- Page-by-page progress
- Highlight/bookmark system
- Note-taking with page references
- Book completion certificates

### 3.5 Enhanced Community Features
- Public profiles (optional)
- Follow other students
- Study groups with chat
- Knowledge-sharing forums
- Mentorship system

### 3.6 Teacher Dashboard
- Separate interface for teachers
- View student progress (with permission)
- Assign reading/homework
- Track class attendance
- Grade submissions
- Provide feedback

### 3.7 Advanced Analytics & Insights
- Predictive analytics
- Comparative analysis (vs. peers)
- Subject mastery assessments
- Learning velocity tracking
- Long-term progress projection

### 3.8 Integration Ecosystem
- Calendar integration (Google, Apple)
- Note-taking apps (Notion, Obsidian)
- Qur'an apps (Quran.com API)
- Video platforms (YouTube, SOK Academy)
- Hadith databases (Sunnah.com API)

---

# Technical Architecture Changes

## Current vs. Target Architecture

### Current (Phase 0)
```
Frontend: Next.js (single page app)
State: React useState
Storage: localStorage
Analytics: Client-side calculations
```

### Phase 1 Target
```
Frontend: Next.js (modular components)
State: Zustand/Jotai
Storage: localStorage + PWA cache
Analytics: Enhanced client-side
i18n: Basic (English + Arabic terms)
```

### Phase 2 Target
```
Frontend: Next.js (feature modules)
State: Zustand with persistence
Storage: localStorage + Cloud sync (Firebase/Supabase)
Analytics: Client + basic backend
i18n: Full support (next-i18next)
Auth: User accounts (optional)
```

### Phase 3 Target
```
Frontend: Next.js + React Native
State: Zustand with cloud sync
Storage: Firebase/Supabase + local cache
Analytics: Backend service
i18n: Multi-language
Auth: Full authentication system
Backend: Node.js/NestJS API
Database: PostgreSQL/Firestore
Real-time: WebSockets/Firebase
```

---

## Technology Stack

### Phase 1 (MVP)
- **Frontend:** Next.js 14+, React 18+, TypeScript
- **UI:** shadcn/ui, Radix UI, Tailwind CSS
- **State:** Zustand
- **Storage:** localStorage
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Date:** date-fns
- **PWA:** next-pwa

### Phase 2 (Enhanced)
- **Backend:** Firebase or Supabase
- **Auth:** NextAuth.js or Firebase Auth
- **i18n:** next-i18next
- **Calendar:** hijri-date
- **Notifications:** Web Push API

### Phase 3 (Advanced)
- **Mobile:** React Native or Flutter
- **Backend:** NestJS, Express
- **Database:** PostgreSQL, Firestore
- **Real-time:** Socket.io, Firebase
- **AI/ML:** OpenAI API, TensorFlow.js
- **Analytics:** Mixpanel, Amplitude
- **Monitoring:** Sentry, LogRocket

---

## Database Schema (Phase 2+)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(100),
  avatar VARCHAR(255),
  created_at TIMESTAMP,
  last_login TIMESTAMP,
  preferences JSONB
);
```

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(100),
  type VARCHAR(50),
  avatar VARCHAR(10),
  study_level VARCHAR(50),
  created_at TIMESTAMP,
  preferences JSONB,
  quran_progress JSONB,
  streaks JSONB
);
```

### Activities Table
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  name VARCHAR(200),
  duration INTEGER,
  start_time INTEGER,
  color VARCHAR(7),
  icon VARCHAR(10),
  category VARCHAR(50),
  subject_id UUID REFERENCES subjects(id),
  is_revision BOOLEAN,
  book_reference VARCHAR(255),
  teacher_id UUID REFERENCES teachers(id),
  created_at TIMESTAMP
);
```

### Daily Records Table
```sql
CREATE TABLE daily_records (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  date DATE,
  activities JSONB,
  completion_rate DECIMAL(5,2),
  mood VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP
);
```

### Teachers Table
```sql
CREATE TABLE teachers (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  name VARCHAR(100),
  subjects TEXT[],
  contact_info TEXT,
  schedule JSONB,
  created_at TIMESTAMP
);
```

### Subjects Table
```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  name VARCHAR(200),
  category VARCHAR(50),
  current_book VARCHAR(255),
  current_page INTEGER,
  total_pages INTEGER,
  teacher_id UUID REFERENCES teachers(id),
  notes TEXT,
  created_at TIMESTAMP
);
```

---

# Testing & Quality Assurance

## Testing Strategy

### Phase 1 Testing

**Unit Tests**
- [ ] Data model validation functions
- [ ] Analytics calculation functions
- [ ] Streak logic
- [ ] Date utilities (Hijri conversion)
- [ ] Share text generation

**Integration Tests**
- [ ] Profile creation flow
- [ ] Activity completion flow
- [ ] Data persistence (localStorage)
- [ ] Analytics data aggregation

**End-to-End Tests**
- [ ] Complete onboarding
- [ ] Create profile and activities
- [ ] Complete activities
- [ ] View analytics
- [ ] Share progress
- [ ] Export data

**Manual Testing Checklist**
- [ ] All 7 profile types create correctly
- [ ] All activity categories work
- [ ] Streak increments correctly
- [ ] Milestone messages display
- [ ] Analytics calculations accurate
- [ ] Sharing generates correct text
- [ ] Settings persist
- [ ] Data exports successfully
- [ ] Offline mode works
- [ ] Mobile responsive on iOS/Android
- [ ] Cross-browser (Chrome, Safari, Firefox, Edge)

---

## Content Review Process

### Islamic Content Verification

**Qur'an Quotes Review**
- [ ] Verify Arabic text matches Uthmani script
- [ ] Verify translation matches Sahih International
- [ ] Verify surah:ayah references are correct
- [ ] Check transliteration accuracy

**Hadith Review**
- [ ] Verify hadith text matches source (Sunnah.com)
- [ ] Verify translation accuracy
- [ ] Verify reference (Sahih al-Bukhari/Muslim number)
- [ ] Verify narrator attribution
- [ ] Ensure all hadith are authentic (Sahih)

**Terminology Review**
- [ ] Check Arabic transliterations
- [ ] Verify English translations
- [ ] Ensure consistency across app
- [ ] Review with Arabic-speaking Muslims

**Cultural Sensitivity Review**
- [ ] Ensure respectful tone throughout
- [ ] Avoid controversial interpretations
- [ ] Maintain mainstream Sunni perspective
- [ ] Review with SOK Academy scholars

---

## Beta Testing Program

### Phase 1 Beta (Internal - Week 8)
**Participants:** 3-5 SOK Academy staff/close students
**Duration:** 1 week
**Focus:** Core functionality, bugs, Islamic content accuracy

**Testing Goals:**
- Verify all features work
- Check Islamic content accuracy
- Identify critical bugs
- Test all 7 profile types
- Validate analytics calculations

### Phase 2 Beta (Limited - Post-Launch)
**Participants:** 20-30 SOK Academy students
**Duration:** 2 weeks
**Focus:** Real-world usage, feature requests, performance

**Testing Goals:**
- Collect user feedback
- Identify common issues
- Gather feature requests
- Test with real study schedules
- Monitor performance

### Phase 3 Beta (Public - Phase 2)
**Participants:** 100+ community members
**Duration:** 4 weeks
**Focus:** Scale testing, community features, mobile apps

---

## Feedback Collection

### Beta Testing Form
```markdown
# FocusFlow: Student of Knowledge - Beta Feedback

## About You
- Name:
- Profile Type Used:
- Study Level:
- How long did you test?

## Functionality
1. Did all features work as expected? (Yes/No/Partially)
2. What didn't work?
3. What was confusing?

## Islamic Content
4. Is the Islamic terminology accurate? (Yes/No)
5. Any corrections needed?
6. Are the hadith/Qur'an quotes appropriate?

## User Experience
7. Is the app easy to use? (1-5)
8. Is it helpful for your studies? (1-5)
9. What's your favorite feature?
10. What's missing?

## Suggestions
11. What would make this app more useful?
12. Any features from other apps you'd like?
13. Would you recommend this to other students?

## Technical
14. Device used:
15. Browser:
16. Any errors or crashes?

## Open Feedback
[Free text area]
```

---

# Timeline & Milestones

## Phase 1: MVP Timeline (8 Weeks)

### Week 1-2: Foundation
**Milestone:** Refactored codebase with modular architecture
- ✅ Code refactoring complete
- ✅ State management implemented (Zustand)
- ✅ New data models defined
- ✅ Islamic content database created

### Week 3-4: Core Transformation
**Milestone:** Rebranded app with Islamic profile system
- ✅ App rebranding complete
- ✅ 7 profile types implemented
- ✅ Islamic activity system working
- ✅ Onboarding flow redesigned

### Week 5-6: Analytics & Features
**Milestone:** Islamic analytics dashboard and streak system
- ✅ Analytics updated with Islamic terminology
- ✅ Streak milestones implemented
- ✅ Sharing feature redesigned
- ✅ Study guide created

### Week 7: Polish & Content
**Milestone:** Complete feature set ready for testing
- ✅ Notifications implemented
- ✅ Settings updated
- ✅ Performance optimized
- ✅ PWA enabled

### Week 8: Testing & Review
**Milestone:** Beta-ready MVP
- ✅ Content reviewed and verified
- ✅ Alpha testing complete
- ✅ Beta testing launched
- ✅ Critical bugs fixed

---

## Phase 2: Enhanced Timeline (6-8 Weeks)

### Week 9-10: Internationalization
**Milestone:** Full Arabic support
- Arabic interface complete
- RTL layout working
- Language switcher functional

### Week 11: Calendar & Qur'an
**Milestone:** Hijri calendar and advanced Qur'an tracking
- Hijri calendar integrated
- Qur'an tracker component complete
- Revision scheduling working

### Week 12-13: Teacher & Class Management
**Milestone:** Teacher collaboration features
- Teacher profiles implemented
- Class schedules working
- Class notes and questions functional

### Week 14: Analytics & Social
**Milestone:** Enhanced analytics and community features
- Advanced analytics views
- Accountability partner feature
- Achievement badges

### Week 15-16: Mobile & Backend
**Milestone:** Mobile-ready with cloud sync
- PWA enhancements complete
- Backend infrastructure deployed
- Cloud sync working
- User accounts functional

---

## Phase 3: Advanced Timeline (8-12 Weeks)

### Months 5-6: Mobile Apps
**Milestone:** Native iOS/Android apps launched
- React Native apps built
- App store submissions
- Push notifications working

### Month 7: SOK Academy Integration
**Milestone:** Seamless integration with SOK Academy
- API integration complete
- Course sync working
- Assignment submission functional

### Month 8: AI & Community
**Milestone:** AI recommendations and community platform
- AI recommendation engine
- Community features
- Teacher dashboard

---

## Key Milestones Summary

| Phase | Week | Milestone | Deliverable |
|-------|------|-----------|-------------|
| 1 | 2 | Foundation | Refactored codebase |
| 1 | 4 | Core Transformation | Islamic profile system |
| 1 | 6 | Analytics | Islamic analytics dashboard |
| 1 | 7 | Features Complete | All MVP features |
| 1 | 8 | **MVP Launch** | **Beta-ready product** |
| 2 | 10 | Internationalization | Arabic interface |
| 2 | 11 | Qur'an Tracking | Advanced Qur'an features |
| 2 | 13 | Teacher Features | Teacher management |
| 2 | 16 | **Enhanced Launch** | **Cloud-enabled app** |
| 3 | 20 | Mobile Apps | iOS/Android apps |
| 3 | 24 | **Platform Launch** | **Full platform** |

---

# Risk Management

## Technical Risks

### Risk: Refactoring Complexity
**Probability:** Medium
**Impact:** High
**Mitigation:**
- Break refactoring into small, testable pieces
- Maintain working version throughout
- Use feature flags for gradual rollout
- Extensive testing at each step

### Risk: Performance Degradation
**Probability:** Low
**Impact:** Medium
**Mitigation:**
- Performance testing with large datasets
- Code splitting and lazy loading
- Optimize localStorage operations
- Monitor bundle size

### Risk: Data Loss
**Probability:** Low
**Impact:** High
**Mitigation:**
- localStorage backup before changes
- Data export feature
- Version migration system
- Regular testing of persistence

### Risk: Browser Compatibility
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Test on all major browsers
- Polyfills for older browsers
- Graceful degradation
- Clear browser requirements

---

## Content Risks

### Risk: Islamic Content Inaccuracy
**Probability:** Low
**Impact:** Critical
**Mitigation:**
- Multiple rounds of scholarly review
- Use verified sources (Sunnah.com, Quran.com)
- Community review during beta
- Correction process post-launch

### Risk: Cultural Insensitivity
**Probability:** Low
**Impact:** High
**Mitigation:**
- Diverse beta testers
- Scholarly consultation
- Community feedback channels
- Respectful, mainstream approach

### Risk: Translation Errors
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Use established translations (Sahih International)
- Native Arabic speaker review
- Community feedback
- Clear attribution of translations

---

## User Adoption Risks

### Risk: Feature Complexity
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Comprehensive onboarding
- Study guide with examples
- Video tutorials (Phase 2)
- Responsive support

### Risk: Insufficient Motivation
**Probability:** Low
**Impact:** Medium
**Mitigation:**
- Engaging streak system
- Islamic motivational content
- Achievement celebrations
- Community features (Phase 2)

### Risk: Technical Barriers
**Probability:** Low
**Impact:** Medium
**Mitigation:**
- Mobile-friendly design
- Offline capability
- Simple, intuitive UI
- Clear error messages

---

## Operational Risks

### Risk: Beta Testing Participation
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Incentivize beta testing
- Personal recruitment via SOK Academy
- Clear testing instructions
- Short testing periods (1-2 weeks)

### Risk: Timeline Overrun
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Buffer time built in (8 weeks vs. 6)
- Prioritized feature list
- MVP-first approach
- Regular progress reviews

### Risk: Resource Constraints
**Probability:** Medium
**Impact:** High
**Mitigation:**
- Clear scope definition
- Phased approach
- Community contributions
- Realistic timelines

---

# Success Metrics

## Phase 1 (MVP) Success Criteria

**Launch Readiness**
- [ ] All 7 profile types functional
- [ ] All Islamic activity categories working
- [ ] Analytics displaying correct data
- [ ] Sharing feature generates proper text
- [ ] Study guide complete
- [ ] 0 critical bugs
- [ ] Content reviewed and approved

**User Metrics (First Month)**
- 50+ active users
- 70%+ daily retention (Week 1)
- 5+ day average streak
- 80%+ positive feedback
- <5 critical bug reports

**Quality Metrics**
- 100% Islamic content accuracy
- <2 second page load
- 95%+ mobile responsiveness score
- 0 data loss incidents

---

## Phase 2 Success Criteria

**Feature Adoption**
- 60%+ users enable Arabic interface
- 40%+ users track Qur'an progress
- 50%+ users add teachers
- 30%+ users share progress

**User Growth**
- 200+ active users
- 60%+ 30-day retention
- 10+ day average streak

---

## Phase 3 Success Criteria

**Platform Metrics**
- 1000+ active users
- 500+ mobile app downloads
- 100+ study groups created
- 50+ teachers using dashboard

**Engagement**
- 15+ day average streak
- 70%+ weekly active users
- 50%+ 90-day retention

---

# Appendix

## Glossary of Islamic Terms

| Arabic | Transliteration | English |
|--------|----------------|---------|
| طالب العلم | Talib al-'Ilm | Student of Knowledge |
| ربة الأسرة | Rabbat al-Usra | Homemaker (female) |
| القواعد الفقهية | Qawa'id al-Fiqhiyah | Legal Maxims |
| أصول الفقه | Usul al-Fiqh | Principles of Jurisprudence |
| أصول التفسير | Usul al-Tafsir | Principles of Interpretation |
| مصطلح الحديث | Mustalah al-Hadith | Hadith Terminology |
| العقيدة | Aqidah | Islamic Creed |
| الفقه | Fiqh | Islamic Jurisprudence |
| التفسير | Tafsir | Qur'anic Exegesis |
| الحديث | Hadith | Prophetic Traditions |
| الحفظ | Hifdh | Memorization |
| المراجعة | Muraja'ah | Revision/Review |

---

## Resources

### Islamic Content Sources
- **Qur'an:** Quran.com (Sahih International translation)
- **Hadith:** Sunnah.com (Sahih al-Bukhari, Sahih Muslim)
- **Arabic:** IslamicFinder, Quranicaudio.com
- **Scholarly Review:** SOK Academy faculty

### Technical Resources
- **Next.js:** https://nextjs.org/docs
- **Shadcn/ui:** https://ui.shadcn.com/
- **Zustand:** https://github.com/pmndrs/zustand
- **hijri-date:** https://github.com/arabiaweather/hijri-date
- **next-i18next:** https://github.com/i18next/next-i18next

### Design Resources
- **Islamic Colors:** Green (#059669), Gold (#F59E0B)
- **Arabic Fonts:** Noto Naskh Arabic, Amiri, Lateef
- **Icons:** Lucide Icons, custom emojis
- **Illustrations:** Islamic geometric patterns

---

## Contact & Support

**Development Questions:** [Contact SOK Academy Development Team]
**Islamic Content Review:** [Contact SOK Academy Scholars]
**Beta Testing:** [Beta Testing Form Link]
**Feedback:** [Feedback Form Link]

---

**Document Version:** 1.0
**Last Updated:** 2025-11-13
**Next Review:** End of Week 2 (Foundation Phase)

---

# Quick Reference: Phase 1 Task List

## Pre-Development (Week 0)
- [ ] Review this plan with stakeholders
- [ ] Confirm Islamic content sources
- [ ] Recruit beta testers
- [ ] Set up development environment
- [ ] Create project board/task tracker

## Week 1
- [ ] Refactor index.tsx into modules
- [ ] Implement Zustand state management
- [ ] Define Islamic data models
- [ ] Create Islamic content JSON files

## Week 2
- [ ] Create profile templates
- [ ] Create subject categories
- [ ] Create streak milestones
- [ ] Write unit tests for models

## Week 3
- [ ] Rebrand app (name, colors, theme)
- [ ] Redesign welcome screen
- [ ] Implement 7 profile types
- [ ] Update profile creation modal

## Week 4
- [ ] Transform activity system
- [ ] Update activity tracking
- [ ] Redesign onboarding
- [ ] Add Islamic encouragement messages

## Week 5
- [ ] Update analytics terminology
- [ ] Add Islamic-specific metrics
- [ ] Redesign analytics charts
- [ ] Add Qur'an progress widget (basic)

## Week 6
- [ ] Implement streak milestones
- [ ] Create ShareModal with 3 templates
- [ ] Build Study Guide page
- [ ] Add FAQ content

## Week 7
- [ ] Implement browser notifications
- [ ] Add notification settings
- [ ] Update settings page
- [ ] Optimize performance (PWA)

## Week 8
- [ ] Content accuracy review
- [ ] Alpha testing (internal)
- [ ] Fix critical bugs
- [ ] Launch beta testing
- [ ] Collect feedback
- [ ] Plan Phase 2

---

**End of Implementation Plan**
