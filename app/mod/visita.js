const { Sequelize, TCC } = require('../../database')
const Morador = require('./morador')
const Condominio = require('./condominio')

const Visitas = TCC.define('VISITAS', {
    VSIT_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    VSIT_STR_NOME: {
        type: Sequelize.STRING(25),
        allowNull: false
    },
    VSIT_DT_ENT: {
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

Visitas.belongsTo(Morador, { foreignKey: "MOR_INT_ID" })
Visitas.belongsTo(Condominio, { foreignKey: "COND_INT_ID" })

module.exports = Visitas