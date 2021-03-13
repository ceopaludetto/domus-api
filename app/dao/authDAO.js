const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const Morador = require('../mod/morador');
const Condominio = require('../mod/condominio');

const morMiddleware = require('../middle/morMiddle');
const authMiddleware = require('../middle/authMiddle');

const { secret } = require('../../config/auth');

const mailer = require('../../modules/mailer');
const Log = require('../../modules/logger');
const { TABLE_NAME, TABLE_NUMBER, TABLE_VERB } = require('../../modules/err')('MORADOR');

const router = require('express').Router();

const getToken = params => {
    return jwt.sign(params, secret, {
        expiresIn: 60 * 60 * 1
    });
};

router.post('/register', morMiddleware, async (req, res) => {
    const { MOR_STR_LGN } = req.body;
    try {
        const result = await Morador.find({ where: { MOR_STR_LGN } });
        if (!!result) return res.status(400).send({ error: `${TABLE_NAME} já existente (CODE: ${TABLE_NUMBER}.1.1)` });

        const MORADOR = await Morador.create({ ...req.body, COND_INT_ID: req.COND_INT_ID });

        MORADOR.MOR_STR_PSW = undefined;

        const LOG = await Log.add({
            LOG_STR_MSG: `${TABLE_NAME} (${MORADOR.MOR_STR_NOME}:${MORADOR.MOR_INT_ID}) adicionad${TABLE_VERB}`,
            COND_INT_ID: req.COND_INT_ID
        });

        return res.send({
            MORADOR,
            LOG,
            TOKEN: getToken({ COND_INT_ID: req.COND_INT_ID, MOR_INT_ID: MORADOR.MOR_INT_ID })
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao registrar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.1)` + err });
    }
});

router.post('/login', async (req, res) => {
    const { MOR_STR_LGN, MOR_STR_PSW } = req.body;
    try {
        const MORADOR = await Morador.find({ where: { MOR_STR_LGN }, include: [{ model: Condominio }] });

        if (!MORADOR)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.5.1)`, errorType: 1 });

        if (!(await bcrypt.compare(MOR_STR_PSW, MORADOR.MOR_STR_PSW)))
            return res.status(400).send({ error: `Senha incorreta (CODE: ${TABLE_NUMBER}.5.2)`, errorType: 2 });

        MORADOR.MOR_STR_PSW = undefined;

        res.send({ MORADOR, TOKEN: getToken({ COND_INT_ID: MORADOR.COND_INT_ID, MOR_INT_ID: MORADOR.MOR_INT_ID }) });
    } catch (err) {
        return res.status(400).send({ error: `Erro de Autenticação (CODE: ${TABLE_NUMBER}.5)` + err });
    }
});

router.post('/portao', authMiddleware, async (req, res) => {
    const { MOR_INT_PSWPORTA } = req.body;
    try {
        const MORADOR = await Morador.find({
            where: { MOR_INT_ID: req.MOR_INT_ID },
            include: [{ model: Condominio }]
        });

        if (!MORADOR)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.5.1)` });

        if (MORADOR.MOR_INT_PSWPORTA !== MOR_INT_PSWPORTA)
            return res.status(400).send({ error: `Senha incorrenta (CODE: ${TABLE_NUMBER}.5.2)` });

        res.send({ MORADOR, TOKEN: getToken({ COND_INT_ID: MORADOR.COND_INT_ID, MOR_INT_ID: MORADOR.MOR_INT_ID }) });
    } catch (err) {
        return res.status(400).send({ error: `Erro de Autenticação (CODE: ${TABLE_NUMBER}.5)` + err });
    }
});

router.post('/token', authMiddleware, async (req, res) => {
    try {
        const MORADOR = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID }, include: [{ model: Condominio }] });

        if (!MORADOR)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.5.1)` });

        MORADOR.MOR_STR_PSW = undefined;

        res.send({ MORADOR, TOKEN: getToken({ COND_INT_ID: MORADOR.COND_INT_ID, MOR_INT_ID: MORADOR.MOR_INT_ID }) });
    } catch (err) {
        return res.status(400).send({ error: `Erro de Autenticação (CODE: ${TABLE_NUMBER}.5)` + err });
    }
});

router.post('/forgot', async (req, res) => {
    const { MOR_STR_LGN } = req.body;
    try {
        await Morador.find({ where: { MOR_STR_LGN }, include: [{ model: Condominio }] }).then(async MORADOR => {
            if (!MORADOR)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.6.1)` });

            const MOR_STR_PSWRTOKEN = await crypto.randomBytes(20).toString('hex');

            const MOR_STR_PSWREXP = new Date();
            MOR_STR_PSWREXP.setHours(MOR_STR_PSWREXP.getHours() + 1);

            await MORADOR.updateAttributes({ MOR_STR_PSWRTOKEN, MOR_STR_PSWREXP });

            mailer.sendMail(
                {
                    to: MOR_STR_LGN,
                    from: 'ceo.paludetto@gmail.com',
                    template: 'auth/forgot',
                    context: { MOR_STR_PSWRTOKEN }
                },
                err => {
                    if (err)
                        return res.status(400).send({
                            error: `Erro ao enviar e-mail de recuperação de senha (CODE: ${TABLE_NUMBER}.6.2)` + err
                        });

                    return res.send({ message: `Um email foi enviado para: ${MOR_STR_LGN}` });
                }
            );
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao Solicitar troca de senha (CODE: ${TABLE_NUMBER}.6)` });
    }
});

router.post('/reset', async (req, res) => {
    const { MOR_STR_PSW, TOKEN } = req.body;
    try {
        await Morador.find({ where: { MOR_STR_PSWRTOKEN: TOKEN } }).then(async MORADOR => {
            const now = new Date();

            if (!MORADOR)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.7.1)` });

            if (TOKEN !== MORADOR.MOR_STR_PSWRTOKEN)
                return res.status(400).send({ error: `Token inválido (CODE: ${TABLE_NUMBER}.7.2)` });

            if (now > MORADOR.MOR_DATE_PSWREXP)
                return res.status(400).send({ error: `Token expirado (CODE: ${TABLE_NUMBER}.7.3)` });

            await MORADOR.updateAttributes({ MOR_STR_PSW, MOR_STR_PSWREXP: null, MOR_STR_PSWRTOKEN: null });

            res.send({});
        });
    } catch (err) {
        res.status(400).send({ error: `Não foi possível alterar a senha (CODE: ${TABLE_NUMBER}.7)` });
    }
});

module.exports = app => app.use('/auth', router);
