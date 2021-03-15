const express = require("express");
const app = express();
const mongoose = require("mongoose");
const url = "mongodb+srv://Sharan:chubb@12@cluster0.byij1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const userModel = require('./models/UserModel.js');
const channelModel = require('./models/ChannelModel.js');
const videoModel = require('./models/VideosModel.js');
const bcrypt= require('bcryptjs');
const json = require('jsonwebtoken');
const cors = require('cors');
const upload = require('./middleware/file-upload');
const { insertMany } = require("./models/UserModel.js");
app.use(cors());


app.use(express.json());
app.listen(process.env.PORT || 3000);


app.get("/",(req,res)=>{
    res.send({Status:"Hello World"});
})

//Authentication Function
async function authenticate(req,res,next)
{
    if(req.headers.authorization)
    {
        json.verify(req.headers.authorization,"NOTYOUTUBE",function(err,result){
            if(result)
            {
                next();
            }
            else
            {
                res.status(401).json({Status:"Not Authorized"});
            }
        });
    }
    else
    {
        res.status(401).json({Status:"No token present"});
    }
}

//check token
app.post('/checkToken',(req,res)=>{
    if(req.body.token)
    {
        json.verify(req.body.token,"NOTYOUTUBE",function(err,result){
            if(result)
            {
                res.status(200).json({Status:"Authorized"});
            }
            else
            {
                res.status(401).json({Status:"Not Authorized"});
            }
        });
    }
    else
    {
        res.status(401).json({Status:"No token present"});
    }
})

//Create new User
app.post('/createuser',async (req,res)=>{
    try {
        await mongoose.connect(url,{useNewUrlParser:true});
            let salt = await bcrypt.genSalt(10);
            let hash = await bcrypt.hash(req.body.password,salt);
            req.body.password = hash;
            const user = new userModel(req.body);
            user.createdon = Date.now();
            await user.save();
            await mongoose.disconnect();
            res.status(200).json({Status:"User Created"});
    } catch (error) {
        console.log(error);
        res.status(500).json(error); 
    }  
})


//Login
app.post('/login',async (req,res)=>{
    try {
        await mongoose.connect(url,{useNewUrlParser:true});
            const user = await userModel.findOne({email:req.body.email});
            await mongoose.disconnect();
            if(user)
            {
                let result = await bcrypt.compare(req.body.password,user.password);
                if(result)
                {
                    let token = json.sign({_id:user._id},"NOTYOUTUBE")
                    res.status(200).json({Status:"Success",token});
                }
                else
                {
                    res.status(401).json({Status:"Password Incorrect"});
                }
            }
            else
            {   
                res.status(404).json({Status:"User Not Found"});
            }
    } catch (error) {
        res.status(500).json(error); 
    }  
})

//Get User Details
app.get('/get/userDetails',authenticate,async(req,res)=>{
    try
    {
        token = req.headers.authorization;
        const decoded = json.decode(token);
        id = decoded._id;  
        await mongoose.connect(url,{useNewUrlParser:true});
        output = await userModel.findById(mongoose.Types.ObjectId(id)).select({firstname:1,lastname:1,email:1,mobileno:1,_id:0});
        await mongoose.disconnect();
        res.status(200).json({output,Status:"Success"});
    }
    catch(error)
    {
        res.status(500).json(error);
    }
})

//get Channel
app.get('/get/channelExist',authenticate,async(req,res)=>{
    try
    {
        output=false;
        token = req.headers.authorization;
        const decoded = json.decode(token);
        id = decoded._id;  
        await mongoose.connect(url,{useNewUrlParser:true});
        result = await userModel.findById(mongoose.Types.ObjectId(id)).select({channelId:1,_id:0});
        cid = result.channelId;
        if(result.channelId==null)
        {
            output = false;
        }
        else
        {
            output=true;
        }
        await mongoose.disconnect();
        res.status(200).json({output,cid,Status:"Success"});
    }
    catch(error)
    {
        res.status(500).json(error);
    }
})


//Post Channel
app.post('/createChannel',authenticate,async(req,res)=>{
    try
    {
        token = req.headers.authorization;
        const decoded = json.decode(token);
        id = decoded._id;  
        await mongoose.connect(url,{useNewUrlParser:true});
        const channel = new channelModel({'name':req.body.name});
        await channel.save();
        console.log(channel);
        result = await userModel.findByIdAndUpdate(mongoose.Types.ObjectId(id),{'channelId':channel._id});
        await mongoose.disconnect();
        res.status(200).json({Status:"Success"});
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json(error);
    }
})

app.post('/api/files/upload',authenticate,upload.array('video', 1), async(req, res) => {
    try
    {
        token = req.headers.authorization;
        const decoded = json.decode(token);
        id = decoded._id;  
        await mongoose.connect(url,{useNewUrlParser:true});
        result = await userModel.findById(mongoose.Types.ObjectId(id)).select({channelId:1,_id:0});
        cid = result.channelId;
        fileName = req.file;
        const video = new videoModel({'cid':cid,'fileName':fileName,'title':req.body.title});
        await video.save();
        await channelModel.findByIdAndUpdate(mongoose.Types.ObjectId(cid),{$push:{'videos':video._id}});
        await mongoose.disconnect();
        res.status(200).json(req.file);
    }
    catch(error)
    {   
        res.status(500).json(error);
    }
   });


   
