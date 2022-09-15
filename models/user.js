const mongoose = require("mongoose");

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
        required: true,
    },
})

module.exports = mongoose.model.User || mongoose.model("User", userSchema);