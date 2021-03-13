const Reservas = require('../mod/reservas');
const Morador = require('../mod/morador');
const Locais = require('../mod/locais');
const Condominio = require('../mod/condominio');
const Log = require('../../modules/logger');
const authMiddleware = require('../middle/authMiddle');
const { TABLE_NAME, TABLE_NAME_PLURAL, TABLE_NUMBER, TABLE_VERB, TABLE_PRONOUM } = require('../../modules/err')(
    'RESERVAS'
);

const router = require('express').Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
    const { LOC_INT_ID, RES_INT_QTDE } = req.body;
    try {
        const LOCAL = await Locais.find({ where: { LOC_INT_ID } });

        if (LOCAL.LOC_INT_QTDE < RES_INT_QTDE)
            return res
                .status(400)
                .send({
                    error: `O número de pessoas esperadas excede o número suportado pelo Local (CODE: ${TABLE_NUMBER}.1.1)`
                });

        const RESERVA = await Reservas.create({
            ...req.body,
            COND_INT_ID: req.COND_INT_ID,
            MOR_INT_ID: req.MOR_INT_ID
        });

        const LOG = await Log.add({
            LOG_STR_MSG: `${TABLE_NAME} (${LOCAL.LOC_STR_NOME}:${RESERVA.RES_INT_ID}) adicionad${TABLE_VERB}`,
            COND_INT_ID: req.COND_INT_ID
        });

        return res.send({ RESERVA, LOG });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao adicionar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.1)` + err });
    }
});

router.get('/', async (req, res) => {
    try {
        const RESERVAS = await Reservas.findAll({
            where: {
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Morador }, { model: Locais }, { model: Condominio }]
        });

        if (!RESERVAS.length)
            return res
                .status(400)
                .send({
                    error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.2.1)`
                });

        await RESERVAS.map((v, i) => {
            RESERVAS[i].MORADOR.MOR_STR_PSW = undefined;
        });

        return res.send({ RESERVAS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.2)` + err });
    }
});

router.get('/:reservaId', async (req, res) => {
    try {
        const RESERVA = await Reservas.find({
            where: {
                RES_INT_ID: req.params.reservaId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Morador }, { model: Locais }, { model: Condominio }]
        });

        if (!RESERVA)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.3.1)` });

        RESERVA.MORADOR.MOR_STR_PSW = undefined;

        return res.send({ RESERVA });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.3)` + err });
    }
});

router.get('/locais/:localId', async (req, res) => {
    try {
        const RESERVAS = await Reservas.findAll({
            where: {
                COND_INT_ID: req.COND_INT_ID,
                LOC_INT_ID: req.params.localId
            },
            include: [{ model: Morador }, { model: Locais }, { model: Condominio }]
        });

        if (!RESERVAS.length)
            return res
                .status(400)
                .send({
                    error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.4.1)`
                });

        await RESERVAS.map((v, i) => {
            RESERVAS[i].MORADOR.MOR_STR_PSW = undefined;
        });

        return res.send({ RESERVAS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.4)` });
    }
});

router.get('/morador/:moradorId', async (req, res) => {
    try {
        const RESERVAS = await Reservas.findAll({
            where: {
                MOR_INT_ID: req.params.moradorId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Morador }, { model: Locais }, { model: Condominio }]
        });
        if (!RESERVAS.length)
            return res
                .status(400)
                .send({
                    error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.5.1)`
                });

        await RESERVAS.map((v, i) => {
            RESERVAS[i].MORADOR.MOR_STR_PSW = undefined;
        });

        return res.send({ RESERVAS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.5)` });
    }
});

router.get('/locais/:localId/morador/:moradorId', async (req, res) => {
    try {
        const RESERVAS = await Reservas.findAll({
            where: {
                LOC_INT_ID: req.params.localId,
                MOR_INT_ID: req.params.moradorId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Morador }, { model: Locais }, { model: Condominio }]
        });
        if (!RESERVAS.length)
            return res
                .status(400)
                .send({
                    error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} CODE: ${TABLE_NUMBER}.6.1)`
                });

        await RESERVAS.map((v, i) => {
            RESERVAS[i].MORADOR.MOR_STR_PSW = undefined;
        });

        return res.send({ RESERVAS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.6)` + err });
    }
});

router.put('/:reservaId', async (req, res) => {
    const { RES_INT_QTDE } = req.body;
    try {
        await Reservas.find({
            where: {
                RES_INT_ID: req.params.reservaId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }, { model: Morador }, { model: Locais }]
        }).then(async RESERVA => {
            if (!RESERVA)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.7.1)` });

            const LOCAL = await Locais.find({ where: { LOC_INT_ID: RESERVA.LOC_INT_ID } });

            if (LOCAL.LOC_INT_QTDE < RES_INT_QTDE)
                return res
                    .status(400)
                    .send({
                        error: `O número de esperados excede o número suportado pelo Local (CODE: ${TABLE_NUMBER}.7.2)`
                    });

            await RESERVA.updateAttributes({ ...req.body });

            RESERVA.MORADOR.MOR_STR_PSW = undefined;

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${LOCAL.LOC_STR_NOME}:${RESERVA.RES_INT_ID}) atualizad${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            });

            return res.send({ RESERVA, LOG });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao atualizar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.7)` });
    }
});

router.delete('/:reservaId', async (req, res) => {
    try {
        await Reservas.find({
            where: {
                RES_INT_ID: req.params.reservaId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }, { model: Morador }, { model: Locais }]
        }).then(async RESERVA => {
            if (!RESERVA)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.8.1)` });

            await RESERVA.destroy();

            const LOCAL = await Locais.find({ where: { LOC_INT_ID: RESERVA.LOC_INT_ID } });

            RESERVA.MORADOR.MOR_STR_PSW = undefined;

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${LOCAL.LOC_STR_NOME}:${RESERVA.RES_INT_ID}) excluíd${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            });

            return res.send({ RESERVA, LOG });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao excluir ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.8)` });
    }
});

module.exports = app => app.use('/reservas', router);
