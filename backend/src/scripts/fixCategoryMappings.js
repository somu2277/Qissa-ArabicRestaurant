import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { MenuItem } from '../models/MenuItem.js';
import { ENV } from '../config/env.js';

async function seedRollsAndPockets() {
  await mongoose.connect(ENV.MONGODB_URI);
  console.log('[Fix] Connected to DB');

  const rollsCat = await Category.findOne({ slug: 'rolls-pockets' });
  if (!rollsCat) {
    console.error('Category rolls-pockets not found!');
    process.exit(1);
  }

  // Update image for rollsCat if needed to ensure high quality
  rollsCat.image = 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80';
  await rollsCat.save();

  // Dishes to populate into Rolls & Pockets from the physical menu
  const rollDishes = [
    {
      name: 'Shawarma Roll',
      arabicName: 'رول شاورما',
      description: 'Thinly sliced strips of meat grilled till tender, rolled in pita with shredded vegetables, pickles and assorted condiments.',
      categoryId: rollsCat._id,
      price: 199,
      priceOptions: [
        { label: 'Chicken', amount: 199 },
        { label: 'Lamb', amount: 269 },
      ],
      isVeg: false,
      primaryImage: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80',
      badges: ['bestseller'],
      tags: ['roll', 'shawarma', 'chicken', 'lamb', 'wrap'],
      ingredients: ['Grilled chicken/lamb', 'Pickled cucumbers', 'Toum garlic sauce', 'Pita bread', 'French fries'],
      allergens: ['Gluten'],
      flavours: ['garlic', 'mild', 'savoury'],
      preparationMethods: ['roasted'],
      characteristics: ['filling'],
      mealRole: 'snack',
      averageRating: 4.7,
      totalRatings: 34,
    },
    {
      name: 'Hummus Shawarma Roll',
      arabicName: 'رول شاورما بالحمص',
      description: 'Slow roasted chicken shawarma slices nestled in a generous spread of artisan creamy hummus, mint leaves and garlic sauce wrapped in saj bread.',
      categoryId: rollsCat._id,
      price: 249,
      isVeg: false,
      primaryImage: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
      badges: ['popular'],
      tags: ['roll', 'shawarma', 'hummus', 'creamy', 'wrap'],
      ingredients: ['Chicken shawarma', 'Creamy hummus', 'Pickles', 'Toum', 'Saj bread'],
      allergens: ['Gluten', 'Sesame'],
      flavours: ['creamy', 'garlic', 'mild'],
      preparationMethods: ['roasted'],
      characteristics: ['filling', 'rich'],
      mealRole: 'snack',
      averageRating: 4.8,
      totalRatings: 26,
    },
    {
      name: 'Falafel Roll',
      arabicName: 'رول فلافل',
      description: 'Golden fried herb falafel patties crushed inside warm pita with tahini sauce, chopped tomatoes, cucumber, mint, and pickled turnips.',
      categoryId: rollsCat._id,
      price: 189,
      isVeg: true,
      primaryImage: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80',
      badges: ['popular'],
      tags: ['roll', 'falafel', 'veg', 'crispy', 'wrap'],
      ingredients: ['Chickpea falafel', 'Tahini', 'Fresh mint', 'Tomatoes', 'Pita bread', 'Pickled turnip'],
      allergens: ['Gluten', 'Sesame'],
      flavours: ['tangy', 'mild', 'nutty'],
      preparationMethods: ['fried'],
      characteristics: ['healthy', 'light'],
      mealRole: 'snack',
      averageRating: 4.6,
      totalRatings: 29,
    },
    {
      name: 'Shish Taouk Roll',
      arabicName: 'رول شيش طاووق',
      description: 'Charcoal-grilled juicy chicken cubes marinated in citrus and Ottoman spices, rolled with garlic toum, French fries, and pickled gherkins.',
      categoryId: rollsCat._id,
      price: 219,
      priceOptions: [
        { label: 'Chicken', amount: 219 },
        { label: 'Lamb', amount: 289 },
      ],
      isVeg: false,
      primaryImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      badges: ['chef_choice'],
      tags: ['roll', 'shish taouk', 'grilled', 'chicken', 'smoky'],
      ingredients: ['Charcoal grilled chicken', 'Toum garlic cream', 'Crisp fries', 'Pickles', 'Pita bread'],
      allergens: ['Gluten', 'Dairy'],
      flavours: ['smoky', 'garlic', 'tangy'],
      preparationMethods: ['grilled'],
      characteristics: ['filling'],
      mealRole: 'snack',
      averageRating: 4.9,
      totalRatings: 41,
    },
    {
      name: 'Kebab Roll',
      arabicName: 'رول كباب',
      description: 'Skewered minced meat seasoned with Arabic spices and parsley, grilled over charcoal and wrapped with sumac onions and tahini.',
      categoryId: rollsCat._id,
      price: 239,
      priceOptions: [
        { label: 'Chicken', amount: 239 },
        { label: 'Lamb', amount: 289 },
      ],
      isVeg: false,
      primaryImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      badges: [],
      tags: ['roll', 'kebab', 'lamb', 'chicken', 'grilled'],
      ingredients: ['Minced meat kebab', 'Sumac spiced onions', 'Tahini sauce', 'Parsley', 'Flatbread'],
      allergens: ['Gluten', 'Sesame'],
      flavours: ['smoky', 'spicy', 'savoury'],
      preparationMethods: ['grilled'],
      characteristics: ['filling'],
      mealRole: 'snack',
      averageRating: 4.5,
      totalRatings: 18,
    },
    {
      name: 'Turkish Durum Roll',
      arabicName: 'دوروم تركي',
      description: 'Authentic Turkish lavash wrap loaded with grilled filling, roasted red peppers, crisp iceberg lettuce, and zesty yoghurt dressing.',
      categoryId: rollsCat._id,
      price: 189,
      priceOptions: [
        { label: 'Falafel (Veg)', amount: 189 },
        { label: 'Chicken', amount: 219 },
        { label: 'Lamb', amount: 279 },
      ],
      isVeg: false,
      primaryImage: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
      badges: ['popular'],
      tags: ['durum', 'turkish', 'lavash', 'wrap', 'grilled'],
      ingredients: ['Turkish lavash', 'Roasted peppers', 'Yogurt garlic sauce', 'Fresh salad'],
      allergens: ['Gluten', 'Dairy'],
      flavours: ['mild', 'tangy', 'creamy'],
      preparationMethods: ['grilled'],
      characteristics: ['filling'],
      mealRole: 'snack',
      averageRating: 4.7,
      totalRatings: 22,
    },
    {
      name: 'Sabich Sandwich',
      arabicName: 'سندويش سابيح',
      description: 'A flavourful pita pocket stuffed with crispy fried eggplant, boiled egg, fresh Israeli salad, creamy tahini, and tangy amba mango pickle sauce.',
      categoryId: rollsCat._id,
      price: 189,
      isVeg: true,
      primaryImage: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80',
      badges: ['chef_choice'],
      tags: ['sabich', 'eggplant', 'pita', 'sandwich', 'veg'],
      ingredients: ['Crispy fried eggplant', 'Boiled egg', 'Tahini', 'Amba sauce', 'Pita bread', 'Chopped cucumber salad'],
      allergens: ['Gluten', 'Sesame', 'Egg'],
      flavours: ['tangy', 'creamy', 'savoury'],
      preparationMethods: ['fried'],
      characteristics: ['filling', 'healthy'],
      mealRole: 'snack',
      averageRating: 4.6,
      totalRatings: 19,
    },
    {
      name: 'Hassan Mattar',
      arabicName: 'حسن مطر',
      description: 'The iconic Emirati street sandwich: toasted Lebanese bread pressed with spiced minced chicken, melted cheese, french fries and toum.',
      categoryId: rollsCat._id,
      price: 259,
      isVeg: false,
      primaryImage: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
      badges: ['bestseller'],
      tags: ['hassan mattar', 'sandwich', 'cheese', 'chicken', 'emirati'],
      ingredients: ['Minced chicken', 'Melted cheese', 'Fries inside', 'Toum', 'Pressed pita'],
      allergens: ['Gluten', 'Dairy'],
      flavours: ['creamy', 'savoury', 'garlic'],
      preparationMethods: ['grilled'],
      characteristics: ['rich', 'filling'],
      mealRole: 'snack',
      averageRating: 4.9,
      totalRatings: 52,
    },
  ];

  let added = 0;
  for (const d of rollDishes) {
    const existing = await MenuItem.findOne({ name: d.name });
    if (!existing) {
      await MenuItem.create(d);
      added++;
      console.log(`+ Created: ${d.name}`);
    } else {
      // Ensure categoryId is set to rollsCat._id
      existing.categoryId = rollsCat._id;
      existing.priceOptions = d.priceOptions || existing.priceOptions;
      existing.flavours = d.flavours;
      existing.preparationMethods = d.preparationMethods;
      existing.characteristics = d.characteristics;
      existing.mealRole = d.mealRole;
      if (!existing.averageRating) existing.averageRating = d.averageRating;
      if (!existing.totalRatings) existing.totalRatings = d.totalRatings;
      await existing.save();
      console.log(`* Updated: ${d.name} -> mapped to Rolls & Pockets`);
    }
  }

  console.log(`[Fix] Finished! Added ${added} new items, updated remaining.`);
  process.exit(0);
}

seedRollsAndPockets();
