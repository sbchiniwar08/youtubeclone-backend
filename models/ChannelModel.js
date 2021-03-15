const mongoose = require('mongoose');
const validator = require('validator');

const ChannelSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique:true,
        trim: true
    },
    videos:{
        type:[mongoose.SchemaTypes.ObjectId]}

});
const channel = mongoose.model("Channel",ChannelSchema);
module.exports = channel;