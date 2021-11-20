const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('mini').get(function () {
    return this.url.replace('/upload', '/upload/w_800,h_600')
})
ImageSchema.virtual('micro').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})
// // opts helps to enable virtuals in JSON
// const opts = { toJSON: { virtuals: true } }

const BlogSchema = new Schema({
    title: String,
    thumbnail: ImageSchema,
    content: String,
    description: String,
    comment: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    date: {
        type: Date,
        default: Date.now


    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }


})

const Blog = mongoose.model('Blog', BlogSchema);
module.exports = Blog;