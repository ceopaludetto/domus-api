const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

const Morador = require('../mod/morador');
const Condominio = require('../mod/condominio');
const Log = require('../../modules/logger');
const authMiddleware = require('../middle/authMiddle');
const { TABLE_NAME, TABLE_NAME_PLURAL, TABLE_NUMBER, TABLE_VERB, TABLE_PRONOUM } = require('../../modules/err')(
    'MORADOR'
);

const router = require('express').Router();

const storage = multer.diskStorage({
    destination: 'public/morador/',
    filename: function(req, file, callback) {
        crypto.pseudoRandomBytes(16, function(err, raw) {
            if (err) return callback(err);

            callback(null, raw.toString('hex') + path.extname(file.originalname));
        });
    }
});

const upload = multer({ storage });

router.use(authMiddleware);

router.post('/image', upload.single('file'), async (req, res) => {
    try {
        await Morador.find({
            where: {
                MOR_INT_ID: req.MOR_INT_ID,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        }).then(async MORADOR => {
            if (!MORADOR)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.1.1)` });

            await MORADOR.updateAttributes({ MOR_STR_IMG: req.file.filename });

            MORADOR.MOR_STR_PSW = undefined;

            return res.send({ MORADOR });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao atualizar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.1)` + err });
    }
});

router.get('/', async (req, res) => {
    try {
        const MORADORES = await Morador.findAll({
            where: {
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        });

        if (!MORADORES.length)
            return res.send({
                error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.2.1)`
            });

        await MORADORES.map((v, i) => {
            MORADORES[i].MOR_STR_PSW = undefined;
        });

        return res.send({ MORADORES });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.2)` });
    }
});

router.get('/:moradorId', async (req, res) => {
    try {
        const MORADOR = await Morador.find({
            where: {
                MOR_INT_ID: req.params.moradorId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        });

        if (!MORADOR)
            return res
                .status(400)
                .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.3.1)` });

        MORADOR.MOR_STR_PSW = undefined;

        return res.send({ MORADOR });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.3)` });
    }
});

router.put('/:moradorId', async (req, res) => {
    try {
        await Morador.find({
            where: {
                MOR_INT_ID: req.params.moradorId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        }).then(async MORADOR => {
            const { MOR_STR_LGN, MOR_STR_OLDPSW } = req.body;

            if (!MORADOR)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.4.1)` });

            const result = await Morador.find({ where: { MOR_STR_LGN } });

            if (!!result)
                return res.status(400).send({ error: `${TABLE_NAME} já existente (CODE: ${TABLE_NUMBER}.4.2)` });

            await Morador.find({
                where: {
                    MOR_INT_ID: req.MOR_INT_ID,
                    COND_INT_ID: req.COND_INT_ID
                }
            }).then(async MORADOR_SOLICITANTE => {
                if (
                    !MORADOR_SOLICITANTE.MOR_BIT_SIN &&
                    req.body.MOR_BIT_SIN !== undefined &&
                    req.body.MOR_BIT_SIN !== null
                )
                    return res
                        .status(400)
                        .send({ error: `Apenas síndicos podem eleger novos síndicos (CODE: ${TABLE_NUMBER}.4.3)` });

                if (MORADOR_SOLICITANTE.MOR_STR_LGN !== MORADOR.MOR_STR_LGN)
                    return res.status(400).send({
                        error: `Apenas o próprio morador pode alterar suas informações (CODE: ${TABLE_NUMBER}.4.4)`
                    });

                if (
                    !(await bcrypt.compare(String(MOR_STR_OLDPSW), MORADOR.MOR_STR_PSW)) &&
                    req.body.MOR_STR_OLDPSW !== undefined &&
                    req.body.MOR_STR_OLDPSW !== null
                )
                    return res.status(400).send({ error: `Senha antiga incorreta! (CODE: ${TABLE_NUMBER}.4.5)` });

                await MORADOR.updateAttributes({ ...req.body });

                MORADOR.MOR_STR_PSW = undefined;

                const LOG = await Log.add({
                    LOG_STR_MSG: `${TABLE_NAME} (${MORADOR.MOR_STR_NOME}:${MORADOR.MOR_INT_ID}) atualizad${TABLE_VERB}`,
                    COND_INT_ID: req.COND_INT_ID
                });

                return res.send({ MORADOR, LOG });
            });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao atualizar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.4)` + err });
    }
});

router.put('/transferir/:moradorId', async (req, res) => {
    try {
        await Morador.find({
            where: {
                MOR_INT_ID: req.params.moradorId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        }).then(async MORADOR => {
            if (!MORADOR)
                return res
                    .status(400)
                    .send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.5.2)` });

            Morador.find({
                where: {
                    MOR_INT_ID: req.MOR_INT_ID,
                    COND_INT_ID: req.COND_INT_ID
                }
            }).then(async MORADOR_SOLICITANTE => {
                if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
                    return res
                        .status(400)
                        .send({ error: `Apenas um síndico pode transferir seu cargo (CODE: ${TABLE_NUMBER}.5.1)` });

                await MORADOR_SOLICITANTE.updateAttributes({ MOR_BIT_SIN: false });

                await MORADOR.updateAttributes({ MOR_BIT_SIN: true });

                MORADOR.MOR_STR_PSW = undefined;

                const LOG = await Log.add({
                    LOG_STR_MSG: `${TABLE_NAME} (${MORADOR.MOR_STR_NOME}:${MORADOR.MOR_INT_ID}) agora é síndico`,
                    COND_INT_ID: req.COND_INT_ID
                });

                return res.send({ MORADOR, LOG });
            });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao transferir sindicato (CODE: ${TABLE_NUMBER}.5)` + err });
    }
});

router.delete('/:moradorId', async (req, res) => {
    try {
        await Morador.find({
            where: {
                MOR_INT_ID: req.params.moradorId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [{ model: Condominio }]
        }).then(async MORADOR => {
            if (!MORADOR)
                return res.status(400).send({ error: `${TABLE_NAME} não encontrado (CODE: ${TABLE_NUMBER}.6.1)` });

            await MORADOR.destroy();

            MORADOR.MOR_STR_PSW = undefined;

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${MORADOR.MOR_STR_NOME}:${MORADOR.MOR_INT_ID}) excluíd${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            });

            return res.send({ MORADOR, LOG });
        });
    } catch (err) {
        return res.status(400).send({ error: `Erro ao excluir ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.6)` + err });
    }
});

module.exports = app => app.use('/morador', router);
