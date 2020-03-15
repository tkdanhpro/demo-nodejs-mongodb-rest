let mongoose = require('mongoose');
let statsd = require('./statsd');

let walletHistoryModel = require('./models/walletHistory');

// const mongoUrl = "mongodb://127.0.0.1:27017/moneydb";

// const mongoUrl = process.env.MONGODB_URL

const mongoUrl = "mongodb://tkdanh1:tranvan2@money1-shard-00-00-j1fvj.mongodb.net:27017,money1-shard-00-01-j1fvj.mongodb.net:27017,money1-shard-00-02-j1fvj.mongodb.net:27017/moneydb?ssl=true&replicaSet=Money1-shard-0&authSource=admin&retryWrites=true&w=majority";


module.exports = {
    connectDB: function () {
        mongoose.connect(mongoUrl,
            {
                useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            })
            .then(() => console.log("DB connected!"))
            .catch(err => console.log("DB connection Error:", err));
    },

    // Common start...

    deleteOne: (id) => {

    },
    // Common end...

    

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
