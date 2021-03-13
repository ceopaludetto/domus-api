const { Sequelize, TCC } = require('../../database')
const Morador = require('./morador')
const Locais = require('./locais')
const Condominio = require('./condominio')

const Reservas = TCC.define('RESERVAS', {
    RES_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    RES_DT_CMC: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    RES_DT_TER: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    RES_INT_QTDE: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    MOR_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: "MORADOR",
            key: "MOR_INT_ID"
        }
    },
    LOC_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: "LOCAIS",
            key: "LOC_INT_ID"
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

Reservas.belongsTo(Locais, { foreignKey: "LOC_INT_ID" })
Reservas.belongsTo(Morador, { foreignKey: "MOR_INT_ID" })
Reservas.belongsTo(Condominio, { foreignKey: "COND_INT_ID" })

module.exports = Reservas