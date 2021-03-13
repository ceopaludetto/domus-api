const moment = require('moment');
const Assistencia = require('../mod/assistencia');
const Morador = require('../mod/morador');
const Condominio = require('../mod/condominio');
const Log = require('../../modules/logger');
const authMiddleware = require('../middle/authMiddle');
const mailer = require('../../modules/mailer');
const { TABLE_NAME, TABLE_NAME_PLURAL, TABLE_NUMBER, TABLE_VERB, TABLE_PRONOUM } = require('../../modules/err')(
    'ASSISTENCIA'
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

        const ASSISTENCIA = await Assistencia.create({
            ...req.body,
            COND_INT_ID: req.COND_INT_ID,
            MOR_INT_ID: req.MOR_INT_ID
        });

        const LOG = await Log.add({
            LOG_STR_MSG: `${TABLE_NAME} (${ASSISTENCIA.AST_STR_TIT}:${ASSISTENCIA.AST_INT_ID}) adicionad${TABLE_VERB}`,
            COND_INT_ID: req.COND_INT_ID
        });

        moment.locale('pt-BR');
        mailer.sendMail(
            {
                to: MORADOR_SOLICITANTE.MOR_STR_LGN,
                from: 'ceo.paludetto@gmail.com',
                template: 'assistencia/index',
                context: {
                    titulo: ASSISTENCIA.AST_STR_TIT,
                    desc: ASSISTENCIA.AST_STR_DESC,
                    motivo: ASSISTENCIA.AST_STR_TIPO,
                    data: moment(ASSISTENCIA.AST_DT_DATA).format('LL')
                }
            },
            err => {
                if (err)
                    return res.status(400).send({
                        error: `Erro ao enviar e-mail de assistência (CODE: ${TABLE_NUMBER}.6.2)` + err
                    });
            }
        );

        return res.send({ ASSISTENCIA, LOG });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao adicionar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.1)` + err });
    }
});

router.get('/', async (req, res) => {
    try {
        const ASSISTENCIAS = await Assistencia.findAll({
            where: {
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Morador }, { model: Condominio }]
        });

        if (!ASSISTENCIAS.length)
            return res.status(400).send({
                error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.2.1)`
            });

        await ASSISTENCIAS.map((v, i) => {
            ASSISTENCIAS[i].MORADOR.MOR_STR_PSW = undefined;
        });

        return res.send({ ASSISTENCIAS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.2)` + err });
    }
});

router.get('/:assistenciaId', async (req, res) => {
    try {
        const ASSISTENCIA = await Assistencia.find({
            where: {
                AST_INT_ID: req.params.assistenciaId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Morador }, { model: Condominio }]
        });

        if (!ASSISTENCIA)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.3.1)` });

        ASSISTENCIA.MORADOR.MOR_STR_PSW = undefined;

        return res.send({ ASSISTENCIA });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.3)` });
    }
});

router.get('/morador/:assistenciaId', async (req, res) => {
    try {
        const ASSISTENCIAS = await Assistencia.findAll({
            where: {
                MOR_INT_ID: req.params.assistenciaId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Morador }, { model: Condominio }]
        });
        if (!ASSISTENCIAS.length)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME_PLURAL} não encontrad${TABLE_VERB_PLURAL} (CODE: ${TABLE_NUMBER}.4.1)` });

        await ASSISTENCIAS.map((v, i) => {
            ASSISTENCIAS[i].MORADOR.MOR_STR_PSW = undefined;
        });

        return res.send({ ASSISTENCIAS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.4)` });
    }
});

router.put('/:assistenciaId', async (req, res) => {
    try {
        await Assistencia.find({
            where: {
                AST_INT_ID: req.params.assistenciaId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }, { model: Morador }]
        }).then(async ASSISTENCIA => {
            if (!ASSISTENCIA)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.5.1)` });

            const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } });

            if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
                return res.status(400).send({
                    error: `Somente síndicos podem atualizar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.5.2)`
                });

            await ASSISTENCIA.updateAttributes({ ...req.body });

            ASSISTENCIA.MORADOR.MOR_STR_PSW = undefined;

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${ASSISTENCIA.AST_STR_TIT}:${
                    ASSISTENCIA.AST_INT_ID
                }) atualizad${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            });

            return res.send({ ASSISTENCIA, LOG });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao atualizar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.5)` });
    }
});

router.delete('/:assistenciaId', async (req, res) => {
    try {
        await Assistencia.find({
            where: {
                AST_INT_ID: req.params.assistenciaId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }, { model: Morador }]
        }).then(async ASSISTENCIA => {
            if (!ASSISTENCIA)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.6.1)` });

            const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } });

            if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
                return res
                    .status(400)
                    .send({ error: `Somente síndicos podem excluir ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.6.2)` });

            await ASSISTENCIA.destroy();

            ASSISTENCIA.MORADOR.MOR_STR_PSW = undefined;

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${ASSISTENCIA.AST_STR_TIT}:${
                    ASSISTENCIA.AST_INT_ID
                }) excluíd${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            });

            return res.send({ ASSISTENCIA, LOG });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao excluir ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.6)` });
    }
});

module.exports = app => app.use('/assistencia', router);
