const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('mini').get(function () {
    return this.url.replace('/upload', '/upload/w_800,h_600')
})

const ProjectSchema = new Schema({
    title: String,
    thumbnail: [ImageSchema],
    category: String,
    content: String,
    client: String,
    date: {
        type: Date,
        default: Date.now
    },

    url: String

})

const Project = mongoose.model('Project', ProjectSchema);
module.exports = Project;