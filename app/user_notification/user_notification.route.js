const express = require("express");
const userNotificationDb = require('./user_notification.db');
const auth = require('../core/middleware/auth');

const userNotificationRoute = express.Router();


userNotificationRoute.get('/me', auth, async (req, res, next) => {
    try {
        await userNotificationDb.getByMe(req, res)

    } catch (err) {
        next();
        res.status(500).send(err.message)
    }
});

userNotificationRoute.put('/update', auth, async (req, res, next) => {
    try {
        await userNotificationDb.update(req, res)

    } catch (err) {
        next();
        res.status(500).send(err.message)
    }
});

module.exports = userNotificationRoute;
