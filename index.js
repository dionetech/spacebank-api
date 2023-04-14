require('dotenv').config();
const express = require('express');
const app = express();
const Sentry = require("@sentry/node");
const SentryTracing = require("@sentry/tracing");
const { DSN } = process.env;

console.log("DSN: ", DSN);

Sentry.init({
    dsn: DSN,
    integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new SentryTracing.Integrations.Express({ app }),
        new SentryTracing.Integrations.Mongo({ useMongoose: true })
    ],
    tracesSampleRate: 0.1,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

require('./src/containers/logger')();
require('./src/containers/database')();
require('./src/containers/routes')(app);

const PORT = process.env.PORT;

app.listen(PORT, () => {
	console.log("Server is running on port: ", PORT);
})

module.exports = app;