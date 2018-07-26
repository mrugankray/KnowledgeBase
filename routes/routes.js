const express = require('express');
const router = express.Router();
const flash = require('connect-flash');

// Article Model
let Articles = require('../models/article');

//Users Model
let Users = require('../models/users');

//New route
router.get('/add',ensureAuthenticated ,(req, res, next) => {
    res.render('add_route',{
        title:"articles"
    });
});

// Add Submit POST Route
router.post('/add',(req, res, next)=>{
    req.checkBody('title','Title is required').notEmpty();
    //req.checkBody('author','Author is required').notEmpty();
    req.checkBody('body','Body is required').notEmpty();
  
    // Get Errors
    let errors = req.validationErrors();
  
    if(errors){
      res.render('add_route', {
        title:'Add Article',
        errors:errors
      });
    } else {
      let article = new Articles();
      article.title = req.body.title;
      article.author = req.user._id;
      article.body = req.body.body;
  
      article.save(function(err){
        if(err){
          console.log(err);
          return;
        } else {
          req.flash('success','Article Added');
          res.redirect('/');
        }
      });
    }
  });
  

//Load edit form
router.get('/edit/:id',ensureAuthenticated,(req,res, next)=>{
    Articles.findById(req.params.id,(err,article)=>{
        if(req.user._id != article.author)
        {
            req.flash('danger','You are not authorized');
            res.redirect('/');
        } else {
            if(err)
            {
                console.log(err)
            } else {
                res.render('edit_article',{
                    //title:"Articles",
                    article:article
                });
                //console.log(article)
                //return;
            }
        }
    });
});

//submit edit form
router.post('/edit/:id', (req, res, next) => {
    let article = {};
    //let article = new Articles();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;
    let query = {_id:req.params.id};
    Articles.update(query,article,(err)=>{
        if(err)
        {
            console.log(err);
            return;
        }
        else
        {
            req.flash('success', 'Article Updated');
            res.redirect('/');
            //console.log('suc');
            //console.log(req.params.id);
        }
    });
});

//Delete request
router.delete('/:id',(req,res, next)=>{
    if(!req.user._id)
    {
        req.status(500).send();
    }
    let query = {_id:req.params.id};
    Articles.findById(req.params.id,(err,article)=>{
        if(req.user._id != article.author)
        {
            //req.flash('danger','Please login');//not working,probably bcoz url is changing on it's own , #is automatically getting added to the url
            req.status(500).send();
        } else {
            Articles.remove(query,(err)=>{
                if(err)
                {
                    console.log(err);
                }
                else 
                {
                    res.send('200');
                }
            });
        }
    });

}); 

//individual article
router.get('/:id',(req,res, next)=>{
    Articles.findById(req.params.id,(err,article)=>{
        Users.findById(article.author,(err,user)=>{
            if(err)
            {
                console.log(err)
            } else {
                res.render('article',{
                    //title:"Articles",
                    article:article,
                    author:user.name
                });
                //console.log(article)
                //return;
            }
        });
    });
});

//accesss control
function ensureAuthenticated(req,res,next)
{
    if(req.isAuthenticated())
    {
        next();
    } else {
        req.flash('danger','Please Login');
        res.redirect('/users/login');
    }
}

module.exports = router;