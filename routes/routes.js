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
    console.log("accessToken ", accessToken);
    let result = request({
      uri: 'https://graph.facebook.com/me?fields=name,email&access_token=' + accessToken,
      method: 'GET',
      timeout: 3000
    },
    function (error, response, body) {
      if (error) {
          console.log('error:', error); // Print the error if one occurred

      } else if(response && body) {
          console.log('statusCode:', response && response.statusCode);
          body = JSON.parse(body);
          let name = body.name;
          let facebookId = body.id;
          let email = body.email;

          res.json({'body': body}); // Print JSON response.
      }
  });

    

  } catch (error) {
    return handlePageError(res, error);
  }
});

const handlePageError = (res, e) => res.status(500).send(e.message)

module.exports = router;
