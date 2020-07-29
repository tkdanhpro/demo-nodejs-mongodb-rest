const jwt = require('jsonwebtoken');
const UserModel = require('../../user/user.model');
const AuthenticationFailedError = require('../error/AuthenticationFailedError')

const JWT_KEY = '@Money!Xi@oLin$@Tranvan2@@';

const auth = async (req, res, next) => {
    try {
        const token = req.header('Money-Xiaolin-Auth');

        if (!token) {
            throw new AuthenticationFailedError();
        }
        const data = jwt.verify(token, JWT_KEY);
        const id = data._id || data.id;
        let user = await UserModel.findOne({ _id: id });

        if (!user) {
            throw new AuthenticationFailedError();
        }
        const { keywords, passwordHash, ...result } = user._doc
        req.user = result;
        next()
    } catch (err) {
        res.status(404).send(err);
    }
}

module.exports = auth
