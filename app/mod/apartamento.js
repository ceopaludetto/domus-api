const { Sequelize, TCC } = require('../../database');
const Morador = require('./morador');
const Bloco = require('./bloco');
const Condominio = require('./condominio');

const Apartamento = TCC.define('APARTAMENTO', {
    APTO_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    APTO_INT_NUM: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    APTO_INT_AND: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    MOR_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'MORADOR',
            key: 'MOR_INT_ID'
        }
    },
    BLO_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'BLOCO',
            key: 'BLO_INT_ID'
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

Apartamento.belongsTo(Morador, { foreignKey: 'MOR_INT_ID' });
Apartamento.belongsTo(Bloco, { foreignKey: 'BLO_INT_ID' });
Apartamento.belongsTo(Condominio, { foreignKey: 'COND_INT_ID' });

module.exports = Apartamento;
