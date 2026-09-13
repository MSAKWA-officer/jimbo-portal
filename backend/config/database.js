require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'mfumo_maombi',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // badilisha kuwa console.log ukitaka kuona SQL queries
    define: {
      underscored: true, // majina ya columns kwa snake_case DB-ni (created_at, n.k.)
      timestamps: true,
    },
  }
);

module.exports = sequelize;
