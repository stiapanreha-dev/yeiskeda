/**
 * Migration script to fix workingHours structure
 * Converts complex format {open, close, closed} to simple format "HH:MM-HH:MM"
 */

const { sequelize } = require('../config/database');
const Store = require('../models/Store');

const normalizeWorkingHours = (hours) => {
  if (!hours) return null;

  const normalized = {};
  Object.entries(hours).forEach(([day, value]) => {
    if (typeof value === 'string') {
      // Already in correct format
      normalized[day] = value;
    } else if (typeof value === 'object' && value.open && value.close) {
      // Complex format - convert to simple
      if (value.closed) {
        normalized[day] = 'Выходной';
      } else {
        normalized[day] = `${value.open}-${value.close}`;
      }
    }
  });
  return normalized;
};

async function fixWorkingHours() {
  try {
    console.log('🔧 Starting workingHours migration...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Get all stores
    const stores = await Store.findAll();
    console.log(`\n📊 Found ${stores.length} stores\n`);

    let updatedCount = 0;

    for (const store of stores) {
      console.log(`Processing: ${store.name}`);
      console.log(`  Current workingHours:`, JSON.stringify(store.workingHours, null, 2));

      const normalized = normalizeWorkingHours(store.workingHours);

      if (normalized && JSON.stringify(normalized) !== JSON.stringify(store.workingHours)) {
        await store.update({ workingHours: normalized });
        console.log(`  ✓ Updated to:`, JSON.stringify(normalized, null, 2));
        updatedCount++;
      } else {
        console.log(`  ✓ Already in correct format`);
      }
      console.log('');
    }

    console.log('\n✅ Migration completed!');
    console.log(`   Updated: ${updatedCount} stores`);
    console.log(`   Unchanged: ${stores.length - updatedCount} stores`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

// Run migration
fixWorkingHours();
