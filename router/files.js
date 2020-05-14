const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const db = require('../db');

let gfs;
db.once('open', () => {
    // init stream
    gfs = Grid(db.db, mongoose.mongo);
    gfs.collection('uploads');
});

// @route GET /files
// @desc Display all files in JSON
router.get('/', (req, res) => {
    let errors = [];
    gfs.files.find().toArray((err, files) => {
        // check if files
        if (!files || files.length === 0) {
            errors.push({msg: 'Not files exists'})
            res.render('error', {errors})
        }

        //Files exists
        return res.json(files);
    });
});

// @route GET /files/:filename
// @desc Display file in JSON
router.get('/:filename', (req, res) => {
    let errors = []
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
        // check if file
        if(!file || file.length === 0) {
            errors.push({msg: 'Not such file'})
            res.render('error', {errors})
        }
        
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res)
    });
});

// @route GET /image/:filename
// @desc Display image
router.get('/image/:filename', (req, res) => {
    let errors = []
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
            errors.push({msg: 'Not a image'})
            res.render('error', {errors})
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