const { Sequelize, TCC } = require('../../database')
const Morador = require('./morador')
const Condominio = require('./condominio')

const Assistencia = TCC.define('ASSISTENCIA', {
    AST_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    AST_STR_TIT: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    AST_STR_DESC: {
        type: Sequelize.STRING(320),
        allowNull: false
    },
    AST_STR_TIPO: {
        type: Sequelize.STRING(25),
        allowNull: false
    },
    AST_DT_DATA: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    MOR_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: "MORADOR",
            key: "MOR_INT_ID"
        }
    },
    COND_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: "CONDOMINIO",
            key: "COND_INT_ID"
        }
    }
})

Assistencia.belongsTo(Morador, { foreignKey: "MOR_INT_ID" })
Assistencia.belongsTo(Condominio, { foreignKey: "COND_INT_ID" })

module.exports = Assistencia