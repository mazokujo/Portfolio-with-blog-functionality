const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReplySchema = new Schema({
    text: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
})

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})
const CommentSchema = new Schema({
    text: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reply: [ReplySchema]
});
//exporting Review model

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;