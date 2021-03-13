const { Sequelize, TCC } = require('../../database');
const Morador = require('./morador');
const Condominio = require('./condominio');

const Voto = TCC.define('VOTO', {
    VOTO_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    VOTO_BIT_OPCAO: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    VOT_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'VOTACAO',
            key: 'VOT_INT_ID'
        }
    },
    COND_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'CONDOMINIO',
            key: 'COND_INT_ID'
        }
    },
    MOR_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'MORADOR',
            key: 'MOR_INT_ID'
        }
    }
});

Voto.belongsTo(Condominio, { foreignKey: 'COND_INT_ID' });
Voto.belongsTo(Morador, { foreignKey: 'MOR_INT_ID' });

module.exports = Voto;
