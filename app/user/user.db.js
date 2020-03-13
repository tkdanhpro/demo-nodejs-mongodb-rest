const UserModel = require('./user.model');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const validator = require('validator');

const JWT_KEY = '@Money!Xi@oLin$@Tranvan2@@';

async function generateAuthToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        passwordHash: user.passwordHash
    };

    const accessToken = jwt.sign(payload, JWT_KEY);
    user.accessToken = accessToken;
    await user.save()
    return accessToken;
}

async function generateFacebookAuthToken(user) {
    const payload = {
        id: user.id,
        facebookId: user.facebookId
    };

    const accessToken = jwt.sign(payload, JWT_KEY);
    user.accessToken = accessToken;
    await user.save()
    return accessToken;
}

async function generateGoogleAuthToken(user) {
    const payload = {
        id: user.id,
        googleId: user.googleId
    };

    const accessToken = jwt.sign(payload, JWT_KEY);
    user.accessToken = accessToken;
    await user.save()
    return accessToken;
}

async function addUser(user) {
    if (user.passwordHash !== undefined & user.passwordHash !== '') {
        user.passwordHash = await bcrypt.hash(user.passwordHash, 8);
        console.log("user.passwordHash ", user.passwordHash)
    }
    console.log("create result ", user);
    await user.save();
    switch (user.type) {
        case "FACEBOOK":
            await generateFacebookAuthToken(user);
            break;
        case "GOOGLE":
            await generateGoogleAuthToken(user);
            break;
        default:
            await generateAuthToken(user);
            break;
    }

    return user;
}

const findByCredentials = async (username, passwordHash) => {
    const user = await UserModel.findOne({username});
    console.log("find user ", user);
    if (!user) {
        throw new Error('Invalid login credentials');
    }
    const isPasswordMatch = await bcrypt.compare(passwordHash, user.passwordHash);
    console.log("isPasswordMatch user ", isPasswordMatch);
    if (!isPasswordMatch) {
        throw new Error('Invalid login credentials')
    }
    return user
};

module.exports = {
    verifyFbAccount: async (userData, res) => {
        const user = await UserModel.findOne({ facebookId: userData.facebookId }, (err, result) => {
            if (err || !result) {
                console.log(err);
                return err;
            }
            return result;

        });

        if (user !== null && user !== undefined && user.length) {
            console.log("user found! " + user);
            res.status(201).send({ status: "ok", data: user });
        }
        else {
            console.log("user not found! => create new user");
            let newUser = new UserModel(userData);
            await addUser(newUser);
            res.status(201).send({ status: "ok", data: newUser });

        }
    },

    verifyGgAccount: async (userData, res) => {
        const user = await UserModel.findOne({ googleId: userData.googleId }, (err, result) => {
            if (err || !result) {
                console.log(err);
                return err;
            }
            return result;

        });
        console.log("user data! " + user);
        if (user !== null && user !== undefined && user.length) {
            console.log("user found! " + user);
            res.status(201).send({ status: "ok", data: user });
        }
        else {
            let newUser = new UserModel(userData);
            await addUser(newUser);
            res.status(201).send({ status: "ok", data: newUser });

        }
    },

    getUsers: async (params, res) => {
        return await UserModel.find(params, (err, result) => {
            if (err || !result) {
                console.log(err);
                res.status(500).send("Database error!");
                return
            }

            res.status(201).send({ status: "ok", data: result });

        });
    },

    signInWithPassword: async (data, res) => {
        try {
            const userInfo = Object.assign(data);
            console.log("userInfo ", userInfo);
            const user = await findByCredentials(data.username, data.passwordHash);
            if (!user) {
                return res.status(401).send({status: "error", value: 'Login failed! Check authentication credentials'})
            }
            const token = await generateAuthToken(user)
            res.send({ user, token })
        } catch (err) {        
            res.status(400).send(JSON.stringify({ status: "error", value: err.toString() }));
        }
    },

    signUpWithPassword: async (data, res) => {
        try {

            // If sign up with email
            // console.log("data ", data.email);
            // const emailInput = data.email;
            // if (emailInput == undefined || emailInput == '') {
            //     res.send(JSON.stringify({ status: "error", value: "Email cannot be empty!" }));
            //     return
            // }
            // if (!validator.isEmail(emailInput)) {
            //     res.send(JSON.stringify({ status: "error", value: "Wrong email format!" }));
            //     return
            // }
            // const existUser = await UserModel.find({ email: emailInput });
            // console.log("existUser ", existUser);

            // If sign up by user name
            const username = data.username;
            if (username == undefined || username == '' || /\s/.test(username)) {
                res.send(JSON.stringify({ status: "error", value: "Invalid username!" }));
                return
            }
            if (username.length < 6) {
                res.send(JSON.stringify({ status: "error", value: "Username must be greater than 6 character!" }));
                return
            }

            let existUser = {};
            if (validator.isEmail(username)) {
                data.email = username;
                existUser = Object.assign({}, await UserModel.find({ email: username }));
            } else {
                existUser = Object.assign({}, await UserModel.find({ username: username }));
            }

            console.log("existUser ", existUser);

            if (existUser != undefined && Object.keys(existUser).length) {
                //throw new Error("Email already exists!");
                console.log("user exists! ");
                res.send(JSON.stringify({ status: "error", value: "Username or Email already exists!" }));
                return
            }
            if (data.passwordHash.length < 8) {
                //throw new Error("Password length must be greater than 8 characters!")
                res.send(JSON.stringify({ status: "error", value: "Password length must be greater than 8 characters!" }));
                return
            }
            // register new user
            data.type = "NORMAL";

            const newUser = new UserModel(data);
            await addUser(newUser);

            res.status(201).send({ status: "ok", data: newUser });
        } catch (err) {
            res.send(JSON.stringify({ status: "Error! Something went wrong!", value: err }));
        }

    },

    updateUser: (id, data, res) => {
        UserModel.findByIdAndUpdate(id, data, { new: true }, (err, result) => {
            if (err) {
                console.log(err);
                res.send(JSON.stringify({ status: "error", value: "Error, db request failed" }));
                return
            }

            res.status(201).send({ status: "ok", data: result });
        });
    }

}