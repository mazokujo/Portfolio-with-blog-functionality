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

const ProjectSchema = new Schema({
    title: String,
    thumbnail: [ImageSchema],
    category: String,
    content: String,
    client: String,
    description: String,
    date: {
        type: Date,

    },

    url: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

})

const Project = mongoose.model('Project', ProjectSchema);
module.exports = Project;