export * from "./types/index.js";
export * from "./exercises/diktat.js";
export { diktatLessons, sampleDiktatLesson } from "./content/diktat-lessons.js";
export {
  verbConjugationExercises,
  nounGenderExercises,
  pluralExercises,
  adjectiveComparisonExercises,
  punctuationExercises,
  capitalizationExercises,
  wordTypeExercises,
  sentenceBuildingExercises,
  pastTenseExercises,
  vocabularyExercises,
} from "./content/grammar-exercises.js";
export { createSupabaseClient } from "./lib/supabase.js";
export { buildWeakWordUpdates } from "./lib/weak-words.js";
export type { WrongWordEntry } from "./lib/weak-words.js";
export { verbConjugationPool, getRandomVerbExercises } from "./content/verb-conjugation-pool.js";
export { artikelPool, getRandomArtikelExercises } from "./content/artikel-pool.js";
export { readingTextsPool, getRandomReadingTexts } from "./content/reading-texts-pool.js";
export type { ReadingTextStatic } from "./content/reading-texts-pool.js";
export { CURRICULUM_MIN_KLASSE, filterByGrade } from "./content/curriculum.js";
export {
  canUseFeature,
  getTrialDaysRemaining,
  isTrialing,
  hasActiveSubscription,
  FEATURES,
} from "./lib/features.js";
export type {
  SubscriptionTier,
  SubscriptionStatus,
  Subscription,
  FeatureFlags,
  FeatureKey,
} from "./lib/features.js";
