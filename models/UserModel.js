const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: true,
        trim: true
    },
    lastname:{
        type: String,
        required: true,
        trim: true
    },
    email:
    {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: (value)=>{
            return validator.isEmail(value)
        }
    },
    password:
    {
        type: String,
        required: true
    },
    mobileno:
    {
        type: Number,
        required: true
    },
    dob:
    {
        type: String,
        required: true
    },
    createdon:
    {
        type: Date,
        required: true
    },
    channelId:
    {
        type: mongoose.SchemaTypes.ObjectId,
    },
    likedVideos:
    {
        type:[mongoose.SchemaTypes.ObjectId],
        unique: true,
    },
    comments:
    {
        type:[mongoose.SchemaTypes.ObjectId],
    }

});
const user = mongoose.model("User",UserSchema);
module.exports = user;