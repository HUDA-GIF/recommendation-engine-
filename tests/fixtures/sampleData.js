/**
 * Sample = AlphaFit Supabase catalogue se matched shapes
 * (workout_templates PDF list + 12 real recipes).
 * Fake "Mystery Veg Plate" HATA diya — DB mein nahi tha.
 */

export const SAMPLE_WORKOUTS = [
  { id: 'wt1', title: 'Core Crusher', goal: 'general_fitness', difficulty: 'beginner', focus: 'abs', duration_min: 15, est_kcal: 100, equipment: ['none'], tags: ['home'] },
  { id: 'wt2', title: 'Abs Burn Intermediate', goal: 'weight_loss', difficulty: 'intermediate', focus: 'abs', duration_min: 20, est_kcal: 160, equipment: ['none'], tags: ['home'] },
  { id: 'wt3', title: 'Back Builder Beginner', goal: 'muscle_gain', difficulty: 'beginner', focus: 'back', duration_min: 25, est_kcal: 150, equipment: ['dumbbells'], tags: ['gym'] },
  { id: 'wt4', title: 'Back and Biceps Gym', goal: 'muscle_gain', difficulty: 'intermediate', focus: 'back', duration_min: 45, est_kcal: 280, equipment: ['dumbbells', 'barbell'], tags: ['gym'] },
  { id: 'wt5', title: 'Pull Day Advanced', goal: 'muscle_gain', difficulty: 'advanced', focus: 'back', duration_min: 50, est_kcal: 350, equipment: ['barbell', 'cable'], tags: ['gym'] },
  { id: 'wt6', title: 'Fat Burn Express', goal: 'weight_loss', difficulty: 'beginner', focus: 'cardio', duration_min: 20, est_kcal: 220, equipment: ['none'], tags: ['home'] },
  { id: 'wt7', title: 'HIIT Cardio Blast', goal: 'weight_loss', difficulty: 'intermediate', focus: 'cardio', duration_min: 25, est_kcal: 300, equipment: ['none'], tags: ['hiit', 'jumping'] },
  { id: 'wt8', title: 'Jump Rope Endurance', goal: 'endurance', difficulty: 'beginner', focus: 'cardio', duration_min: 20, est_kcal: 240, equipment: ['jump_rope'], tags: ['cardio'] },
  { id: 'wt9', title: 'Endurance Cardio Mix', goal: 'endurance', difficulty: 'intermediate', focus: 'cardio', duration_min: 35, est_kcal: 380, equipment: ['none'], tags: ['cardio'] },
  { id: 'wt10', title: 'Chest Beginner Workout', goal: 'muscle_gain', difficulty: 'beginner', focus: 'chest', duration_min: 25, est_kcal: 200, equipment: ['dumbbells'], tags: ['gym'] },
  { id: 'wt11', title: 'Push Day Advanced', goal: 'muscle_gain', difficulty: 'advanced', focus: 'chest', duration_min: 50, est_kcal: 340, equipment: ['barbell', 'dumbbells'], tags: ['gym'] },
  { id: 'wt12', title: 'Full Body Beginner', goal: 'general_fitness', difficulty: 'beginner', focus: 'full_body', duration_min: 30, est_kcal: 200, equipment: ['none'], tags: ['home'] },
  { id: 'wt13', title: 'Morning Mobility', goal: 'general_fitness', difficulty: 'beginner', focus: 'full_body', duration_min: 15, est_kcal: 60, equipment: ['none'], tags: ['home'] },
  { id: 'wt14', title: 'Kettlebell Fat Burner', goal: 'weight_loss', difficulty: 'intermediate', focus: 'full_body', duration_min: 25, est_kcal: 320, equipment: ['kettlebell'], tags: ['gym'] },
  { id: 'wt15', title: 'No-Equipment Full Body Intermediate', goal: 'general_fitness', difficulty: 'intermediate', focus: 'full_body', duration_min: 35, est_kcal: 330, equipment: ['none'], tags: ['home'] },
  { id: 'wt16', title: 'Leg Day at Home', goal: 'muscle_gain', difficulty: 'beginner', focus: 'legs', duration_min: 30, est_kcal: 230, equipment: ['none'], tags: ['home'] },
  { id: 'wt17', title: 'Glutes and Legs Low Impact', goal: 'weight_loss', difficulty: 'beginner', focus: 'legs', duration_min: 25, est_kcal: 160, equipment: ['none'], tags: ['home'] },
  { id: 'wt18', title: 'Leg Day Gym', goal: 'muscle_gain', difficulty: 'intermediate', focus: 'legs', duration_min: 45, est_kcal: 320, equipment: ['dumbbells', 'barbell'], tags: ['gym'] },
  { id: 'wt19', title: 'Shoulders and Arms', goal: 'muscle_gain', difficulty: 'intermediate', focus: 'shoulders', duration_min: 35, est_kcal: 200, equipment: ['dumbbells'], tags: ['gym'] },
  { id: 'wt20', title: 'Upper Body Strength', goal: 'muscle_gain', difficulty: 'beginner', focus: 'upper_body', duration_min: 30, est_kcal: 220, equipment: ['dumbbells'], tags: ['gym'] },
  // Longer advanced-friendly option when user has 60 min
  { id: 'wt21', title: 'Advanced Full Engine 55', goal: 'muscle_gain', difficulty: 'advanced', focus: 'full_body', duration_min: 55, est_kcal: 400, equipment: ['dumbbells', 'barbell'], tags: ['gym'] },
  { id: 'wt22', title: 'Advanced Endurance 55', goal: 'endurance', difficulty: 'advanced', focus: 'cardio', duration_min: 55, est_kcal: 450, equipment: ['none'], tags: ['cardio'] },
];

