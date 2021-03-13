const { Sequelize, TCC } = require('../../database');
const Morador = require('./morador');

const Mensagens = TCC.define('MENSAGENS', {
    MSG_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    MSG_STR_DESC: {
        type: Sequelize.STRING(500),
        allowNull: false
    },
    MSG_DT_DATA: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    MSG_INT_DEST: {
        type: Sequelize.INTEGER,
        allowNull: false
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

Mensagens.belongsTo(Morador, { foreignKey: 'MOR_INT_ID' });

module.exports = Mensagens;
