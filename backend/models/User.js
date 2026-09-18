const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// USERS: watumiaji wa mfumo (wanaoingia/login) - admin, staff wa ofisi, n.k.
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullName: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false, // itahifadhiwa kama hash (bcrypt)
  },
  role: {
    // Roles tofauti kabisa (siyo aina ndogo za 'staff'):
    //  - admin: msimamizi mkuu wa mfumo, ruhusa zote
    //  - staff: mfanyakazi wa jumla wa ofisi
    //  - secretary: katibu - anayeshughulikia mawasiliano/hati
    //  - officer: afisa - anayeshughulikia masuala ya kiufundi/miradi
    //  - citizen: mwananchi anayejisajili hadharani, anaweza kujiongeza
    //    kwenye constituents na kutuma maombi (requests) yake mwenyewe
    type: DataTypes.ENUM('admin', 'staff', 'secretary', 'officer', 'citizen'),
    allowNull: false,
    defaultValue: 'staff',
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'users',
});

module.exports = User;
