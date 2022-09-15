const mongoose = require("mongoose");
require('dotenv').config()

async function dbConnect() {
    mongoose.connect(
        process.env.DB_URL,
        {
            useNewUrlParser : true, 
            useUnifiedTopology: true,
            dbName: "keeper-app"
        },
    )
    .then(() => {
        console.log("Successfully connected to Mongo DB Atlas")
    })
    .catch((error) => {
        console.log("unable to connect to MongoDB Atlas!");
        console.log(error);
    })
}

module.exports = dbConnect;

