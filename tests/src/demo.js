/**
 * Non-interactive demo with TWO different dynamic profiles
 * (proves engine does not hardcode one user).
 * Run: npm run demo
 */

import { recommendWorkouts, recommendMeals } from './index.js';
import { SAMPLE_WORKOUTS, SAMPLE_MEALS } from '../tests/fixtures/sampleData.js';

function show(label, profile) {
  console.log(`\n========== ${label} ==========`);
  console.log('Profile:', profile);

  const w = recommendWorkouts({ profile, workouts: SAMPLE_WORKOUTS, limit: 3 });
  const m = recommendMeals({ profile, meals: SAMPLE_MEALS, limit: 3 });

  console.log('Workouts:', w.recommendations.map((x) => `${x.title} (${x.score})`));
  console.log('Meals:', m.recommendations.map((x) => `${x.title} (${x.score})`));
}

show('User dynamic A', {
  fitness_goal: 'weight_loss',
  fitness_level: 'beginner',
  equipment: ['none'],
  available_workout_duration: 20,
  diet_preference: 'vegetarian',
  disliked_foods: [],
  allergies: ['peanut'],
  gender: 'female',
  weight_kg: 55,
  height_cm: 162,
  age: 22,
});

show('User dynamic B', {
  fitness_goal: 'muscle_gain',
  fitness_level: 'intermediate',
  equipment: ['dumbbells', 'barbell'],
  available_workout_duration: 45,
  diet_preference: 'any',
  disliked_foods: [],
  gender: 'male',
  weight_kg: 72,
  height_cm: 175,
  age: 25,
  daily_calorie_target: 2500,
});
