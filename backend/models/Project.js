const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// PROJECTS: miradi ya maendeleo inayotekelezwa (mfano: ujenzi wa zahanati,
// barabara, shule) - hufuatilia gharama, maendeleo (progress) na hali yake.
const Project = sequelize.define(
  'Project',
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

    // Aina ya mradi, mfano: Elimu, Afya, Miundombinu (si lazima)
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'category_id',
    },

    // Mwananchi/eneo linalonufaika na mradi (si lazima)
    constituentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'constituent_id',
    },

    location: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM('planned', 'ongoing', 'completed', 'on_hold', 'cancelled'),
      allowNull: false,
      defaultValue: 'planned',
    },

    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'start_date',
    },

    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'end_date',
    },

    estimatedCost: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true,
      field: 'estimated_cost',
    },

    actualCost: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'actual_cost',
    },

    progressPercentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'progress_percentage',
      validate: { min: 0, max: 100 },
    },

    // Msimamizi wa mradi (mtumiaji wa mfumo)
    managerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'manager_id',
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'projects',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Project;
