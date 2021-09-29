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

//require passport
const passport = require('passport')
//require passport-local
const localStrategy = require('passport-local')
// require express session and connect-flash
const session = require('express-session');
const flash = require('connect-flash');

//ejs-mate (to improve html template)
const ejsMate = require('ejs-mate');
//require method override for put, push, delete route
const methodOverride = require('method-override');
//require nodemailer
const nodemailer = require('nodemailer')

//mongoose and mongoose models
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongo');
const Blog = require('./models/blog')
const Comment = require('./models/comment')
const Project = require('./models/project')
const User = require('./models/user')
//loggedin middleware, isOwner middleware, validate campground middleware
const { isLoggedin, isBlogOwner, isCommentOwner, isProjectOwner, validateBlog, validateProject, validateComment } = require('./middleware');
//error handling utilities
const wrapAsync = require('./Errorhandling utilities/wrapAsync');
//require new class for error handling: appError
const AppError = require('./Errorhandling utilities/appError');

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

//use method override
app.use(methodOverride('_method'));

//ejs engine
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// public directory: middleware to enable static files in our boilerplate
app.use(express.static(path.join(__dirname, 'public')));
//url encoded
app.use(express.urlencoded({ extended: true }));
//JSON conversion to string middleware
app.use(express.json());

//create new mongostore which change default storage of session from browser to mongo
// setting up the secret for our session
const secret = 'mysecret'
const store = new MongoDBStore({
    mongoUrl: dbLocal,
    secret,
    touchAfter: 24 * 60 * 60
})

store.on('error', function (e) {
    console.log("SESSION STORE ERROR", e)
})
// setting express-session and flash
const sessionParam = {
    store,
    name: 'kreativeK',
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        //secure:true,
        //specifies the life of a cookie, in our case 1 week
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionParam));
app.use(flash());
//execute passport,localStrategy
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

//serialise user and deserialise user(associaciate or disassociate the user to the session or log him out of the session)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//we can also add req.user object, it will be accessed in every single request
app.use((req, res, next) => {
    if (!['/login', '/'].includes(req.originalUrl)) {
        console.log(req.originalUrl)
        req.session.returnTo = req.originalUrl
    }
    console.log(req.query)
    console.log(req.session);
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next()
})





//blog index
app.get('/blog', wrapAsync(async (req, res) => {
    const blogs = await Blog.find({})
    res.render('blog/index', { blogs })
}))

//route to projects
app.get('/project', wrapAsync(async (req, res) => {
    const projects = await Project.find({})
    res.render('project/index', { projects })
}))
// create a project
app.get('/project/new', isLoggedin, wrapAsync(async (req, res) => {
    res.render('project/new', { project: new Project() })
}));

app.post('/project', upload.array('thumbnail'), isLoggedin, wrapAsync(async (req, res) => {
    const newProject = await new Project(req.body)
    console.log(req.files)
    newProject.thumbnail = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newProject.owner = req.user._id;
    console.log(newProject.owner)
    await newProject.save();
    // we use a flash message before redirecting
    req.flash('success', 'project has been added');
    res.redirect(`/project/${newProject._id}`)

}));

// create a blog
app.get('/blog/new', isLoggedin, wrapAsync(async (req, res) => {
    res.render('blog/new', { blog: new Blog() })
}));
app.post('/blog', upload.single('thumbnail'), isLoggedin, wrapAsync(async (req, res) => {
    const newBlog = await new Blog(req.body)
    console.log(req.file)
    newBlog.thumbnail = { url: req.file.path, filename: req.file.filename }
    console.log(newBlog.thumbnail)
    newBlog.owner = req.user._id;
    await newBlog.save();
    // we use a flash message before redirecting
    req.flash('success', 'blog has been added');
    res.redirect(`/blog/${newBlog._id}`)
}));

// edit a project
app.get('/project/:id/edit', isLoggedin, isProjectOwner, wrapAsync(async (req, res) => {
    const { id } = req.params
    const project = await Project.findById(id);
    if (!project) {
        req.flash('error', 'Cannot find that project')
        return res.redirect('/project')
    }
    res.render('project/edit', { project });
}))

app.put('/project/:id', upload.array('thumbnail'), isLoggedin, isProjectOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const project = await Project.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    const newImgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    project.thumbnail.push(...newImgs);
    await project.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await project.updateOne({ $pull: { thumbnail: { filename: { $in: req.body.deleteImages } } } }, { new: true })
    }
    req.flash('success', 'the project has been edited!')
    res.redirect(`/project/${project._id}`)

}))

