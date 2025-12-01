const { Sequelize } = require('sequelize');


const dbUrl = process.env.DB_URL || 'postgres://admin:password123@localhost:5432/school_db';

const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

module.exports = sequelize;