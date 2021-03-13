const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const socket = require('socket.io');
const ip = require('ip');
const morgan = require('morgan');
const cors = require('cors');

const Mensagens = require('./app/mod/mensagens');
const auth = require('./app/middle/authMiddle');

const Op = require('sequelize').Op;

const PORT = 3001;

const app = express();
const server = http.Server(app);
const io = socket(server);

process.setMaxListeners(Infinity);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());
app.use(morgan('tiny'));

app.use('/static', express.static(__dirname + '/public'));

io.on('connection', client => {
    client.on('subscribe', room => {
        client.join(`morador:${room}`);
    });
    client.on('message', async message => {
        const { MSG_STR_DESC, MSG_INT_DEST, MOR_INT_ID } = message;
        try {
            const MENSAGEM = await Mensagens.create({ MSG_STR_DESC, MSG_INT_DEST, MOR_INT_ID });
            await client.to(`morador:${MSG_INT_DEST}`).emit('message', { OK: true, MENSAGEM });
            await client.emit('message', { OK: true, MENSAGEM });
        } catch (err) {
            await client.emit('message', { OK: false, ERROR: 'Erro ao enviar mensagem' + err });
        }
    });
    client.on('disconnect', function() {
        console.log('Disconnected: ' + client.id);
    });
});

app.get('/mensagem/:destId', auth, async (req, res) => {
    const MSG_INT_DEST = req.params.destId;
    try {
        const MENSAGENS = await Mensagens.findAll({
            where: {
                [Op.or]: [
                    {
                        MSG_INT_DEST,
                        MOR_INT_ID: req.MOR_INT_ID
                    },
                    {
                        MSG_INT_DEST: req.MOR_INT_ID,
                        MOR_INT_ID: MSG_INT_DEST
                    }
                ]
            }
        });
        res.send({ MENSAGENS });
    } catch (err) {
        res.status(400).send({ ERROR: 'Erro ao retornar mensagens' });
    }
});

require('./app/dao')(app);

server.listen(PORT, err => {
    if (err) throw new Error(err);
    console.log(`Acessar servidor em localhost:${PORT} ou ${ip.address()}:${PORT}`);
});
