const Locais = require('../mod/locais')
const Condominio = require('../mod/condominio')
const Morador = require('../mod/morador')
const Log = require('../../modules/logger')
const authMiddleware = require('../middle/authMiddle')
const { TABLE_NAME, TABLE_NAME_PLURAL, TABLE_NUMBER, TABLE_VERB } = require('../../modules/err')('LOCAIS')

const router = require('express').Router()

router.use(authMiddleware)

router.post('/', async (req, res) => {
    try {
        const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } })

        if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
            return res.status(400).send({ error: `Apenas síndicos devem inserir ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.1.1)` })

        const LOCAL = await Locais.create({ ...req.body, COND_INT_ID: req.COND_INT_ID })

        const LOG = await Log.add({
            LOG_STR_MSG: `${TABLE_NAME} (${LOCAL.LOC_STR_NOME}:${LOCAL.LOC_INT_ID}) adicionad${TABLE_VERB}`,
            COND_INT_ID: req.COND_INT_ID
        })
        
        return res.send({ LOCAL, LOG })
    }
    catch (err) {
        return res.status(400).send({ error: `Erro ao adicionar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.1)` })
    }
})

router.get('/', async (req, res) => {
    try {
        const LOCAIS = await Locais.findAll({ 
            where: { 
                COND_INT_ID: req.COND_INT_ID 
            }, 
            include: [ 
                { model: Condominio } 
            ] 
        })

        if (!LOCAIS.length)
            return res.status(400).send({ error: `Nenhum${TABLE_PRONOUM} ${TABLE_NAME} encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.2.1)` })
        
        return res.send({ LOCAIS })
    }
    catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.2)` })
    }
})

router.get('/:locaisId', async (req, res) => {
    try {
        const LOCAL = await Locais.find({ 
            where: { 
                LOC_INT_ID: req.params.locaisId,
                COND_INT_ID: req.COND_INT_ID 
            }, 
            include: [ 
                { model: Condominio } 
            ]
        })
        if (!LOCAL)
            return res.status(400).send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.3.1)` })

        return res.send({ LOCAL })
    }
    catch (err) {
        return res.status(400).send({ error: `Erro ao capturar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.3)` })
    }
})

router.put('/:locaisId', async (req, res) => {
    try {
        await Locais.find({ 
            where: { 
                LOC_INT_ID: req.params.locaisId,
                COND_INT_ID: req.COND_INT_ID 
            }, 
            include: [ 
                { model: Condominio } 
            ]
        }).then(async LOCAL => {
            const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } })

            if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
                return res.status(400).send({ error: `Apenas síndicos devem atualizar ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.4.1)` })

            if (!LOCAL)
                return res.status(400).send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.4.2)` })

            await LOCAL.updateAttributes({ ...req.body })

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${LOCAL.LOC_STR_NOME}:${LOCAL.LOC_INT_ID}) atualizad${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            })

            return res.send({ LOCAL, LOG })
        })
    }
    catch (err) {
        return res.status(400).send({ error: `Erro ao atualizar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.4)` + err })
    }
})

router.delete('/:locaisId', async (req, res) => {
    try {
        await Locais.find({ 
            where: { 
                LOC_INT_ID: req.params.locaisId,
                COND_INT_ID: req.COND_INT_ID 
            }, 
            include: [ 
                { model: Condominio } 
            ]
        }).then(async LOCAL => {
            const MORADOR_SOLICITANTE = await Morador.find({ where: { MOR_INT_ID: req.MOR_INT_ID } })

            if (!MORADOR_SOLICITANTE.MOR_BIT_SIN)
                return res.status(400).send({ error: `Apenas síndicos devem excluir ${TABLE_NAME_PLURAL} (CODE: ${TABLE_NUMBER}.5.1)` })

            if (!LOCAL)
                return res.status(400).send({ error: `${TABLE_NAME} não encontrad${TABLE_VERB} (CODE: ${TABLE_NUMBER}.5.2)` })

            await LOCAL.destroy()

            const LOG = await Log.add({
                LOG_STR_MSG: `${TABLE_NAME} (${LOCAL.LOC_STR_NOME}:${LOCAL.LOC_INT_ID}) excluíd${TABLE_VERB}`,
                COND_INT_ID: req.COND_INT_ID
            })

            return res.send({ LOCAL, LOG })
        })
    }
    catch (err) {
        return res.status(400).send({ error: `Erro ao excluir ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.5)` })
    }
})

module.exports = app => app.use('/locais', router)