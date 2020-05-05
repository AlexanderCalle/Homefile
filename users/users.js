const mongoose = require('mongoose');

const users = new mongoose.Schema({
    Id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    username: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    firstname: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String,
        required: true
    }
})

users.set('toJSON', { virtuals: true });

module.exports = mongoose.model('user', users);