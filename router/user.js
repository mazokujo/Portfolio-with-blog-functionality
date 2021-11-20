// require express
const express = require('express')
// create new router object
const router = express.Router({ mergeParams: true });
//require passport
const passport = require('passport')

//require controllers
const user = require('../controllers/user')

//require wrapAsync to handle async function error with try and catch
const wrapAsync = require('../Errorhandling utilities/wrapAsync');


//route to register user(sign up)
router.route('/register')
    .get(user.renderRegisterForm)
    .post(wrapAsync(user.registerUser))
// route to login
router.route('/login')
    .get(user.renderLoginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: 'login' }), user.loginUser)
//logout route
router.get('/logout', user.logoutUser)

module.exports = router;
