const Imposto = require('../mod/imposto')
const Morador = require('../mod/morador')
const Condominio = require('../mod/condominio')
const Log = require('../../modules/logger')
const authMiddleware = require('../middle/authMiddle')
const { TABLE_NAME, TABLE_NAME_PLURAL, TABLE_NUMBER, TABLE_VERB, TABLE_PRONOUM } = require('../../modules/err')('IMPOSTO')

const router = require('express').Router()

router.use(authMiddleware)

router.post('/', async (req, res) => {
    try {
        const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } })

        if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
            return res.status(400).send({ error: `Apenas síndicos devem inserir ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.1.1)` })

        const IMPOSTO = await Imposto.create({ ...req.body, COND_INT_ID: req.COND_INT_ID })

        const LOG = await Log.add({
            LOG_STR_MSG: `${TABLE_NAME} (${IMPOSTO.DESP_STR_DESC}:${IMPOSTO.DESP_INT_ID}) adicionad${TABLE_VERB}`,
            COND_INT_ID: req.COND_INT_ID
        })
        
        return res.send({ IMPOSTO, LOG })
    }
    catch (err) {
        return res.status(400).send({ error: `Erro ao adicionar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.2)` + err })
    }
})

router.get('/', async (req, res) => {
    try {
        const IMPOSTOS = await Imposto.findAll({ 
            where: { 
                COND_INT_ID: req.COND_INT_ID 
            },
            include: [
                { model: Condominio }
            ]
        })

        if(!IMPOSTOS.length)
            return res.send({ error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.2.1)` })

        return res.send({ IMPOSTOS })
    }
    catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.2)` })
    }
})

router.get('/:impostoId', async (req, res) => {
    try {
        const IMPOSTO = await Imposto.find({ 
            where: { 
                IMP_INT_ID: req.params.impostoId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [
                { model: Condominio }
            ]
        })

        if(!IMPOSTO)
            return res.status(400).send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.3.1)` })

        
        return res.send({ IMPOSTO })
    }
    catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.3)` })
    }
})

router.put('/:impostoId', async (req, res) => {
    try {
        await Imposto.find({ 
            where: { 
                IMP_INT_ID: req.params.impostoId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [
                { model: Condominio }
            ]
        }).then(async IMPOSTO => {
            if (!IMPOSTO)
                return res.status(400).send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.4.1)` })

            const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } })

            if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
                return res.status(400).send({ error: `Apenas síndicos devem inserir ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.1.1)` })
            
            IMPOSTO.updateAttributes({ ...req.body })

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${IMPOSTO.MOR_STR_NOME}:${IMPOSTO.MOR_INT_ID}) atualizad${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            })

            res.send({ IMPOSTO, LOG })
        })
    }
    catch (err) {
        return res.status(400).send({ error: `Erro ao atualizar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.4)` + err})
    }
})

router.delete('/:impostoId', async (req, res) => {
    try {
        await Imposto.find({ 
            where: { 
                IMP_INT_ID: req.params.impostoId,
                COND_INT_ID: req.COND_INT_ID
            },
            include: [
                { model: Condominio }
            ]
        }).then(async IMPOSTO => {
            if (!IMPOSTO)
                return res.status(400).send({ error: `${TABLE_NAME} não encontrado (CODE: ${TABLE_NUMBER}.6.1)` })
            
            await IMPOSTO.destroy()

            const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } })

            if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
                return res.status(400).send({ error: `Apenas síndicos devem inserir ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.1.1)` })

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${IMPOSTO.MOR_STR_NOME}:${IMPOSTO.MOR_INT_ID}) excluíd${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            })

            return res.send({ IMPOSTO, LOG })
        })
    }
    catch (err) {
        return res.status(400).send({ error: `Erro ao excluir ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.6)` + err})
    }
})

module.exports = app => app.use('/imposto', router)