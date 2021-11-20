
// require express
const express = require('express')
// create new router object
const router = express.Router();
//require wrapAsync to handle async function error with try and catch
const wrapAsync = require('../Errorhandling utilities/wrapAsync');
//require controllers
const home = require('../controllers/home')

router.route('')
    .get(wrapAsync(home.homePage))
    .post(home.postMessage)

module.exports = router