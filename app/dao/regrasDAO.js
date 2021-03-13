const Regras = require('../mod/regras');
const Condominio = require('../mod/condominio');
const Morador = require('../mod/morador');
const Log = require('../../modules/logger');
const authMiddleware = require('../middle/authMiddle');
const { TABLE_NAME, TABLE_NAME_PLURAL, TABLE_NUMBER, TABLE_VERB, TABLE_PRONOUM } = require('../../modules/err')(
    'REGRAS'
);

const router = require('express').Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
    try {
        const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } });

        if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
            return res
                .status(400)
                .send({ error: `Apenas síndicos devem inserir ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.1.1)` });

        const REGRA = await Regras.create({ ...req.body, COND_INT_ID: req.COND_INT_ID });

        const LOG = await Log.add({
            LOG_STR_MSG: `${TABLE_NAME} (${REGRA.REG_STR_DESC}:${REGRA.REG_INT_ID}) adicionad${TABLE_VERB}`,
            COND_INT_ID: req.COND_INT_ID
        });

        return res.send({ REGRA, LOG });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao adicionar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.1)` + err });
    }
});

router.get('/', async (req, res) => {
    try {
        const REGRAS = await Regras.findAll({
            where: {
                COND_INT_ID: req.COND_INT_ID
            },
            order: [['REG_STR_DESC', 'ASC']],
            include: [{ model: Condominio }]
        });

        if (!REGRAS.length)
            return res.status(400).send({
                error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.2.1)`
            });

        return res.send({ REGRAS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.2)` });
    }
});

router.get('/:regId', async (req, res) => {
    try {
        const REGRA = await Regras.find({
            where: {
                REG_INT_ID: req.params.regId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        });
        if (!REGRA)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.3.1)` });

        return res.send({ REGRA });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.3)` });
    }
});

router.put('/:regId', async (req, res) => {
    try {
        await Regras.find({
            where: {
                REG_INT_ID: req.params.regId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        }).then(async REGRA => {
            const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } });

            if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
                return res.status(400).send({
                    error: `Apenas síndicos devem atualizar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.4.1)`
                });

            if (!REGRA)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.4.2)` });

            await REGRA.updateAttributes({ ...req.body });

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${REGRA.REG_STR_DESC}:${REGRA.REG_INT_ID}) atualizad${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            });

            return res.send({ REGRA, LOG });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao atualizar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.4)` });
    }
});

router.delete('/:regId', async (req, res) => {
    try {
        await Regras.find({
            where: {
                REG_INT_ID: req.params.regId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        }).then(async REGRA => {
            const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } });

            if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
                return res
                    .status(400)
                    .send({ error: `Apenas síndicos devem excluir ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.5.1)` });

            if (!REGRA)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.5.2)` });

            await REGRA.destroy();

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${REGRA.REG_STR_NOME}:${REGRA.REG_INT_ID}) excluíd${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            });

            return res.send({ REGRA, LOG });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao excluir ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.5)` });
    }
});

module.exports = app => app.use('/regra', router);
