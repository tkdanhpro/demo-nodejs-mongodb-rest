const UserModel = require('./user.model');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const validator = require('validator');

const InvalidFullNameError = require('./../core/error/InvalidFullNameError');
const WrongEmailFormatError = require('./../core/error/WrongEmailFormatError');
const EmailAlreadyExistsError = require('./../core/error/EmailAlreadyExistsError');
const UsernameAlreadyExistsError = require('./../core/error/UsernameAlreadyExistsError');
const PasswordLengthRequireError = require('./../core/error/PasswordLengthRequireError');
const AuthenticationFailedError = require('./../core/error/AuthenticationFailedError');
const InvalidUsernameError = require('./../core/error/InvalidUsernameError');
const UsernameLengthRequireError = require('./../core/error/UsernameLengthRequireError');
const EmailNotFoundError = require('./../core/error/EmailNotFoundError');
const InvalidPasswordError = require('./../core/error/InvalidPasswordError');

require('dotenv').config();
const JWT_KEY = process.env.JWT_KEY;

const usernameRegex = /^[a-zA-Z0-9]+$/
const passwordRegex = /^[a-zA-Z0-9]*\S{6,}$/
const fullNameRegex = /^^[a-zA-Z0-9_ ]*$/

const generateKeywords = require('../core/common/keywordGenerator');

async function generateAuthToken(user) {
    const id = user._id || user.id;
    const payload = {
        id: id,
        username: user.username,
        passwordHash: user.passwordHash
    };

    const token = jwt.sign(payload, JWT_KEY);
    console.log("token! => ", token)
    console.log("user =>", user)
    return token;
}

async function generateFacebookAuthToken(user) {
    const id = user.id || user._id;
    const payload = {
        id: id,
        facebookId: user.facebookId
    };

    const token = jwt.sign(payload, JWT_KEY);
    console.log("token! => ", token)
    console.log("user =>", user)
    return token;
}

async function generateGoogleAuthToken(user) {
    const id = user.id || user._id;
    const payload = {
        id: id,
        googleId: user.googleId
    };

    const token = jwt.sign(payload, JWT_KEY);
    console.log("token! => ", token)
    console.log("user =>", user)
    return token;
}

async function generateAppleAuthToken(user) {
    const id = user.id || user._id;
    const payload = {
        id: id,
        appleId: user.appleId
    };

    const token = jwt.sign(payload, JWT_KEY);
    return token;
}

async function addUser(data) {
    if (data.passwordHash !== undefined && data.passwordHash !== '') {
        data.passwordHash = await bcrypt.hash(data.passwordHash, 8);
    }

    setUserKeywords(data);

    let user = new UserModel(data);

    await user.save()

    console.log("user  => ", user)

    let token;
    switch (user.type) {
        case "FACEBOOK":
            token = await generateFacebookAuthToken(user);
            break;
        case "GOOGLE":
            token = await generateGoogleAuthToken(user);
            break;
        case "APPLE":
            token = await generateAppleAuthToken(user);
            break;
        case "NORMAL":
            token = await generateAuthToken(user);
            break;
        default:
            break;
    }

    // remove keywords field

    let { keywords, passwordHash, ...result } = user._doc;

    return { user: result, token };

}

const findByCredentialsByUsername = async (username, passwordHash) => {
    const user = await UserModel.findOne({ username });

    if (!user) {
        throw new AuthenticationFailedError()
    }
    const isPasswordMatch = await bcrypt.compare(passwordHash, user.passwordHash);

    if (!isPasswordMatch) {
        throw new AuthenticationFailedError()
    }
    return user
};

const findByCredentialsByEmail = async (email, passwordHash) => {
    const user = await UserModel.findOne({ email });

    if (!user) {
        throw new AuthenticationFailedError()
    }
    const isPasswordMatch = await bcrypt.compare(passwordHash, user.passwordHash);

    if (!isPasswordMatch) {
        throw new AuthenticationFailedError()
    }
    return user
};


const verifyEmail = async (email) => {
    try {
        if (email.length && !validator.isEmail(email)) {
            throw new WrongEmailFormatError()
        }
        if (email.length) {
            const existEmail = await UserModel.find({ email });

            if (existEmail != undefined && Object.keys(existEmail).length) {
                throw new EmailAlreadyExistsError()
            }
        }
    } catch (err) {
        throw err
    }

};

const setUserKeywords = user => {
    // generate keywords
    const first = user.username || '';
    const email = user.email !== undefined ? user.email.substring(0, user.email.lastIndexOf("@")) : ''
    const middle = email
    const last = user.fullName || '';
    const suffix = '';

    user.keywords = generateKeywords([
        first,
        middle,
        last,
        suffix
    ])
}

