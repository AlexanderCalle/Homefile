const mongoose = require('mongoose');

const folders = new mongoose.Schema({
    Id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    foldername: {
        type: String,
        required: true
    },
    UserId: {
        type: String
    }
})

folders.set('toJSON', { virtuals: true });

module.exports = mongoose.model('folder', folders);