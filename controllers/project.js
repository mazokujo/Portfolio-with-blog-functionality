// require Campground model
const Project = require('../models/project');
// cloudinary
const { cloudinary } = require("../cloudinary");


module.exports.projectIndex = async (req, res) => {
    const projects = await Project.find({})
    res.render('project/index', { projects })
}

module.exports.renderNewForm = (req, res) => {
    res.render('project/new', { project: new Project() })
}
module.exports.createProject = async (req, res) => {
    const newProject = await new Project(req.body)
    console.log(req.files)
    newProject.thumbnail = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newProject.owner = req.user._id;
    console.log(newProject.owner)
    await newProject.save();
    // we use a flash message before redirecting
    req.flash('success', 'project has been added');
    res.redirect(`/project/${newProject._id}`)
}
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const project = await Project.findById(id);
    if (!project) {
        req.flash('error', 'Cannot find that project')
        return res.redirect('/project')
    }
    res.render('project/edit', { project });
}
module.exports.editProject = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const project = await Project.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    const newImgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    project.thumbnail.push(...newImgs);
    await project.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await project.updateOne({ $pull: { thumbnail: { filename: { $in: req.body.deleteImages } } } }, { new: true })
    }
    req.flash('success', 'the project has been edited!')
    res.redirect(`/project/${project._id}`)
}


module.exports.showProject = async (req, res) => {
    const project = await Project.findById(req.params.id).populate('owner');
    console.log(project)
    if (!project) {
        req.flash('error', 'Cannot find that project')
        res.redirect('/project')
    }
    const currentUser = req.user
    res.render('project/show', { project, currentUser })


}
module.exports.deleteProject = async (req, res, next) => {
    const { id } = req.params;
    const deletedProject = await Project.findById(id);
    for (let filename of deletedProject.thumbnail[0].filename) {
        await cloudinary.uploader.destroy(filename)
    }
    await Project.findByIdAndDelete(deletedProject._id)

    // we use a flash message before redirecting
    req.flash('success', 'blog has been deleted');
    res.redirect('/project');
}