//require nodemailer
const nodemailer = require('nodemailer')

const Blog = require('../models/blog')
const Project = require('../models/project')

module.exports.homePage = async (req, res) => {
    const blogs = await Blog.find({})
    const projects = await Project.find({})
    const currentUser = req.user;
    res.render('home', { blogs, projects, currentUser })
}

module.exports.postMessage = (req, res) => {
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
}