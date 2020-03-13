const jwt = require('jsonwebtoken');
const UserModel = require('../../user/user.model');

const JWT_KEY = '@Money!Xi@oLin$@Tranvan2@@';

const auth = async (req, res, next) => {
    try {
        const token = req.header('Money-Xiaolin-Auth');

        const data = jwt.verify(token, JWT_KEY);
        const user = await UserModel.findOne({ _id: data.id, 'tokens.token': token });
        if (!user) {
            throw new Error();
        }
        req.user = user;
        req.token = token;
        next()
    } catch (err) {
        res.status(401).send(JSON.stringify({ status: "error", value: "Authentication failed!" }));
    }
}

module.exports = auth
