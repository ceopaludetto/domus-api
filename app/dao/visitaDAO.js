const Visitas = require('../mod/visita')
const Morador = require('../mod/morador')
const Condominio = require('../mod/condominio')
const Log = require('../../modules/logger')
const authMiddleware = require('../middle/authMiddle')
const { TABLE_NAME, TABLE_NAME_PLURAL, TABLE_NUMBER, TABLE_VERB, TABLE_PRONOUM } = require('../../modules/err')('VISITA')

const router = require('express').Router()

router.use(authMiddleware)

router.post('/', async (req, res) => {
    try {
        const VISITA = await Visitas.create({ ...req.body, COND_INT_ID: req.COND_INT_ID, MOR_INT_ID: req.MOR_INT_ID })
        
        const LOG = await Log.add({
            LOG_STR_MSG: `${TABLE_NAME} (${VISITA.VSIT_STR_NOME}:${VISITA.VSIT_INT_ID}) adicionad${TABLE_VERB}`,
            COND_INT_ID: req.COND_INT_ID
        })
        
        return res.send({ VISITA, LOG })
    }
    catch (err) {
        return res.status(400).send({ error: `Erro ao adicionar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.1)` + err })
    }
})

router.get('/', async (req, res) => {
    try {
        const VISITAS = await Visitas.findAll({ 
            where: { 
                COND_INT_ID: req.COND_INT_ID
            }, 
            include: [ 
                { model: Morador }, { model: Condominio }
            ]
        })

        if (!VISITAS.length)
            return res.status(400).send({ error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.2.1)` })

        await VISITAS.map((v, i) => {
            VISITAS[i].MORADOR.MOR_STR_PSW = undefined
        })
        
        return res.send({ VISITAS })
    }
    catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.2)` + err })
    }
})

router.get('/:visitaId', async (req, res) => {
    try {
        const VISITA = await Visitas.find({ 
            where: { 
                VSIT_INT_ID: req.params.visitaId,
                COND_INT_ID: req.COND_INT_ID
            }, 
            include: [ 
                { model: Morador }, { model: Condominio }
            ] 
        })

        if (!VISITA)
            return res.status(400).send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.3.1)` })

        VISITA.MORADOR.MOR_STR_PSW = undefined
        
        return res.send({ VISITA })
    }
    catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.3)` })
    }
})

router.get('/morador/:moradorId', async (req, res) => {
    try {
        const VISITAS = await Visitas.findAll({ 
            where: { 
                MOR_INT_ID: req.params.moradorId,
                COND_INT_ID: req.COND_INT_ID 
            }, 
            include: [ 
                { model: Morador }, { model: Condominio } 
            ]
        })
        if (!VISITAS.length)
            return res.status(400).send({ error: `${TABLE_NAME_PLURAL} não encontrad${TABLE_VERB_PLURAL} (CODE: ${TABLE_NUMBER}.4.1)` })

        await VISITAS.map((v, i) => {
            VISITAS[i].MORADOR.MOR_STR_PSW = undefined
        })

        return res.send({ VISITAS })
    }
    catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.4)` })
    }
})

router.put('/:visitaId', async (req, res) => {
    try {
        await Visitas.find({ 
            where: { 
                VSIT_INT_ID: req.params.visitaId,
                COND_INT_ID: req.COND_INT_ID
            }, 
            include: [ 
                { model: Condominio }, { model: Morador }
            ]
        }).then(async VISITA => {
            if (!VISITA)
                return res.status(400).send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.5.1)` })

            await VISITA.updateAttributes({ ...req.body })

            VISITA.MORADOR.MOR_STR_PSW = undefined

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${VISITA.VSIT_STR_NOME}:${VISITA.VSIT_INT_ID}) atualizad${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            })

            return res.send({ VISITA, LOG })
        })
    }
    catch (err) {
        return res.status(400).send({ error: `Erro ao atualizar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.5)` })
    }
})

router.delete('/:visitaId', async (req, res) => {
    try {
        await Visitas.find({ 
            where: { 
                VSIT_INT_ID: req.params.visitaId,
                COND_INT_ID: req.COND_INT_ID 
            }, 
            include: [ 
                { model: Condominio }, { model: Morador }
            ]
        }).then(async VISITA => {
            if (!VISITA)
                return res.status(400).send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.6.1)` })

            await VISITA.destroy()

            VISITA.MORADOR.MOR_STR_PSW = undefined

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${VISITA.VSIT_STR_NOME}:${VISITA.VSIT_INT_ID}) excluíd${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            })

            return res.send({ VISITA, LOG })
        })
    }
    catch (err) {
        return res.status(400).send({ error: `Erro ao excluir ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.6)` })
    }
})

module.exports = app => app.use('/visita', router)