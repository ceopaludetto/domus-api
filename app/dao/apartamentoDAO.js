const Apartamento = require('../mod/apartamento');
const Morador = require('../mod/morador');
const Bloco = require('../mod/bloco');
const Condominio = require('../mod/condominio');
const Log = require('../../modules/logger');
const authMiddleware = require('../middle/authMiddle');
const { TABLE_NAME, TABLE_NAME_PLURAL, TABLE_NUMBER, TABLE_VERB, TABLE_PRONOUM } = require('../../modules/err')(
    'APARTAMENTO'
);

const router = require('express').Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
    const { APTO_INT_NUM, BLO_INT_ID } = req.body;
    try {
        const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } });

        if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
            return res
                .status(400)
                .send({ error: `Apenas síndicos devem inserir ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.1.1)` });

        const result = await Apartamento.find({ where: { APTO_INT_NUM, BLO_INT_ID, COND_INT_ID: req.COND_INT_ID } });
        if (!!result) return res.status(400).send({ error: `${TABLE_NAME} já existente (CODE: ${TABLE_NUMBER}.1.2)` });

        const MOR_INT_ID = req.body.MOR_INT_ID ? req.body.MOR_INT_ID : req.MOR_INT_ID;

        const morResult = await Morador.find({ where: { MOR_INT_ID, COND_INT_ID: req.COND_INT_ID } });

        if (!morResult) return res.status(400).send({ error: `Morador inexistente (CODE: ${TABLE_NUMBER}.1.3)` });

        const condResult = await Condominio.find({ where: { COND_INT_ID: req.COND_INT_ID } });
        const aptoTot = await Apartamento.findAll({ where: { COND_INT_ID: req.COND_INT_ID } });

        if (condResult.COND_INT_APTOS <= aptoTot.length)
            return res.status(400).send({
                error: `Condomínio excedeu o limite de ${TABLE_NAME_PLURAL} suportados (CODE: ${TABLE_NUMBER}.1.4)`
            });

        const APARTAMENTO = await Apartamento.create({ ...req.body, COND_INT_ID: req.COND_INT_ID, MOR_INT_ID });

        const LOG = await Log.add({
            LOG_STR_MSG: `${TABLE_NAME} (${APARTAMENTO.APTO_INT_NUM}:${
                APARTAMENTO.APTO_INT_ID
            }) adicionad${TABLE_VERB}`,
            COND_INT_ID: req.COND_INT_ID
        });

        return res.send({ APARTAMENTO, LOG });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao adicionar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.1)` + err });
    }
});

router.get('/', async (req, res) => {
    try {
        const APARTAMENTOS = await Apartamento.findAll({
            where: {
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Morador }, { model: Bloco }, { model: Condominio }]
        });

        if (!APARTAMENTOS.length)
            return res.status(400).send({
                error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.2.1)`
            });

        await APARTAMENTOS.map((v, i) => {
            APARTAMENTOS[i].MORADOR.MOR_STR_PSW = undefined;
        });

        return res.send({ APARTAMENTOS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.2)` + err });
    }
});

router.get('/:apartamentoId', async (req, res) => {
    try {
        const APARTAMENTO = await Apartamento.find({
            where: {
                APTO_INT_ID: req.params.apartamentoId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Morador }, { model: Bloco }, { model: Condominio }]
        });

        if (!APARTAMENTO)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.3.1)` });

        APARTAMENTO.MORADOR.MOR_STR_PSW = undefined;

        return res.send({ APARTAMENTO });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.3)` + err });
    }
});

router.get('/bloco/:blocoId', async (req, res) => {
    try {
        const APARTAMENTOS = await Apartamento.findAll({
            where: {
                COND_INT_ID: req.COND_INT_ID,
                BLO_INT_ID: req.params.blocoId
            },
            include: [{ model: Morador }, { model: Bloco }, { model: Condominio }]
        });

        if (!APARTAMENTOS.length)
            return res.status(400).send({
                error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.4.1)`
            });

        await APARTAMENTOS.map((v, i) => {
            APARTAMENTOS[i].MORADOR.MOR_STR_PSW = undefined;
        });

        return res.send({ APARTAMENTOS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.4)` + err });
    }
});

router.get('/morador/:moradorId', async (req, res) => {
    try {
        const APARTAMENTOS = await Apartamento.findAll({
            where: {
                MOR_INT_ID: req.params.moradorId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Morador }, { model: Bloco }, { model: Condominio }]
        });
        if (!APARTAMENTOS.length)
            return res.status(400).send({
                error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.5.1)`
            });

        await APARTAMENTOS.map((v, i) => {
            APARTAMENTOS[i].MORADOR.MOR_STR_PSW = undefined;
        });

        return res.send({ APARTAMENTOS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.5)` });
    }
});

router.get('/bloco/:blocoId/morador/:moradorId', async (req, res) => {
    try {
        const APARTAMENTOS = await Apartamento.findAll({
            where: {
                BLO_INT_ID: req.params.blocoId,
                MOR_INT_ID: req.params.moradorId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Morador }, { model: Bloco }, { model: Condominio }]
        });
        if (!APARTAMENTOS.length)
            return res.status(400).send({
                error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} CODE: ${TABLE_NUMBER}.6.1)`
            });

        await APARTAMENTOS.map((v, i) => {
            APARTAMENTOS[i].MORADOR.MOR_STR_PSW = undefined;
        });

        return res.send({ APARTAMENTOS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.6)` });
    }
});

router.put('/:apartamentoId', async (req, res) => {
    try {
        await Apartamento.find({
            where: {
                APTO_INT_ID: req.params.apartamentoId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }, { model: Morador }, { model: Bloco }]
        }).then(async APARTAMENTO => {
            if (!APARTAMENTO)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.7.1)` });

            await APARTAMENTO.updateAttributes({ ...req.body });

            APARTAMENTO.MORADOR.MOR_STR_PSW = undefined;

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${APARTAMENTO.APTO_INT_NUM}:${
                    APARTAMENTO.APTO_INT_ID
                }) atualizad${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            });

            return res.send({ APARTAMENTO, LOG });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao atualizar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.7)` });
    }
});

router.delete('/:apartamentoId', async (req, res) => {
    try {
        await Apartamento.find({
            where: {
                APTO_INT_ID: req.params.apartamentoId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }, { model: Morador }, { model: Bloco }]
        }).then(async APARTAMENTO => {
            if (!APARTAMENTO)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.8.1)` });

            const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } });

            if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
                return res
                    .status(400)
                    .send({ error: `Apenas síndicos devem excluir ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.1.1)` });

            await APARTAMENTO.destroy();

            APARTAMENTO.MORADOR.MOR_STR_PSW = undefined;

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${APARTAMENTO.APTO_INT_NUM}:${
                    APARTAMENTO.APTO_INT_ID
                }) excluíd${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            });

            return res.send({ APARTAMENTO, LOG });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao excluir ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.8)` });
    }
});

module.exports = app => app.use('/apartamento', router);
