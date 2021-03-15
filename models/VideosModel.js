const mongoose = require('mongoose');
const validator = require('validator');


const comment = new mongoose.Schema({
    value:{type:String},
    userName:{type:String}
})
const VideoSchema = new mongoose.Schema({
    title:{
        type: String,
        trim: true,
        required:true,
        unique: true,
    },
    tags:{type:[String]},
    fileName:{type:String},
    cid:{type:mongoose.SchemaTypes.ObjectId},
    comments:[comment],
    views:{
        type:Number
    }
})

const video = mongoose.model("Video",VideoSchema);
module.exports = video;