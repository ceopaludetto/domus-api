const Seguidores = require('../mod/seguidores');
const Morador = require('../mod/morador');
const authMiddleware = require('../middle/authMiddle');
const { TABLE_NAME, TABLE_NAME_PLURAL, TABLE_NUMBER, TABLE_VERB, TABLE_PRONOUM } = require('../../modules/err')(
    'SEGUIDORES'
);

const router = require('express').Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
    try {
        const SEGUIDOR = await Seguidores.create({ ...req.body, MOR_INT_ID: req.MOR_INT_ID });

        return res.send({ SEGUIDOR });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao adicionar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.1)` + err });
    }
});

router.get('/', async (req, res) => {
    try {
        const SEGUIDORES = await Seguidores.findAll({
            where: {
                MOR_INT_ID: req.MOR_INT_ID
            },
            include: [{ model: Morador }]
        });

        if (!SEGUIDORES.length)
            return res.status(400).send({
                error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.2.1)`
            });

        return res.send({ SEGUIDORES });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.2)` });
    }
});

router.get('/:segId', async (req, res) => {
    try {
        const SEGUIDOR = await Seguidores.find({
            where: {
                SEG_INT_ID: req.params.segId
            },
            include: [{ model: Morador }]
        });
        if (!SEGUIDOR)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.3.1)` });

        return res.send({ SEGUIDOR });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.3)` });
    }
});

router.delete('/:segId', async (req, res) => {
    try {
        await Seguidores.find({
            where: {
                SEG_INT_ID: req.params.segId
            },
            include: [{ model: Morador }]
        }).then(async SEGUIDOR => {
            if (!SEGUIDOR)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.5.2)` });

            await SEGUIDOR.destroy();

            return res.send({ SEGUIDOR });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao excluir ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.5)` });
    }
});

module.exports = app => app.use('/seguidores', router);
