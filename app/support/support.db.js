const SupportModel = require('./suport.model');

module.exports = {

    send: async (req, res) => {
        try {
            const email= req.body.data.email;
            const message = req.body.data.message;
            const sgMail = require('@sendgrid/mail');
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);           
            
            const msg = {
                from: 'moneyxiaolin@gmail.com',
                to: 'moneyxiaolin@gmail.com',
                subject: '[MoneyXiaolin] Customer Supports ',
                text: 'Customer Supports',
                html: '<p>Email: '+ email +'</p></br><p>Message: '+ message + ' </p>'
            };
            await sgMail.send(msg).then((sent) => {
                console.log('sent ', sent)
            });

            new SupportModel({email, message}).save();
            
            res.status(201).send({ success : true });
        } catch (err) {
            res.status(404).send(err);
        }
    }

};
