var express = require('express');
var mongodb = require('../db');
var request = require('request');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  mongodb.getVal(res);
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
router.get("/users/all", (req, res) => {

  mongodb.getUsers({}, res);
});

router.get("/users/:id", (req, res) => {
  let params = {};
  let uuid = req.params.id;
  if (uuid !== undefined && uuid !== "") {
    params = { _id: uuid };
  }

  mongodb.getUsers(params, res);
});

router.post('/user/add', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    let user = req.body.data;
    console.log(JSON.stringify(user));

    if (user === undefined || user === "") {
      res.send(JSON.stringify({ status: "error", value: "user undefined" }));
      return
    }
    mongodb.addUser(user, res);


  } catch (error) {
    return handlePageError(res, error)
  }
});

router.put('/user/:id', async (req, res) => {
  try {

    await mongodb.updateUser(req.params.id, req.body, res);
    
  } catch (error) {
    return handlePageError(res, error);
  }
});

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
router.post('/fb/verify_token', (req, res) => {
  try {
    
    let accessToken = req.body.accessToken;
    console.log("access token ", accessToken);
    
    let result = request({
      uri: 'https://graph.facebook.com/me?access_token=EAALyglEcVVcBABxqpPx4Clic70THv8xVpVOWQEnnfJ2CSsLk6NPgjXTNPEbcJG0U4KZCiRvVKUYC3zr54NCyLiZBrZClRmiGZCv0Wwm1y33icaaPjuZAVwuCVnIDxExSWOBKm5lrePWQMpbo2ftzxCypwKUUWDlZBpoHYlvbn8DOmXZBYFEIHv4AUPGv1yVt66lVNcznmgFmqqtEtvf4BjyXezXeOKNReJz4Bw15YO2pQZDZD',
      method: 'GET',
      timeout: 3000      
    },
    (err, res, body) => {
      if (err) { return console.log("error! ", err); }
      
    });

    res.status(201).send({ status: "ok", data: result });

  } catch (error) {
    return handlePageError(res, error);
  }
});



const handlePageError = (res, e) => res.status(500).send(e.message)

module.exports = router;
