// require Campground model
const Blog = require('../models/blog');
// require Review model
const Comment = require('../models/comment');

module.exports.postComment = async (req, res) => {
    // res.send("it's working!");
    const { id } = req.params;
    const blog = await Blog.findById(id);
    const newComment = await new Comment(req.body);
    blog.comment.push(newComment);
    console.log(newComment)
    newComment.owner = req.user._id;
    await newComment.save();
    await blog.save();
    res.redirect(`/blog/${id}`);
}

module.exports.deleteComment = async (req, res) => {
    //res.send("it's working!!!!")
    const { id, commentId } = req.params;
    //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    //we remove the comment in the blog
    await Blog.findByIdAndUpdate(id, { $pull: { comment: commentId } })
    //remove the review from the Review model
    await Comment.findByIdAndDelete(commentId);
    res.redirect(`/blog/${id}`);
}