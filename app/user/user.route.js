var express = require("express");
var request = require('request');
var mongodb = require('../../db');
const userRoute = express.Router();

userRoute.post('/fb/verify_token', (req, res) => {
  try {

    let accessToken = req.body.accessToken;
    console.log("accessToken ", accessToken);
    request({
      uri: 'https://graph.facebook.com/me?fields=name,email,link&access_token=' + accessToken,
      method: 'GET',
      timeout: 3000
    },
      function (error, response, body) {
        if (error) {
          console.log('error:', error); // Print the error if one occurred

        } else if (response && body) {
          console.log('statusCode:', response && response.statusCode);
          body = JSON.parse(body);
          let name = body.name;
          let facebookId = body.id;
          let email = body.email;
          let facebookLink = body.link;

          let userData = {
            "data": {
              "firstName": name,
              "lastName": name,
              "email": email,
              "totalSpentAmount": 0,
              "facebookId": facebookId,
              "facebookLink": facebookLink
            }
          }

          verifyUser(facebookId).then((result) => {

            if (result !== null && result != '') {
              console.log("user found! " + result);
            }
            else {
              console.log("user not found! => create new user");
              mongodb.addUser(userData, res);

            }
          },
            () => {
              console.log("user not found! ");
            });

          return res.json({ 'body': body }); // Print JSON response.
        }
      });

  } catch (error) {
    return (res, error) => res.status(500).send(error.message)
  }
});

function verifyUser(facebookId) {
  return mongodb.verifyUser(facebookId);
}

userRoute.get("/all", (req, res) => {
  mongodb.getUsers({}, res);

  // res.send({ status: result, data: result });

});

userRoute.get("/:id", (req, res) => {
  let params = {};
  let uuid = req.params.id;
  if (uuid !== undefined && uuid !== "") {
    params = { _id: uuid };
  }
  mongodb.getUsers(params, res);

});

userRoute.post('/add', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    let user = req.body.data;
    console.log(JSON.stringify(user));

    if (user === undefined || user === "") {
      res.send(JSON.stringify({ status: "error", value: "user undefined" }));
      return
    }
    var data = {};
    
    addNew(user, data).then((data) => {
      res.status(201).send(data);
    });    
    

  } catch (error) {
    return handlePageError(res, error)
  }
});

function addNew(user, data) {

  let usermodel =  mongodb.addUser(user, data);
  console.log("usermodel " +usermodel);
  return usermodel;
}

userRoute.put('/:id', async (req, res) => {
  try {

    await mongodb.updateUser(req.params.id, req.body, res);

  } catch (error) {
    return handlePageError(res, error);
  }
});

const handlePageError = (res, e) => res.status(500).send(e.message)

module.exports = userRoute;