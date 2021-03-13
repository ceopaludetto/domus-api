const Logger = require('../app/mod/logger')
const { TABLE_NAME, TABLE_NUMBER } = require('./err')('LOGGER')

const Log = {
    add: async data => {
        try {
            const log = await Logger.create(data)
            log.LOG_DT_EMI = Date.now()
            return log
        }
        catch (err) {
            return { error: `Erro ao adicionar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.1)` }
        }
    },
    find: async data => {
        try {
            const log = await Logger.find(data)
            return log
        }
        catch (err) {
            return { error: `Erro ao encontrar ${TABLE_NAME} (CODE: ${TABLE_NUMBER}.2)` }
        }
    }
}

module.exports = Log