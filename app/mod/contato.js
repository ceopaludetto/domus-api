const { Sequelize, TCC } = require('../../database');

const Contato = TCC.define('CONTATO', {
    CONT_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    CONT_STR_NOME: {
        type: Sequelize.STRING(25),
        allowNull: false
    },
    CONT_STR_EMAIL: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    CONT_STR_END: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    CONT_STR_DESC: {
        type: Sequelize.STRING(500),
        allowNull: false
    },
    CONT_INT_APTOS: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

module.exports = Contato;
