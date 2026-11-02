/**
 * Personalized Workout Recommendations
 * Flow: profile check → hard filter → score → rank → top N
 */

import { hasProfileGoal } from './utils/normalize.js';
import {
  filterWorkouts,
  getWorkoutProfileFields,
} from './rules/workoutRules.js';
import { rankWorkouts } from './scoring/workoutScoring.js';

const DEFAULT_LIMIT = 5;

/**
 * @param {object} options
 * @param {object} options.profile - User fitness profile
 * @param {Array<object>} options.workouts - Available workout catalog
 * @param {number} [options.limit=5]
 * @param {boolean} [options.requireGoal=true] - Goal missing pe personalized list band
 */
export function recommendWorkouts({
  profile,
  workouts = [],
  limit = DEFAULT_LIMIT,
  requireGoal = true,
} = {}) {
  if (!profile || typeof profile !== 'object') {
    return {
      ok: false,
      needsProfile: true,
      recommendations: [],
      reason: 'missing_profile',
      message: 'User profile is required before generating workout recommendations.',
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
        'Fitness goal is missing. Complete your profile to get personalized workout recommendations.',
      rejected: [],
    };
  }

  if (!Array.isArray(workouts)) {
    return {
      ok: false,
      needsProfile: false,
      recommendations: [],
      reason: 'invalid_workouts',
      message: 'Workouts must be an array.',
      rejected: [],
    };
  }

  const profileFields = getWorkoutProfileFields(profile);
  const { passed, rejected } = filterWorkouts(workouts, profileFields);

  if (passed.length === 0) {
    return {
      ok: true,
      needsProfile: false,
      recommendations: [],
      reason: 'no_suitable_matches',
      message:
        'No suitable workouts matched your profile filters (level, time, equipment, goal, or restrictions).',
      rejected,
      meta: { candidateCount: 0, profileFields },
    };
  }

  const ranked = rankWorkouts(passed, profileFields);
  const recommendations = ranked.slice(0, Math.max(1, limit));

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
