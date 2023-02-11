const mongoose = require("mongoose");
const winston = require("winston");

const dbURL = process.env.DATABASE_URL;

module.exports = function () {
  mongoose.set('strictQuery', true);
  mongoose
    .connect(dbURL, {
		  useNewUrlParser: true,
		  useUnifiedTopology: true,
    })
    .then(() => winston.info("Successful Connection to mongo database"));
};