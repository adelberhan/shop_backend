const dotenv = require("dotenv")
dotenv.config({ path: "./config/config.env" })
const DB = process.env.DB_CONATION
const mongoose = require('mongoose')

mongoose.set("strictQuery", false);

const connectDB = async () => {
    mongoose
        .connect(DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: process.env.DP_NAME,
        })
        .then(() => {
            console.log("Database Connection is ready...");
        })
        .catch((err) => {
            console.log(err);
        });
}

module.exports = connectDB
