/**
 * Workout scoring — workout_templates rows.
 * Weights explainable hain; medically validated claim nahi.
 */

import {
  canonicalGoal,
  getWorkoutFields,
  levelRank,
  normalizeText,
  toArray,
} from '../utils/normalize.js';
import { equipmentCompatible } from '../rules/workoutRules.js';

export const WORKOUT_WEIGHTS = {
  goal: 30,
  level: 25,
  time: 20,
  equipment: 10,
  preference: 10,
  variety: 5,
};

function scoreGoal(workoutGoal, userGoal) {
  if (!userGoal) return 0;
  const w = canonicalGoal(workoutGoal);
  if (!w) return 10;
  if (w === userGoal) return WORKOUT_WEIGHTS.goal;
  if (w === 'general_fitness') return 15;
  return 0;
}

function scoreLevel(workoutLevel, userLevel) {
  const w = levelRank(workoutLevel);
  const u = levelRank(userLevel);
  if (u == null || w == null) return Math.round(WORKOUT_WEIGHTS.level / 2);
  if (w === u) return WORKOUT_WEIGHTS.level;
  if (w === u - 1) return 12;
  return 0;
}

/**
 * Available time ke QAREEB workouts ko prioritize.
 * Pehle: sirf "duration <= available" — isliye 60 min user ko 30 min bhi aa jati thi.
 * Ab: jo time ka zyada hissa use kare, uska score oopar.
 */
function scoreTime(durationMinutes, availableMinutes) {
  if (!Number.isFinite(availableMinutes) || availableMinutes <= 0) {
    return Math.round(WORKOUT_WEIGHTS.time / 2);
  }
  const duration = Number(durationMinutes);
  if (!Number.isFinite(duration)) return Math.round(WORKOUT_WEIGHTS.time / 2);
  if (duration > availableMinutes) return 0;

  const ratio = duration / availableMinutes;
  if (ratio >= 0.85) return WORKOUT_WEIGHTS.time; // almost fills the slot
  if (ratio >= 0.7) return 16;
  if (ratio >= 0.5) return 10;
  return 3; // bahut chhoti session vs available time → neeche
}

function scoreEquipment(requiredEquipment, userEquipment) {
  const required = toArray(requiredEquipment).filter(
    (item) => !['none', 'bodyweight', 'no_equipment'].includes(item)
  );
  if (required.length === 0) {
    const hasGear = userEquipment.some((e) => e && e !== 'none');
    return hasGear ? 6 : WORKOUT_WEIGHTS.equipment;
  }
  return equipmentCompatible(requiredEquipment, userEquipment)
    ? WORKOUT_WEIGHTS.equipment
    : 0;
}

function scoreVariety(workoutId, recentIds) {
  if (!recentIds.length) return WORKOUT_WEIGHTS.variety;
  if (recentIds.includes(String(workoutId))) return 0;
  return WORKOUT_WEIGHTS.variety;
}

function scorePreference(workout, preferredTypes) {
  if (!preferredTypes?.length) return Math.round(WORKOUT_WEIGHTS.preference / 2);
  const w = getWorkoutFields(workout);
  const type = normalizeText(w.focus);
  const tags = toArray(w.tags);
  if (preferredTypes.includes(type) || preferredTypes.some((p) => tags.includes(p))) {
    return WORKOUT_WEIGHTS.preference;
  }
  return 0;
}

export function scoreWorkout(workout, profileFields) {
  const w = getWorkoutFields(workout);

  const breakdown = {
    goal: scoreGoal(w.goal, profileFields.goal),
    level: scoreLevel(w.level, profileFields.level),
    time: scoreTime(w.durationMinutes, profileFields.availableMinutes),
    equipment: scoreEquipment(w.equipment, profileFields.equipment),
    preference: scorePreference(workout, profileFields.preferredTypes),
    variety: scoreVariety(workout.id, profileFields.recentIds),
  };

  const total = Object.values(breakdown).reduce((sum, n) => sum + n, 0);
  return { total, breakdown };
}

export function rankWorkouts(workouts, profileFields) {
  return workouts
    .map((workout) => {
      const w = getWorkoutFields(workout);
      const { total, breakdown } = scoreWorkout(workout, profileFields);
      return {
        ...workout,
        // Convenience aliases for UI / tests
        workout_name: w.name,
        title: w.name,
        target_goal: w.goal,
        goal: w.goal,
        fitness_level: w.level,
        difficulty: w.level,
        duration_minutes: w.durationMinutes,
        duration_min: w.durationMinutes,
        equipment_required: toArray(w.equipment),
        workout_type: w.focus,
        focus: w.focus,
        score: total,
        scoreBreakdown: breakdown,
        reason: buildWorkoutReason(w, profileFields, breakdown),
      };
    })
    .sort((a, b) => b.score - a.score || String(a.id).localeCompare(String(b.id)));
}

function buildWorkoutReason(w, profileFields, breakdown) {
  const bits = [];
  if (breakdown.goal >= 25) bits.push(`Matches your ${profileFields.goal} goal`);
  if (breakdown.level >= 20) bits.push(`Fits ${profileFields.level} level`);
  if (Number.isFinite(w.durationMinutes)) {
    bits.push(`${w.durationMinutes} min`);
  }
  return bits.join(' · ') || 'Compatible with your profile';
}
