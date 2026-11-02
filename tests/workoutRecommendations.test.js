import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { recommendWorkouts } from '../src/recommendWorkouts.js';
import { SAMPLE_WORKOUTS } from './fixtures/sampleData.js';

describe('Workout recommendations (Supabase-aligned)', () => {
  it('Test 1: beginner weight_loss within 20 minutes', () => {
    const result = recommendWorkouts({
      profile: {
        fitness_goal: 'weight_loss',
        fitness_level: 'beginner',
        available_workout_duration: 20,
        equipment: ['none'],
      },
      workouts: SAMPLE_WORKOUTS,
    });

    assert.equal(result.ok, true);
    assert.ok(result.recommendations.length > 0);

    const ids = result.recommendations.map((w) => w.id);
    assert.ok(ids.includes('wt1') || ids.includes('wt2'));
    assert.equal(ids.includes('wt6'), false);
    assert.equal(ids.includes('wt5'), false);
    assert.equal(ids.includes('wt10'), false);

    for (const w of result.recommendations) {
      assert.ok(['beginner'].includes(w.difficulty ?? w.fitness_level));
      assert.ok((w.duration_min ?? w.duration_minutes) <= 20);
    }
  });

  it('Test 2: intermediate muscle_gain with dumbbells', () => {
    const result = recommendWorkouts({
      profile: {
        fitness_goal: 'muscle_gain',
        fitness_level: 'intermediate',
        available_workout_duration: 45,
        equipment: ['dumbbells', 'barbell'],
      },
      workouts: SAMPLE_WORKOUTS,
    });

    assert.equal(result.ok, true);
    const ids = result.recommendations.map((w) => w.id);
    assert.ok(ids.includes('wt4') || ids.includes('wt5'));
    assert.equal(ids.includes('wt6'), false);

    const topGoals = result.recommendations.map((w) => w.goal ?? w.target_goal);
    assert.ok(topGoals.includes('muscle_gain') || topGoals.includes('general_fitness'));
  });

  it('Test 3: filters duration over available time', () => {
    const result = recommendWorkouts({
      profile: {
        fitness_goal: 'weight_loss',
        fitness_level: 'beginner',
        available_workout_duration: 20,
        equipment: ['none'],
      },
      workouts: SAMPLE_WORKOUTS,
    });

    const over = result.recommendations.filter(
      (w) => (w.duration_min ?? w.duration_minutes) > 20
    );
    assert.equal(over.length, 0);
    assert.ok(result.rejected.some((r) => r.id === 'wt10' && r.reason === 'duration'));
  });

  it('Test 4: missing fitness_goal blocks personalized list', () => {
    const result = recommendWorkouts({
      profile: {
        fitness_level: 'beginner',
        equipment: ['none'],
      },
      workouts: SAMPLE_WORKOUTS,
    });

    assert.equal(result.ok, false);
    assert.equal(result.needsProfile, true);
    assert.equal(result.reason, 'missing_fitness_goal');
    assert.deepEqual(result.recommendations, []);
  });

  it('different profiles produce different top recommendations', () => {
    const a = recommendWorkouts({
      profile: {
        fitness_goal: 'weight_loss',
        fitness_level: 'beginner',
        available_workout_duration: 20,
        equipment: ['none'],
      },
      workouts: SAMPLE_WORKOUTS,
    });
    const b = recommendWorkouts({
      profile: {
        fitness_goal: 'muscle_gain',
        fitness_level: 'intermediate',
        available_workout_duration: 45,
        equipment: ['dumbbells', 'barbell'],
      },
      workouts: SAMPLE_WORKOUTS,
    });

    assert.notEqual(a.recommendations[0]?.id, b.recommendations[0]?.id);
  });

  it('endurance goal ranks endurance templates', () => {
    const result = recommendWorkouts({
      profile: {
        fitness_goal: 'endurance',
        fitness_level: 'beginner',
        available_workout_duration: 25,
        equipment: ['jump_rope', 'none'],
      },
      workouts: SAMPLE_WORKOUTS,
    });

    assert.ok(result.recommendations.some((w) => (w.goal ?? w.target_goal) === 'endurance'));
  });
});
