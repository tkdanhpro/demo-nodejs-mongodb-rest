const express = require("express");
// const request = require('request');
const noteDb = require('./note.db');
const auth = require('../core/middleware/auth');
const ErrorCode = require('./../core/error/ErrorCode');

const noteRoute = express.Router();

noteRoute.get('/:id', auth, async (req, res, next) => {
    try {
        await noteDb.getById(req, res)

    } catch (err) {
        next();
        res.status(500).send(err.message)
    }
});

noteRoute.get('/me', auth, async (req, res, next) => {
    try {
        await noteDb.getNotes(req, res)

    } catch (err) {
        next();
        res.status(500).send(err.message)
    }
});

noteRoute.post('/add', auth, async (req, res, next) => {
    try {
        await noteDb.addNote(req, res)

    } catch (err) {
        next();
        res.status(500).send(err.message)
    }
});

noteRoute.put('/update', auth, async (req, res, next) => {
    try {
        await noteDb.updateNote(req, res)

    } catch (err) {
        next();
        res.status(500).send(err.message)
    }
});

noteRoute.post('/finish', auth, async (req, res, next) => {
    try {
        await noteDb.finishNote(req, res)

    } catch (err) {
        next();
        res.status(500).send(err.message)
    }
});

module.exports = noteRoute;
