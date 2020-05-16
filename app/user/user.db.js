const UserModel = require('./user.model');
const ForgotPasswordModel = require('./../forgot_password/forgot_password');
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
const InvalidVerifyCode = require('./../core/error/InvalidVerifyCode');
const UserNotFoundError = require('./../core/error/UserNotFoundError');
const JWT_KEY = process.env.JWT_KEY;
require('dotenv').config();

const usernameRegex = /^[a-zA-Z0-9]+$/
const passwordRegex = /^[a-zA-Z0-9]*\S{6,}$/
const fullNameRegex = /^^[a-zA-Z0-9_ ]*$/

async function generateAuthToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        passwordHash: user.passwordHash
    };

    const token = jwt.sign(payload, JWT_KEY);
    user.tokens = user.tokens.concat({ token });
    await user.save()
    return token;
}

async function generateFacebookAuthToken(user) {
    const payload = {
        id: user.id,
        facebookId: user.facebookId
    };

    const token = jwt.sign(payload, JWT_KEY);
    user.tokens = user.tokens.concat({ token });
    await user.save()
    return token;
}

async function generateGoogleAuthToken(user) {
    const payload = {
        id: user.id,
        googleId: user.googleId
    };

    const token = jwt.sign(payload, JWT_KEY);
    user.tokens = user.tokens.concat({ token });
    await user.save()
    return token;
}

async function generateAppleAuthToken(user) {
    const payload = {
        id: user.id,
        appleId: user.appleId
    };

    const token = jwt.sign(payload, JWT_KEY);
    user.tokens = user.tokens.concat({ token });
    await user.save()
    return token;
}

async function addUser(user) {
    if (user.passwordHash !== undefined & user.passwordHash !== '') {
        user.passwordHash = await bcrypt.hash(user.passwordHash, 8);
    }

    await user.save();
    switch (user.type) {
        case "FACEBOOK":
            await generateFacebookAuthToken(user);
            break;
        case "GOOGLE":
            await generateGoogleAuthToken(user);
            break;
        case "APPLE":
            await generateAppleAuthToken(user);
            break;
        default:
            await generateAuthToken(user);
            break;
    }

    return user;
}

