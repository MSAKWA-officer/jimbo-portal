// Run this ONCE with: node fix-role-enum.js
// It updates the "role" column so it accepts 'citizen' (replacing 'viewer'),
// working correctly for BOTH MySQL (Aiven) and PostgreSQL (Render),
// based on whatever DB_DIALECT / DATABASE_URL is already set in your .env.

const sequelize = require('./config/database');

async function run() {
  const dialect = sequelize.getDialect();
  console.log(`Detected dialect: ${dialect}`);

  try {
    await sequelize.authenticate();
    console.log('Connected to the database.');

    if (dialect === 'postgres') {
      await sequelize.query(
        `ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'citizen';`
      );
      console.log('Postgres enum updated: "citizen" added.');
    } else if (dialect === 'mysql') {
      await sequelize.query(
        `ALTER TABLE users
         MODIFY COLUMN role
         ENUM('admin','staff','secretary','officer','viewer','citizen')
         NOT NULL DEFAULT 'staff';`
      );
      console.log('MySQL column updated: "citizen" added alongside "viewer".');
    } else {
      throw new Error(`Unhandled dialect: ${dialect}`);
    }

    const [result] = await sequelize.query(
      `UPDATE users SET role = 'citizen' WHERE role = 'viewer';`
    );
    console.log('Old "viewer" rows switched to "citizen".', result);

    console.log('Done. You can now delete this script.');
  } catch (error) {
    console.error('FAILED:', error.message);
  } finally {
    await sequelize.close();
  }
}

run();
