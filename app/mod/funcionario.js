const { Sequelize, TCC } = require('../../database')
const Condominio = require('./condominio')

const Funcionario = TCC.define('FUNCIONARIO', {
    FUNC_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    FUNC_STR_NOME: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    FUNC_STR_CEL: {
        type: Sequelize.STRING(11),
        allowNull: false
    },
    FUNC_STR_CARGO: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    FUNC_STR_EMPR: {
        type: Sequelize.STRING(50),
        allowNull: true
    },
    FUNC_DT_ADMIS: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Date.now()
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

Funcionario.belongsTo(Condominio, { foreignKey: "COND_INT_ID" })

module.exports = Funcionario