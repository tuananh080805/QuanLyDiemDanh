const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Lưu ý đường dẫn config của bạn

const Student = sequelize.define('Student', {
    name: { type: DataTypes.STRING, allowNull: false },
    commune: { type: DataTypes.STRING, allowNull: true } // THÊM DÒNG NÀY
});

module.exports = Student;