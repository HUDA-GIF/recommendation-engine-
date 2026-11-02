/**
 * Personalized Meal Recommendations
 * Allergies / dietary restrictions hard-enforced.
 * Nutrition invent nahi hota.
 */

import { hasProfileGoal } from './utils/normalize.js';
import {
  filterMeals,
  getMealProfileFields,
} from './rules/mealRules.js';
import {
  formatMealForDisplay,
  rankMeals,
} from './scoring/mealScoring.js';

const DEFAULT_LIMIT = 5;

/**
 * @param {object} options
 * @param {object} options.profile
 * @param {Array<object>} options.meals
 * @param {number} [options.limit=5]
 * @param {boolean} [options.requireGoal=true]
 */
export function recommendMeals({
  profile,
  meals = [],
  limit = DEFAULT_LIMIT,
  requireGoal = true,
} = {}) {
  if (!profile || typeof profile !== 'object') {
    return {
      ok: false,
      needsProfile: true,
      recommendations: [],
      reason: 'missing_profile',
      message: 'User profile is required before generating meal recommendations.',
      rejected: [],
    };
  }

  if (requireGoal && !hasProfileGoal(profile)) {
    return {
      ok: false,
      needsProfile: true,
      recommendations: [],
      reason: 'missing_fitness_goal',
      message:
        'Fitness goal is missing. Complete your profile to get personalized meal recommendations.',
      rejected: [],
    };
  }

  if (!Array.isArray(meals)) {
    return {
      ok: false,
      needsProfile: false,
      recommendations: [],
      reason: 'invalid_meals',
      message: 'Meals must be an array.',
      rejected: [],
    };
  }

  const profileFields = getMealProfileFields(profile);
  const { passed, rejected } = filterMeals(meals, profileFields);

  if (passed.length === 0) {
    return {
      ok: true,
      needsProfile: false,
      recommendations: [],
      reason: 'no_suitable_matches',
      message:
        'No suitable meals matched your dietary preference, allergies, or restrictions.',
      rejected,
      meta: { candidateCount: 0, profileFields },
    };
  }

  const ranked = rankMeals(passed, profileFields);
  const top = ranked.slice(0, Math.max(1, limit));
  const recommendations = top.map(formatMealForDisplay);

  return {
    ok: true,
    needsProfile: false,
    recommendations,
    reason: null,
    message: null,
    rejected,
    meta: {
      candidateCount: passed.length,
      returnedCount: recommendations.length,
      profileFields,
    },
  };
}
