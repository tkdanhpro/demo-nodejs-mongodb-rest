const express = require("express");
const request = require('request');
const mongodb = require('../../db');
const { OAthu2Client } = require('google-auth-library');


const userRoute = express.Router();

userRoute.post('/appInfo', (req, res) => {
  try {
    
  } catch (error) {
    return (res, error) => res.status(500).send(error.message)
  }
});

userRoute.post('/gg/verify_token', (req, res) => {
  try {
    let accessToken = req.body.accessToken;
    console.log("google token ", accessToken);

    request({
      uri: 'https://oauth2.googleapis.com/tokeninfo?id_token=' + accessToken,
      method: 'GET',
      timeout: 3000
    },
      function (error, response, body) {
        if (error) {
          console.log('error:', error);

        } else if (response && body) {
          body = JSON.parse(body);
          let given_name = body.given_name;
          let family_name = body.family_name;
          let googleId = body.sub;
          let email = body.email || '';
          let avatarUrl = body.picture;

          let userData = {
            "firstName": given_name,
            "lastName": family_name,
            "email": email,
            "googleId": googleId,
            "avatarUrl": avatarUrl,
            "totalSpentAmount": 0,
            "totalLoanAmount": 0
          }
          console.log("gg userData ", userData);

          mongodb.verifyGgAccount(googleId).then((result) => {

            if (result !== null && result != '') {
              console.log("user found! " + result);
              res.status(201).send({ status: "ok", data: result });
            }
            else {
              console.log("user not found! => create new user");
              mongodb.addUser(userData, res);

            }
          },
            () => {
              console.log("user not found!");
            });
        }

      });

  } catch (error) {
    return (res, error) => res.status(500).send(error.message)
  }
});

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
          let email = body.email || '';
          let facebookLink = body.link || '';

          let userData = {
            "firstName": name,
            "lastName": name,
            "email": email,
            "facebookId": facebookId,
            "facebookLink": facebookLink,
            "totalSpentAmount": 0,
            "totalLoanAmount": 0
          }

          mongodb.verifyFbAccount(facebookId).then((result) => {

            if (result !== null && result != '') {
              console.log("user found! " + result);
              res.status(201).send({ status: "ok", data: result });
            }
            else {
              console.log("user not found! => create new user");
              mongodb.addUser(userData, res);

            }
          },
            () => {
              console.log("user not found!");
            });

        }
      });

  } catch (error) {
    return (res, error) => res.status(500).send(error.message)
  }
});

userRoute.get("/all", async (req, res) => {
  // var data = {};
  mongodb.getUsers({}, res);
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

    mongodb.addUser(user, res)

  } catch (error) {
    return handlePageError(res, error)
  }
});

userRoute.put('/:id', async (req, res) => {
  try {

    await mongodb.updateUser(req.params.id, req.body, res);

  } catch (error) {
    return handlePageError(res, error);
  }
});

const handlePageError = (res, e) => res.status(500).send(e.message)

module.exports = userRoute;