/** Exact 12 AlphaFit recipes from Supabase work summary */
export const SAMPLE_MEALS = [
  { id: 'm1', title: 'Masala Egg Scramble', meal_types: ['breakfast'], recommendation_tags: ['high_protein', 'lower_carb'], diet_tags: ['vegetarian'], allergens: ['egg'], kcal: 248, protein_g: 25.2, carbs_g: 7.6, fat_g: 13.0, ingredients: ['egg', 'tomato', 'spinach', 'onion'] },
  { id: 'm2', title: 'Mango Cinnamon Oats', meal_types: ['breakfast'], recommendation_tags: ['balanced', 'high_fibre'], diet_tags: ['vegetarian'], allergens: ['dairy', 'peanut'], kcal: 349, protein_g: 15.2, carbs_g: 53.4, fat_g: 8.3, ingredients: ['oats', 'mango', 'skim_milk', 'peanut'] },
  { id: 'm3', title: 'Smoky Chicken Bowl', meal_types: ['lunch', 'dinner'], recommendation_tags: ['high_protein', 'balanced'], diet_tags: [], allergens: ['dairy'], kcal: 434, protein_g: 49.6, carbs_g: 39.9, fat_g: 8.4, ingredients: ['chicken', 'rice', 'yogurt'] },
  { id: 'm4', title: 'Chicken Qeema Wrap', meal_types: ['lunch'], recommendation_tags: ['high_protein', 'portable'], diet_tags: [], allergens: ['dairy', 'gluten'], kcal: 370, protein_g: 40.3, carbs_g: 33.4, fat_g: 8.3, ingredients: ['chicken', 'roti'] },
  { id: 'm5', title: 'Chickpea Chaat', meal_types: ['snack', 'lunch'], recommendation_tags: ['high_fibre', 'balanced'], diet_tags: ['vegetarian'], allergens: ['dairy'], kcal: 327, protein_g: 19.2, carbs_g: 54.2, fat_g: 3.7, ingredients: ['chickpeas', 'yogurt', 'onion', 'tomato'] },
  { id: 'm6', title: 'Moong Dal Chilla', meal_types: ['breakfast'], recommendation_tags: ['high_protein', 'high_fibre'], diet_tags: ['vegetarian'], allergens: ['dairy'], kcal: 274, protein_g: 21.7, carbs_g: 37.4, fat_g: 4.1, ingredients: ['moong_dal', 'yogurt', 'spinach'] },
  { id: 'm7', title: 'Chicken Salad', meal_types: ['lunch'], recommendation_tags: ['high_protein', 'balanced'], diet_tags: [], allergens: ['dairy'], kcal: 302, protein_g: 44.8, carbs_g: 12.9, fat_g: 7.9, ingredients: ['chicken', 'salad_greens', 'cucumber', 'yogurt'] },
  { id: 'm8', title: 'Chicken Lentil Curry', meal_types: ['lunch', 'dinner'], recommendation_tags: ['high_protein', 'high_fibre'], diet_tags: [], allergens: [], kcal: 345, protein_g: 38.5, carbs_g: 32.7, fat_g: 6.7, ingredients: ['chicken', 'lentils', 'onion', 'tomato'] },
  { id: 'm9', title: 'Mango Smoothie', meal_types: ['breakfast', 'snack'], recommendation_tags: ['balanced', 'high_protein'], diet_tags: ['vegetarian'], allergens: ['dairy'], kcal: 244, protein_g: 21.1, carbs_g: 31.8, fat_g: 3.6, ingredients: ['mango', 'yogurt', 'skim_milk'] },
  { id: 'm10', title: 'Banana Peanut Butter Oats', meal_types: ['breakfast'], recommendation_tags: ['energy_dense', 'vegetarian'], diet_tags: ['vegetarian'], allergens: ['dairy', 'peanut'], kcal: 351, protein_g: 15.2, carbs_g: 54.3, fat_g: 8.1, ingredients: ['banana', 'peanut_butter', 'oats'] },
  { id: 'm11', title: 'Chicken Grill Sandwich', meal_types: ['lunch'], recommendation_tags: ['high_protein', 'portable'], diet_tags: [], allergens: ['dairy', 'gluten'], kcal: 347, protein_g: 42.3, carbs_g: 31.0, fat_g: 5.9, ingredients: ['chicken', 'bread', 'yogurt'] },
  { id: 'm12', title: 'Masala Potato Eggs', meal_types: ['breakfast'], recommendation_tags: ['high_protein', 'balanced'], diet_tags: ['vegetarian'], allergens: ['egg'], kcal: 304, protein_g: 25.7, carbs_g: 21.3, fat_g: 12.9, ingredients: ['egg', 'potato', 'onion', 'tomato'] },
];
