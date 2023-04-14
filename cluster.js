const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const app = require('./server');
const port = process.env.PORT || 6500;

const masterProcess = () => Array.from(Array(numCPUs)).map(cluster.fork)
const childProcess = () => app.listen(port)

if (cluster.isMaster) {
    masterProcess()
} else {
    childProcess()
}

cluster.on('exit', () => cluster.fork())