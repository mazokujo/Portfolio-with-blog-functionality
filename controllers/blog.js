// require Campground model
const Blog = require('../models/blog');
// cloudinary
const { cloudinary } = require("../cloudinary");


module.exports.blogIndex = async (req, res) => {
    const blogs = await Blog.find({})
    res.render('blog/index', { blogs })
}

module.exports.renderNewForm = (req, res) => {
    res.render('blog/new', { blog: new Blog() })
}
module.exports.createBlog = async (req, res) => {
    const newBlog = await new Blog(req.body)
    console.log(req.file)
    newBlog.thumbnail = { url: req.file.path, filename: req.file.filename }
    console.log(newBlog.thumbnail)
    newBlog.owner = req.user._id;
    await newBlog.save();
    // we use a flash message before redirecting
    req.flash('success', 'blog has been added');
    res.redirect(`/blog/${newBlog._id}`)
}
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const blog = await Blog.findById(id);
    if (!blog) {
        req.flash('error', 'Cannot find that blog')
        return res.redirect('/blog')
    }
    res.render('blog/edit', { blog });
}
module.exports.editBlog = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const blog = await Blog.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    const newImg = { url: req.file.path, filename: req.file.filename }
    blog.thumbnail = newImg;
    await blog.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
    }
    req.flash('success', 'the blog has been edited!')
    res.redirect(`/blog/${blog._id}`)
}

// cool edit code
// db.products.update(
//     { _id: 100 },
//     {
//         $set:
//         {
//             quantity: 500,
//             details: { model: "14Q3", make: "xyz" },
//             tags: ["coats", "outerwear", "clothing"]
//         }
//     }
// )

module.exports.showBlog = async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate({
        path: 'comment',
        populate: {
            path: 'owner'
        }
    }).populate('owner');
    if (!blog) {
        req.flash('error', 'Cannot find that blog')
        res.redirect('/blog')
    }
    console.log(blog)
    const currentUser = req.user
    res.render('blog/show', { blog, currentUser })
}
module.exports.deleteBlog = async (req, res, next) => {
    const { id } = req.params;
    const deletedBlog = await Blog.findByIdAndDelete(id);
    // we use a flash message before redirecting
    req.flash('success', 'blog has been deleted');
    res.redirect('/blog');
}

