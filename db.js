require('dotenv').config();
let mongoose = require('mongoose');

console.log("process.env.MONGODB_URL ", process.env.MONGODB_URL)
const mongoUrl = process.env.MONGODB_URL


module.exports = {
    db: function () {
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
    }
};
