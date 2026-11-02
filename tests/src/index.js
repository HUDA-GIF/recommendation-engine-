/**
 * AlphaFit Personalized Recommendation Engine
 * Rule-based filtering + scoring (not a trained ML model).
 */

export { recommendWorkouts } from './recommendWorkouts.js';
export { recommendMeals } from './recommendMeals.js';

export {
  filterWorkouts,
  getWorkoutProfileFields,
  passesWorkoutHardFilters,
} from './rules/workoutRules.js';

export {
  filterMeals,
  getMealProfileFields,
  passesMealHardFilters,
  containsAllergen,
  containsDislikedFood,
} from './rules/mealRules.js';

export {
  SUPABASE_GOALS,
  canonicalGoal,
  getWorkoutFields,
  getMealFields,
} from './utils/normalize.js';

export { WORKOUT_WEIGHTS, scoreWorkout, rankWorkouts } from './scoring/workoutScoring.js';
export { MEAL_WEIGHTS, scoreMeal, rankMeals } from './scoring/mealScoring.js';
