//establish connection with mongoose
const mongoose = require('mongoose');
// export Blog model from blog.js
const Blog = require('../models/blog');
const Project = require('../models/project');
//mongoose connection
mongoose.connect('mongodb://localhost:27017/WebPortfolio', {
    useNewUrlParser: true,
    useUnifiedTopology: true,

});
// handling error in mongoose connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log("Database connected")
});

// we create 6 new campgrounds
const seedDB = async () => {
    //delete everything in the database
    await Blog.deleteMany({});
    await Project.deleteMany({});
    for (let i = 0; i < 6; i++) {
        const pr = new Project({
            title: 'Bloodborne a rite of passage for those for the aspiring hardcore gamer',
            thumbnail: [
                {
                    url: 'https://static0.gamerantimages.com/wordpress/wp-content/uploads/2021/07/bloodborne-goty-remaster-rumors.jpg?q=50&fit=contain&w=960&h=500&dpr=1.5',
                    filename: 'bloodborne'
                }

            ],
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab asperiores molestias facilis ullam placeat consequatur omnis quos nam odit quis sunt, veritatis nobis! Eveniet animi explicabo recusandae deserunt nam eum?'
        })
        const index = new Blog({
            title: 'Bloodborne a rite of passage for those for the aspiring hardcore gamer',
            thumbnail: [
                {
                    url: 'https://static0.gamerantimages.com/wordpress/wp-content/uploads/2021/07/bloodborne-goty-remaster-rumors.jpg?q=50&fit=contain&w=960&h=500&dpr=1.5',
                    filename: 'bloodborne'
                }

            ],
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab asperiores molestias facilis ullam placeat consequatur omnis quos nam odit quis sunt, veritatis nobis! Eveniet animi explicabo recusandae deserunt nam eum?'

        });
        // save new datas in Mongo
        await index.save();
        await pr.save();

    }
}

const deleteOne = async () => {
    await Blog.deleteMany({});
}
deleteOne()
    .then(res => {
        console.log(res)
    })
    .catch(e => {
        console.log(e)
    })
