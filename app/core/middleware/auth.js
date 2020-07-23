const jwt = require('jsonwebtoken');
const AuthenticationFailedError = require('../error/AuthenticationFailedError')
const { usersCollectionRef } = require('../../../config/db')

const auth = async (req, res, next) => {
    try {
        const JWT_KEY = process.env.JWT_KEY;
        
        const token = req.header('Money-Xiaolin-Auth');
        console.log("token ", token)
        if (!token) {
            throw new AuthenticationFailedError();
        }
        const data = jwt.verify(token, JWT_KEY);
        // console.log("data ", data)
        const user = await usersCollectionRef.doc(data.id).get();

        // console.log("auth user ", user)
        // if (snapshot.empty) {
        //     throw new AuthenticationFailedError()
        // }
        // let user;
        // snapshot.forEach(doc => {
        //     user = doc.data()
        // })

        if (!user) {
            throw new AuthenticationFailedError();
        }
        req.user = user;
        req.token = token;
        next()
    } catch (err) {
        res.status(404).send(err);
    }
}

module.exports = auth
