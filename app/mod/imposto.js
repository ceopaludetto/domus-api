const { Sequelize, TCC } = require('../../database')
const Condominio = require('./condominio')
const Apartamento = require('./apartamento')

const Imposto = TCC.define('IMPOSTO', {
    IMP_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    IMP_STR_DESC: {
        type: Sequelize.STRING(25),
        allowNull: true
    },
    IMP_DT_DATA: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Date.now()
    },
    IMP_NM_VAL: {
        type: 'FLOAT',
        allowNull: false,
    },
    APTO_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: "APARTAMENTO",
            key: "APTO_INT_ID"
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

Imposto.belongsTo(Condominio, { foreignKey: "COND_INT_ID" })
Imposto.belongsTo(Apartamento, { foreignKey: "APTO_INT_ID" })

module.exports = Imposto