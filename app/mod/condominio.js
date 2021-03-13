const { Sequelize, TCC } = require('../../database');

const Condominio = TCC.define('CONDOMINIO', {
    COND_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    COND_STR_NOME: {
        type: Sequelize.STRING(25),
        allowNull: false
    },
    COND_STR_END: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    COND_STR_CARAC: {
        type: Sequelize.STRING(1),
        allowNull: false,
        defaultValue: '#'
    },
    COND_INT_APTOS: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

module.exports = Condominio;
