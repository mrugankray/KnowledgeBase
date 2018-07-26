const express = require('express');
const path = require('path');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const cors=require('cors');
const passport = require('passport');
const Users = require('./models/users');
const users = require('./routes/user');
let routes = require('./routes/routes');
const config = require('./config/database');
const port = process.env.PORT || 3000;
//Init app
const app = express();
//const www = process.env.WWW || './';
//app.use(express.static(www));
//console.log(`serving ${www}`);

//connecting with mogodb
mongoose.connect(config.database);
let db = mongoose.connection;

//checkng for any db error
db.on('error',(err)=>{
    console.log(err);
});

//check for connection error
db.once('open',()=>{
    console.log('connected to mongodb');
});

//cors middleware
app.use(cors());

//importing aricle.js from models folder
let Articles = require('./models/article')

//Load view engine
app.set('views',path.join(__dirname , 'views'));
app.set('view engine','pug');

//setting up public folder
app.use(express.static(path.join(__dirname,'public')));

//Body parser middleware
app.use(bodyparser.urlencoded({extended :false}))
app.use(bodyparser.json());

// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }));
  
  // Express Messages Middleware
  app.use(require('connect-flash')());
  app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
  });
  
  // Express Validator Middleware
  app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Global variable which is available for all the routes
app.get('*',(req,res,next)=>{
    res.locals.user = req.user || null
    next();
});

//adding routes
app.use('/articles',routes);
app.use('/users',users);

//Home route
app.get('/', (req, res) => {
    Articles.find({},(err,articles)=>{
        if(err)
        {
            console.log(err);
        } else {
            res.render('index',{
                title:"Articles",
                articles:articles
            });
        }
    });
});

//Start server
app.listen(port, () => console.log(`listening on http://localhost:${port}`));