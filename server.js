const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt"); // for security
const dbConnect = require("./db/conn");
const User = require("./models/user");
const Note = require("./models/notes");
const auth = require("./auth/auth");
const jwt = require("jsonwebtoken");
const cors = require('cors');
app.use(cors());
app.use(require("./routes/notes"));
//connect to the database
dbConnect();

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
  
// configure use of bodyParser 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.json({messsage: "Hello! I am your server!"});
})
// register endpoint
app.post("/register", (request, response) => {
    // hash the password
    bcrypt
      .hash(request.body.password, 10)
      .then((hashedPassword) => {
        // create a new user instance and collect the data
        const user = new User({
          email: request.body.email,
          password: hashedPassword,
        });
  
        // save the new user
        user
          .save()
          // return success if the new user is added to the database successfully
          .then((result) => {
            response.status(201).send({
              message: "User Created Successfully",
              result,
            });
          })
          // catch erroe if the new user wasn't added successfully to the database
          .catch((error) => {
            response.status(500).send({
              message: "Error creating user",
              error,
            });
          });
      })
      // catch error if the password hash isn't successful
      .catch((e) => {
        response.status(500).send({
          message: "Password was not hashed successfully",
          e,
        });
      });
  });

// login endpoint 
app.post("/login", (request, response) => {
    User.findOne({email : request.body.email})
    .then((user) => {
        // once user has been found check if passwords match
        bcrypt.compare(request.body.password, user.password)
        .then((passwordCheck) =>{
            //check if password matches
            if (!passwordCheck) {
                return response.status(400).send({
                    message: "Passwords do not match",
                    error,
                });
            }

            const token = jwt.sign(
                {
                    userId: user._id,
                    userEmail: user.email,
                },
                "RANDOM-TOKEN",
                {expiresIn: "24h"}
            );

            response.status(200).send({
                message: "Login Successful",
                email: user.email,
                token,
            });
        })
        //catch error if passwords do not match
        .catch((error) => {
            response.status(400).send({
                message: "Passwords do not match and error",
                error,
            });
        });
    })
    .catch((e) => {
        response.status(401).send({
            message: "Email not found",
            e,
        });
    });
});




const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Successfully running on ${port}`);
})




