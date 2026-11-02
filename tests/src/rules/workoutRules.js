/**
 * Workout HARD FILTERS — workout_templates + profiles (Supabase).
 */

import {
  canonicalGoal,
  getWorkoutFields,
  levelRank,
  normalizeText,
  toArray,
  unique,
} from '../utils/normalize.js';

export function getWorkoutProfileFields(profile = {}) {
  const availableMinutes = Number(
    profile.available_workout_duration ??
      profile.availableWorkoutDuration ??
      profile.available_time ??
      profile.availableTime ??
      profile.preferred_duration_min
  );

  return {
    goal: canonicalGoal(profile.fitness_goal ?? profile.fitnessGoal),
    level: normalizeText(profile.fitness_level ?? profile.fitnessLevel),
    availableMinutes: Number.isFinite(availableMinutes) ? availableMinutes : NaN,
    // Supabase: profiles.equipment text[]
    equipment: unique(
      toArray(
        profile.equipment ??
          profile.available_equipment ??
          profile.availableEquipment
      )
    ),
    restrictions: unique(
      toArray(profile.workout_restrictions ?? profile.workoutRestrictions)
    ),
    preferredTypes: unique(
      toArray(
        profile.preferred_workout_types ??
          profile.preferredWorkoutTypes ??
          profile.workout_preference ??
          profile.workoutPreference
      )
    ),
    recentIds: unique(
      (profile.recent_workout_ids ?? profile.recentWorkoutIds ?? []).map(String)
    ),
    // Biometrics — scoring/context (hard filter nahi, invent targets nahi)
    age: Number(profile.age),
    gender: normalizeText(profile.gender ?? profile.sex),
    heightCm: Number(profile.height_cm ?? profile.heightCm),
    weightKg: Number(profile.weight_kg ?? profile.weightKg),
  };
}

/**
 * Template equipment[] user ke profiles.equipment mein cover hona chahiye.
 * none / bodyweight / empty → no special gear.
 */
export function equipmentCompatible(requiredEquipment, userEquipment) {
  const required = toArray(requiredEquipment).filter(
    (item) => !['none', 'bodyweight', 'no_equipment'].includes(item)
  );
  if (required.length === 0) return true;

  const available = new Set(userEquipment);
  if (available.size === 0 || (available.size === 1 && available.has('none'))) {
    return false;
  }
  return required.every((item) => available.has(item));
}

export function passesRestrictions(workout, userRestrictions) {
  if (!userRestrictions.length) return true;
  const w = getWorkoutFields(workout);
  const tags = unique([
    ...toArray(w.tags),
    ...toArray(workout.restriction_flags ?? workout.restrictionFlags),
    ...toArray(w.focus),
  ]);
  const tagSet = new Set(tags);
  return !userRestrictions.some((r) => tagSet.has(r));
}

/**
 * User se zyada mushkil → bahar.
 * Advanced user ko beginner (2-level gap) mat do.
 */
export function levelCompatible(workoutLevel, userLevel) {
  const w = levelRank(workoutLevel);
  const u = levelRank(userLevel);
  if (u == null) return true;
  if (w == null) return true;
  if (w > u) return false;
  if (u - w >= 2) return false;
  return true;
}

export function timeCompatible(durationMinutes, availableMinutes) {
  if (!Number.isFinite(availableMinutes) || availableMinutes <= 0) return true;
  const duration = Number(durationMinutes);
  if (!Number.isFinite(duration)) return true;
  return duration <= availableMinutes;
}

/**
 * Goal match: general_fitness templates almost always allowed.
 * Exact goal match preferred; clear mismatch (e.g. muscle vs weight_loss) exclude.
 */
export function goalCompatible(workoutGoal, userGoal) {
  if (!userGoal) return true;
  const w = canonicalGoal(workoutGoal);
  if (!w || w === 'general_fitness') return true;
  if (userGoal === 'general_fitness') return true;
  return w === userGoal;
}

export function passesWorkoutHardFilters(workout, profileFields) {
  const w = getWorkoutFields(workout);
  const { goal, level, availableMinutes, equipment, restrictions } = profileFields;

  if (!levelCompatible(w.level, level)) {
    return { pass: false, reason: 'fitness_level' };
  }

  if (!timeCompatible(w.durationMinutes, availableMinutes)) {
    return { pass: false, reason: 'duration' };
  }

  if (!equipmentCompatible(w.equipment, equipment)) {
    return { pass: false, reason: 'equipment' };
  }

  if (!passesRestrictions(workout, restrictions)) {
    return { pass: false, reason: 'restrictions' };
  }

  if (!goalCompatible(w.goal, goal)) {
    return { pass: false, reason: 'goal' };
  }

  return { pass: true, reason: null };
}

export function filterWorkouts(workouts, profileFields) {
  const passed = [];
  const rejected = [];

  for (const workout of workouts) {
    const result = passesWorkoutHardFilters(workout, profileFields);
    if (result.pass) {
      passed.push(workout);
    } else {
      rejected.push({ id: workout.id, reason: result.reason });
    }
  }

  return { passed, rejected };
}
