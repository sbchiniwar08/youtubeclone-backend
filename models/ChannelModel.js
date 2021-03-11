const mongoose = require('mongoose');
const validator = require('validator');

const privateVideo = new mongoose.Schema({
    title:{
        type: String,
        trim: true,
        unique: true,
    },
    _id:{type:mongoose.SchemaTypes.ObjectId},
    tags:{type:[String]},
    fileName:{type:String},
    cid:{type:mongoose.SchemaTypes.ObjectId},
})

const ChannelSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    videos:[mongoose.SchemaTypes.ObjectId],
    private:[privateVideo]

});
const channel = mongoose.model("Channel",ChannelSchema);
module.exports = channel;
