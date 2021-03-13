const { Sequelize, TCC } = require('../../database')
const Condominio = require('./condominio')

const Bloco = TCC.define('BLOCO', {
    BLO_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    BLO_STR_NOME: {
        type: Sequelize.STRING(25),
        allowNull: true
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

Bloco.belongsTo(Condominio, { foreignKey: "COND_INT_ID" })

module.exports = Bloco