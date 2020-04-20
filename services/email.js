"use strict";
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: 'moneyxiaolin@gmail.com',
           pass: '@Abc123!@'
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
