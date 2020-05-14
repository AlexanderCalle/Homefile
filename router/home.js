const express = require('express');
const router = express.Router();
const User = require('../models/users');
const db = require('../db');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const Folder = require('../models/folders');

let gfs;
db.once('open', () => {
    // init stream
    gfs = Grid(db.db, mongoose.mongo);
    gfs.collection('uploads');
});

router.get('/:id',(req, res) => {
    User.findOne({ _id: req.params.id}, (err, user)=> {
        if(err) return req.flash({error_msg: 'Error findig user'});
        if(!user) return req.flash({error_msg: 'User not found'})
        if(user) {
            gfs.files.find({"metadata.user_id": req.params.id, "metadata.folder": "home"}).toArray((err, files) => {
                Folder.find({UserId: req.params.id}, (err, folders) => {
                    if(err) return req.flash({error_msg: 'Error findig files/folders'})
                    if (!files && !folders || files.length === 0 && folders.length === 0) {
                        res.render('index', {files: false, userId: req.params.id, folders: false});
                    } else {
                        files.map(file => {
                            if(file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
                                file.isImage = true;
                            } else {
                                file.isImage = false;
                            }
                        });
                        res.render('index', {files: files, userId: req.params.id, folders: folders});
                    }
                });
            });
        }
    });
});

module.exports = router;