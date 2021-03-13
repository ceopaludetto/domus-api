const moment = require('moment');
const Despesas = require('../mod/despesas');
const Morador = require('../mod/morador');
const Condominio = require('../mod/condominio');
const Log = require('../../modules/logger');
const authMiddleware = require('../middle/authMiddle');
const { TABLE_NAME, TABLE_NAME_PLURAL, TABLE_NUMBER, TABLE_VERB } = require('../../modules/err')('DESPESA');

const router = require('express').Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
    try {
        const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } });

        if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
            return res
                .status(400)
                .send({ error: `Apenas síndicos devem inserir ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.1.1)` });

        const DESPESA = await Despesas.create({ ...req.body, COND_INT_ID: req.COND_INT_ID });

        const LOG = await Log.add({
            LOG_STR_MSG: `${TABLE_NAME} (${DESPESA.DESP_STR_DESC}:${DESPESA.DESP_INT_ID}) adicionad${TABLE_VERB}`,
            COND_INT_ID: req.COND_INT_ID
        });

        return res.send({ DESPESA, LOG });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao adicionar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.1)` + err });
    }
});

router.get('/', async (req, res) => {
    try {
        const DESPESAS = await Despesas.findAll({
            where: {
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        });

        if (!DESPESAS.length)
            return res.status(400).send({
                error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.2.1)`
            });

        return res.send({ DESPESAS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.2)` });
    }
});

router.get('/:despesasId', async (req, res) => {
    try {
        const DESPESA = await Despesas.find({
            where: {
                DESP_INT_ID: req.params.despesasId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        });
        if (!DESPESA)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.3.1)` });

        return res.send({ DESPESA });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.3)` });
    }
});

router.put('/:despesasId', async (req, res) => {
    try {
        await Despesas.find({
            where: {
                DESP_INT_ID: req.params.despesasId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        }).then(async DESPESA => {
            const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } });

            if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
                return res.status(400).send({
                    error: `Apenas síndicos devem atualizar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.4.1)`
                });

            if (!DESPESA)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.4.2)` });

            await DESPESA.updateAttributes({ ...req.body });

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${DESPESA.DESP_STR_DESC}:${DESPESA.DESP_INT_ID}) atualizad${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            });

            return res.send({ DESPESA, LOG });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao atualizar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.4)` });
    }
});

router.delete('/:despesaId', async (req, res) => {
    try {
        await Despesas.find({
            where: {
                DESP_INT_ID: req.params.despesaId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        }).then(async DESPESA => {
            const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } });

            if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
                return res.status(400).send({
                    error: `Apenas síndicos devem excluir ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NAME_PLURAL}.5.1)`
                });

            if (!DESPESA)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.5.2)` });

            await DESPESA.destroy();

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${DESPESA.DESP_STR_NOME}:${DESPESA.DESP_INT_ID}) excluíd${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            });

            return res.send({ DESPESA, LOG });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao excluir ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.5)` });
    }
});

module.exports = app => app.use('/despesas', router);
