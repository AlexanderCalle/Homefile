const mongoose = require('mongoose');
const config = require('./config.json');

mongoose.connect(process.env.MONGODB_URL || config.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

module.exports = db;