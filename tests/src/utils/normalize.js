/**
 * Shared helpers — Supabase AlphaFit schema ke exact values ke saath align.
 *
 * profiles.fitness_goal CHECK:
 *   weight_loss | muscle_gain | endurance | general_fitness
 * profiles.fitness_level:
 *   beginner | intermediate | advanced
 * profiles.diet_preference:
 *   any | vegetarian | halal | vegan
 */

export function normalizeText(value) {
  if (value == null) return '';
  return String(value).trim().toLowerCase().replace(/\s+/g, '_');
}

export function toArray(value) {
  if (value == null || value === '') return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeText(item))
      .filter(Boolean);
  }
  return String(value)
    .split(/[,|;]/)
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

export function unique(values) {
  return [...new Set(values)];
}

/**
 * Canonical goals = exact Supabase values.
 * Purane aliases (fat_loss etc.) map ho jate hain taake tests/legacy na tootein.
 */
const GOAL_ALIASES = {
  weight_loss: ['weight_loss', 'fat_loss', 'lose_weight', 'cut'],
  muscle_gain: ['muscle_gain', 'bulking', 'gain_muscle', 'hypertrophy'],
  endurance: ['endurance', 'stamina', 'cardio_endurance'],
  general_fitness: [
    'general_fitness',
    'maintenance',
    'maintain',
    'general',
  ],
};

export const SUPABASE_GOALS = [
  'weight_loss',
  'muscle_gain',
  'endurance',
  'general_fitness',
];

export function canonicalGoal(goal) {
  const n = normalizeText(goal);
  if (!n) return null;
  for (const [canonical, aliases] of Object.entries(GOAL_ALIASES)) {
    if (aliases.includes(n) || n === canonical) return canonical;
  }
  return n;
}

const LEVEL_ORDER = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export function levelRank(level) {
  const n = normalizeText(level);
  return LEVEL_ORDER[n] ?? null;
}

export function hasProfileGoal(profile) {
  return Boolean(canonicalGoal(profile?.fitness_goal ?? profile?.fitnessGoal));
}

/** Workout template / legacy workout row se fields */
export function getWorkoutFields(workout = {}) {
  return {
    id: workout.id,
    name: workout.title ?? workout.workout_name ?? workout.workoutName ?? workout.name,
    goal: workout.goal ?? workout.target_goal ?? workout.targetGoal,
    level: workout.difficulty ?? workout.fitness_level ?? workout.fitnessLevel,
    durationMinutes:
      workout.duration_min ??
      workout.duration_minutes ??
      workout.durationMinutes,
    equipment:
      workout.equipment ??
      workout.equipment_required ??
      workout.equipmentRequired,
    focus: workout.focus ?? workout.workout_type ?? workout.workoutType,
    tags: workout.tags,
    estKcal: workout.est_kcal ?? workout.estKcal,
    description: workout.description,
  };
}

/** Meal row (Supabase meals) / legacy */
export function getMealFields(meal = {}) {
  return {
    id: meal.id,
    name: meal.title ?? meal.meal_name ?? meal.mealName ?? meal.name,
    dietTags: toArray(meal.diet_tags ?? meal.dietTags ?? meal.dietary_type ?? meal.dietaryType),
    recommendationTags: toArray(
      meal.recommendation_tags ?? meal.recommendationTags ?? meal.tags
    ),
    allergens: toArray(meal.allergens),
    ingredients: toArray(meal.ingredients),
    calories: meal.kcal ?? meal.calories,
    protein: meal.protein_g ?? meal.protein,
    carbs: meal.carbs_g ?? meal.carbs,
    fat: meal.fat_g ?? meal.fat,
    mealTypes: toArray(meal.meal_types ?? meal.mealTypes),
    description: meal.description ?? meal.instructions,
  };
}
