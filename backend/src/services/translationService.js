/**
 * Qissa Arabic Restaurant - Automatic Culinary Arabic Translation Service
 * Accurately translates English dish names into context-aware Arabic culinary names.
 */

const CULINARY_DICTIONARY = {
  // Signature Rice & Pot Dishes
  'chicken mandi': 'مندي الدجاج',
  'mandi chicken': 'مندي الدجاج',
  'mutton mandi': 'مندي اللحم',
  'lamb mandi': 'مندي اللحم',
  'arabic chicken mandi': 'مندي دجاج عربي',
  'chicken kabsa': 'كبسة دجاج',
  'lamb kabsa': 'كبسة لحم',
  'chicken biryani': 'برياني دجاج',
  'mutton biryani': 'برياني لحم',
  'veg biryani': 'برياني خضار',
  'rice pot': 'قدر الأرز',
  'steamed basmati rice': 'أرز بسمتي على البخار',

  // Soups (Shurba)
  'lentil soup': 'شوربة العدس',
  'shurba addas': 'شوربة عدس',
  'shurba addas (lentil soup)': 'شوربة عدس',
  'moroccan harira': 'حريرة مغربية',
  'harira soup': 'شوربة الحريرة',
  'chicken soup': 'شوربة دجاج',
  'cream of mushroom soup': 'شوربة كريمة الفطر',
  'shurba': 'شوربة',

  // Salads (Sulta)
  'fattoush': 'فتوش',
  'fattoush salad': 'سلطة فتوش',
  'tabbouleh': 'تبولة',
  'tabbouleh salad': 'سلطة تبولة',
  'lebanese olive salad': 'سلطة زيتون لبنانية',
  'tahini chickpea salad': 'سلطة حمص بالطحينة',
  'watermelon feta salad': 'سلطة بطيخ مع جبنة فيتا',
  'arabic salad': 'سلطة عربية',
  'greek salad': 'سلطة يونانية',

  // Hummus & Cold Mezze
  'hummus': 'حمص',
  'classic hummus': 'حمص كلاسيكي',
  'healthy hummus bowls': 'أطباق حمص صحية',
  'hummus bowl': 'صحن حمص',
  'hummus chicken bowl': 'حمص بالدجاج',
  'beiruti lamb hummus bowl': 'حمص بيروتي باللحم',
  'pink hummus bowl': 'حمص وردي بالشمندر',
  'green falafel hummus bowl': 'حمص بالفلافل الخضراء',
  'cold mezze': 'مازة باردة',
  'mutabbal': 'متبل باذنجان',
  'baba ganoush': 'بابا غنوج',
  'labneh': 'لبنة',
  'labneh with zaatar & olives': 'لبنة بالزعتر والزيتون',
  'grape leaves (warak enab)': 'ورق عنب',
  'warak enab': 'ورق عنب',
  'toum': 'ثومية',
  'toum (garlic sauce)': 'صلصة الثومية',

  // Hot Mezze & Oven
  'hot mezze': 'مازة ساخنة',
  'falafel': 'فلافل',
  'falafel platter': 'طبق فلافل',
  'kibbeh': 'كبة مقلية',
  'meat kibbeh': 'كبة لحم',
  'cheese sambusek': 'سمبوسك جبنة',
  'meat sambusek': 'سمبوسك لحم',
  'batata harra': 'بطاطا حرة',
  'from the clay oven': 'من فرن الحطب',
  'manakeesh': 'مناقيش',
  'zaatar manakeesh': 'مناقيش زعتر',
  'cheese manakeesh': 'مناقيش جبنة',
  'lahmajoun': 'لحم بعجين',
  'lahmajoun with kebab': 'لحم بعجين مع كباب',
  'arayes': 'عرايس',
  'arayes meat': 'عرايس لحم',

  // Grills & Kebabs
  'on the grills': 'مشاوي على الفحم',
  'mix grill platter': 'مشويات مشكلة',
  'qissa signature mix grill platter': 'مشويات قصة المشكلة الفاخرة',
  'chicken al faham': 'دجاج على الفحم (الفحم)',
  'shish taouk': 'شيش طاووق',
  'shish tawook': 'شيش طاووق',
  'istanbul chicken kebab': 'كباب دجاج اسطنبولي',
  'lamb kebab': 'كباب لحم',
  'chicken kebab': 'كباب دجاج',
  'mutton seekh kebab': 'كباب سيخ لحم',
  'lamb chops': 'ريش لحم ضأن مشوية',

  // Shawarma & Rolls
  'shawarma': 'شاورما',
  'chicken shawarma': 'شاورما دجاج',
  'chicken shawarma plate': 'صحن شاورما دجاج',
  'chicken shawarma roll': 'رول شاورما دجاج',
  'qissa signature shawarma roll': 'شاورما رول قصة الخاصة',
  'hassan mattar': 'حسن مطر',
  'falafel roll': 'رول فلافل',
  'kebab roll': 'رول كباب',
  'shish taouk roll': 'رول شيش طاووق',

  // Gravies & Stews
  'gravy & stews': 'إدامات ويخنات',
  'butter chicken': 'دجاج بالزبدة',
  'lamb tagine': 'طاجين لحم',
  'chicken tagine': 'طاجين دجاج',

  // Desserts & Beverages
  'desserts': 'حلويات',
  'kunafeh': 'كنافة نابلسية',
  'kunafa': 'كنافة نابلسية',
  'dubai cheese bomb': 'قنبلة الجبن دبي',
  'baklava': 'بقلاوة مشكلة',
  'um ali': 'أم علي',
  'mohalabia': 'مهلبية',
  'fresh lemon mint': 'عصير ليمون بالنعناع',
  'fresh orange juice': 'عصير برتقال طازج',
  'arabic coffee': 'قهوة عربية',
  'karak chai': 'شاي كرك',
  'mint tea': 'شاي بالنعناع',
};

/**
 * Translates an English dish name to culinary Arabic.
 * @param {string} dishName - English dish name (e.g., "Chicken Mandi")
 * @returns {Promise<{arabicName: string, source: 'dictionary' | 'api' | 'fallback'}>}
 */
export async function translateDishNameToArabic(dishName) {
  if (!dishName || typeof dishName !== 'string') {
    return { arabicName: '', source: 'fallback' };
  }

  const clean = dishName.trim();
  const lower = clean.toLowerCase();

  // 1. Direct or fuzzy lookup in curated culinary dictionary
  if (CULINARY_DICTIONARY[lower]) {
    return {
      arabicName: CULINARY_DICTIONARY[lower],
      source: 'dictionary',
    };
  }

  // 2. Try online translation API (Google Translate Web API endpoint)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(
      clean
    )}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
        const translatedSegments = data[0].map((seg) => seg[0]).filter(Boolean);
        const translatedText = translatedSegments.join(' ').trim();
        if (translatedText) {
          return {
            arabicName: translatedText,
            source: 'api',
          };
        }
      }
    }
  } catch (err) {
    console.warn(`[TranslationService] Online translation for "${dishName}" failed or timed out:`, err.message);
  }

  // 3. Fallback: Compound matching for words inside dictionary
  for (const [key, val] of Object.entries(CULINARY_DICTIONARY)) {
    if (lower.includes(key) && key.length > 4) {
      return {
        arabicName: val,
        source: 'dictionary',
      };
    }
  }

  return {
    arabicName: '',
    source: 'fallback',
  };
}
