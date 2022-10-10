const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

//userSchema 
const userSchema = new mongoose.Schema({
    email: {
        type: String, 
        required: [true, "Please provide an Email"],
        unique: [true, "Email exists"],
    },
    
    // password field
    password : {
        type: String, 
        required: false,
    },
    notes : [{type: mongoose.Schema.Types.ObjectId, ref: 'Note'}],
    googleId : String,
    // facebookId : String
})


userSchema.pre('save',function(next){
    if(!this.isModified('password'))
        return next();
    bcrypt.hash(this.password,10,(err,passwordHash)=>{
        if(err)
            return next(err);
        this.password = passwordHash;
        next();
    });
});

userSchema.methods.comparePassword = function(password,cb){
    bcrypt.compare(password,this.password,(err,isMatch)=>{
        if(err)
            return cb(err);
        else{
            if(!isMatch)
                return cb(null,isMatch);
            return cb(null,this);
        }
    });
}


module.exports = mongoose.model("User", userSchema);