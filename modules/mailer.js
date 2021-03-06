const path = require('path')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')

const { host, port, user, pass} = require('../config/mail')

const transport = nodemailer.createTransport({
    host: host,
    port: port,
    auth: {
        user: user,
        pass: pass
    }
})

transport.use('compile', hbs({
    viewEngine: 'handlebars',
    viewPath: path.resolve('./resources/mail'),
    extName: '.html'
}))

module.exports = transport