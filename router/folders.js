const express = require('express');
const router = express.Router();
const Folder = require('../models/folders');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const db = require('../db');
const User = require('../models/users');
const flash = require('connect-flash');

router.post('/:id/mkdir', (req, res) => {
    var folder = new Folder();

    folder.foldername = req.body.folder;
    folder.UserId = req.params.id;

    folder.save()
    res.redirect(`/home/${req.params.id}`)
});

router.get('/:id/rename/:folderid', (req, res)=> {
    User.findOne({ _id : req.params.id }, (err, user)=> {
        if(err) return console.log(err);
        if(user) {
            Folder.findOne({ _id : req.params.folderid }, (err, folder)=> {
                res.render('rename', {
                    userId : req.params.id,
                    folderId: req.params.folderid
                })
            })
        }
    })
});

router.post('/:id/rename/:folderid', (req, res) => {
    Folder.updateOne({ _id : req.params.folderid }, 
        { $set: { foldername: req.body.folder}}, {new: true}, (err, folder)=> {
            if(err) return req.flash({error_msg: 'Oops! Something went wrong'});

            res.redirect(`/home/${req.params.id}`);
        }
    );
});

router.delete('/:id/:foldername', (req, res)=> {
    var foldername = req.params.foldername
    gfs.files.remove({"metadata.folder": foldername}, (err) => {
        if(err) return req.flash({error_msg: 'Oops! Something went wrong'});

        Folder.findOneAndRemove({foldername: req.params.foldername}, (err, folder)=> {
            if(err) return console.log(err);
            res.redirect(`/home/${req.params.id}`);
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
        if(err) return req.flash({error_msg: 'Oops! Something went wrong'});
        if(user) {
            gfs.files.find({"metadata.user_id": req.params.id, "metadata.folder": req.params.foldername}).toArray((err, files) => {
                Folder.find({UserId: req.params.id}, (err, folders) => {
                    if(err) return req.flash({error_msg: 'Oops! Something went wrong'});
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
    });
});

router.post('/move/:id/:foldername/:filename', (req, res)=> {
    gfs.files.findOne({ filename: req.params.filename }, (err, file)=> {
        if(err) return req.flash({error_msg: 'Oops! Something went wrong'});
        if(file) {
            gfs.files.update({filename: req.params.filename} ,{ $set: { "metadata.folder": req.params.foldername}}, {new: true}, (err, file)=> {
                if(err) return console.log(err);
                if(file) return res.redirect(`/home/${req.params.id}`);
            });
        }
    });
})

module.exports = router;