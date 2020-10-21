const express = require("express");
const userInvitationDb = require('./user_invitation.db');
const auth = require('../core/middleware/auth');

const userInvitationRoute = express.Router();


userInvitationRoute.get('/me', auth, async (req, res, next) => {
    try {
        await userInvitationDb.getByMe(req, res)

    } catch (err) {
        next();
        res.status(500).send(err.message)
    }
});

userInvitationRoute.put('/update', auth, async (req, res, next) => {
    try {
        await userInvitationDb.update(req, res)

    } catch (err) {
        next();
        res.status(500).send(err.message)
    }
});

module.exports = userInvitationRoute;