//edit a blog
app.get('/blog/:id/edit', isLoggedin, isBlogOwner, wrapAsync(async (req, res) => {
    const { id } = req.params
    const blog = await Blog.findById(id);
    if (!blog) {
        req.flash('error', 'Cannot find that blog')
        return res.redirect('/blog')
    }
    res.render('blog/edit', { blog });
}))

app.put('/blog/:id', upload.single('thumbnail'), isLoggedin, isBlogOwner, wrapAsync(async (req, res) => {
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
}))


// delete blog
app.delete('/blog/:id', isBlogOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedBlog = await Blog.findByIdAndDelete(id);
    // we use a flash message before redirecting
    req.flash('success', 'blog has been deleted');
    res.redirect('/blog');
}))

//delete project
app.delete('/project/:id', isProjectOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedProject = await Project.findById(id);
    for (let filename of deletedProject.thumbnail[0].filename) {
        await cloudinary.uploader.destroy(filename)
    }
    await Project.findByIdAndDelete(deletedProject._id)

    // we use a flash message before redirecting
    req.flash('success', 'blog has been deleted');
    res.redirect('/project');
}))


//route to single project
app.get('/project/:id', wrapAsync(async (req, res) => {
    const project = await Project.findById(req.params.id)
    console.log(project)
    if (!project) {
        req.flash('error', 'Cannot find that project')
        res.redirect('/project')
    }
    res.render('project/show', { project })
}))
//route to a single blog 
app.get('/blog/:id', wrapAsync(async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate('comment')
    console.log(blog)
    res.render('blog/show', { blog })
}));

//COMMENT ROUTES

//post a comment
app.post('/blog/:id/comment', isLoggedin, wrapAsync(async (req, res) => {

    const { id } = req.params;
    const blog = await Blog.findById(id);
    const newComment = await new Comment(req.body);
    blog.comment.push(newComment);
    console.log(newComment)
    newComment.owner = req.user._id;
    await newComment.save();
    await blog.save();
    res.redirect(`/blog/${id}`);
}));


//delete comment
app.delete('/blog/:id/comment/:commentId', isLoggedin, isCommentOwner, wrapAsync(async (req, res) => {
    //res.send("it's working!!!!")
    const { id, commentId } = req.params;
    //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    //we remove the comment in the blog
    await Blog.findByIdAndUpdate(id, { $pull: { comment: commentId } })
    //remove the review from the Review model
    await Comment.findByIdAndDelete(commentId);
    res.redirect(`/blog/${id}`);
}))

//USER ROUTES

//route to register user(sign up)
app.get('/register', (req, res) => {
    res.render('users/register')
})
app.post('/register', wrapAsync(async (req, res) => {
    try {
        const { email, username, password } = (req.body)
        const user = await new User({ email, username });
        const registeredUser = await User.register(user, password)
        console.log(registeredUser);
        //login the registeredUser.
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'You are logged in!')
            res.redirect('/');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }
}))

// route to login
app.get('/login', (req, res) => {
    res.render('users/login')
})
app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: 'login' }), (req, res) => {
    req.flash('success', 'Welcome back!');
    //remember  original Url before login and redirect to original Url after login
    const returnToUrl = req.session.returnTo || '/'
    //delete returnTo in the req.session object
    delete req.session.returnTo
    res.redirect(returnToUrl);
})

//logout route
app.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye');
    res.redirect('/')
})


//send an email from the landing page
app.post('/', (req, res) => {
    console.log(req.body)
    //transport info to our email in object transporter

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ACCOUNT,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    const mailOptions = {
        from: req.body.email,
        to: process.env.EMAIL_ACCOUNT,
        subject: `Message from ${req.body.email} : ${req.body.subject}`,
        text: req.body.message
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.send('error');
        } else {
            console.log('Email sent:' + info.response)
            res.send('success')
        }
    })

})


//route to home
app.get('/', async (req, res) => {
    const blogs = await Blog.find({})
    const projects = await Project.find({})
    res.render('home', { blogs, projects })
});
// // handling all remaining error
// app.all('*', (req, res, next) => {
//     next(new AppError('Page Not Found', 404))
// })
// error handling middleware with custom message notification
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    console.log(err)
    // change stack message
    res.status(statusCode).render('error', { err })
})




//connection to port 8000
app.listen(3000, () => {
    console.log("APP IS LISTENING ON PORT 3000!")
})