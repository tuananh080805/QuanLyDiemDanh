const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('school_db', 'admin', 'password123', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
});

module.exports = sequelize;