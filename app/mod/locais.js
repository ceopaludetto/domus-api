const { Sequelize, TCC } = require('../../database')
const Condominio = require('./condominio')

const Locais = TCC.define('LOCAIS', {
    LOC_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    LOC_STR_NOME: {
        type: Sequelize.STRING(25),
        allowNull: false
    },
    LOC_STR_DESC: {
        type: Sequelize.STRING(320),
        allowNull: false
    },
    LOC_INT_QTDE: {
        type: Sequelize.INTEGER,
        allowNull: false
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

Locais.belongsTo(Condominio, { foreignKey: "COND_INT_ID" })

module.exports = Locais