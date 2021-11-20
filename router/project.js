// require express
const express = require('express')
// create new router object
const router = express.Router();
//require wrapAsync to handle async function error with try and catch
const wrapAsync = require('../Errorhandling utilities/wrapAsync');
//require controllers
const project = require('../controllers/project')
//loggedin middleware, isOwner middleware, validate campground middleware
const { isLoggedin, isProjectOwner, validateProject } = require('../middleware');
//require multer and cloudinary packages
const { storage } = require('../cloudinary')
const multer = require('multer')
const upload = multer({ storage })

router.route('/')
    .get(wrapAsync(project.projectIndex))
    .post(upload.array('thumbnail'), isLoggedin, wrapAsync(project.createProject))

router.get('/new', isLoggedin, project.renderNewForm)

router.route('/:id')
    .put(upload.array('thumbnail'), isLoggedin, isProjectOwner, wrapAsync(project.editProject))
    .get(wrapAsync(project.showProject))
    .delete(isProjectOwner, wrapAsync(project.deleteProject))

router.get('/:id/edit', isLoggedin, isProjectOwner, wrapAsync(project.renderEditForm))

module.exports = router