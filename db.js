var mongoose = require('mongoose');
var statsd = require('./statsd');

var schema = mongoose.Schema({value: String});
var Values = mongoose.model('values', schema);

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
