const express = require('express');
const router = express.Router();
const GridFsStorage = require('multer-gridfs-storage');
const multer = require('multer');

// Mongo URI
const mongoURI = process.env.MONGODB_URL || 'mongodb://localhost:27017/mongouploads';

const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
           const fileInfo = {
              filename: file.originalname,
              metadata: {
                  user_id: req.params.id,
                  folder: 'home'
              },
              bucketName: 'uploads'
            };
            resolve(fileInfo);
        });
      }
});
const upload = multer({ storage });

router.post('/:id', upload.array('file'), (req, res) => {
    res.redirect(`/home/${req.params.id}`);
});

module.exports = router;