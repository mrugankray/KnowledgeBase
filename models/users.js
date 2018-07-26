let mongoose = require('mongoose');

//UserSchema
let userSchema = mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    }
});

let Users = module.exports = mongoose.model('users',userSchema);