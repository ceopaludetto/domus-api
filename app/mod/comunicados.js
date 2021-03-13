const { Sequelize, TCC } = require('../../database');
const Morador = require('./morador');
const Condominio = require('./condominio');

const Comunicados = TCC.define('COMUNICADOS', {
    COMU_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    COMU_STR_TIT: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    COMU_STR_DESC: {
        type: Sequelize.STRING(600),
        allowNull: false
    },
    COMU_DT_DATA: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: Sequelize.literal('DATEADD(DAY, 7, CURRENT_TIMESTAMP)')
    },
    MOR_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'MORADOR',
            key: 'MOR_INT_ID'
        }
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

Comunicados.belongsTo(Morador, { foreignKey: 'MOR_INT_ID' });
Comunicados.belongsTo(Condominio, { foreignKey: 'COND_INT_ID' });

module.exports = Comunicados;
