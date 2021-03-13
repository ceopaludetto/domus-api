const moment = require('moment');
const Post = require('../mod/post');
const Condominio = require('../mod/condominio');
const Morador = require('../mod/morador');
const authMiddleware = require('../middle/authMiddle');
const { TABLE_NAME, TABLE_NAME_PLURAL, TABLE_NUMBER, TABLE_VERB, TABLE_PRONOUM } = require('../../modules/err')('POST');

const router = require('express').Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
    try {
        const POST = await Post.create({ ...req.body, MOR_INT_ID: req.MOR_INT_ID, COND_INT_ID: req.COND_INT_ID });

        return res.send({ POST });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao adicionar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.1)` + err });
    }
});

router.get('/', async (req, res) => {
    try {
        const POSTS = await Post.findAll({
            where: {
                COND_INT_ID: req.COND_INT_ID
            },
            order: [['POST_DT_DATA', 'DESC']],
            include: [{ model: Condominio }, { model: Morador }]
        });

        if (!POSTS.length)
            return res.status(400).send({
                error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.2.1)`
            });

        return res.send({ POSTS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.2)` + err });
    }
});

router.get('/:postId', async (req, res) => {
    try {
        const POST = await Post.find({
            where: {
                POST_INT_ID: req.params.postId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }, { model: Morador }]
        });
        if (!POST)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.3.1)` });

        return res.send({ POST });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.3)` });
    }
});

router.get('/morador/:morId', async (req, res) => {
    try {
        const POSTS = await Post.findAll({
            where: {
                MOR_INT_ID: req.params.morId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }, { model: Morador }]
        });
        if (!POSTS.length)
            return res.status(400).send({
                error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.4.1)`
            });

        return res.send({ POSTS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.4)` });
    }
});

router.put('/:postId', async (req, res) => {
    try {
        await Post.find({
            where: {
                BLO_INT_ID: req.params.postId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }, { model: Morador }]
        }).then(async POST => {
            if (!POST)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.5.1)` });

            await POST.updateAttributes({ ...req.body });

            return res.send({ POST });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao atualizar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.5)` });
    }
});

router.delete('/:postId', async (req, res) => {
    try {
        await Post.find({
            where: {
                POST_INT_ID: req.params.postId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }, { model: Morador }]
        }).then(async POST => {
            if (!POST)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.6.1)` });

            await POST.destroy();

            return res.send({ POST });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao excluir ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.6)` });
    }
});

module.exports = app => app.use('/post', router);
