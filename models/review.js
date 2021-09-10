const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})
const ReviewSchema = new Schema({
    text: {
        type: String,
        required: [true, "Can't submit without comment"]
    },
    profile: [ImageSchema],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
});
//exporting Review model

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;