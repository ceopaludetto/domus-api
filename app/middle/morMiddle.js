const jwt = require('jsonwebtoken');
const { secret } = require('../../config/cond');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).send({ error: 'Token não informado (CODE: 0.1)' });

    const parts = authHeader.split(' ');

    if (!parts.length === 2) return res.status(401).send({ error: 'Erro de Token (CODE: 0.2)' });

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) return res.status(401).send({ error: 'Token mal formatado (CODE: 0.3)' });

    jwt.verify(token, secret, (err, decoded) => {
        if (err) return res.status(401).send({ error: 'Token inválido (CODE: 0.4)' });

        req.COND_INT_ID = decoded.COND_INT_ID;
        return next();
    });
};
