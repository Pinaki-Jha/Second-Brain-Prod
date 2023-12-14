const mongoose = require("mongoose")

const Content = new mongoose.Schema({
    id: String,
    _id: mongoose.Schema.Types.ObjectId,
    heading: String,
    text: String,
    row: Number,
})

const SectionSubsection = new mongoose.Schema({ 
    id: String,
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    content: [Content]
    })

const Project = new mongoose.Schema({
    id: String,
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    itemList: [SectionSubsection]
})
const Projects = new mongoose.Schema({
    id: String,
    _id: mongoose.Schema.Types.ObjectId,
    heading: String,
    content:[Project]
})

const ToDo = new mongoose.Schema({
    id: String,
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    completed: Boolean,
})

const User = new mongoose.Schema({
    username : {type:String, required:true},
    email:{type:String, required:true,unique:true},
    password:{type:String, required:true},
    bookList: [SectionSubsection],
    projectList: [Projects],
    toDoList: [ToDo],



},{collection : 'user-data'})


const model = mongoose.model("UserData",User)

module.exports = model

