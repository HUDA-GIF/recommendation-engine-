/**
 * Meal scoring — Supabase meals (kcal, protein_g, diet_tags, recommendation_tags).
 */

import { getMealFields, toArray } from '../utils/normalize.js';
import { dietaryCompatible } from '../rules/mealRules.js';

export const MEAL_WEIGHTS = {
  diet: 25,
  goal: 30,
  caloriePlan: 15,
  nutritionMeta: 15,
  variety: 15,
};

function hasNumber(value) {
  return value != null && value !== '' && Number.isFinite(Number(value));
}

function scoreDiet(meal, userPreference) {
  if (!userPreference || userPreference === 'none' || userPreference === 'any') {
    return Math.round(MEAL_WEIGHTS.diet / 2);
  }
  return dietaryCompatible(meal, userPreference) ? MEAL_WEIGHTS.diet : 0;
}

function scoreGoal(meal, userGoal, cohortStats) {
  if (!userGoal) return 0;
  const m = getMealFields(meal);
  const calories = hasNumber(m.calories) ? Number(m.calories) : null;
  const protein = hasNumber(m.protein) ? Number(m.protein) : null;
  const tags = new Set([...m.recommendationTags, ...m.dietTags]);

  if (userGoal === 'weight_loss') {
    if (tags.has('lower_carb') || tags.has('high_fibre')) {
      // soft boost via tag + calories if present
    }
    if (calories == null) {
      return tags.has('lower_carb') || tags.has('balanced') ? 12 : 0;
    }
    const median = cohortStats.calorieMedian;
    if (median == null) return 18;
    if (calories <= median * 0.85) return MEAL_WEIGHTS.goal;
    if (calories <= median) return 22;
    if (calories <= median * 1.15) return 12;
    return 5;
  }

  if (userGoal === 'muscle_gain') {
    if (protein == null) {
      return tags.has('high_protein') ? 12 : 0;
    }
    const median = cohortStats.proteinMedian;
    if (median == null) return tags.has('high_protein') ? 22 : 18;
    let pts = 5;
    if (protein >= median * 1.15) pts = MEAL_WEIGHTS.goal;
    else if (protein >= median) pts = 22;
    else if (protein >= median * 0.7) pts = 12;
    if (tags.has('high_protein') && pts < MEAL_WEIGHTS.goal) pts = Math.min(MEAL_WEIGHTS.goal, pts + 5);
    return pts;
  }

  if (userGoal === 'endurance') {
    if (tags.has('energy_dense') || tags.has('balanced')) return 22;
    if (calories == null) return 10;
    return 15;
  }

  // general_fitness
  if (calories == null) return tags.has('balanced') ? 18 : 10;
  const median = cohortStats.calorieMedian;
  if (median == null) return 15;
  const ratio = calories / median;
  if (ratio >= 0.85 && ratio <= 1.15) return 25;
  return 12;
}

function scoreNutritionMeta(meal) {
  const m = getMealFields(meal);
  let points = 0;
  if (hasNumber(m.calories)) points += 5;
  if (hasNumber(m.protein)) points += 5;
  if (hasNumber(m.carbs)) points += 2;
  if (m.ingredients.length > 0 || m.recommendationTags.length > 0) points += 3;
  return Math.min(points, MEAL_WEIGHTS.nutritionMeta);
}

function scoreVariety(mealId, recentIds) {
  if (!recentIds.length) return MEAL_WEIGHTS.variety;
  if (recentIds.includes(String(mealId))) return 0;
  return MEAL_WEIGHTS.variety;
}

function scoreCaloriePlan(meal, dailyCalorieTarget) {
  if (!dailyCalorieTarget) return Math.round(MEAL_WEIGHTS.caloriePlan / 2);
  const m = getMealFields(meal);
  if (!hasNumber(m.calories)) return 0;

  const mealCal = Number(m.calories);
  const low = dailyCalorieTarget * 0.15;
  const high = dailyCalorieTarget * 0.35;

  if (mealCal >= low && mealCal <= high) return MEAL_WEIGHTS.caloriePlan;
  if (mealCal >= low * 0.8 && mealCal <= high * 1.2) return 10;
  return 3;
}

function median(numbers) {
  if (!numbers.length) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function buildMealCohortStats(meals) {
  const mapped = meals.map(getMealFields);
  return {
    calorieMedian: median(
      mapped.filter((m) => hasNumber(m.calories)).map((m) => Number(m.calories))
    ),
    proteinMedian: median(
      mapped.filter((m) => hasNumber(m.protein)).map((m) => Number(m.protein))
    ),
  };
}

export function scoreMeal(meal, profileFields, cohortStats) {
  const breakdown = {
    diet: scoreDiet(meal, profileFields.dietaryPreference),
    goal: scoreGoal(meal, profileFields.goal, cohortStats),
    caloriePlan: scoreCaloriePlan(meal, profileFields.dailyCalorieTarget),
    nutritionMeta: scoreNutritionMeta(meal),
    variety: scoreVariety(meal.id, profileFields.recentIds),
  };

  const m = getMealFields(meal);
  const total = Object.values(breakdown).reduce((sum, n) => sum + n, 0);

  return {
    total,
    breakdown,
    nutritionAvailable: {
      calories: hasNumber(m.calories),
      protein: hasNumber(m.protein),
    },
  };
}

export function rankMeals(meals, profileFields) {
  const cohortStats = buildMealCohortStats(meals);

  return meals
    .map((meal) => {
      const m = getMealFields(meal);
      const { total, breakdown, nutritionAvailable } = scoreMeal(
        meal,
        profileFields,
        cohortStats
      );
      return {
        ...meal,
        score: total,
        scoreBreakdown: breakdown,
        nutritionAvailable,
        reason: buildMealReason(m, profileFields, breakdown),
      };
    })
    .sort((a, b) => b.score - a.score || String(a.id).localeCompare(String(b.id)));
}

function buildMealReason(m, profileFields, breakdown) {
  const bits = [];
  if (breakdown.goal >= 20) bits.push(`Relevant for ${profileFields.goal}`);
  if (profileFields.dietaryPreference && profileFields.dietaryPreference !== 'any') {
    bits.push(`Fits ${profileFields.dietaryPreference} preference`);
  }
  if (hasNumber(m.protein)) bits.push(`${Number(m.protein)}g protein`);
  return bits.join(' · ') || 'Compatible with your profile';
}

export function formatMealForDisplay(meal) {
  const m = getMealFields(meal);
  const calories = hasNumber(m.calories) ? Number(m.calories) : null;
  const protein = hasNumber(m.protein) ? Number(m.protein) : null;

  return {
    id: meal.id,
    meal_name: m.name,
    title: m.name,
    description: m.description ?? null,
    dietary_type: m.dietTags[0] ?? null,
    diet_tags: m.dietTags,
    recommendation_tags: m.recommendationTags,
    allergens: m.allergens,
    calories,
    kcal: calories,
    protein,
    protein_g: protein,
    nutritionNote:
      calories == null && protein == null
        ? 'Nutrition data not available in database'
        : null,
    score: meal.score,
    scoreBreakdown: meal.scoreBreakdown,
    reason: meal.reason,
  };
}
