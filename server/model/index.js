const sequelize = require('../config/db');
const Class = require('./class');
const Student = require('./student');
const Attendance = require('./attendance');

Class.hasMany(Student);
Student.belongsTo(Class);

Student.hasMany(Attendance, { onDelete: 'CASCADE' });
Attendance.belongsTo(Student);

module.exports = {
    sequelize,
    Class,
    Student,
    Attendance
};