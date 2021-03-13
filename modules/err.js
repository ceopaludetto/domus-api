const config = require('../config/err')

module.exports = v => {
    let TABLE_PRONOUM = config[v].TABLE_FEMALE ? 'a' : ''
    let TABLE_VERB = config[v].TABLE_FEMALE ? 'a' : 'o'
    let TABLE_VERB_PLURAL = config[v].TABLE_FEMALE ? 'as' : 'os'
    return { ...config[v], TABLE_PRONOUM, TABLE_VERB, TABLE_VERB_PLURAL }
}