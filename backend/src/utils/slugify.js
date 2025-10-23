// Transliteration map for Cyrillic to Latin
const translitMap = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
  'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
  'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
  'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
  'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
  'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
  'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
};

/**
 * Convert Cyrillic text to Latin transliteration
 */
function transliterate(text) {
  return text.split('').map(char => translitMap[char] || char).join('');
}

/**
 * Generate URL-friendly slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} - URL-friendly slug
 */
function generateSlug(text) {
  if (!text) return '';

  // Transliterate Cyrillic to Latin
  let slug = transliterate(text);

  // Convert to lowercase
  slug = slug.toLowerCase();

  // Replace spaces and special characters with hyphens
  slug = slug
    .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Trim hyphens from start
    .replace(/-+$/, ''); // Trim hyphens from end

  return slug;
}

/**
 * Generate unique slug for a store
 * @param {string} name - Store name
 * @param {object} Store - Store model
 * @param {string} excludeId - Store ID to exclude from uniqueness check (for updates)
 * @returns {Promise<string>} - Unique slug
 */
async function generateUniqueSlug(name, Store, excludeId = null) {
  let baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  // Check if slug already exists
  while (true) {
    const whereClause = { slug };
    if (excludeId) {
      whereClause.id = { [require('sequelize').Op.ne]: excludeId };
    }

    const existing = await Store.findOne({ where: whereClause });

    if (!existing) {
      break;
    }

    // If slug exists, add counter
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

module.exports = {
  transliterate,
  generateSlug,
  generateUniqueSlug
};
