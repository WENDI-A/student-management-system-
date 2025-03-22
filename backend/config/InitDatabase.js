const { Sequelize } = require('sequelize');
const { sequelize } = require('../models');
require('dotenv').config();

const db = {
  initialize: async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection established successfully.');

      const dbInfo = sequelize.config;
      console.log(`ℹ️  Connected to ${dbInfo.database} on ${dbInfo.host} as ${dbInfo.username}`);

      await db.checkTables();

      return {
        database: dbInfo.database,
        host: dbInfo.host,
        username: dbInfo.username,
      };
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
      throw new Error('Database connection failed');
    }
  },

  checkTables: async () => {
    try {
      const [results] = await sequelize.query("SHOW TABLES");
      const tableCount = results.length;
      const forceMigration = process.env.FORCE_MIGRATION === 'true';

      if (forceMigration) {
        console.log('⚠️ FORCE_MIGRATION enabled. Dropping and recreating all tables...');
        await sequelize.drop();
        console.log('🗑️  All tables dropped.');
        await sequelize.sync({ force: true });
        console.log('✅ Database schema recreated successfully.');
      } else if (tableCount === 0) {
        console.log('🔄 No tables found. Initializing database schema...');
        await sequelize.sync();
        console.log('✅ Database schema created successfully.');
      } else {
        console.log(`✅ Database already contains ${tableCount} tables. No migration needed.`);
      }
    } catch (error) {
      console.error('❌ Failed to manage database schema:', error.message);
      throw new Error('Database schema management failed');
    }
  },

  getSequelize: () => sequelize
};

module.exports = db;