module.exports = {
    verifyFbAccount: async (data, res) => {
        const user = await UserModel.findOne({ facebookId: data.facebookId }, (err, result) => {
            if (err || !result) {
                console.log(err);
                return err;
            }
            return result;

        });

        if (user !== null && Object.keys(user)) {
            const token = await generateFacebookAuthToken(user)
            res.send({ user, token })
        }
        else {
            let { user, token } = await addUser(data);
            res.send({ user, token })

        }
    },

    verifyGgAccount: async (data, res) => {
        const user = await UserModel.findOne({ googleId: data.googleId }, (err, result) => {
            if (err || !result) {
                console.log(err);
                return err;
            }
            return result;

        });

        if (user !== null && Object.keys(user)) {
            const token = await generateGoogleAuthToken(user)
            res.send({ user, token })
        }
        else {
            let { user, token } = await addUser(data);
            res.send({ user, token })
        }
    },

    verifyAppleAccount: async (req, res) => {
        let data = req.body.data;
        const user = await UserModel.findOne({ appleId: data.userId }, (err, result) => {
            if (err || !result) {
                console.log(err);
                return err;
            }
            return result;

        });

        if (user !== null && Object.keys(user)) {
            const token = await generateAuthToken(user)
            let { keywords, passwordHash, ...result } = user._doc;

            res.send({ user: result, token })
        }
        else {
            let newUser = new UserModel({
                type: 'APPLE',
                appleId: data.userId,
                fullName: data.fullName,
                email: data.email,
                picture: ''

            });

            let { user, token } = await addUser(newUser);
            res.send({ user, token })
        }
    },

    signOut: async (req, res) => {
        try {
            req.user.tokens = req.user.tokens.filter((token) => {
                return token.token != req.token
            })
            await req.user.save()
            res.send({ status: 200, message: 'Sign out!' })
        } catch (err) {
            res.status(500).send({ status: 500, message: 'Ops! Something went wrong. Please try again!' });
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const email = req.body.data.email;
            var user = await UserModel.findOne({ email });
            if (!user) {
                throw new EmailNotFoundError();
            }
            console.log("process.env.SENDGRID_API_KEY => ", process.env.SENDGRID_API_KEY)
            const newPassword = Math.floor(100000 + Math.random() * 90000000) + '';

            const sgMail = require('@sendgrid/mail');
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);

            const msg = {
                from: 'moneyxiaolin@gmail.com',
                to: email,
                subject: '[MoneyXiaolin] Your New Password',
                text: 'MoneyXiaolin New Password',
                html: '<p>Your new password is : ' + newPassword + ' </p></br><p>We recommend you update your own password!</p>'
            };
            await sgMail.send(msg).then((sent) => {
                console.log('sent ', sent)
            });

            user.passwordHash = await bcrypt.hash(newPassword, 8);
            await generateAuthToken(user);
            await UserModel.findByIdAndUpdate(user._id, { user }, { new: true });
            res.status(201).send({ verified: true });

        } catch (err) {
            res.status(404).send(err);
        }
    },

    signInWithPassword: async (req, res) => {
        try {
            const data = req.body.data;
            console.log("data => ", data)
            let user;
            if (data.isEmail) {
                user = await findByCredentialsByEmail(data.email, data.passwordHash);
            } else {
                user = await findByCredentialsByUsername(data.username, data.passwordHash);
            }

            if (!user) {
                throw new AuthenticationFailedError();
            }
            const token = await generateAuthToken(user);
            let { keywords, passwordHash, ...result } = user._doc;
            res.send({ user: result, token })
        } catch (err) {
            res.status(404).send(err);
        }
    },

    signUpWithPassword: async (req, res) => {
        try {

            const data = req.body.data;

            // Validate full name
            if (!fullNameRegex.test(data.fullName)) {
                throw new InvalidFullNameError()
            }

            // If sign up with email
            const emailInput = data.email;

            await verifyEmail(emailInput);

            // If sign up by user name
            const username = data.username;

            if (username == undefined || username == '' || !usernameRegex.test(username)) {
                throw new InvalidUsernameError();
            }
            if (username.length < 6) {
                throw new UsernameLengthRequireError();
            }

            let existUser = Object.assign({}, await UserModel.find({ username: username }));

            if (existUser != undefined && Object.keys(existUser).length) {
                throw new UsernameAlreadyExistsError();
            }
            if (data.passwordHash.length < 6) {
                throw new PasswordLengthRequireError()
            }
            if (!passwordRegex.test(data.passwordHash)) {
                throw new InvalidPasswordError();
            }

            // register normal new user
            data.type = "NORMAL";
            data.picture = '';
            data.totalSpentAmount = 0;
            data.totalLoanAmount = 0;

            const { user, token } = await addUser(data);

            res.status(201).send({ user, token });
        } catch (err) {
            res.status(404).send(err);
        }

    },

    updateUserInfo: async (req, res) => {
        const id = req.user.id || req.user._id;
        const data = req.body.data;

        if (data.email && data.email != req.user.email) {
            await verifyEmail(data.email)
        }
        console.log("data update => ", data)
        const result = await UserModel.findByIdAndUpdate(id, data, {new: true});
        let { keywords, passwordHash, ...user } = result._doc

        console.log("user updated => ", user);
        res.status(201).send({ user });
    },

    changePassword: async (req, res) => {
        const id = req.user.id;
        const username = req.user.username;
        const oldPassword = req.body.data.oldPassword;
        const newPassword = req.body.data.newPassword;

        const passwordHash = await bcrypt.hash(newPassword, 8);

        const user = await findByCredentialsByUsername(username, oldPassword);
        if (!user) {
            throw new AuthenticationFailedError();
        }

        user.passwordHash = passwordHash;
        const token = await generateAuthToken(user);

        await UserModel.findByIdAndUpdate(id, { user }, { new: true });

        res.status(201).send({ status: 'success', token });
    },

    search: async (req, res) => {
        const keyword = req.params.keyword.toLowerCase();
        const searchResults = await UserModel.find({ keywords: { "$in": [keyword] } },
            { username: 1, fullName: 1, email: 1, picture: 1 })
            .sort({
                'username': 1,
                'email': 1,
                'fullName': 1
            })
            .limit(10);

        res.status(201).send({ searchResults });
    },

    generateKewords: async (req, res) => {
        let users = await UserModel.find({});
        users.forEach(user => {
            setUserKeywords(user);
            user.save()
        });

        res.status(201).send({ users });
    }

}
