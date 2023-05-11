const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose')
const userShema = new mongoose.Schema ({
    firstName : String,
    lastName : String,
    email : String,
    password :{
        type : String
    },
    role:{
        type:String,
        default:'student'
    },
    resetPasswordToken : String,
    resetPasswordExpires : Date,
    firstAccess: {
        type: Date,
        default: new Date
      },
      lastAccess: {
        type: Date,
        default: Date.now
      }
}
);
userShema.plugin(passportLocalMongoose,{usernameField:'email'})
module.exports=mongoose.model('User',userShema)
