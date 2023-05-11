const express = require('express');
const router = express.Router();
const passport = require('passport')
const Event = require('../models/event');



const {
  addUser,
  getProfile,
  getUsers,
  updateUser, forgetPassword
  , logout, reset
  , resetPassword,
  edit,
  editUser

} = require('../controller/userController')
const lessonController= require('../controller/lesson')
const eventsController= require('../controller/eventController')


let isAuthenticatedUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.originalUrl === '/login') {
      return res.redirect('/');
    }
    return next();
  }
  req.flash('error_msg', 'Please login first to access this page.');
  res.redirect('/login');
}

router.get('/manageStudents', getUsers)


router.get('/', isAuthenticatedUser, async (req, res) => {
  try {
    // Fetch events from the database
    const events = await Event.find({})
console.log(events)
    let message = '';
    if (req.session.isFirstTime) {
      message = 'Welcome';
      req.session.isFirstTime = false;
    } else {
      message = 'Welcome back';
    }
    // Render the dashboard template with the events data
    res.render('dashboard.ejs', { user: req.user, message, events })
  } catch (error) {
    console.log(error)
    res.render('error.ejs', { message: 'Something went wrong. Please try again later.' })
  }
});

//profile
router.get('/profile/:id', isAuthenticatedUser, getProfile)
//edite route
router.get('/edit/:id', edit)
//get cours
router.get('/manageCourses',(req,res)=> {
  res.render('./teacher-views/manage-courses.ejs')
})
//get lessons
router.get('/lessons',lessonController.getLessons)
//get lesson
router.get('/lessons/:lessonId',lessonController.viewLesson)

router.get('/download/:id',lessonController.downloadPdf )

router.get('/videos' ,lessonController.getVideos)


//-----------------------------------------------------------

router.post('/addVideo',lessonController.addVideo)
router.post('/addUser', addUser)
router.post('/updateUser/:id', updateUser);
router.put('/edit/:id', editUser);

router.post('/addLesson',lessonController.createLesson)

//events post
router.post('/events',eventsController.createEvent)

//---passport --------


// post routers
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: 'Invalid email or password. Try Again!!'
}))



// get routers

router.get('/login', (req, res) => {
  res.render('login.ejs')
})

router.get('/logout', logout)
router.get('/forgot', (req, res) => {
  res.render('forgot.ejs')
})
router.get('/reset/:token', reset)
// Router to handle forgot password
router.post('/forgot', forgetPassword)
//--------

router.post('/reset/:token', resetPassword)


//----end passport----

router.get('*', (req, res) => {
  res.render('./partials/error.ejs')
})

module.exports = router;