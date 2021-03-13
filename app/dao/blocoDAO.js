const Bloco = require('../mod/bloco');
const Condominio = require('../mod/condominio');
const Morador = require('../mod/morador');
const Log = require('../../modules/logger');
const authMiddleware = require('../middle/authMiddle');
const { TABLE_NAME, TABLE_NAME_PLURAL, TABLE_NUMBER, TABLE_VERB, TABLE_PRONOUM } = require('../../modules/err')(
    'BLOCO'
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

        const BLOCO = await Bloco.create({ ...req.body, COND_INT_ID: req.COND_INT_ID });

        const LOG = await Log.add({
            LOG_STR_MSG: `${TABLE_NAME} (${BLOCO.BLO_STR_NOME}:${BLOCO.BLO_INT_ID}) adicionad${TABLE_VERB}`,
            COND_INT_ID: req.COND_INT_ID
        });

        return res.send({ BLOCO, LOG });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao adicionar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.1)` + err });
    }
});

router.get('/', async (req, res) => {
    try {
        const BLOCOS = await Bloco.findAll({
            where: {
                COND_INT_ID: req.COND_INT_ID
            },
            order: [['BLO_STR_NOME', 'ASC']],
            include: [{ model: Condominio }]
        });

        if (!BLOCOS.length)
            return res.status(400).send({
                error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.2.1)`
            });

        return res.send({ BLOCOS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.2)` });
    }
});

router.get('/:blocoId', async (req, res) => {
    try {
        const BLOCO = await Bloco.find({
            where: {
                BLO_INT_ID: req.params.blocoId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        });
        if (!BLOCO)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.3.1)` });

        return res.send({ BLOCO });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.3)` });
    }
});

router.put('/:blocoId', async (req, res) => {
    try {
        await Bloco.find({
            where: {
                BLO_INT_ID: req.params.blocoId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        }).then(async BLOCO => {
            const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } });

            if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
                return res.status(400).send({
                    error: `Apenas síndicos devem atualizar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.4.1)`
                });

            if (!BLOCO)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.4.2)` });

            await BLOCO.updateAttributes({ ...req.body });

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${BLOCO.BLO_STR_NOME}:${BLOCO.BLO_INT_ID}) atualizad${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            });

            return res.send({ BLOCO, LOG });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao atualizar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.4)` });
    }
});

router.delete('/:blocoId', async (req, res) => {
    try {
        await Bloco.find({
            where: {
                BLO_INT_ID: req.params.blocoId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        }).then(async BLOCO => {
            const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } });

            if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
                return res
                    .status(400)
                    .send({ error: `Apenas síndicos devem excluir ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.5.1)` });

            if (!BLOCO)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.5.2)` });

            await BLOCO.destroy();

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${BLOCO.BLO_STR_NOME}:${BLOCO.BLO_INT_ID}) excluíd${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            });

            return res.send({ BLOCO, LOG });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao excluir ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.5)` });
    }
});

module.exports = app => app.use('/bloco', router);
