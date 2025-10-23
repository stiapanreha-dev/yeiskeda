/**
 * Production Data Seeder
 * Seeds the database with production data from Pi4-2 server
 * Run: node src/seeders/seed-production-data.js
 */

const { sequelize } = require('../config/database');
const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');

const productionData = {
  users: [
    {
      id: '70bd0edb-4fcb-408b-9977-2fd160c97aec',
      email: 'admin@spasiedu.sh3.su',
      password: '$2a$10$XwARgd.bwuzwsy6s7i0fVOcLCceRG4h2kzLgn6Jlp00wD8n/p6vL.',
      role: 'admin',
      phoneNumber: null,
      isActive: true,
      createdAt: new Date('2025-10-21 20:32:49.361+00'),
      updatedAt: new Date('2025-10-21 20:32:49.361+00')
    },
    {
      id: '72729d23-3a5e-4900-80c3-67653b1eec05',
      email: 'pyaterochka@test.ru',
      password: '$2a$10$jyGfq/cYDVBTjIMrUbKdcuAghZoPGWTlvUiu0.iiYAMcKK6heHOPq',
      role: 'store',
      phoneNumber: null,
      isActive: true,
      createdAt: new Date('2025-10-21 20:37:56.039+00'),
      updatedAt: new Date('2025-10-21 20:37:56.039+00')
    },
    {
      id: '6b844faa-0663-427a-8999-e286b1212cf7',
      email: 'magnit@test.ru',
      password: '$2a$10$fL2Aw4ZheOTNO2u3c4YdLeOFWjlcWbXlqro5V5Q9zR.fz5jBxpQJi',
      role: 'store',
      phoneNumber: null,
      isActive: true,
      createdAt: new Date('2025-10-21 20:37:56.742+00'),
      updatedAt: new Date('2025-10-21 20:37:56.742+00')
    },
    {
      id: 'e6df7934-1ed2-4323-969b-5e3534f2cfca',
      email: 'diksi@test.ru',
      password: '$2a$10$bm0wNDTtkU2WCuRseJS.AO6f6q4GCtlYREqcUvme.DPvlfwrJypA.',
      role: 'store',
      phoneNumber: null,
      isActive: true,
      createdAt: new Date('2025-10-21 20:37:57.453+00'),
      updatedAt: new Date('2025-10-21 20:37:57.453+00')
    }
  ],

  stores: [
    {
      id: '36037c77-315d-47f4-a317-149b7975f272',
      userId: '72729d23-3a5e-4900-80c3-67653b1eec05',
      name: 'Пятёрочка на Свердлова',
      description: 'Сеть продуктовых магазинов с доступными ценами',
      address: 'ул. Свердлова, 87, Ейск',
      latitude: '46.70970000',
      longitude: '38.27470000',
      photo: null,
      workingHours: {
        monday: '08:00-22:00',
        tuesday: '08:00-22:00',
        wednesday: '08:00-22:00',
        thursday: '08:00-22:00',
        friday: '08:00-22:00',
        saturday: '09:00-21:00',
        sunday: '09:00-21:00'
      },
      isActive: true,
      subscriptionTier: 'free',
      subscriptionExpiresAt: null,
      createdAt: new Date('2025-10-21 20:38:36.291+00'),
      updatedAt: new Date('2025-10-21 20:38:36.291+00')
    },
    {
      id: '36deffbb-74ff-439e-8b2b-5011fe3710b9',
      userId: '6b844faa-0663-427a-8999-e286b1212cf7',
      name: 'Магнит',
      description: 'Сеть магазинов у дома',
      address: 'ул. Красная, 52, Ейск',
      latitude: '46.71500000',
      longitude: '38.27000000',
      photo: null,
      workingHours: {
        monday: '07:00-23:00',
        tuesday: '07:00-23:00',
        wednesday: '07:00-23:00',
        thursday: '07:00-23:00',
        friday: '07:00-23:00',
        saturday: '07:00-23:00',
        sunday: '07:00-23:00'
      },
      isActive: true,
      subscriptionTier: 'free',
      subscriptionExpiresAt: null,
      createdAt: new Date('2025-10-21 20:38:36.788+00'),
      updatedAt: new Date('2025-10-21 20:38:36.788+00')
    },
    {
      id: '9288cee9-a77a-4c8f-90b2-49fa85041bfd',
      userId: 'e6df7934-1ed2-4323-969b-5e3534f2cfca',
      name: 'Дикси',
      description: 'Магазин продуктов рядом с домом',
      address: 'ул. Победы, 14, Ейск',
      latitude: '46.70500000',
      longitude: '38.28500000',
      photo: null,
      workingHours: {
        monday: '08:00-22:00',
        tuesday: '08:00-22:00',
        wednesday: '08:00-22:00',
        thursday: '08:00-22:00',
        friday: '08:00-22:00',
        saturday: '08:00-22:00',
        sunday: '08:00-22:00'
      },
      isActive: true,
      subscriptionTier: 'free',
      subscriptionExpiresAt: null,
      createdAt: new Date('2025-10-21 20:38:37.297+00'),
      updatedAt: new Date('2025-10-21 20:38:37.297+00')
    }
  ],

  products: [
    // Пятёрочка products
    {
      id: '71b23122-fcf1-4bbb-8548-1f0488650fc5',
      storeId: '36037c77-315d-47f4-a317-149b7975f272',
      name: 'Молоко 3.2%',
      photo: null,
      originalPrice: '300.00',
      discountPrice: '200.00',
      quantity: 15,
      expiryDate: '2025-10-23',
      isAvailable: true,
      pickedUpAt: null,
      createdAt: new Date('2025-10-21 20:39:33.234+00'),
      updatedAt: new Date('2025-10-21 20:39:33.234+00')
    },
    {
      id: 'f9665e37-ed8e-4e75-9ead-fe0b77ebbc89',
      storeId: '36037c77-315d-47f4-a317-149b7975f272',
      name: 'Хлеб белый',
      photo: null,
      originalPrice: '200.00',
      discountPrice: '130.00',
      quantity: 20,
      expiryDate: '2025-10-24',
      isAvailable: true,
      pickedUpAt: null,
      createdAt: new Date('2025-10-21 20:39:33.797+00'),
      updatedAt: new Date('2025-10-21 20:39:33.797+00')
    },
    {
      id: '94884bae-f54f-4201-a812-8b0f91df1ee8',
      storeId: '36037c77-315d-47f4-a317-149b7975f272',
      name: 'Сыр Российский',
      photo: null,
      originalPrice: '1500.00',
      discountPrice: '1000.00',
      quantity: 8,
      expiryDate: '2025-10-25',
      isAvailable: true,
      pickedUpAt: null,
      createdAt: new Date('2025-10-21 20:39:34.326+00'),
      updatedAt: new Date('2025-10-21 20:39:34.326+00')
    },
    {
      id: '2d1e1d5b-005f-431a-99b1-7dd61424b12c',
      storeId: '36037c77-315d-47f4-a317-149b7975f272',
      name: 'Йогурт клубничный',
      photo: null,
      originalPrice: '250.00',
      discountPrice: '170.00',
      quantity: 25,
      expiryDate: '2025-10-26',
      isAvailable: true,
      pickedUpAt: null,
      createdAt: new Date('2025-10-21 20:39:34.855+00'),
      updatedAt: new Date('2025-10-21 20:39:34.855+00')
    },

    // Магнит products
    {
      id: '0ca34267-a283-41b3-a71d-9ab206f70da7',
      storeId: '36deffbb-74ff-439e-8b2b-5011fe3710b9',
      name: 'Кефир 2.5%',
      photo: null,
      originalPrice: '350.00',
      discountPrice: '240.00',
      quantity: 18,
      expiryDate: '2025-10-23',
      isAvailable: true,
      pickedUpAt: null,
      createdAt: new Date('2025-10-21 20:40:11.15+00'),
      updatedAt: new Date('2025-10-21 20:40:11.15+00')
    },
    {
      id: '26df7acf-c78a-4e7e-a34a-a161b3478696',
      storeId: '36deffbb-74ff-439e-8b2b-5011fe3710b9',
      name: 'Колбаса Докторская',
      photo: null,
      originalPrice: '2000.00',
      discountPrice: '1300.00',
      quantity: 12,
      expiryDate: '2025-10-24',
      isAvailable: true,
      pickedUpAt: null,
      createdAt: new Date('2025-10-21 20:40:11.678+00'),
      updatedAt: new Date('2025-10-21 20:40:11.678+00')
    },
    {
      id: 'd2ca091b-dded-4b4e-8851-0ee327e49251',
      storeId: '36deffbb-74ff-439e-8b2b-5011fe3710b9',
      name: 'Творог 5%',
      photo: null,
      originalPrice: '800.00',
      discountPrice: '550.00',
      quantity: 10,
      expiryDate: '2025-10-25',
      isAvailable: true,
      pickedUpAt: null,
      createdAt: new Date('2025-10-21 20:40:12.185+00'),
      updatedAt: new Date('2025-10-21 20:40:12.185+00')
    },
    {
      id: 'b6816acd-1866-4e11-85d7-bb1d971325aa',
      storeId: '36deffbb-74ff-439e-8b2b-5011fe3710b9',
      name: 'Масло сливочное 82%',
      photo: null,
      originalPrice: '1200.00',
      discountPrice: '800.00',
      quantity: 14,
      expiryDate: '2025-10-27',
      isAvailable: true,
      pickedUpAt: null,
      createdAt: new Date('2025-10-21 20:40:12.72+00'),
      updatedAt: new Date('2025-10-21 20:40:12.72+00')
    },

    // Дикси products
    {
      id: '126500b5-b574-43c1-85c6-b88c7c052191',
      storeId: '9288cee9-a77a-4c8f-90b2-49fa85041bfd',
      name: 'Молоко 3.5%',
      photo: null,
      originalPrice: '400.00',
      discountPrice: '270.00',
      quantity: 12,
      expiryDate: '2025-10-24',
      isAvailable: true,
      pickedUpAt: null,
      createdAt: new Date('2025-10-21 20:40:52.405+00'),
      updatedAt: new Date('2025-10-21 20:40:52.405+00')
    },
    {
      id: 'e96dc2a8-a0da-4bcd-9204-fd7417ab55bd',
      storeId: '9288cee9-a77a-4c8f-90b2-49fa85041bfd',
      name: 'Сыр Чеддер',
      photo: null,
      originalPrice: '2000.00',
      discountPrice: '1300.00',
      quantity: 6,
      expiryDate: '2025-10-25',
      isAvailable: true,
      pickedUpAt: null,
      createdAt: new Date('2025-10-21 20:40:52.911+00'),
      updatedAt: new Date('2025-10-21 20:40:52.911+00')
    },
    {
      id: 'a5e38f7e-c776-4384-9e42-930a44fe036e',
      storeId: '9288cee9-a77a-4c8f-90b2-49fa85041bfd',
      name: 'Йогурт натуральный',
      photo: null,
      originalPrice: '350.00',
      discountPrice: '240.00',
      quantity: 20,
      expiryDate: '2025-10-26',
      isAvailable: true,
      pickedUpAt: null,
      createdAt: new Date('2025-10-21 20:40:53.454+00'),
      updatedAt: new Date('2025-10-21 20:40:53.454+00')
    },
    {
      id: '8e31ec8d-81fb-437d-9251-a02c0bf5de11',
      storeId: '9288cee9-a77a-4c8f-90b2-49fa85041bfd',
      name: 'Масло сливочное',
      photo: null,
      originalPrice: '1500.00',
      discountPrice: '1000.00',
      quantity: 9,
      expiryDate: '2025-10-27',
      isAvailable: true,
      pickedUpAt: null,
      createdAt: new Date('2025-10-21 20:40:54.027+00'),
      updatedAt: new Date('2025-10-21 20:40:54.027+00')
    },
    {
      id: '9364f08d-dff6-474a-8210-79bf2edc4a42',
      storeId: '9288cee9-a77a-4c8f-90b2-49fa85041bfd',
      name: 'Греческий йогурт',
      photo: null,
      originalPrice: '450.00',
      discountPrice: '300.00',
      quantity: 15,
      expiryDate: '2025-10-23',
      isAvailable: true,
      pickedUpAt: null,
      createdAt: new Date('2025-10-21 20:40:54.561+00'),
      updatedAt: new Date('2025-10-21 20:40:54.561+00')
    }
  ]
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await Product.destroy({ where: {}, force: true });
    await Store.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    console.log('✓ Existing data cleared');

    // Seed users (skip password hashing hooks)
    console.log('\n👥 Seeding users...');
    for (const userData of productionData.users) {
      await User.create(userData, {
        hooks: false, // Skip password hashing - already hashed
        validate: false
      });
    }
    console.log(`✓ Created ${productionData.users.length} users`);

    // Seed stores
    console.log('\n🏪 Seeding stores...');
    for (const storeData of productionData.stores) {
      await Store.create(storeData, {
        hooks: false,
        validate: false
      });
    }
    console.log(`✓ Created ${productionData.stores.length} stores`);

    // Seed products
    console.log('\n📦 Seeding products...');
    for (const productData of productionData.products) {
      await Product.create(productData, {
        hooks: false,
        validate: false
      });
    }
    console.log(`✓ Created ${productionData.products.length} products`);

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Users: ${productionData.users.length}`);
    console.log(`   Stores: ${productionData.stores.length}`);
    console.log(`   Products: ${productionData.products.length}`);
    console.log('\n✅ Database seeding completed successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, productionData };
