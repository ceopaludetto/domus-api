const { Sequelize, TCC } = require('../../database');
const Condominio = require('./condominio');

const Despesas = TCC.define('DESPESAS', {
    DESP_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    DESP_STR_DESC: {
        type: Sequelize.STRING(25),
        allowNull: true
    },
    DESP_DT_DATA: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    DESP_NM_VAL: {
        type: 'FLOAT',
        allowNull: false
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

Despesas.belongsTo(Condominio, { foreignKey: 'COND_INT_ID' });

module.exports = Despesas;
