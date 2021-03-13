const Votacao = require('../mod/votacao');
const Condominio = require('../mod/condominio');
const Voto = require('../mod/voto');
const Morador = require('../mod/morador');
const Log = require('../../modules/logger');
const authMiddleware = require('../middle/authMiddle');
const { TABLE_NAME, TABLE_NAME_PLURAL, TABLE_NUMBER, TABLE_VERB, TABLE_PRONOUM } = require('../../modules/err')(
    'VOTACAO'
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

        const VOTACAO = await Votacao.create({ ...req.body, MOR_INT_ID: req.MOR_INT_ID, COND_INT_ID: req.COND_INT_ID });

        const LOG = await Log.add({
            LOG_STR_MSG: `${TABLE_NAME} (${VOTACAO.VOT_STR_TITULO}:${VOTACAO.VOT_INT_ID}) adicionad${TABLE_VERB}`,
            COND_INT_ID: req.COND_INT_ID
        });

        return res.send({ VOTACAO, LOG });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao adicionar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.1)` + err });
    }
});

router.get('/', async (req, res) => {
    try {
        const VOTACOES = await Votacao.findAll({
            where: {
                COND_INT_ID: req.COND_INT_ID
            },
            order: [['VOT_DT_DATA', 'DESC']],
            include: [{ model: Condominio }, { model: Morador }, { model: Voto }]
        });

        if (!VOTACOES.length)
            return res.status(400).send({
                error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.2.1)`
            });

        return res.send({ VOTACOES });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.2)` + err });
    }
});

router.get('/:votId', async (req, res) => {
    try {
        const VOTACAO = await Votacao.find({
            where: {
                VOT_INT_ID: req.params.votId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }, { model: Morador }]
        });
        if (!VOTACAO)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.3.1)` });

        return res.send({ VOTACAO });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.3)` });
    }
});

router.put('/:votId', async (req, res) => {
    try {
        await Votacao.find({
            where: {
                VOT_INT_ID: req.params.votId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }, { model: Morador }]
        }).then(async VOTACAO => {
            const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } });

            if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
                return res
                    .status(400)
                    .send({ error: `Apenas síndicos devem editar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.4.1)` });

            if (!VOTACAO)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.4.2)` });

            await VOTACAO.updateAttributes({ ...req.body });

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${VOTACAO.VOT_STR_TITULO}:${VOTACAO.VOT_INT_ID}) atualizad${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            });

            return res.send({ VOTACAO, LOG });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao atualizar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.4)` + err });
    }
});

router.delete('/:votId', async (req, res) => {
    try {
        await Votacao.find({
            where: {
                VOT_INT_ID: req.params.votId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }, { model: Morador }]
        }).then(async VOTACAO => {
            const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } });

            if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
                return res
                    .status(400)
                    .send({ error: `Apenas síndicos devem excluir ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.5.1)` });

            if (!VOTACAO)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.5.2)` });

            await VOTACAO.destroy();

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${VOTACAO.VOT_STR_TITULO}:${VOTACAO.VOT_INT_ID}) excluíd${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            });

            return res.send({ VOTACAO, LOG });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao excluir ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.5)` + err });
    }
});

module.exports = app => app.use('/votacao', router);
