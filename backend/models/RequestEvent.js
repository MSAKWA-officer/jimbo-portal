const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// REQUEST_EVENTS: historia/matukio (timeline) ya kila ombi - kurekodi kila
// hatua muhimu inayotokea kwa ombi husika (kuwasilishwa, mabadiliko ya hali,
// maoni ya kiofisi, n.k.) ili kuwa na ufuatiliaji kamili wa safari ya ombi.
const RequestEvent = sequelize.define(
  'RequestEvent',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    requestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'request_id',
    },

    createdById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_by_id',
    },

    // aina ya tukio: mabadiliko ya hali (yanatokea kiotomatiki), maoni ya
    // kiofisi, dokezo la jumla, au tukio jingine
    type: {
      type: DataTypes.ENUM('status_change', 'comment', 'note', 'other'),
      allowNull: false,
      defaultValue: 'note',
    },

    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // hutumika tu kwa aina 'status_change'
    oldStatus: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'old_status',
    },

    newStatus: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'new_status',
    },

    eventDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'event_date',
    },
  },
  {
    tableName: 'request_events',
    timestamps: true,
    underscored: true,
  }
);

module.exports = RequestEvent;
