const UserModel = require('./user.model');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const validator = require('validator');

const JWT_KEY = '@Money!Xi@oLin$@Tranvan2@@';

async function generateAuthToken(user) {
    const jwtToken = jwt.sign({ _id: user.id }, JWT_KEY);
    user.jwtToken = jwtToken;
    await user.save()
    return jwtToken;
}

async function addUser(user) {

    if (user.passwordHash !== undefined & user.passwordHash !== '') {
        user.passwordHash = await bcrypt.hash(user.passwordHash, 8);
        console.log("user.passwordHash ", user.passwordHash)
    }
    console.log("create result ", user);
    let result = await user.save();
    
    await generateAuthToken(result);
    return user;
}

module.exports = {
    verifyFbAccount: async (userData, res) => {        
        const user = await UserModel.find({ facebookId: userData.facebookId }, (err, result) => {
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
        const user = await UserModel.find({ googleId: userData.googleId }, (err, result) => {
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

    signInWithPassword: async (user, res) => {

    },

    signUpWithPassword: async (params, res) => {
        try {
            const emailInput = params.email;
            if (emailInput == undefined || emailInput == '') {
                res.send(JSON.stringify({ status: "error", value: "Email cannot be empty!" }));
                return
            }
            if (!validator.isEmail(emailInput)) {
                res.send(JSON.stringify({ status: "error", value: "Wrong email format!" }));
                return
            }

            const existUser = await UserModel.find({ email: emailInput });
            console.log("existUser ", existUser);

            if (existUser != undefined) {
                //throw new Error("Email already exists!");
                res.send(JSON.stringify({ status: "error", value: "Email already exists!" }));
                return
            }
            if (params.password.length < 8) {
                //throw new Error("Password length must be greater than 8 characters!")
                res.send(JSON.stringify({ status: "error", value: "Password length must be greater than 8 characters!" }));
                return
            }
            // register new user
            const user = new UserModel(params);
            await addUser(user, res);
        } catch (err) {
            res.send(JSON.stringify({ status: "error", value: err }));
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