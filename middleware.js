//require new class for error handling: appError
const AppError = require('./Errorhandling utilities/appError');
// import joi schema
const { blogSchema, commentSchema, projectSchema } = require('./joiSchema')
// import models
const Blog = require('./models/blog');
const Comment = require('./models/comment')
const Project = require('./models/project')
//verify if user is logged in
module.exports.isLoggedin = (req, res, next) => {
    console.log('REQ.USER:', req.user)
    if (!req.isAuthenticated()) {
        //req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in');
        return res.redirect('/login')
    }
    next();
}
// handle potentiel error in our blog model
module.exports.validateBlog = (req, res, next) => {
    const { error } = blogSchema.validate(req.body);
    console.log(error)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}
// handle potentiel error in our project model
module.exports.validateProject = (req, res, next) => {
    const { error } = projectSchema.validate(req.body);
    console.log(error)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}
// is owner middleware
module.exports.isBlogOwner = async (req, res, next) => {
    const { id } = req.params;
    const blog = await Blog.findById(id).populate('owner');
    console.log(`blog.owner:${blog.owner}`)
    console.log(`req.user:${req.user._id}`)
    if (!blog.owner === req.user._id) {
        req.flash('error', 'You do not have permission')
        res.redirect(`/blog/${id}`);
    }
    next()

}
module.exports.isProjectOwner = async (req, res, next) => {
    const { id } = req.params;
    const project = await Project.findById(id).populate('owner');
    console.log(`project.owner:${project.owner}`)
    console.log(`req.user:${req.user._id}`)
    if (!project.owner === req.user._id) {
        req.flash('error', 'You do not have permission')
        res.redirect(`/blog/${id}`);
    }
    next()

}

//is CommentOwner middleware
module.exports.isCommentOwner = async (req, res, next) => {
    const { id, commentId } = req.params;
    const comment = await Comment.findById(commentId).populate('owner');
    console.log(`comment.owner:${comment.owner}`)
    console.log(`req.user:${req.user}`)
    if (!comment.owner === req.user._id) {
        req.flash('error', 'You do not have permission')
        res.redirect(`/blog/${id}`);
    }
    next()

}
//handle potential errors in our review model
module.exports.validateComment = (req, res, next) => {
    const { error } = commentSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

