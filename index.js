const express = require('express');
const cors = require("cors")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const User = require("./models/user.model")
const bcrypt = require("bcryptjs")
require("dotenv").config();



const app = express();

//middlewares
app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

mongoose.connect(process.env.MONGODB_URI)



app.post('/api/register', async (req,res)=>{
    try{        
        const newPassword = await bcrypt.hash(req.body.password,10)
        await User.create({
            username : req.body.username,
            email : req.body.email,
            password : newPassword,

            bookList : [
                {id:"0", name:"Reading List", content:[],},
            ],

            projectList : [{
                id:"0",
                heading:"default projects", content:[],},],

            toDoList : []

          

    })
        console.log(req.body)
        return res.json({status:"ok", message:"Registration Successful. Please Log In.", color:"text-blue-500"})
    }catch(err){
        console.log(err)
        return res.json({status:"error", message: "A user with that Email already exists", color:"text-red-500"})
    }
    
})



app.post('/api/login', async (req, res) =>{
    try{
    const user = await User.findOne({email: req.body.email})
    if(!user){return res.json({status:"not ok",user:false,message:"No user with that email registered"})}
    const isPassValid = await bcrypt.compare(req.body.password, user.password)
    if(isPassValid){
        const token = jwt.sign({
            username : user.username,
            email : user.email,
        }, "secret123", {expiresIn:'1d'})

        return res.json({status:"ok", user:token, message:"login successful"})
    }
    else{
        return res.json({status:"not ok",user:false, message: "Please check your password."})
    }
}catch(err){
    console.log(err);
    return res.json({status:"error", user:false, message:"blehh"})
}
})



app.post('/api/updatetodo', async (req, res) =>{
    const user = await User.findOne({email: req.body.email})
    if(user){
        user.toDoList = req.body.toDoList;
        await user.save();
        return res.json({status:"ok", message:"tasks updated successfully"})
    }
    else{

        return res.json({status:"error", message: "Nahi hua bhai"})
    }
})

app.post('/api/updateprojectlist', async(req,res)=>{
  const user = await User.findOne({email: req.body.email})
  if(user){
    user.projectList = req.body.projectList;
    await user.save();
    return res.json({status:"ok", message:"Projects Updated Successfully"})
  }else{
    return res.json({status:"error", message: "Nahi hua bhai"})

  }
})

app.post('/api/updatesectionbooklist', async(req,res)=>{
    const user = await User.findOne({email:req.body.email});
    if(user){
        user.bookList = req.body.itemList;
        await user.save();
        return res.json({status:"ok"})
    }
    else{
        return res.json({status:"not ok"})
    }
})


app.post('/api/updatesectionbooklistupdatecontent', async(req,res)=>{
    try{
    const user = await User.findOne({email:req.body.email});
    if(user){
        const booklist = user.bookList;
        //console.log(booklist)
        const newBooklist = booklist.map(book=>{

            if (book.id === req.body.parentid){
                const newbookContent = book.content.map(stuff=>{
                    if(stuff.id === req.body.id){
                        const newStuff = {id:stuff.id, heading:req.body.heading, text:req.body.text, row:req.body.row}
                        return newStuff;
                    }
                    else{
                        return stuff;
                    }

                })

                const newBook = {id:book.id, name:book.name, content:newbookContent}
                return newBook;
            }
            else{
                return book;
            }
        })

        user.bookList = newBooklist;
        //console.log(user.bookList)
        await user.save();
        return res.json({status:"ok"})

        //console.log(newBooklist)
    }
    else{
        return res.json({status:"not ok"})
    }
    }catch(error){
        console.log(error)
        return res.json({status:"error"})
    }
})

app.post('/api/updatesectionprojectlist', async(req,res)=>{
    const user = await User.findOne({email:req.body.email});
    if (user){
        const projectlist = user.projectList;
        const newProjectlist = projectlist.map(projects=>{
            const newProjectContent = projects.content.map(project=>{
                if(project.id ===req.body.projectID){
                    //console.log(req.body.itemList)
                    const newProject = {id:project.id,name:project.name, itemList:req.body.itemList}
                    //console.log(newProject);
                    return newProject;
                }
                else{
                    return project;
                }
            })
            const newProjects = {id:projects.id, heading:projects.heading, content:newProjectContent}
            return newProjects;
        })
        user.projectList = newProjectlist;
        await user.save();
        return res.json({status:"ok"})
    }
    else{
        return res.json({status:"not ok"})
    }
})

app.post('/api/updatesectionprojectlistupdatecontent',async (req,res)=>{
    const user = await User.findOne({email:req.body.email});

    if(user){
        const projectlist = user.projectList;
        const newProjectlist = projectlist.map(projects=>{
            const newProjectContent = projects.content.map(project=>{
                if(project.id ===req.body.projectID){
                    //console.log(req.body.itemList)
                    const newItemlist =  project.itemList.map(psection=>{

                        if (psection.id === req.body.parentid){
                            const newPSectionContent = psection.content.map(stuff=>{
                                if(stuff.id === req.body.id){
                                    const newStuff = {id:stuff.id, heading:req.body.heading, text:req.body.text, row:req.body.row}
                                    return newStuff;
                                }
                                else{
                                    return stuff;
                                }
            
                            })
            
                            const newPSection = {id:psection.id, name:psection.name, content:newPSectionContent}
                            return newPSection;
                        }
                        else{
                            return psection;
                        }
                    })


                    const newProject = {id:project.id,name:project.name, itemList:newItemlist}
                    //console.log(newProject);
                    return newProject;
                }
                else{
                    return project;
                }
            })
            const newProjects = {id:projects.id, heading:projects.heading, content:newProjectContent}
            return newProjects;
        })


        user.projectList = newProjectlist;
        await user.save();
        

    }

})









app.post('/api/gettodo', async(req,res)=>{
    const user = await User.findOne({email:req.body.email});

    if(user){
        //console.log(user.toDoList)
        return res.json({status:"ok",todo:user.toDoList, message:"yelo tumhaari todo list"})
        
    }
    else{
        return res.json({status:"not ok"})
    }
})

app.post('/api/getprojectlist', async(req,res)=>{
  const user = await User.findOne({email:req.body.email});
  //console.log("yay")

  if (user){
    return res.json({status:"ok", projectlist: user.projectList, message:"yelo tumhaari project list"})
  }
  else{
    return res.json({status:"not ok"})
  }
})

app.post('/api/getbooklist', async(req,res)=>{
    const user = await User.findOne({email:req.body.email});
    if(user){
        return res.json({status:"ok", booklist: user.bookList, message:"yelo tumhaari book list"})
    }
    else{
        return res.json({status:"not ok"})
    }
})


app.use('*',  (req, res) => {
    res.sendFile((__dirname+ '/dist/index.html'));
});
    



app.listen(process.env.PORT || 3000, ()=>{
    console.log("server started on port 3000")
})