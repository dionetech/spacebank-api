require('dotenv').config();
const express = require('express');
const app = express();

require('./containers/logger')();
require('./containers/database')();
require('./containers/routes')(app);

app.get('/', (req, res) => {
	res.send({title: "Testing the server with a main route..."})
})

const PORT = process.env.PORT;

app.listen(PORT, () => {
	console.log("Server is running on port: ", PORT);
})