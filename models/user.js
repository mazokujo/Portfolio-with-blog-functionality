const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

const User = new Schema({
    email: {
        type: String,
        required: [true, 'Cannot login without email address'],
        unique: [true, 'this email address is already being used']
    },
    profile: [ImageSchema]
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);