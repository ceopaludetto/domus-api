const { Sequelize, TCC } = require('../../database');
const Condominio = require('./condominio');

const Regras = TCC.define('REGRAS', {
    REG_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    REG_STR_DESC: {
        type: Sequelize.STRING(100),
        allowNull: true
    },
    COND_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'CONDOMINIO',
            key: 'COND_INT_ID'
        }
    }
});

Regras.belongsTo(Condominio, { foreignKey: 'COND_INT_ID' });

module.exports = Regras;
