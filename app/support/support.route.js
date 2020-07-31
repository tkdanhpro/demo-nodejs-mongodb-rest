const express = require("express");
const supportRouter = express.Router();
const supportDb = require('./support.db');

supportRouter.post('/add',  async (req, res, next) => {
    await supportDb.send(req, res)
});

module.exports = supportRouter;
