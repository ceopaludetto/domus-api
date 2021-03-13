const Sequelize = require('sequelize');
const { database, username, password, host, port, dialect } = require('../config/db');

const TCC = new Sequelize(database, username, password, {
    host: host,
    port: port,
    dialect: dialect,
    logging: false,
    dialectOptions: {
        encrypt: true
    },
    operatorsAliases: false,
    define: {
        underscored: true,
        freezeTableName: true,
        charset: 'utf8',
        dialectOptions: {
            collate: 'utf8_general_ci'
        },
        timestamps: false
    }
});

module.exports = { TCC, Sequelize };
