// require express
const express = require('express')
// create new router object
const router = express.Router();
//require wrapAsync to handle async function error with try and catch
const wrapAsync = require('../Errorhandling utilities/wrapAsync');
//require controllers
const blog = require('../controllers/blog')
//loggedin middleware, isOwner middleware, validate campground middleware
const { isLoggedin, isBlogOwner, validateBlog } = require('../middleware');
//require multer and cloudinary packages
const { storage } = require('../cloudinary')
const multer = require('multer')
const upload = multer({ storage })

router.route('/')
    .get(wrapAsync(blog.blogIndex))
    .post(upload.single('thumbnail'), isLoggedin, wrapAsync(blog.createBlog))

router.get('/new', isLoggedin, blog.renderNewForm)

router.route('/:id')
    .put(upload.single('thumbnail'), isLoggedin, isBlogOwner, wrapAsync(blog.editBlog))
    .get(wrapAsync(blog.showBlog))
    .delete(isBlogOwner, wrapAsync(blog.deleteBlog))
router.get('/:id/edit', isLoggedin, isBlogOwner, wrapAsync(blog.renderEditForm))

module.exports = router