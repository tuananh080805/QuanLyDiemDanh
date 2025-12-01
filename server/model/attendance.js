const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db'); 
const Attendance = sequelize.define('Attendance', {
    date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    isPresent: { type: DataTypes.BOOLEAN, defaultValue: false }
});
module.exports = Attendance