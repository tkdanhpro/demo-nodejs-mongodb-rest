const express = require("express");
// const request = require('request');
const noteDb = require('./note.db');
const auth = require('../core/middleware/auth');

const noteRoute = express.Router();

noteRoute.get('/id/:id', auth, async (req, res, next) => {
    try {
        await noteDb.getById(req, res)

    } catch (err) {
        next();
        res.status(500).send(err.message)
    }
});

noteRoute.get('/me', auth, async (req, res, next) => {
    try {
        await noteDb.getUserNotes(req, res)

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

noteRoute.put('/changeStatus', auth, async (req, res, next) => {
    try {
        await noteDb.changeStatus(req, res)

    } catch (err) {
        next();
        res.status(500).send(err.message)
    }
});

noteRoute.put('/changeMembers', auth, async (req, res, next) => {
    try {
        await noteDb.changeMembers(req, res)

    } catch (err) {
        next();
        res.status(500).send(err.message)
    }
});

noteRoute.put('/shareMoney', auth, async (req, res, next) => {
    try {
        await noteDb.shareMoney(req, res)

    } catch (err) {
        next();
        res.status(500).send(err.message)
    }
});

module.exports = noteRoute;
