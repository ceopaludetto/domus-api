const Comunicados = require('../mod/comunicados');
const Morador = require('../mod/morador');
const Condominio = require('../mod/condominio');
const Log = require('../../modules/logger');
const authMiddleware = require('../middle/authMiddle');
const { TABLE_NAME, TABLE_NAME_PLURAL, TABLE_NUMBER, TABLE_VERB, TABLE_PRONOUM } = require('../../modules/err')(
    'COMUNICADOS'
);

const router = require('express').Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
    try {
        const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } });

        if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
            return res
                .status(400)
                .send({ error: `Somente síndicos podem adicionar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.1.1)` });

        const COMUNICADO = await Comunicados.create({
            ...req.body,
            COND_INT_ID: req.COND_INT_ID,
            MOR_INT_ID: req.MOR_INT_ID
        });

        const LOG = await Log.add({
            LOG_STR_MSG: `${TABLE_NAME} (${COMUNICADO.COMU_STR_TIT}:${COMUNICADO.COMU_INT_ID}) adicionad${TABLE_VERB}`,
            COND_INT_ID: req.COND_INT_ID
        });

        return res.send({ COMUNICADO, LOG });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao adicionar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.1)` + err });
    }
});

router.get('/', async (req, res) => {
    try {
        const COMUNICADOS = await Comunicados.findAll({
            where: {
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Morador }, { model: Condominio }]
        });

        if (!COMUNICADOS.length)
            return res.status(400).send({
                error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.2.1)`
            });

        await COMUNICADOS.map((v, i) => {
            COMUNICADOS[i].MORADOR.MOR_STR_PSW = undefined;
        });

        return res.send({ COMUNICADOS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.2)` + err });
    }
});

router.get('/:comunicadoId', async (req, res) => {
    try {
        const COMUNICADO = await Comunicados.find({
            where: {
                COMU_INT_ID: req.params.comunicadoId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Morador }, { model: Condominio }]
        });

        if (!COMUNICADO)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.3.1)` });

        COMUNICADO.MORADOR.MOR_STR_PSW = undefined;

        return res.send({ COMUNICADO });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.3)` });
    }
});

router.get('/morador/:comunicadoId', async (req, res) => {
    try {
        const COMUNICADOS = await Comunicados.findAll({
            where: {
                MOR_INT_ID: req.params.comunicadoId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Morador }, { model: Condominio }]
        });
        if (!COMUNICADOS.length)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME_PLURAL} não encontrad${TABLE_VERB_PLURAL} (CODE: ${TABLE_NUMBER}.4.1)` });

        await COMUNICADOS.map((v, i) => {
            COMUNICADOS[i].MORADOR.MOR_STR_PSW = undefined;
        });

        return res.send({ COMUNICADOS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.4)` });
    }
});

router.put('/:comunicadoId', async (req, res) => {
    try {
        await Comunicados.find({
            where: {
                COMU_INT_ID: req.params.comunicadoId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }, { model: Morador }]
        }).then(async COMUNICADO => {
            if (!COMUNICADO)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.5.1)` });

            const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } });

            if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
                return res.status(400).send({
                    error: `Somente síndicos podem atualizar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.5.2)`
                });

            await COMUNICADO.updateAttributes({ ...req.body });

            COMUNICADO.MORADOR.MOR_STR_PSW = undefined;

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${COMUNICADO.COMU_STR_TIT}:${
                    COMUNICADO.COMU_INT_ID
                }) atualizad${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            });

            return res.send({ COMUNICADO, LOG });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao atualizar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.5)` });
    }
});

router.delete('/:comunicadoId', async (req, res) => {
    try {
        await Comunicados.find({
            where: {
                COMU_INT_ID: req.params.comunicadoId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }, { model: Morador }]
        }).then(async COMUNICADO => {
            if (!COMUNICADO)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.6.1)` });

            const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } });

            if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
                return res
                    .status(400)
                    .send({ error: `Somente síndicos podem excluir ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.6.2)` });

            await COMUNICADO.destroy();

            COMUNICADO.MORADOR.MOR_STR_PSW = undefined;

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${COMUNICADO.COMU_STR_TIT}:${
                    COMUNICADO.COMU_INT_ID
                }) excluíd${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            });

            return res.send({ COMUNICADO, LOG });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao excluir ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.6)` + err });
    }
});

module.exports = app => app.use('/comunicados', router);
