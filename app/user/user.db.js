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
const IncorrectOldPassword = require('./../core/error/IncorrectOldPassword');
const InvalidPasswordError = require('./../core/error/InvalidPasswordError');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const JWT_KEY = process.env.JWT_KEY;
const usernameRegex = /^[a-zA-Z0-9]+$/
const passwordRegex = /^[a-zA-Z0-9]*\S{6,}$/
const fullNameRegex = /^^[a-zA-Z0-9_ ]*$/

const { usersCollectionRef } = require('../../config/db')
const { convertTimeStampToDate, getData } = require('../core/common/common');
const generateKeywords = require('../core/common/keywordGenerator');

async function generateAuthToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        passwordHash: user.passwordHash
    };

    const token = jwt.sign(payload, JWT_KEY);

    console.log("token! => ", token)
    console.log("user =>", user)

    return token;
}

async function generateFacebookAuthToken(user) {
    const payload = {
        id: user.id,
        facebookId: user.facebookId
    };

    const token = jwt.sign(payload, JWT_KEY);

    console.log("token! => ", token)
    console.log("user =>", user)

    return token;
}

async function generateGoogleAuthToken(user) {
    const payload = {
        id: user.id,
        googleId: user.googleId
    };

    const token = jwt.sign(payload, JWT_KEY);

    console.log("token! => ", token)
    console.log("user =>", user)

    return token;
}

async function generateAppleAuthToken(user) {
    const payload = {
        id: user.id,
        appleId: user.appleId
    };

    const token = jwt.sign(payload, JWT_KEY);

    console.log("token! => ", token)
    console.log("user =>", user)

    return token;
}

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

async function addUser(user) {
    if (user.passwordHash !== undefined && user.passwordHash !== '') {
        user.passwordHash = await bcrypt.hash(user.passwordHash, 8);
    }

    // generate user id
    const userId = uuidv4();
    user.id = userId
    // generate keywords
    setUserKeywords(user)

    await usersCollectionRef.doc(userId).set(user)
    // let doc = (await newUser.get()).data()
    // doc.id = newUser.id

    // set docId to userId
    // await usersCollectionRef.doc(doc.id).update(doc)
    let token;

    console.log('new user data ', user)
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
    let { keywords, passwordHash, ...result } = user
    return { user: result, token };
}

function setDefaultUserData(data) {
    // data.totalSpentAmount = 0;
    // data.totalLoanAmount = 0;
    data.notes = []
    data.contacts = []
    data.created_at = new Date()
    data.updated_at = new Date()
    data.deleted = false
    return data
}

const findByCredentials = async (username, passwordHash) => {
    const snapshot = await usersCollectionRef.where('username', '==', username).get();
    if (snapshot.empty) {
        throw new AuthenticationFailedError()
    }
    let user = getData(snapshot)

    console.log("user ", user)

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
    // const user = await UserModel.findOne({ email });
    const snapshot = await usersCollectionRef.where('email', '==', email).get();
    if (snapshot.empty) {
        throw new AuthenticationFailedError()
    }

    let user = getData(snapshot)

    console.log("user ", user)

    // const user = snapshot[0]
    const isPasswordMatch = await bcrypt.compare(passwordHash, user.passwordHash);

    if (!isPasswordMatch) {
        throw new AuthenticationFailedError()
    }
    return user
};


const verifyEmail = async (email) => {
    if (email.length && !validator.isEmail(email)) {
        throw new WrongEmailFormatError()
    }
    if (email.length) {
        const snapshot = await usersCollectionRef.where('email', '==', email).get();
        if (!snapshot.empty) {
            throw new EmailAlreadyExistsError()
        }

    }

};


// const searchUser = async keyword => {
//     const username = usersCollectionRef.where('username', '==', keyword).get();
//     const email = usersCollectionRef.where('email', '==', keyword).get();
//     const fullname = usersCollectionRef.where('fullname', '==', keyword).get();

//     const [usernameQuerySnapshot, emailQuerySnapshot, fullnameQuerySnapshot] = await Promise.all([
//         username,
//         email,
//         fullname
//     ]);

//     const usernameArray = usernameQuerySnapshot.docs;
//     const emailArray = emailQuerySnapshot.docs;
//     const fullnameArray = fullnameQuerySnapshot.docs;
//     console.log("usernameArray ", usernameArray)
//     console.log("emailArray ", emailArray)
//     console.log("fullnameArray ", fullnameArray)
//     const results = _.concat(usernameArray,emailArray, fullnameArray);
//     console.log("results ", results)
//     return _.uniqWith(results, _.isEqual);;
// }

