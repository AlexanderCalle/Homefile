const express = require('express');
const router = express.Router();
const Folder = require('../folders/folders');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');
const db = require('../db');
const User = require('../users/users');

router.post('/:id/mkdir', (req, res) => {
    var folder = new Folder();

    folder.foldername = req.body.folder;
    folder.UserId = req.params.id;

    folder.save()
    console.log('folder created');
    res.redirect(`/home/${req.params.id}`)
});

router.delete('/:id/:foldername', (req, res)=> {
    var foldername = req.params.foldername
    gfs.files.remove({"metadata.folder": foldername}, (err) => {
        if(err) {
            return res.status(404).json({ err : err});
        }

        Folder.findOneAndRemove({foldername: req.params.foldername}, (err, folder)=> {
            if(err) return console.log(err);
            res.redirect(`/home/${req.params.id}`)
        });
    });
});

let gfs;
db.once('open', () => {
    // init stream
    gfs = Grid(db.db, mongoose.mongo);
    gfs.collection('uploads');
});

const mongoURI = process.env.MONGODB_URL || 'mongodb://localhost:27017/mongouploads';

// Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
           const fileInfo = {
              filename: file.originalname,
              metadata: {
                  user_id: req.params.id,
                  folder: req.params.foldername
              },
              bucketName: 'uploads'
            };
            resolve(fileInfo);
        });
      }
});
const upload = multer({ storage });

router.post('/upload/:id/:foldername', upload.array('file'), (req, res) => {
    //res.json({file: req.file})
    res.redirect(`/folders/${req.params.id}/folder/${req.params.foldername}`);
});

router.get('/:id/folder/:foldername', (req, res)=> {
    User.findOne({ _id: req.params.id}, (err, user)=> {
        if(err) return res.send(err)
        if(user) {
            gfs.files.find({"metadata.user_id": req.params.id, "metadata.folder": req.params.foldername}).toArray((err, files) => {
                Folder.find({UserId: req.params.id}, (err, folders) => {
                    if (!files || files.length === 0) {
                        res.render('folder', {files: false, userId: req.params.id, foldername: req.params.foldername});
                    } else {
                        files.map(file => {
                            if(file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
                                file.isImage = true;
                            } else {
                                file.isImage = false;
                            }
                        });
                        res.render('folder', {files: files, userId: req.params.id, foldername: req.params.foldername});
                    }
                });
            });
        }
    })
});

module.exports = router;