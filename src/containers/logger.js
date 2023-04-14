const winston = require("winston");
require("winston-mongodb");
require("express-async-errors");

module.exports = function () {
	try{
		winston.exceptions.handle(
			new winston.transports.Console({ colorize: true, prettyPrint: true }),
			new winston.transports.File({ filename: "uncaught.log", level: "error" }),
		);
	}catch{
		console.log("ERROR 1");
	}

	try{
		process.on("unhandledRejection", (ex) => {
			throw ex;
		});
	}catch{
		console.log("ERROR 2");
	}

	try{
		winston.add(new winston.transports.File({
			filename: 'logfile.log',
			level: "info",
			handleExceptions: true
		}));
	}catch(error){
		console.log("ERROR 3", error);
	}
};
