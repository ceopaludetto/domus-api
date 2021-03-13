const Voto = require('../mod/voto');
const Condominio = require('../mod/condominio');
const Votacao = require('../mod/votacao');
const Morador = require('../mod/morador');
const authMiddleware = require('../middle/authMiddle');
const { TABLE_NAME, TABLE_NAME_PLURAL, TABLE_NUMBER, TABLE_VERB, TABLE_PRONOUM } = require('../../modules/err')('VOTO');

const router = require('express').Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
    try {
        const VOTO = await Voto.create({ ...req.body, COND_INT_ID: req.COND_INT_ID, MOR_INT_ID: req.MOR_INT_ID });

        return res.send({ VOTO });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao adicionar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.1)` + err });
    }
});

router.get('/', async (req, res) => {
    try {
        const VOTOS = await Voto.findAll({
            where: {
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        });

        if (!VOTOS.length)
            return res.status(400).send({
                error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.2.1)`
            });

        return res.send({ VOTOS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.2)` + err });
    }
});

router.get('/morador', async (req, res) => {
    try {
        const VOTOS = await Voto.findAll({
            where: {
                COND_INT_ID: req.COND_INT_ID,
                MOR_INT_ID: req.MOR_INT_ID
            },
            include: [{ model: Condominio }, { model: Morador }]
        });

        if (!VOTOS.length)
            return res.status(400).send({
                error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.2.1)`
            });

        return res.send({ VOTOS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.2)` + err });
    }
});

router.get('/:votId', async (req, res) => {
    try {
        const VOTO = await Voto.find({
            where: {
                VOTO_INT_ID: req.params.votId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        });
        if (!VOTO)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.3.1)` });

        return res.send({ VOTO });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.3)` });
    }
});

router.put('/:votId', async (req, res) => {
    try {
        await Voto.find({
            where: {
                VOTO_INT_ID: req.params.votId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        }).then(async VOTO => {
            if (!VOTO)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.4.1)` });

            await VOTO.updateAttributes({ ...req.body });

            return res.send({ VOTO });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao atualizar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.4)` });
    }
});

router.delete('/:votId', async (req, res) => {
    try {
        await Voto.find({
            where: {
                VOTO_INT_ID: req.params.votId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        }).then(async VOTO => {
            if (!VOTO)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.5.1)` });

            await VOTO.destroy();

            return res.send({ VOTO });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao excluir ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.5)` + err });
    }
});

module.exports = app => app.use('/voto', router);
