const express = require('express');
const router = express.Router(); 
let bcrypt = require('bcryptjs'); 
const flash = require('connect-flash');
const passport = require('passport');
//addding the users model
let User = require('../models/users');

//Get Register route
router.get('/register',(req,res)=>{
    res.render('register');
});

//Submit register form
router.post('/register',(req,res)=>{
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let password2 =req.body.pasword2;
    let username = req.body.username;

    req.checkBody('name','Name is required').notEmpty();
    req.checkBody('email','Email is required').notEmpty();
    req.checkBody('email','Email is not valid').isEmail();
    req.checkBody('password','password is required').notEmpty();
    req.checkBody('password2','password do not match').equals(req.body.password);
    req.checkBody('username','username is reqired').notEmpty();

    error = req.validationErrors();
    if(error)
    {
        res.render('register',{
            error:error
        });
        console.log(error);
    } else {
        let user = new User();
        user.name = name;
        user.email = email;
        user.password = password;
        user.password2 = password2;
        user.username = username;
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err)
                {
                    console.log(err);
                } else {
                    user.password = hash;
                    user.save((err)=>{
                            if(err)
                            {
                                console.log(err);
                            } else {
                                req.flash('success','you are now registred');
                                res.redirect('/users/login');
                            }
                    });
                }
            });
        });
    }

});

//login route
router.get('/login',(req,res)=>{
    res.render('login');
});

// Login Process
router.post('/login', function(req, res, next){
    passport.authenticate('local', {
      successRedirect:'/',
      failureRedirect:'/users/login',
      failureFlash: true
    })(req, res, next);
  });

//Logout
router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success','You have sucessfully loggedout');
    res.redirect('/users/login');
});

//exporting the routes
module.exports = router