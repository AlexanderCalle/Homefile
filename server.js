const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');
const db = require('./db');
const User = require('./users/users');
const Folder = require('./folders/folders');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(morgan('short'));

// Mongo URI
const mongoURI = process.env.MONGODB_URL || 'mongodb://localhost:27017/mongouploads';

//init gfs
let gfs;
db.once('open', () => {
    // init stream
    gfs = Grid(db.db, mongoose.mongo);
    gfs.collection('uploads');
    console.log('connected to MongoDB')
});

// Create storage engine
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

// @route GET /
// @desc Loads form
app.get('/home/:id', (req, res) => {
    User.findOne({ _id: req.params.id}, (err, user)=> {
        if(err) return res.send(err)
        if(user) {
            gfs.files.find({"metadata.user_id": req.params.id, "metadata.folder": "home"}).toArray((err, files) => {
                Folder.find({UserId: req.params.id}, (err, folders) => {
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
    })
});

app.get("/", (req, res) => {
    res.render('login')
});

app.post("/", (req, res)=> {
    if(req.body.email && req.body.password != null) {
        User.findOne({ email : req.body.email }, (err, user) => {
            if(err) {
                res.send('Failed');
            }
            if(user) {
                var hash = user.password;
                var password = bcrypt.compareSync(req.body.password, hash);
                if(password) {
                    res.redirect(`/home/${user._id}`)
                } else {
                    res.send('wrong password')
                }
            } else {
                res.send('wrong email')
            }
        })
    }
});

// @route POST /uploads
// @desc uploads file to DB
app.post('/upload/:id', upload.array('file'), (req, res) => {
    //res.json({file: req.file})
    res.redirect(`/home/${req.params.id}`);
});

const signin = require('./router/signin');
app.use('/signin', signin);

const files = require('./router/files');
app.use('/files', files)

const folders = require('./router/folders');
app.use('/folders', folders);

const port = process.env.PORT || 2000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})