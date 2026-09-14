require('dotenv').config();

const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

// ==========================================
// SEED ADMIN
// ==========================================
// Hutengeneza (au kuhakikisha ipo) akaunti ya kwanza ya admin, bila kuhitaji
// curl/Postman. Hutumia taarifa kutoka .env (kama zipo) au default hapa chini.
//
// Jinsi ya kutumia:
//   node utils/seedAdmin.js
//
// Au ongeza kwenye package.json -> "scripts": { "seed:admin": "node utils/seedAdmin.js" }
// kisha: npm run seed:admin
//
// Unaweza kubadilisha taarifa za admin kwa kuweka hizi kwenye .env:
//   ADMIN_FULL_NAME=Admin
//   ADMIN_EMAIL=admin@mfumo.co.tz
//   ADMIN_PASSWORD=siri123
//   ADMIN_PHONE=0700000000

const ADMIN_FULL_NAME = process.env.ADMIN_FULL_NAME || 'Admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mfumo.co.tz';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Mbunge123!';
const ADMIN_PHONE = process.env.ADMIN_PHONE || null;

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Muunganiko na database umefanikiwa.');

    // Hakikisha tables zipo (haziathiri data iliyopo - alter: true)
    await sequelize.sync({ alter: true });

    const existing = await User.findOne({ where: { email: ADMIN_EMAIL } });

    if (existing) {
      if (existing.role !== 'admin' || !existing.isActive) {
        await existing.update({ role: 'admin', isActive: true });
        console.log(`✅ Akaunti "${ADMIN_EMAIL}" tayari ilikuwepo - imepandishwa kuwa admin na kuwashwa.`);
      } else {
        console.log(`ℹ️  Akaunti ya admin "${ADMIN_EMAIL}" tayari ipo. Hakuna lililobadilishwa.`);
      }
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

      await User.create({
        fullName: ADMIN_FULL_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        phone: ADMIN_PHONE,
        isActive: true,
      });

      console.log('✅ Akaunti mpya ya admin imetengenezwa kwa mafanikio:');
      console.log(`   Email    : ${ADMIN_EMAIL}`);
      console.log(`   Password : ${ADMIN_PASSWORD}`);
      console.log('   (Ingia kupitia ukurasa wa Login, kisha badilisha password haraka iwezekanavyo.)');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Imeshindwa kutengeneza akaunti ya admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
