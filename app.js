// Requirements
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const usersRoutes = require('./Routes/users');
const methodOverrride = require('method-override')
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser= require('body-parser');
const passport = require('passport');
const User = require('./models/user')
const localStrategy = require('passport-local').Strategy;
const expressLayouts = require('express-ejs-layouts')
const multer = require('multer')


const FullCalendar = require('@fullcalendar/core');
const dayGridPlugin = require('@fullcalendar/daygrid');
const bootstrapPlugin = require('@fullcalendar/bootstrap');


//------Start Middleware ----------
//static files

app.use(expressLayouts)
app.use(express.static('public'));

app.set('view engine','ejs');
app.set('views','views')
app.set('layout','layout.ejs')



//body parser
app.use(bodyParser.urlencoded({extended:true}))
//flash message
app.use(flash())

app.use(cookieParser('yourSecretKey', {
    sameSite: 'Strict'
  }));


app.use(methodOverrride('_method'));


//session 
app.use(session({
    secret:'login & sign up app',
    resave:'false',
    saveUninitialized:'true',
    cookie: { maxAge: 3600000 } // 1 hour
}));
//----passport middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy({usernameField:'email'},User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//globale middleware 
app.use((req,res,next)=>{
    res.locals.success_msg=req.flash(('success_msg'))
    res.locals.error_msg=req.flash(('error_msg'))
    res.locals.error=req.flash(('error'))
    res.locals.currentUser=req.user;
    next()
});
app.use(usersRoutes)



// ---------------End Middlewares----------







dotenv.config({path:'.env'})
var PORT = process.env.port||5000;




//connection to db
mongoose.set('strictQuery',true)
mongoose.connect(process.env.DB_URI)
    .then(()=> {console.log("Connected Successfully To DB")})
      .catch(()=> {console.log("Unable To Connect To DB")});

app.listen(PORT,()=>console.log(`server running on port ${PORT}...`))