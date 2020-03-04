var mongoose = require('mongoose');
var statsd = require('./statsd');

var schema = mongoose.Schema({value: String});
var Values = mongoose.model('values', schema);

var Customer = mongoose.Schema({
    firstName: String,
    lastName: String,
    phoneNumber:String,
    email: String,
    password_hash: String,
    gender: String,
    platform: String,
    provider: String,
    avatarUrl: String,
    status: String,
    birthDay: String,
    facebook_id: String,
    facebook_link: String,
    deleted: Boolean,
    totalSpentAmount: Number,
    totalLoanAmount: Number
});

var CustomerModel = mongoose.model("customers", Customer);

const mongoUrl = "mongodb://127.0.0.1:27017/moneydb";

module.exports = {
    connectDB : function() {
        mongoose.connect(process.env.MONGODB_ADDON_URI || mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log("DB connected!"))
        .catch(err => console.log("DB connection Error: ${err.message}"));
    },

    updateGauge : function() {
        Values.count(function(err, result) {
            if(!err) {
                statsd.gauge('values', result);
            }
        })
    }, 

    getCustomers : (res) => {
        CustomerModel.find({_id: '5e5e24d167f974dc3a41d4e8'}, (err, data) => {
            if (err || !data) {
                console.log(err);
                res.status(500).send("Database error!");
                return
            }
            console.log("data response: ", JSON.stringify(data));
            res.status(200).send(data);
        });
    },

    getCustomerById : (res) => {
        CustomerModel.findOne({id: "1"},(err, data) => {
            if (err || !data) {
                console.log(err);
                res.status(500).send("Database error!");
                return
            }
            console.log("data response: ", JSON.stringify(data));
            res.status(200).send(data);
        });    
    },


    getVal : function(res) {
        Values.find(function(err, result) {
            if (err) {
                console.log(err);
                res.send('database error');
                return
            }
            var values = {};
            for (var i in result) {
                var val = result[i];
                values[val["_id"]] = val["value"]
            }
            var title = process.env.TITLE || 'NodeJS MongoDB demo'
            res.render('index', {title, values: values});
        });
    },

    sendVal : function(val, res) {
        var request = new Values({value: val});
        request.save((err, result) => {
            if (err) {
                console.log(err);
                res.send(JSON.stringify({status: "error", value: "Error, db request failed"}));
                return
            }
            this.updateGauge();
            statsd.increment('creations');
            res.status(201).send(JSON.stringify({status: "ok", value: result["value"], id: result["_id"]}));
        });
    },

    delVal : function(id) {
        Values.remove({_id: id}, (err) => {
            if (err) {
                console.log(err);
            }
            this.updateGauge();
            statsd.increment('deletions');
        });
    }
};
