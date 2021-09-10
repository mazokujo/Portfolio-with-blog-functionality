if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
// cloudinary
const { cloudinary } = require("./cloudinary");
//require multer
const { storage } = require('./cloudinary')
const multer = require('multer')
const upload = multer({ storage })

//ejs-mate (to improve html template)
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const Blog = require('./models/blog')
const Review = require('./models/review')
const Project = require('./models/project')
//const User = require('./models/user')
// mongoose.connect('mongodb://localhost:27017/WebPortfolio', { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => {
//         console.log("MONGO CONNECTION OPEN!!!")
//     })
//     .catch(err => {
//         console.log("OH NO MONGO CONNECTION ERROR!!!!")
//         console.log(err)
//     })
const dbLocal = 'mongodb://localhost:27017/WebPortfolio'
mongoose.connect(dbLocal, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // //remove mongoose deprecation error 
    // useFindAndModify: false,

});
// handling error in mongoose connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log("Database connected")
    console.log(dbLocal)
});
//ejs engine
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// public directory: middleware to enable static files in our boilerplate
app.use(express.static(path.join(__dirname, 'public')));


//route to home
app.get('/', async (req, res) => {
    const blogs = await Blog.find({})
    const projects = await Project.find({})
    res.render('home', { blogs, projects })
});
//blog index
app.get('/blog', async (req, res) => {
    const blogs = await Blog.find({})
    res.render('blog/index', { blogs })
})

//route to projects
app.get('/project', async (req, res) => {
    const projects = await Project.find({})
    res.render('project/index', { projects })
})
// create a project
app.get('/project/new', async (req, res) => {
    res.render('project/new', { project: new Project() })
});

app.post('/project', upload.array('thumbnail'), async (req, res) => {
    const newProject = await new Project(req.body)
    console.log(req.files)
    newProject.thumbnail = req.files.map(f => ({ url: f.path, filename: f.filename }))
    await newProject.save();
    // // we use a flash message before redirecting
    // req.flash('success', 'farm has been added');
    res.redirect(`/project/${newProject._id}`)

});

// create a blog
app.get('/blog/new', async (req, res) => {
    res.render('blog/new', { blog: new Blog() })
});
app.post('/blog', upload.single('thumbnail'), async (req, res) => {
    const newBlog = await new Blog(req.body)
    console.log(req.file)
    newBlog.thumbnail = { url: req.file.path, filename: req.file.filename }
    console.log(newBlog.thumbnail)
    await newBlog.save();
    // // // // we use a flash message before redirecting
    // // // req.flash('success', 'farm has been added');
    res.redirect(`/blog/${newBlog._id}`)
});

//route to single project
app.get('/project/:id', async (req, res) => {
    const project = await Project.findById(req.params.id)
    console.log(project)
    res.render('project/show', { project })
})

//route to a single blog 
app.get('/blog/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id)
    console.log(blog)
    res.render('blog/show', { blog })
});
//connection to port 3000
app.listen(3000, () => {
    console.log("APP IS LISTENING ON PORT 3000!")
})