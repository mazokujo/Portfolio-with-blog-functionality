const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})
const CommentSchema = new Schema({
    text: String,
    profile: [ImageSchema],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
});
//exporting Review model

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;