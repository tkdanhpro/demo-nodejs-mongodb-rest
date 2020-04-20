const express = require("express");

const supportRouter = express.Router();

supportRouter.post('/add',  async (req, res, next) => {
    const email= req.body.data.email;
    const message = req.body.data.message;
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);           
    
    const msg = {
        from: 'moneyxiaolin@gmail.com',
        to: 'moneyxiaolin@gmail.com',
        subject: '[MoneyXiaolin] Customer Supports ',
        text: 'Customer Supports',
        html: '<p>Customer email: '+ email +'</p></br><p>Customer Supports: '+ message + ' </p>'
    };
    await sgMail.send(msg).then((sent) => {
        console.log('sent ', sent)
    });
    res.status(201).send({ success : true });
});

module.exports = supportRouter;