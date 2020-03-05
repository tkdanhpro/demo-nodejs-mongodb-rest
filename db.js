let mongoose = require('mongoose');
let statsd = require('./statsd');
let userModel = require('./app/user/user.model');
let walletHistoryModel = require('./models/walletHistory');

const Joi = require('joi');

const mongoUrl = "mongodb://127.0.0.1:27017/moneydb";

module.exports = {
    connectDB: function () {
        mongoose.connect(process.env.MONGODB_ADDON_URI || mongoUrl,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            })
            .then(() => console.log("DB connected!"))
            .catch(err => console.log("DB connection Error: ${err.message}"));
    },

    updateGauge: function () {
        Values.count(function (err, result) {
            if (!err) {
                statsd.gauge('values', result);
            }
        })
    },

    // User start...
    getUsers: (params, res) => {
        userModel.find(params, (err, result) => {
            if (err || !result) {
                console.log(err);
                res.status(500).send("Database error!");
                return
            }

            res.status(201).send({ status: "ok", data: result });
        });
    },

    addUser: (user, res) => {
        new userModel(user).save((err, result) => {
            if (err) {
                console.log(err);
                res.send(JSON.stringify({ status: "error", value: "Error, db request failed" }));
                return
            }

            res.status(201).send({ status: "ok", data: result });
        });

    },

    updateUser: (id, data, res) => {
        userModel.findByIdAndUpdate(id, data, { new: true }, (err, result) => {
            if (err) {
                console.log(err);
                res.send(JSON.stringify({ status: "error", value: "Error, db request failed" }));
                return
            }

            res.status(201).send({ status: "ok", data: result });
        });
    },

    // User end...

    // Wallet history start...

    getWalletHistories: async (req, res) => {
        const options = {
            sort: { _id: -1 },
            limit: parseInt(req.query.limit || 20, 10),
            page: parseInt(req.query.page || 1, 10)
          }
      
          const histories = await walletHistoryModel.paginate({}, options)
          res.status(201).send({ status: "ok", data: histories });
    },

    // Wallet history end...

    getVal: function (res) {
        Values.find(function (err, result) {
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
            res.render('index', { title, values: values });
        });
    },

    sendVal: function (val, res) {
        var request = new Values({ value: val });
        request.save((err, result) => {
            if (err) {
                console.log(err);
                res.send(JSON.stringify({ status: "error", value: "Error, db request failed" }));
                return
            }
            this.updateGauge();
            statsd.increment('creations');
            res.status(201).send(JSON.stringify({ status: "ok", value: result["value"], id: result["_id"] }));
        });
    },

    delVal: function (id) {
        Values.remove({ _id: id }, (err) => {
            if (err) {
                console.log(err);
            }
            this.updateGauge();
            statsd.increment('deletions');
        });
    }
};
