// require express
const express = require('express')
// create new router object
const router = express.Router({ mergeParams: true });
//require wrapAsync to handle async function error with try and catch
const wrapAsync = require('../Errorhandling utilities/wrapAsync');
//loggedin middleware, isOwner middleware, validate campground middleware
const { validateComment, isLoggedin, isCommentOwner } = require('../middleware');
//require controllers
const comment = require('../controllers/comment')

// *post a review on the comment
router.post('', isLoggedin, wrapAsync(comment.postComment))

//*delete a review associated to a comment
router.delete('/:commentId', isLoggedin, isCommentOwner, wrapAsync(comment.deleteComment))

module.exports = router
