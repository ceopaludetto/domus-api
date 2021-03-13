const bcrypt = require('bcryptjs');
const { Sequelize, TCC } = require('../../database');
const Condominio = require('./condominio');

const Morador = TCC.define('MORADOR', {
    MOR_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    MOR_STR_NOME: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    MOR_STR_LGN: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false
    },
    MOR_STR_PSW: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    MOR_STR_IMG: {
        type: Sequelize.STRING(500),
        allowNull: true
    },
    MOR_STR_CEL: {
        type: Sequelize.STRING(11),
        allowNull: false
    },
    MOR_BIT_ATIVO: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 1
    },
    MOR_BIT_REP: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0
    },
    MOR_BIT_SIN: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0
    },
    MOR_DT_ING: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Date.now()
    },
    MOR_STR_PSWRTOKEN: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null
    },
    MOR_DT_PSWREXP: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
    },
    MOR_INT_PSWPORTA: {
        type: Sequelize.INTEGER,
        allowNull: false
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

Morador.beforeCreate(async morador => {
    if (morador.changed('MOR_STR_PSW')) {
        const hash = await bcrypt.hash(morador.MOR_STR_PSW, 10);
        morador.MOR_STR_PSW = hash;
    }
});

Morador.beforeUpdate(async morador => {
    if (morador.changed('MOR_STR_PSW')) {
        const hash = await bcrypt.hash(morador.MOR_STR_PSW, 10);
        morador.MOR_STR_PSW = hash;
    }
});

Morador.belongsTo(Condominio, { foreignKey: 'COND_INT_ID' });

module.exports = Morador;
