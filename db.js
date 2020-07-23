let mongoose = require('mongoose');

let walletHistoryModel = require('./models/walletHistory');

const mongoUrl = "mongodb://127.0.0.1:27017/moneydb";

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

    // close connection database
    closeConnectDB: function() {
        mongoose.connection.close();
        console.log("DB close connection!");
    },
    

    // Wallet history start...

    getWalletHistories: async (req, res) => {
        const options = {
            sort: { _id: -1 },
            limit: parseInt(req.query.limit || 20, 10),
            page: parseInt(req.query.page || 1, 10)
          }
      
          const histories = await walletHistoryModel.paginate({}, options)
          res.status(201).send({ status: "ok", data: histories });
    }
    
};
