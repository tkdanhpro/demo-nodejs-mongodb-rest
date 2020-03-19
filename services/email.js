"use strict";
const nodemailer = require("nodemailer");



let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: 'email@gmail.com',
           pass: 'password'
       }
});

module.exports = {
    sendMail: function(mailOptions) {
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }

};
