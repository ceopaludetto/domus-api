const { Sequelize, TCC } = require('../../database');
const Morador = require('./morador');

const Seguidores = TCC.define('SEGUIDORES', {
    SEG_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    SEG_INT_MOR: {
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

Seguidores.belongsTo(Morador, { foreignKey: 'MOR_INT_ID' });

module.exports = Seguidores;
