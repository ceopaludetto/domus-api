const Condominio = require('../mod/condominio');
const jwt = require('jsonwebtoken');

const { secret } = require('../../config/cond');
const { TABLE_NAME, TABLE_NAME_PLURAL, TABLE_NUMBER, TABLE_VERB, TABLE_PRONOUM } = require('../../modules/err')(
    'CONDOMINIO'
);

const router = require('express').Router();

const getToken = params => {
    return jwt.sign(params, secret, {
        expiresIn: 60 * 60 * 1
    });
};

router.post('/', async (req, res) => {
    try {
        const CONDOMINIO = await Condominio.create(req.body);
        return res.send({ CONDOMINIO, TOKEN: getToken({ COND_INT_ID: CONDOMINIO.COND_INT_ID }) });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao registrar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.1)` + err });
    }
});

router.get('/', async (req, res) => {
    try {
        const CONDOMINIOS = await Condominio.findAll();

        if (!CONDOMINIOS.length)
            return res
                .status(400)
                .send({
                    error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.2.1)`
                });

        return res.send({ CONDOMINIOS });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.2)` + err });
    }
});

router.get('/:condominioId', async (req, res) => {
    try {
        const CONDOMINIO = await Condominio.find({ where: { COND_INT_ID: req.params.condominioId } });

        if (!CONDOMINIO)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.3.1)` });

        return res.send({ CONDOMINIO, TOKEN: getToken({ COND_INT_ID: CONDOMINIO.COND_INT_ID }) });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.3)` + err });
    }
});

router.put('/:condominioId', async (req, res) => {
    try {
        await Condominio.find({ where: { COND_INT_ID: req.params.condominioId } }).then(async CONDOMINIO => {
            if (!CONDOMINIO)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.4.1)` });

            await CONDOMINIO.updateAttributes({ ...req.body });
            return res.send({ CONDOMINIO, TOKEN: getToken({ id: CONDOMINIO.COND_INT_ID }) });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao atualizar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.4)` });
    }
});

router.delete('/:condominioId', async (req, res) => {
    try {
        await Condominio.find({ where: { COND_INT_ID: req.params.condominioId } }).then(async CONDOMINIO => {
            if (!CONDOMINIO)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.5.1)` });

            await CONDOMINIO.destroy();
            return res.send({ CONDOMINIO });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao deletar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.5)` });
    }
});

module.exports = app => app.use('/condominio', router);
