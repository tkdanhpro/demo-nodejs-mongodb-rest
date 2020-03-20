const express = require("express");
// const request = require('request');
const transDb = require('./transaction.db');
const auth = require('../core/middleware/auth');
const ErrorCode = require('./../core/error/ErrorCode');

const transRoute = express.Router();

transRoute.get('/:noteId', auth, async (req, res, next) => {
    try {
        const noteId = req.params.noteId;
        await transDb.getTrans(noteId, res)

    } catch (err) {
        next();
        res.status(500).send(err.message)
    }
});

transRoute.post('/add', auth, async (req, res, next) => {
    try {
        await transDb.addTrans(req, res)

    } catch (err) {
        next();
        res.status(500).send(err.message)
    }
});

transRoute.put('/update', auth, async (req, res, next) => {
    try {
        await transDb.updateTrans(req, res)

    } catch (err) {
        next();
        res.status(500).send(err.message)
    }
});

transRoute.put('/complete', auth, async (req, res, next) => {
    try {
        await transDb.completeTrans(req, res)

    } catch (err) {
        next();
        res.status(500).send(err.message)
    }
});

module.exports = transRoute;