app.get('/get/Videos',async(req,res)=>{
    try
    {
        const mongooseOpts = {
            useNewUrlParser: true,
            autoReconnect: true,
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 1000,
            poolSize: 10,
          };
          await mongoose.connect(url,mongooseOpts);
        output = await videoModel.find().select({title:1,cid:1,fileName:1,_id:1});
        await mongoose.disconnect();
        res.status(200).json({output,Status:"Success"});
    }
    catch(error)
    {
        res.status(500).json(error);
    }
})

app.get('/get/Video/:id',async(req,res)=>{
    try
    {
        await mongoose.connect(url, {useNewUrlParser: true});
        id = req.params.id;
        output = await videoModel.findById(mongoose.Types.ObjectId(id)).select({fileName:1,title:1,views:1,_id:0});
        await mongoose.disconnect();
        videourl = "https://notyoutube.s3.ap-south-1.amazonaws.com/" + output.fileName;
        views = output.views;
        title = output.title
        res.status(200).json({videourl,views,title,Status:"Success"});
    }
    catch(error)
    {
        res.status(500).json(error);
    }
})


app.put('/view/Video/:id',async(req,res)=>{
    try
    {
        await mongoose.connect(url, {useNewUrlParser: true});
        id = req.params.id;
        output = await videoModel.findByIdAndUpdate(mongoose.Types.ObjectId(id),{$inc:{views:1}});
        await mongoose.disconnect();
        res.status(200).json({Status:"Success"});
    }
    catch(error)
    {
        res.status(500).json(error);
    }
})

app.post('/comment',authenticate,async(req,res)=>{
    try
    {
        token = req.headers.authorization;
        const decoded = json.decode(token);
        id = decoded._id;  
        await mongoose.connect(url,{useNewUrlParser:true});
        insert={};
        vid = req.body.vid;
        user = await userModel.findById(mongoose.Types.ObjectId(id)).select({firstname:1,lastname:1,_id:0});
        insert.userName  = user.firstname+ " " + user.lastname;
        insert.value = req.body.value;
        result = await videoModel.findByIdAndUpdate(mongoose.Types.ObjectId(vid),{$push:{comments:insert}});
        await mongoose.disconnect();
        res.status(200).json({result,Status:"Success"});
    }
    catch(error)
    {
        res.status(500).json(error);
    }
})


app.get('/comments/:vid',async(req,res)=>{
    try
    { 
        await mongoose.connect(url,{useNewUrlParser:true});
        vid = req.params.vid;
        result = await videoModel.findById(mongoose.Types.ObjectId(vid)).select({comments:1,_id:0});
        comments = result.comments;
        await mongoose.disconnect();
        res.status(200).json({comments,Status:"Success"});
    }
    catch(error)
    {
        res.status(500).json(error);
    }
})

app.get('/get/likedVideos',authenticate,async(req,res)=>{
    try
    {
        token = req.headers.authorization;
        const decoded = json.decode(token);
        uid = decoded._id;
        await mongoose.connect(url,{useNewUrlParser:true});
        output = await userModel.findById(mongoose.Types.ObjectId(uid)).select({likedVideos:1,_id:0});
        await mongoose.disconnect();
        res.status(200).json({output,Status:"Success"});
    }
    catch(error)
    {
        res.status(500).json(error);
    }
})


app.post('/like/Video/:vid',authenticate,async(req,res)=>{
    try
    {
        token = req.headers.authorization;
        const decoded = json.decode(token);
        id = decoded._id;
        await mongoose.connect(url, {useNewUrlParser: true});
        vid = req.params.vid;
        output = await userModel.findByIdAndUpdate(mongoose.Types.ObjectId(id),{$push:{likedVideos:mongoose.Types.ObjectId(vid)}});
        await mongoose.disconnect();
        res.status(200).json({Status:"Success"});
    }
    catch(error)
    {
        res.status(500).json(error);
    }
})

app.post('/unlike/Video/:vid',authenticate,async(req,res)=>{
    try
    {
        token = req.headers.authorization;
        const decoded = json.decode(token);
        id = decoded._id;  
        await mongoose.connect(url, {useNewUrlParser: true});
        vid = req.params.vid;
        output = await userModel.findByIdAndUpdate(mongoose.Types.ObjectId(id),{$pull:{likedVideos:mongoose.SchemaTypes.ObjectId(vid)}});
        await mongoose.disconnect();
        res.status(200).json({Status:"Success"});
    }
    catch(error)
    {
        res.status(500).json(error);
    }
})


app.get('/get/channelVideos/:cid',async(req,res)=>{
    try
    {
        cid = req.params.cid; 
        await mongoose.connect(url,{useNewUrlParser:true});
        result = await channelModel.findById(mongoose.Types.ObjectId(cid)).select({videos:1,_id:0});
        output = await videoModel.find({'_id':{$in:result.videos}}).select({title:1,cid:1,fileName:1,_id:1});
        out2 = await videoModel.find({'_id':{$in:result.videos}}).select({views:1,_id:0});
        views=0;
        out2.forEach(video => {
            if(video.views!=undefined){
            views += video.views;
            }          
        });
        await mongoose.disconnect();
        res.status(200).json({output,views,Status:"Success"});
    }
    catch(error)
    {
        res.status(500).json(error);
    }
})



app.get('/get/searchVideos/:q',async(req,res)=>{
    try
    {
        q = req.params.q;
        const regex = new RegExp(q, 'i')
        await mongoose.connect(url,{useNewUrlParser:true});
        output = await videoModel.find({title: {$regex: regex}}).select({title:1,cid:1,fileName:1,_id:1});
        await mongoose.disconnect();
        console.log(output);
        res.status(200).json({output,Status:"Success"});
    }
    catch(error)
    {
        res.status(500).json(error);
    }
})