module.exports = {
    // firebase implemented
    verifyFbAccount: async (userData, res) => {
        const snapshot = await usersCollectionRef.where('facebookId', '==', userData.facebookId).get();

        if (!snapshot.empty) {
            let user = getData(snapshot)
            const token = await generateFacebookAuthToken(user)
            convertTimeStampToDate(user)
            res.send({ user, token })
        }
        else {
            setDefaultUserData(userData)
            let { user, token } = await addUser(userData);
            // convertTimeStampToDate(user)
            res.send({ user, token })

        }
    },

    // firebase implemented
    verifyGgAccount: async (userData, res) => {
        const snapshot = await usersCollectionRef.where('googleId', '==', userData.googleId).get();

        if (!snapshot.empty) {
            let user = getData(snapshot)
            const token = await generateGoogleAuthToken(user)
            convertTimeStampToDate(user)
            res.send({ user, token })
        }
        else {
            setDefaultUserData(userData)
            let { user, token } = await addUser(userData);
            // convertTimeStampToDate(user)
            res.send({ user, token })

        }
    },

    // firebase implemented
    // need to be re-implemented by Apple ID verify
    verifyAppleAccount: async (req, res) => {
        let data = req.body.data;
        const snapshot = await usersCollectionRef.where('appleId', '==', data.userId).get();

        if (!snapshot.empty) {
            let user = getData(snapshot)
            const token = await generateAppleAuthToken(user)
            convertTimeStampToDate(user)
            res.send({ user, token })
        }
        else {
            let newUser = {
                type: 'APPLE',
                appleId: data.userId,
                fullName: data.fullName,
                email: data.email,
                picture: ''

            };
            setDefaultUserData(newUser)
            let { user, token } = await addUser(newUser);
            // convertTimeStampToDate(user)
            res.send({ user, token })
        }
    },

    // getAll: async (req, res) => {
    //     try {
    //         const users = await UserModel.find(params);
    //         res.status(201).send({ data: users });
    //     } catch (err) {
    //         res.status(404).send({ status: 500, message: 'Ops! Something went wrong. Please try again!' });
    //     }

    // },

    // may be not use
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

    // firebase implemented
    forgotPassword: async (req, res) => {
        try {
            const email = req.body.data.email;

            const snapshot = await usersCollectionRef.where('email', '==', email).get();

            if (snapshot.empty) {
                throw new EmailNotFoundError();
            }
            const newPassword = Math.floor(100000 + Math.random() * 90000000) + '';

            const sgMail = require('@sendgrid/mail');
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);

            const msg = {
                from: 'moneyxiaolin@gmail.com',
                to: email,
                subject: '[MoneyXiaolin] Your New Password',
                text: 'MoneyXiaolin New Password',
                html: '<p>Your new password is : ' + newPassword
                    + ' </p></br><p>We recommend you update your own password!</p>'
            };
            await sgMail.send(msg).then((sent) => {
                console.log('== MoneyXiaolin New Password sent => ', sent)
            });


            let user = getData(snapshot)

            const passwordHash = await bcrypt.hash(newPassword, 8);

            var updatedUser = await usersCollectionRef.doc(user.id).update({ passwordHash, updated_at: new Date() });
            console.log("updatedUser ", updatedUser)
            res.status(201).send({ verified: true });

        } catch (err) {
            res.status(404).send(err);
        }
    },

    // firebase implemented
    // verifyForgotPasswordCode: async (req, res) => {
    //     try {
    //         const code = req.body.data.code;
    //         const snapshot = await forgotPasswordsCollectionRef
    //             .where('code', '==', code)
    //             .where('verified', '==', false).get()

    //         if (snapshot.empty) {
    //             throw new InvalidVerifyCode();
    //         }

    //         let codeData;
    //         snapshot.forEach(doc => {
    //             codeData = doc.data()
    //         })

    //         const verifiedCode = await forgotPasswordsCollectionRef.doc(codeData.id).set({ verified: true })
    //         console.log("verifiedCode ", verifiedCode)

    //         res.send({ verified: true })
    //     } catch (err) {
    //         res.status(404).send(err);
    //     }
    // },

    // firebase implemented
    // resetPassword: async (req, res) => {
    //     const code = req.body.data.code;
    //     const snapshot = await forgotPasswordsCollectionRef
    //         .where('code', '==', code)
    //         .where('verified', '==', true).get()

    //     if (snapshot.empty) {
    //         throw new InvalidVerifyCode();
    //     }
    //     if (snapshot.empty) {
    //         throw new InvalidVerifyCode();
    //     }
    //     let codeData;
    //     snapshot.forEach(doc => {
    //         codeData = doc.data()
    //     })
    //     var user = await UserModel.findById(codeData.user)
    //     if (!user) {
    //         throw new UserNotFoundError();
    //     }
    //     const newPassword = req.body.data.newPassword;
    //     const passwordHash = await bcrypt.hash(newPassword, 8);

    //     user.passwordHash = passwordHash;
    //     user.tokens = [];
    //     const token = await generateAuthToken(user);

    //     const updatedUser = await UserModel.findByIdAndUpdate(user._id, { user }, { new: true });

    //     res.status(201).send({ user: updatedUser, token: token });
    // },

    // firebase implemented
    signInWithPassword: async (req, res) => {
        try {
            const data = req.body.data;
            if (data.isEmail) {
                const user = await findByCredentialsByEmail(data.email, data.passwordHash);

                if (!user) {
                    throw new AuthenticationFailedError();
                }
                const token = await generateAuthToken(user)
                convertTimeStampToDate(user)
                let { keywords, passwordHash, ...result } = user
                res.send({ user: result, token })
            } else {
                console.log("data ", data)
                const user = await findByCredentials(data.username, data.passwordHash);

                if (!user) {
                    throw new AuthenticationFailedError();
                }
                const token = await generateAuthToken(user)
                convertTimeStampToDate(user)
                let { keywords, passwordHash, ...result } = user
                res.send({ user: result, token })
            }

        } catch (err) {
            res.status(404).send(err);
        }
    },

    // firebase implement
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

            const existUser = await usersCollectionRef.where('username', '==', username).get();

            if (!existUser.empty) {
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
            data.picture = ''
            setDefaultUserData(data)
            const { user, token } = await addUser(data);
            // convertTimeStampToDate(user)
            res.status(201).send({ user, token });
        } catch (err) {
            res.status(404).send(err);
        }

    },

    // firebase implemented
    updateUserInfo: async (req, res) => {
        const id = req.user.id;
        const data = req.body.data;
        console.log("data ", data)
        if (data.email && data.email != req.user.email) {
            await verifyEmail(data.email)
        }
        data.updated_at = new Date()
        setUserKeywords(data)

        await usersCollectionRef.doc(id).update(data);
        let result = (await usersCollectionRef.doc(id).get()).data()

        convertTimeStampToDate(result)
        let { keywords, passwordHash, ...user } = result

        res.status(201).send({ user });
    },

    // firebase implemented
    changePassword: async (req, res) => {
        const id = req.user.id;
        console.log("user id ", id)
        // const username = req.user.username;
        const oldPassword = req.body.data.oldPassword;
        const newPassword = req.body.data.newPassword;

        const passwordHash = await bcrypt.hash(newPassword, 8);
        const user = (await usersCollectionRef.doc(id).get()).data();
        console.log("user user ", user)
        if (!user) {
            throw new AuthenticationFailedError();
        }
        const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isMatch) {
            throw new IncorrectOldPassword();
        }

        user.passwordHash = passwordHash;
        user.updated_at = new Date()

        const token = await generateAuthToken(user);
        console.log("firebase user id ", user.id)
        await usersCollectionRef.doc(id).update(user);

        res.status(201).send({ status: 'success', token });
    },

    // need to be refactor
    search: async (req, res) => {
        const keyword = req.params.keyword.toLowerCase();
        // const regKey = new RegExp(keyword, 'i');
        let searchResults = []
        console.log('keyword ', keyword)
        await usersCollectionRef
            .where('keywords', 'array-contains', keyword)
            // .orderBy('fulllName')
            .get()
            .then(result => {
                result.forEach(docSnapshot => {
                    let { keywords, passwordHash, ...item } = docSnapshot.data();
                    convertTimeStampToDate(item)
                    searchResults.push(item)
                });

            })

        console.log('searchResults => ', searchResults)
        res.status(201).send({ searchResults });
    },

    getUserInfo: async (req, res) => {
        try {
            const id = req.user.id;
            console.log("user id ", id)
            // const username = req.user.username;
            const user = (await usersCollectionRef.doc(id).get()).data();
            convertTimeStampToDate(user)
            let { keywords, passwordHash, ...result } = user;
            res.send({ user: result })
        } catch (err) {
            res.status(500).send({ status: 500, message: 'Ops! Something went wrong. Please try again!' });
        }
    },

    // need to be refactor
    keywordGenerator: async (req, res) => {

        res.status(201).send({});
    }

}
