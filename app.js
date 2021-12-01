if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');

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

//require mongoose express sanitise and helmet: need npm installation
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");


//mongoose and mongoose models
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongo');
const User = require('./models/user')
// require  routes
const blogRoutes = require('./router/blog');
const projectRoutes = require('./router/project');
const commentRoutes = require('./router/comment');
const homeRoutes = require('./router/home');
const userRoutes = require('./router/user');

//require new class for error handling: appError
const AppError = require('./Errorhandling utilities/appError');

//connect mongo atlas
const dbLocal = 'mongodb://localhost:27017/WebPortfolio'
const dbUrl = process.env.DB_URL
mongoose.connect(dbUrl, {
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
    console.log(dbUrl)
});

//ejs engine
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// public directory: middleware to enable static files in our boilerplate
app.use(express.static(path.join(__dirname, 'public')));
//url encoded
app.use(express.urlencoded({ extended: true }));
//use method override
app.use(methodOverride('_method'));
//JSON conversion to string middleware
app.use(express.json());

//create new mongostore which change default storage of session from browser to mongo
// setting up the secret for our session


const secret = process.env.SECRET || 'mysecret'
const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})

store.on('error', function (e) {
    console.log("SESSION STORE ERROR", e)
})
// setting express-session and flash
const sessionParam = {
    store,
    name: 'portfolio',
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

// execute  mongoose-express sanitise and helmet
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://fonts.googleapis.com/",
    "https://fonts.gstatic.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];

const fontSrcUrls = []

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'"],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com/"],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dcsoakvpl/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", "https://fonts.gstatic.com/", "assets/vendor/swiper/swiper-bundle.min.js.map", "https://fonts.gstatic.com/", ...fontSrcUrls]
        },
    })
);

//we can also add req.user object, it will be accessed in every single request
app.use((req, res, next) => {
    if (!['/login'].includes(req.originalUrl)) {
        console.log(req.originalUrl)
        req.session.returnto = req.originalUrl
    }
    console.log(req.query)
    console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    next()
})


//All routes

// All blog routes
app.use('/blog', blogRoutes);
// All project routes
app.use('/project', projectRoutes);
//All comment routes
app.use('/blog/:id/comment', commentRoutes);
//All user routes
app.use('', userRoutes);
//All home routes
app.use('/', homeRoutes)
//route to resume 
app.get('/resume', (req, res) => {
    res.render('resume')
})

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
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`APP IS LISTENING ON PORT ${port}!`)
})