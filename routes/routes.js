var express = require('express');
var mongodb = require('../db');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  // mongodb.getVal(res);
  res.send(JSON.stringify({ status: "ok bede!"}));
});

router.post('/values', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var val = req.body.value;

  if (val === undefined || val === "") {
    res.send(JSON.stringify({ status: "error", value: "Value undefined" }));
    return
  }
  mongodb.sendVal(val, res);
});

router.delete('/values/:id', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var uuid = req.params.id;

  if (uuid === undefined || uuid === "") {
    res.send(JSON.stringify({ status: "error", value: "UUID undefined" }));
    return
  }
  mongodb.delVal(uuid);
  res.send(JSON.stringify({ status: "ok", value: uuid }));
});

// User begin...


// user end...

// wallet history start...
router.post('/wallet/history/add', async (req, res) => {
  let data = req.body.data;

});

router.get('/wallet/histories', async (req, res) => {
  try {
    mongodb.getWalletHistories(req, res);
   
  } catch (error) {
    return handlePageError(res, error);
  }
});

// wallet history end...

// verify fb access token


const handlePageError = (res, e) => res.status(500).send(e.message)

module.exports = router;
