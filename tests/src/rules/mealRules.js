/**
 * Meal HARD FILTERS — meals + profiles (Supabase).
 * diet_preference: any | vegetarian | halal | vegan
 * disliked_foods: hard exclude
 * allergens: hard exclude (agar profile mein allergies di hon)
 */

import {
  canonicalGoal,
  getMealFields,
  normalizeText,
  toArray,
  unique,
} from '../utils/normalize.js';

export function getMealProfileFields(profile = {}) {
  const dailyCalories = Number(
    profile.daily_calorie_target ??
      profile.dailyCalorieTarget ??
      profile.calorie_target ??
      profile.calorieTarget ??
      profile.calorie_plan ??
      profile.caloriePlan
  );

  return {
    goal: canonicalGoal(profile.fitness_goal ?? profile.fitnessGoal),
    // Supabase: diet_preference
    dietaryPreference: normalizeText(
      profile.diet_preference ??
        profile.dietPreference ??
        profile.dietary_preference ??
        profile.dietaryPreference
    ),
    // Supabase: disliked_foods (+ optional allergies)
    dislikedFoods: unique(
      toArray(profile.disliked_foods ?? profile.dislikedFoods)
    ),
    allergies: unique(toArray(profile.allergies ?? profile.food_allergies)),
    restrictions: unique(
      toArray(profile.dietary_restrictions ?? profile.dietaryRestrictions)
    ),
    dailyCalorieTarget:
      Number.isFinite(dailyCalories) && dailyCalories > 0 ? dailyCalories : null,
    recentIds: unique(
      (profile.recent_meal_ids ?? profile.recentMealIds ?? []).map(String)
    ),
    age: Number(profile.age),
    gender: normalizeText(profile.gender ?? profile.sex),
    heightCm: Number(profile.height_cm ?? profile.heightCm),
    weightKg: Number(profile.weight_kg ?? profile.weightKg),
  };
}

/**
 * Meal diet_tags / dietary_type vs profiles.diet_preference
 */
export function dietaryCompatible(meal, userPreference) {
  if (!userPreference || userPreference === 'none' || userPreference === 'any') {
    return true;
  }

  const m = typeof meal === 'string' ? null : getMealFields(meal);
  const tags = m
    ? unique([...m.dietTags, ...m.recommendationTags])
    : toArray(meal);

  if (userPreference === 'vegan') {
    return tags.includes('vegan');
  }

  if (userPreference === 'vegetarian' || userPreference === 'veg') {
    return (
      tags.includes('vegetarian') ||
      tags.includes('veg') ||
      tags.includes('vegan')
    );
  }

  if (userPreference === 'halal') {
    // Dataset mein explicit non_halal nahi — pork/alcohol ingredients exclude
    const haystack = [
      ...tags,
      ...(m?.ingredients ?? []),
      normalizeText(m?.name),
    ].join(' ');
    const nonHalal = ['pork', 'bacon', 'ham', 'alcohol', 'wine', 'beer', 'gelatin'];
    return !nonHalal.some((x) => haystack.includes(x));
  }

  if (
    userPreference === 'non_vegetarian' ||
    userPreference === 'non-veg' ||
    userPreference === 'nonveg'
  ) {
    return true;
  }

  return tags.includes(userPreference);
}

export function containsAllergen(meal, userAllergies) {
  if (!userAllergies.length) return false;
  const m = getMealFields(meal);
  const allergenFields = unique([...m.allergens, ...m.ingredients]);
  const haystack = allergenFields.join(' ');

  return userAllergies.some((allergy) => {
    if (!allergy) return false;
    return allergenFields.includes(allergy) || haystack.includes(allergy);
  });
}

/** Common dislike words → related ingredient tokens */
const DISLIKE_SYNONYMS = {
  greens: ['greens', 'salad_greens', 'spinach', 'lettuce', 'cucumber', 'salad', 'mint'],
  green: ['greens', 'salad_greens', 'spinach', 'lettuce', 'cucumber', 'salad', 'mint'],
  salad: ['salad', 'salad_greens', 'lettuce', 'cucumber', 'greens'],
  veg: ['vegetable', 'vegetables', 'spinach', 'tomato', 'onion', 'cucumber', 'carrot', 'peas'],
  vegetable: ['vegetable', 'vegetables', 'spinach', 'tomato', 'onion', 'cucumber', 'carrot'],
  vegetables: ['vegetable', 'vegetables', 'spinach', 'tomato', 'onion', 'cucumber', 'carrot'],
  chicken: ['chicken'],
  egg: ['egg', 'eggs'],
  dairy: ['dairy', 'milk', 'yogurt', 'skim_milk', 'cheese'],
  peanut: ['peanut', 'peanut_butter'],
};

function expandDislikedToken(food) {
  const n = normalizeText(food);
  return unique([n, ...(DISLIKE_SYNONYMS[n] ?? [])]);
}

/** disliked_foods — title / ingredients / tags (+ synonyms) → exclude */
export function containsDislikedFood(meal, dislikedFoods) {
  if (!dislikedFoods.length) return false;
  const m = getMealFields(meal);
  const tokens = unique([
    normalizeText(m.name),
    ...m.ingredients,
    ...m.dietTags,
    ...m.recommendationTags,
    ...m.allergens,
  ]);
  const haystack = tokens.join(' ');

  return dislikedFoods.some((food) => {
    const expanded = expandDislikedToken(food);
    return expanded.some(
      (token) => token && (tokens.includes(token) || haystack.includes(token))
    );
  });
}

export function passesDietaryRestrictions(meal, userRestrictions) {
  if (!userRestrictions.length) return true;
  const m = getMealFields(meal);
  const flags = unique([
    ...m.allergens,
    ...m.ingredients,
    ...m.recommendationTags,
    ...toArray(meal.restriction_flags ?? meal.restrictionFlags),
  ]);
  const joined = flags.join(' ');

  return !userRestrictions.some((restriction) => {
    const r = normalizeText(restriction).replace(/^no_/, '');
    if (!r) return false;
    return flags.includes(r) || joined.includes(r);
  });
}

export function passesMealHardFilters(meal, profileFields) {
  const {
    dietaryPreference,
    allergies,
    dislikedFoods,
    restrictions,
  } = profileFields;

  if (!dietaryCompatible(meal, dietaryPreference)) {
    return { pass: false, reason: 'dietary_preference' };
  }

  if (containsAllergen(meal, allergies)) {
    return { pass: false, reason: 'allergy' };
  }

  if (containsDislikedFood(meal, dislikedFoods)) {
    return { pass: false, reason: 'disliked_food' };
  }

  if (!passesDietaryRestrictions(meal, restrictions)) {
    return { pass: false, reason: 'dietary_restriction' };
  }

  return { pass: true, reason: null };
}

export function filterMeals(meals, profileFields) {
  const passed = [];
  const rejected = [];

  for (const meal of meals) {
    const result = passesMealHardFilters(meal, profileFields);
    if (result.pass) {
      passed.push(meal);
    } else {
      rejected.push({ id: meal.id, reason: result.reason });
    }
  }

  return { passed, rejected };
}
