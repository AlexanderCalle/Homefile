const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const passport = require('passport');

// Passport
require('../middleware/passport')(passport);

router.get("/signin", (req, res) => {
    res.render('signin')
});

// @route POST /signin
// @desc create user
router.post('/signin', (req, res)=> {
    let errors = [];
    if (req.body.username && req.body.name && req.body.firstname && req.body.email && req.body.password != null) {   
        User.findOne({ email : req.body.email }, (err, user)=> {
            if(err){
                res.json({ message : 'error email' });
            }
            if(user){
                errors.push({msg: 'email already used'});
            } else {
                User.findOne({ username : req.body.username }, (err, user)=> {
                    if(err) {
                        res.json({ message : 'error username' });
                    }
                    if (user) {
                        errors.push({msg: 'username already used'});
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
                    res.redirect(`/home/${user._id}`);
                    }
                })
            }
        })
    } else {
        errors.push({msg: 'Please enter all fields'})
    }
});

router.get('/login', (req, res) => {
    res.render('login')
});

router.post('/login', (req, res, next)=> {
    User.findOne({email: req.body.email}, (err, user)=> {
        if(err) return res.send(err);
        if(user) {
            passport.authenticate('local', {
                successRedirect: `/home/${user._id}`,
                failureRedirect: '/user/login',
                failureFlash: true
            })(req, res, next);
        }
    });
});

router.get('/logout', (req, res)=>{
    req.logout();
    res.redirect('/')
});

module.exports = router;