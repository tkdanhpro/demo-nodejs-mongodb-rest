const express = require("express");
const request = require('request');
const userDb = require('./user.db');
const auth = require('../core/middleware/auth');
const ErrorCode = require('./../core/error/ErrorCode');

const userRoute = express.Router();

userRoute.post('/forgotPassword', async (req, res) => {
  try {
    await userDb.forgotPassword(req, res);
  } catch (error) {
    res.status(500).send(error.message)
  }
});

userRoute.post('/verifyForgotPasswordCode', async (req, res) => {
  try {
    await userDb.verifyForgotPasswordCode(req, res);
  } catch (error) {
    res.status(500).send(error.message)
  }
});

userRoute.post('/resetPassword', async (req, res) => {
  try {
    await userDb.resetPassword(req, res);
  } catch (error) {
    res.status(500).send(error.message)
  }
});

userRoute.get('/me', auth, async (req, res, next) => {
  try {
    res.send(req.user)
  } catch (err) {
    next();
    res.status(500).send(err.message)
  }
});

userRoute.post('/appInfo', (req, res) => {
  try {

  } catch (error) {
    return (res, error) => res.status(500).send(error.message)
  }
});

userRoute.post('/signOut', auth, async (req, res, next) => {
  try {
    await userDb.signOut(req, res);
  } catch (err) {
    next();
    res.status(500).send(err.message)
  }
});

userRoute.post('/signIn', async (req, res) => {
  try {
    await userDb.signInWithPassword(req, res);
  } catch (error) {
    res.status(500).send(error.message)
  }
});

userRoute.post('/signUp', async (req, res) => {
  try {
    await userDb.signUpWithPassword(req, res);
  } catch (error) {
    res.status(500).send(error.message)
  }
});

/**
 * @link https://developers.google.com/oauthplayground/
 * @data {
    "iss": "https://accounts.google.com",
    "azp": "407408718192.apps.googleusercontent.com",
    "aud": "407408718192.apps.googleusercontent.com",
    "sub": "102806153551173991098",
    "email": "tkdanhpro@gmail.com",
    "email_verified": "true",
    "at_hash": "RslKK6qpEh1J5WqDZesoew",
    "name": "T. K.D",
    "picture": "https://lh3.googleusercontent.com/a-/AOh14GgdiPx9qke2bjKZLPrB_iATwilG3KQ8zLT5xSgivw=s96-c",
    "given_name": "T.",
    "family_name": "K.D",
    "locale": "vi",
    "iat": "1584063143",
    "exp": "1584066743",
    "alg": "RS256",
    "kid": "cb404383844b46312769bb929ecec57d0ad8e3bb",
    "typ": "JWT"
  }
 */
userRoute.post('/gg/verify_token', (req, res) => {
  try {
    let accessToken = req.body.accessToken;

    request({
      uri: 'https://oauth2.googleapis.com/tokeninfo?id_token=' + accessToken,
      method: 'GET',
      timeout: 3000
    },
      function (error, response, body) {
        const jsonBody = JSON.parse(body);

        if (jsonBody.error) {
          // throw new GoogleVerifyFailedError("jsonBody.error");
          res.status(500).send({ name: 'GoogleVerifyFailed', status: ErrorCode.GOOGLE_VERIFY_FAILED, message: jsonBody.error })
        } else if (response && body) {
          body = JSON.parse(body);
          let fullName = body.name;
          let googleId = body.sub;
          let email = body.email || '';
          let picture = body.picture;

          let userData = {
            "type": "GOOGLE",
            "fullName": fullName,
            "email": email,
            "googleId": googleId,
            "picture": picture,
            "totalSpentAmount": 0,
            "totalLoanAmount": 0
          }

          userDb.verifyGgAccount(userData, res);
        }

      });

  } catch (error) {
    res.send(error)
  }
});

/**
 * @link https://graph.facebook.com/me?fields=name,email,link,picture&access_token=
 * @data {
      "name": "Lnd",
      "picture": {
          "data": {
            "height": 50,
            "is_silhouette": false,
            "url": "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=853979011682836&height=50&width=50&ext=1586655611&hash=AeRfRu3K0j2VIS1s",
            "width": 50
          }
      },
      "id": "853979011682836"
    }
 */
userRoute.post('/fb/verify_token', (req, res) => {
  try {
    let accessToken = req.body.accessToken;

    request({
      uri: 'https://graph.facebook.com/me?fields=name,email,link,picture&access_token=' + accessToken,
      method: 'GET',
      timeout: 3000
    },
      function (error, response, body) {
        const jsonBody = JSON.parse(body);
        if (jsonBody.error) {
          // throw new FacebookVerifyFailedError(jsonBody.error.message);
          res.status(500).send({ name: 'FacebookVerifyFailed', status: ErrorCode.FACEBOOK_VERIFY_FAILED, message: jsonBody.error.message })
        } else if (response && body) {
          body = JSON.parse(body);
          let name = body.name;
          let facebookId = body.id;
          let email = body.email || '';
          let facebookLink = body.link || '';

          let picture = body.picture.data.url;

          let userData = {
            "type": "FACEBOOK",
            "fullName": name,
            "email": email,
            "picture": picture,
            "facebookId": facebookId,
            "facebookLink": facebookLink,
            "totalSpentAmount": 0,
            "totalLoanAmount": 0
          }
          

          userDb.verifyFbAccount(userData, res);
        }
      });

  } catch (error) {
    res.send(error)
  }
});

userRoute.post('/apple/verify', async (req, res) => {
  try {
    userDb.verifyAppleAccount(req, res)
  } catch (error) {
    res.send(error)
  }
});

userRoute.get("/all", async (req, res) => {
  // var data = {};
  userDb.getUsers({}, res);
});

userRoute.get("/:id", (req, res) => {
  let params = {};
  let uuid = req.params.id;
  if (uuid !== undefined && uuid !== "") {
    params = { _id: uuid };
  }
  userDb.getUsers(params, res);

});

userRoute.post('/add', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    let user = req.body.data;

    if (user === undefined || user === "") {
      res.send({ status: "error", value: "user undefined" });
      return
    }

    userDb.addUser(user, res)

  } catch (error) {
    return handlePageError(res, error)
  }
});

userRoute.put('/update', auth, async (req, res) => {
  try {
    await userDb.updateUserInfo(req, res);
  } catch (error) {
    return handlePageError(res, error);
  }
});

userRoute.put('/changePassword', auth, async (req, res) => {
  try {
    await userDb.changePassword(req, res)
  } catch (error) {
    return handlePageError(res, error);
  }
});

userRoute.get('/search/:keyword', auth, async (req, res) => {
  try {
    await userDb.search(req, res)

  } catch (error) {
    return handlePageError(res, error)
  }
});

// for friends function
userRoute.get('/friends/list', auth, async (req, res) => {
  try {
    userDb.getFriends(req, res)

  } catch (error) {
    return handlePageError(res, error)
  }
});

userRoute.post('/friends/add', auth, async (req, res) => {
  try {
    userDb.addFriends(req, res)

  } catch (error) {
    return handlePageError(res, error)
  }
});

userRoute.put('/friends/update', auth, async (req, res) => {
  try {
    userDb.updateFriends(req, res)

  } catch (error) {
    return handlePageError(res, error)
  }
});

const handlePageError = (res, e) => res.status(500).send(e.message)

module.exports = userRoute;
