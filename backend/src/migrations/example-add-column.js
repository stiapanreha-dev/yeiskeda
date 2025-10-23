/**
 * Example migration: Add a new column to stores table
 *
 * To create a new migration, run:
 * npm run migration:create add-column-name
 *
 * This will generate a timestamped migration file.
 */

'use strict';

module.exports = {
  /**
   * Run the migration (apply changes to database)
   */
  async up(queryInterface, Sequelize) {
    // Example: Add a new column to 'stores' table
    await queryInterface.addColumn('stores', 'example_field', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Example field added via migration'
    });

    // Example: Create an index
    // await queryInterface.addIndex('stores', ['example_field'], {
    //   name: 'stores_example_field_idx'
    // });

    // Example: Modify existing column
    // await queryInterface.changeColumn('stores', 'name', {
    //   type: Sequelize.STRING(512),
    //   allowNull: false
    // });

    // Example: Create a new table
    // await queryInterface.createTable('store_reviews', {
    //   id: {
    //     type: Sequelize.UUID,
    //     defaultValue: Sequelize.UUIDV4,
    //     primaryKey: true
    //   },
    //   store_id: {
    //     type: Sequelize.UUID,
    //     allowNull: false,
    //     references: {
    //       model: 'stores',
    //       key: 'id'
    //     },
    //     onUpdate: 'CASCADE',
    //     onDelete: 'CASCADE'
    //   },
    //   rating: {
    //     type: Sequelize.INTEGER,
    //     allowNull: false
    //   },
    //   comment: {
    //     type: Sequelize.TEXT
    //   },
    //   created_at: {
    //     type: Sequelize.DATE,
    //     allowNull: false
    //   },
    //   updated_at: {
    //     type: Sequelize.DATE,
    //     allowNull: false
    //   }
    // });
  },

  /**
   * Revert the migration (undo changes)
   */
  async down(queryInterface, Sequelize) {
    // Undo the changes in reverse order
    await queryInterface.removeColumn('stores', 'example_field');

    // await queryInterface.removeIndex('stores', 'stores_example_field_idx');
    // await queryInterface.changeColumn('stores', 'name', { ...old definition... });
    // await queryInterface.dropTable('store_reviews');
  }
};
