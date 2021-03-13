const { Sequelize, TCC } = require('../../database');
const Voto = require('./voto');
const Morador = require('./morador');
const Condominio = require('./condominio');

const Votacao = TCC.define('VOTACAO', {
    VOT_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    VOT_STR_TITULO: {
        type: Sequelize.STRING(25),
        allowNull: false
    },
    VOT_STR_DESC: {
        type: Sequelize.STRING(150),
        allowNull: false
    },
    VOT_DT_DATA: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: Sequelize.literal('DATEADD(DAY, 7, CURRENT_TIMESTAMP)')
    },
    MOR_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
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

Votacao.belongsTo(Morador, { foreignKey: 'MOR_INT_ID' });
Votacao.belongsTo(Condominio, { foreignKey: 'COND_INT_ID' });

Votacao.hasMany(Voto, { foreignKey: 'VOT_INT_ID' });

module.exports = Votacao;
