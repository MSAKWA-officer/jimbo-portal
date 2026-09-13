const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// EVENTS: matukio/mikutano inayoandaliwa (mfano: mikutano ya hadhara,
// vikao vya wananchi, warsha) ambayo huhitaji kufuatilia waliohudhuria
// (EVENT_ATTENDEES).
const Event = sequelize.define(
  'Event',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    eventDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'event_date',
    },

    startTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: 'start_time',
    },

    endTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: 'end_time',
    },

    location: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM('scheduled', 'ongoing', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'scheduled',
    },

    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Idadi kubwa ya washiriki inayotarajiwa (si lazima)',
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    organizerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'organizer_id',
    },
  },
  {
    tableName: 'events',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Event;
