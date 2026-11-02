/**
 * Terminal: sirf wohi data use hoga jo TUM type karogi.
 * Bracket defaults nahi — koi female/48/muscle_gain pehle se nahi bhara.
 *
 * Run: npm start
 */

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { recommendWorkouts, recommendMeals } from './index.js';
import { SAMPLE_WORKOUTS, SAMPLE_MEALS } from '../tests/fixtures/sampleData.js';

function parseList(value) {
  if (!value || !String(value).trim()) return [];
  return String(value)
    .split(/[,|;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function ask(rl, label) {
  const answer = (await rl.question(`${label}: `)).trim();
  return answer;
}

async function main() {
  const rl = readline.createInterface({ input, output });

  console.log('\n=== AlphaFit Recommendation ===');
  console.log('Har field KHUD type karo. Koi default value nahi.\n');
  console.log('NOTE: Abhi LOCAL sample catalogue hai (20 templates + 12 real recipes).');
  console.log('Supabase connect ke baad YAHI logic live DB rows pe chalegi.\n');
  console.log('Hints:');
  console.log('  fitness_goal: weight_loss | muscle_gain | endurance | general_fitness');
  console.log('  fitness_level: beginner | intermediate | advanced');
  console.log('  diet_preference: any | vegetarian | halal | vegan');
  console.log('  equipment: none | dumbbells | barbell,cable | dumbbells,barbell');
  console.log('  disliked_foods example: greens,chicken,peanut,egg\n');

  try {
    const gender = await ask(rl, 'gender');
    const age = await ask(rl, 'age');
    const height_cm = await ask(rl, 'height_cm');
    const weight_kg = await ask(rl, 'weight_kg');
    const fitness_goal = await ask(rl, 'fitness_goal');
    const fitness_level = await ask(rl, 'fitness_level');
    const available_minutes = await ask(rl, 'available workout minutes');
    const equipment = await ask(rl, 'equipment');
    const diet_preference = await ask(rl, 'diet_preference');
    const disliked_foods = await ask(rl, 'disliked_foods (optional, empty OK)');
    const allergies = await ask(rl, 'allergies (optional, empty OK)');
    const daily_calorie_target = await ask(rl, 'daily_calorie_target (optional, empty OK)');

    const profile = {
      gender: gender || null,
      age: Number(age) || null,
      height_cm: Number(height_cm) || null,
      weight_kg: Number(weight_kg) || null,
      fitness_goal: fitness_goal || null,
      fitness_level: fitness_level || null,
      equipment: parseList(equipment),
      diet_preference: diet_preference || null,
      disliked_foods: parseList(disliked_foods),
      allergies: parseList(allergies),
      available_workout_duration: Number(available_minutes) || null,
      daily_calorie_target: Number(daily_calorie_target) || null,
    };

    console.log('\n--- Tumhara typed profile ---');
    console.log(profile);

    const workouts = recommendWorkouts({
      profile,
      workouts: SAMPLE_WORKOUTS,
      limit: 5,
    });
    const meals = recommendMeals({
      profile,
      meals: SAMPLE_MEALS,
      limit: 5,
    });

    console.log('\n=== Recommended workouts ===');
    if (workouts.needsProfile || workouts.reason === 'no_suitable_matches') {
      console.log(workouts.message);
    } else {
      for (const w of workouts.recommendations) {
        console.log(
          `- ${w.title} | goal=${w.goal} | ${w.difficulty} | ${w.duration_min} min | score=${w.score}`
        );
        if (w.reason) console.log(`  reason: ${w.reason}`);
      }
    }

    console.log('\n=== Recommended meals ===');
    if (meals.needsProfile || meals.reason === 'no_suitable_matches') {
      console.log(meals.message);
    } else {
      for (const m of meals.recommendations) {
        const cal = m.kcal != null ? `${m.kcal} kcal` : 'kcal N/A';
        const pro = m.protein_g != null ? `${m.protein_g}g P` : 'protein N/A';
        console.log(`- ${m.title} | ${cal} | ${pro} | score=${m.score}`);
        if (m.reason) console.log(`  reason: ${m.reason}`);
      }
    }

    console.log('\nDobara: npm start\n');
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
