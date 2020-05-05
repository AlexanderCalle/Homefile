const express = require('express');
const router = express.Router()
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const db = require('../db');
const User = require('../users/users');
const Folder = require('../folders/folders');

let gfs;
db.once('open', () => {
    // init stream
    gfs = Grid(db.db, mongoose.mongo);
    gfs.collection('uploads');
});

// @route GET /files
// @desc Display all files in JSON
router.get('/', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // check if files
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exists'
            });
        }

        //Files exists
        return res.json(files);
    });
});

// @route GET /files/:filename
// @desc Display file in JSON
router.get('/:filename', (req, res) => {
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
        // check if file
        if(!file || file.length === 0) {
            res.status(404).json({
                err: 'No file exist'
            });
        }

        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res)
    });
});

// @route GET /image/:filename
// @desc Display image
router.get('/image/:filename', (req, res) => {
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
        // check if file
        if(!file || file.length === 0) {
            res.status(404).json({
                err: 'No file exist'
            });
        }

        // check if image
        if(file.contentType === 'image/png' || file.contentType === 'image/jpeg') {
            // Read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res)
        } else {
            res.status(404).json({
                err: 'Not an image'
            });
        }
    });
});

// @route DELETE /files/:id
// @desc delete file
router.delete('/:filename/:id', (req, res) => {
    gfs.remove({filename: req.params.filename, root: 'uploads'}, (err) => {
        if(err) {
            return res.status(404).json({ err : err});
        }

        res.redirect(`/home/${req.params.id}`)
    });
});

module.exports = router;