const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// PROJECT_ACTIVITIES: shughuli/matukio yanayofanyika ndani ya utekelezaji
// wa mradi (mfano: kuweka msingi, ukaguzi wa robo mwaka, uzinduzi) -
// hutumika kufuatilia historia/timeline ya kila mradi (PROJECTS).
const ProjectActivity = sequelize.define(
  'ProjectActivity',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'project_id',
    },

    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    activityDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'activity_date',
    },

    status: {
      type: DataTypes.ENUM('planned', 'ongoing', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'planned',
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Mtumiaji aliyerekodi shughuli hii
    recordedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'recorded_by_id',
    },
  },
  {
    tableName: 'project_activities',
    timestamps: true,
    underscored: true,
  }
);

module.exports = ProjectActivity;