const findByCredentials = async (username, passwordHash) => {
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

module.exports = {
    verifyFbAccount: async (userData, res) => {
        const user = await UserModel.findOne({ facebookId: userData.facebookId }, (err, result) => {
            if (err || !result) {
                console.log(err);
                return err;
            }
            return result;

        });

        if (user !== null && Object.keys(user)) {
            const token = await generateAuthToken(user)
            res.send({ user, token })
        }
        else {
            let newUser = new UserModel(userData);
            await addUser(newUser);
            res.send({ user: newUser, token: newUser.tokens[0].token })

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

        if (user !== null && Object.keys(user)) {
            const token = await generateAuthToken(user)
            res.send({ user, token })
        }
        else {
            let newUser = new UserModel(userData);
            await addUser(newUser);
            res.send({ user: newUser, token: newUser.tokens[0].token })
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
            res.send({ user, token })
        }
        else {
            let newUser = new UserModel({
                type: 'APPLE',
                appleId: data.userId,
                fullName: data.fullName,
                email: data.email

            });
            await addUser(newUser);
            res.send({ user: newUser, token: newUser.tokens[0].token })
        }
    },

    getUsers: async (params, res) => {
        try {
            const users =  await UserModel.find(params);
            res.status(201).send({ data: users });
        } catch (err) {
            res.status(404).send({ status: 500, message: 'Ops! Something went wrong. Please try again!' });
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
            var user = await UserModel.findOne({email});
            if (!user) {
                throw new EmailNotFoundError();
            }
            const newPassword = Math.floor(100000 + Math.random() * 90000000)+'';

            const sgMail = require('@sendgrid/mail');
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);           
            
            const msg = {
                from: 'moneyxiaolin@gmail.com',
                to: email,
                subject: '[MoneyXiaolin] Your New Password',
                text: 'MoneyXiaolin New Password',
                html: '<p>Your new password is : '+ newPassword + ' </p></br><p>We recommend you update your own password!</p>'
            };
            await sgMail.send(msg).then((sent) => {
                console.log('sent ', sent)
            });
            
            user.passwordHash = await bcrypt.hash(newPassword, 8);
            user.tokens = [];
            await generateAuthToken(user);
            var updatedUser = await UserModel.findByIdAndUpdate(user._id, { user });
            res.status(201).send({ verified : true });

        } catch (err) {
            res.status(404).send(err);
        }
    },

    verifyForgotPasswordCode: async (req, res) => {
        try {
            const code = req.body.data.code;
            const codeData = await ForgotPasswordModel.findOne({code, verified: false});
            if (!codeData) {
                throw new InvalidVerifyCode();
            }
            codeData.verified = true;
            console.log(codeData)
            codeData.save()
            
            res.send({ verified : true })
        } catch (err) {
            res.status(404).send(err);
        }
    },

    resetPassword: async (req, res) => {
        const code = req.body.data.code;
        const codeData = await ForgotPasswordModel.findOne({code, verified: true})
        if (!codeData) {
            throw new InvalidVerifyCode();
        }
        var user = await UserModel.findById(codeData.user)
        if (!user) {
            throw new UserNotFoundError();
        }
        const newPassword = req.body.data.newPassword;
        const passwordHash = await bcrypt.hash(newPassword, 8);

        user.passwordHash = passwordHash;
        user.tokens = [];
        const token = await generateAuthToken(user);

        const updatedUser = await UserModel.findByIdAndUpdate(user._id, { user }, { new: true });

        res.status(201).send({ user: updatedUser, token: token });
    },

    signInWithPassword: async (req, res) => {
        try {
            const data = req.body.data;
            if (data.isEmail) {
                const user = await findByCredentialsByEmail(data.email, data.passwordHash);
                if (!user) {
                    throw new AuthenticationFailedError();
                }
                const token = await generateAuthToken(user)
                res.send({ user, token })
            } else {
                const user = await findByCredentials(data.username, data.passwordHash);
                if (!user) {
                    throw new AuthenticationFailedError();
                }
                const token = await generateAuthToken(user)
                res.send({ user, token })
            }
            
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
            data.totalSpentAmount = 0;
            data.totalLoanAmount = 0;
            const newUser = new UserModel(data);
            await addUser(newUser);

            res.status(201).send({ user: newUser, token: newUser.tokens[0].token });
        } catch (err) {
            res.status(404).send(err);
        }

    },

    updateUserInfo: async (req, res) => {
        const id = req.user.id;
        const data = req.body.data;

        if (data.email && data.email != req.user.email) {
            await verifyEmail(data.email)
        }

        const result = await UserModel.findByIdAndUpdate(id, data, { new: true });
        res.status(201).send({ data: result });
    },

    changePassword: async (req, res) => {
        const id = req.user.id;
        const username = req.user.username;
        const oldPassword = req.body.data.oldPassword;
        const newPassword = req.body.data.newPassword;

        const passwordHash = await bcrypt.hash(newPassword, 8);

        const user = await findByCredentials(username, oldPassword);
        if (!user) {
            throw new AuthenticationFailedError();
        }

        user.passwordHash = passwordHash;
        user.tokens = [];
        const token = await generateAuthToken(user);

        const updatedUser = await UserModel.findByIdAndUpdate(id, { user }, { new: true });

        res.status(201).send({ user: updatedUser, token: token });
    },

    search: async (req, res) => {
        const keyword = req.params.keyword.toLowerCase();
        const regKey = new RegExp(keyword, 'i');
        
        const searchResults = await UserModel.find({
            $or: [
                { 'username': regKey },
                { 'email': regKey },
                { 'fullName': regKey }
            ],
            _id: { $ne: req.user._id }
        }, { username: 1, fullName: 1, email: 1, picture: 1 })
            .sort({
                'username': 1,
                'email': 1,
                'fullName': 1
            })
            .limit(10);
            console.log(regKey)
        res.status(201).send({ searchResults });
    }

}
