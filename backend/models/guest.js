'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Guest extends Model {
    static associate(models) {
    }
  }
  
  Guest.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: 'Please provide a valid email address'
        }
      }
    },
    organization: {
      type: DataTypes.STRING,
      allowNull: true
    },
    purpose: {
      type: DataTypes.ENUM('tour', 'meeting', 'event', 'interview', 'other'),
      allowNull: false
    },
    visitDuration: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending'),
      defaultValue: 'active'
    },
    registrationDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue : "guest"
    }
  }, {
    sequelize,
    modelName: 'Guest',
    tableName: 'guests',
    timestamps: true
  });
  
  return Guest;
};
