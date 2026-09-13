const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// EVENT_ATTENDEES: watu waliojiandikisha/kuhudhuria tukio (Event) fulani.
// Anaweza kuwa mwananchi aliyeshahifadhiwa (constituentId) au mtu mgeni
// aliyeandikishwa moja kwa moja kwenye tukio (fullName/phone/email).
const EventAttendee = sequelize.define(
  'EventAttendee',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'event_id',
    },

    // Ikiwa mhudhuriaji ni mwananchi aliyeshaandikishwa kwenye mfumo (si lazima)
    constituentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'constituent_id',
    },

    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'full_name',
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      validate: { isEmail: true },
    },

    organization: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'Taasisi/kikundi anachotoka mhudhuriaji (si lazima)',
    },

    attendanceStatus: {
      type: DataTypes.ENUM('registered', 'confirmed', 'attended', 'absent', 'cancelled'),
      allowNull: false,
      defaultValue: 'registered',
      field: 'attendance_status',
    },

    registeredAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'registered_at',
    },

    checkedInAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'checked_in_at',
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'event_attendees',
    timestamps: true,
    underscored: true,
    indexes: [
      // Mtu mmoja (kwa namba ya simu) asijiandikishe mara mbili kwenye tukio moja
      { fields: ['event_id'] },
      { fields: ['event_id', 'phone'] },
    ],
  }
);

module.exports = EventAttendee;
