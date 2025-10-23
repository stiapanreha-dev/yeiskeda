const { sequelize } = require('../config/database');
const { Store } = require('../models');
const { generateUniqueSlug } = require('../utils/slugify');

/**
 * Generate slugs for existing stores
 */
async function generateSlugs() {
  console.log('🔄 Starting slug generation for existing stores...\n');

  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Database connection established\n');

    // Get all stores without slugs or with empty slugs
    const stores = await Store.findAll();

    console.log(`Found ${stores.length} stores\n`);

    // Generate slug for each store
    for (const store of stores) {
      if (!store.slug || store.slug === '') {
        const slug = await generateUniqueSlug(store.name, Store, store.id);

        await store.update({ slug });

        console.log(`✓ Generated slug for "${store.name}": ${slug}`);
      } else {
        console.log(`⊙ "${store.name}" already has slug: ${store.slug}`);
      }
    }

    console.log(`\n✅ Slug generation completed! Generated slugs for ${stores.length} stores.\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating slugs:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateSlugs();
}

module.exports = generateSlugs;
