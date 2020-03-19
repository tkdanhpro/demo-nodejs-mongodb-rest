const express = require("express");
const emailService = require('../../services/email');

const supportRouter = express.Router();

supportRouter.get('/add',  async (req, res, next) => {

    // insert to database here
    // to do

    // get list send mail
    const listMail = 'mailtest@yopmail.com,mailtest2@yopmail.com';

    const mailOptions = {
        from: 'admin@xiaolin.com',
        to: listMail,
        subject: 'Subject of your email',
        html: '<p>Your html here</p>'
    };

    emailService.sendMail(mailOptions);
    res.send("Success");
});

module.exports = supportRouter;