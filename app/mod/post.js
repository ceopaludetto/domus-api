const { Sequelize, TCC } = require('../../database');
const Morador = require('./morador');
const Condominio = require('./condominio');

const Post = TCC.define('POST', {
    POST_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    POST_STR_DESC: {
        type: Sequelize.STRING(500),
        allowNull: false
    },
    POST_DT_DATA: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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

Post.belongsTo(Morador, { foreignKey: 'MOR_INT_ID' });
Post.belongsTo(Condominio, { foreignKey: 'COND_INT_ID' });

module.exports = Post;
