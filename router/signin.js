const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const db = require('../db');
const User = require('../users/users');
const morgan = require('morgan');

router.get("/", (req, res) => {
    res.render('signin')
});

// @route POST /signin
// @desc create user
router.post('/', (req, res)=> {
    if (req.body.username && req.body.name && req.body.firstname && req.body.email && req.body.password != null) {   
        User.findOne({ email : req.body.email }, (err, user)=> {
            if(err){
                res.json({ message : 'error email' });
            }
            if(user){
                res.status(401).send('email already used');
            } else {
                User.findOne({ username : req.body.username }, (err, user)=> {
                    if(err) {
                        res.json({ message : 'error username' });
                    }
                    if (user) {
                        res.status(401).send('username already used');
                    } else  {

                        var salt = bcrypt.genSaltSync(10);
                        var hash = bcrypt.hashSync(req.body.password, salt);

                        var user = new User();

                        user.username = req.body.username;
                        user.name = req.body.name;
                        user.firstname = req.body.firstname;
                        user.email = req.body.email;
                        user.password = hash;

                    user.save();
                    console.log('user saved!');
                    res.redirect(`/home/${user._id}`)
                    }
                })
            }
        })
    } else {
        res.send('failed')
    }
});

module.exports = router;