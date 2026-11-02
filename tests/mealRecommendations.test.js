import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { recommendMeals } from '../src/recommendMeals.js';
import { SAMPLE_MEALS } from './fixtures/sampleData.js';

describe('Meal recommendations (Supabase-aligned)', () => {
  it('Test 5: vegetarian diet_preference only compatible meals', () => {
    const result = recommendMeals({
      profile: {
        fitness_goal: 'weight_loss',
        diet_preference: 'vegetarian',
        disliked_foods: [],
      },
      meals: SAMPLE_MEALS,
    });

    assert.equal(result.ok, true);
    assert.ok(result.recommendations.length > 0);

    for (const meal of result.recommendations) {
      assert.ok(
        (meal.diet_tags ?? []).includes('vegetarian') ||
          meal.dietary_type === 'vegetarian'
      );
    }

    const ids = result.recommendations.map((m) => m.id);
    assert.equal(ids.includes('m3'), false);
    assert.equal(ids.includes('m4'), false);
  });

  it('Test 6: peanut allergen / disliked never recommended', () => {
    const byAllergy = recommendMeals({
      profile: {
        fitness_goal: 'muscle_gain',
        diet_preference: 'any',
        allergies: ['peanut'],
      },
      meals: SAMPLE_MEALS,
    });

    assert.equal(byAllergy.recommendations.some((m) => m.id === 'm2'), false);
    assert.equal(byAllergy.recommendations.some((m) => m.id === 'm6'), false);
    assert.ok(byAllergy.rejected.some((r) => r.reason === 'allergy'));

    const byDislike = recommendMeals({
      profile: {
        fitness_goal: 'muscle_gain',
        diet_preference: 'any',
        disliked_foods: ['chicken'],
      },
      meals: SAMPLE_MEALS,
    });

    assert.equal(byDislike.recommendations.some((m) => m.id === 'm3'), false);
    assert.ok(byDislike.rejected.some((r) => r.reason === 'disliked_food'));
  });

  it('Test 7: muscle_gain ranks higher protein; does not invent protein', () => {
    const result = recommendMeals({
      profile: {
        fitness_goal: 'muscle_gain',
        diet_preference: 'any',
        disliked_foods: [],
      },
      meals: SAMPLE_MEALS,
      limit: 10,
    });

    const chicken = result.recommendations.find((m) => m.id === 'm3');
    const chickpea = result.recommendations.find((m) => m.id === 'm5');
    assert.ok(chicken);
    assert.ok(chickpea);
    assert.ok(chicken.score > chickpea.score);
    assert.ok(chicken.protein_g >= 40);

    const mystery = result.recommendations.find((m) => m.id === 'm8');
    if (mystery) {
      assert.equal(mystery.calories, null);
      assert.equal(mystery.protein, null);
      assert.ok(mystery.nutritionNote);
      assert.equal(mystery.scoreBreakdown.goal, 0);
    }
  });

  it('Test 8: empty state when nothing matches', () => {
    const result = recommendMeals({
      profile: {
        fitness_goal: 'weight_loss',
        diet_preference: 'vegan',
        disliked_foods: ['chickpea', 'oat', 'egg', 'mango', 'banana', 'vegetable'],
      },
      meals: SAMPLE_MEALS,
    });

    assert.equal(result.ok, true);
    assert.deepEqual(result.recommendations, []);
    assert.equal(result.reason, 'no_suitable_matches');
  });

  it('missing goal blocks personalized meals', () => {
    const result = recommendMeals({
      profile: {
        diet_preference: 'vegetarian',
      },
      meals: SAMPLE_MEALS,
    });

    assert.equal(result.ok, false);
    assert.equal(result.needsProfile, true);
  });
});
