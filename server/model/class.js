const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db'); 

const Class = sequelize.define('Class', {
    name: { type: DataTypes.STRING, allowNull: false },
    tuitionFee: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Class;