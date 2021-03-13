const Contato = require('../mod/contato');

const { TABLE_NAME, TABLE_NAME_PLURAL, TABLE_NUMBER, TABLE_VERB, TABLE_PRONOUM } = require('../../modules/err')(
    'CONTATO'
);

const router = require('express').Router();

router.post('/', async (req, res) => {
    try {
        const CONTATO = await Contato.create(req.body);
        return res.send({ CONTATO });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao registrar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.1)` + err });
    }
});

router.get('/', async (req, res) => {
    try {
        const CONTATOS = await Contato.findAll();

        if (!CONTATOS.length)
            return res.status(400).send({
                error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.2.1)`
            });

        return res.send({ CONTATOS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.2)` + err });
    }
});

router.get('/:contatoId', async (req, res) => {
    try {
        const CONTATO = await Contato.find({ where: { CONT_INT_ID: req.params.contatoId } });

        if (!CONTATO)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.3.1)` });

        return res.send({ CONTATO });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.3)` + err });
    }
});

module.exports = app => app.use('/contato', router);
