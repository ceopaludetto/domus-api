const { Sequelize, TCC } = require('../../database')
const Condominio = require('./condominio')

const Logger = TCC.define('LOGGER', {
    LOG_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    LOG_STR_MSG: {
        type: Sequelize.STRING(320),
        allowNull: false
    },
    LOG_DT_EMI: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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

Logger.belongsTo(Condominio, { foreignKey: "COND_INT_ID" })

module.exports = Logger