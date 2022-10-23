const express = require("express");
const session = require("express-session");
const userRouter = express.Router();
const passport = require("passport");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const User = require("../models/user");
const Note = require("../models/notes");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const dbConnect = require("../db/conn");
const cors = require("cors");
const corsOptions = {
  origins: "https://keeper-app-hammad.netlify.app",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
dbConnect();
userRouter.use(cors(corsOptions));

userRouter.use(cookieParser());
userRouter.use(bodyParser.json());
userRouter.use(bodyParser.urlencoded({ extended: true }));
userRouter.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 },
    // store: MongoConnect.create
  })
);
userRouter.use(passport.initialize());
userRouter.use(passport.session());


const signToken = (userId) => {
  return jwt.sign(
    {
      userId: userId,
    },
    process.env.SECRET,
    { expiresIn: "24h" }
  );
};

userRouter.post("/register", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err)
      res.status(500).json({
        message: {
          msgBody: "Error has occurred making user",
          msgError: true,
        },
      });
    if (user)
      res.status(500).json({
        message: {
          msgBody: "Error has occurred user already exists",
          msgError: true,
        },
      });
    else {
      const newUser = new User({ email, password });
      newUser.save((err) => {
        if (err)
          res.status(500).json({
            message: { msgBody: "Error has occured", msgError: true },
          });
        else {
          res.status(201).json({
            message: {
              msgBody: "Account successfully created",
              msgError: false,
            },
          });
        }
      });
    }
  });
});

userRouter.post(
  "/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    if (req.isAuthenticated()) {
      const { _id, email } = req.user;

      const token = jwt.sign(
        {
          userId: _id,
        },
        process.env.SECRET,
        { expiresIn: "24h" }
      );

      res.cookie(process.env.SECRET, token);
      res
        .status(200)
        .json({ isAuthenticated: true, user: { email }, token: token });
    }
  }
);



userRouter.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// userRouter.get(
//   "/auth/google/notes",
//   passport.authenticate("google", {
//     failureRedirect: "http://localhost:3000/login",
//     session : false
//   }),
//   async (req, res) => {
//     if (req.isAuthenticated()) {
//       const { _id, email } = req.user;

//       const token = jwt.sign(
//         {
//           userId: _id,
//         },
//         process.env.SECRET,
//         { expiresIn: "24h" }
//       );

//       res.cookie(process.env.SECRET, token);

//       res.redirect("http://localhost:3000");
//     }
//   }
// );

userRouter.get(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.clearCookie(process.env.SECRET);
    res.json({ user: { email: "" }, success: true });
  }
);

userRouter.post(
  "/notes/add",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const note = new Note(req.body);
    note.save((err) => {
      if (err)
        res
          .status(500)
          .json({ message: { msgBody: "Error has occurred", msgError: true } });
      else {
        console.log("Made new note succesfully");
        req.user.notes.push(note);
        req.user.save((err) => {
          if (err)
            res.status(500).json({
              message: { msgBody: "Error has occurred", msgError: true },
            });
          else {
            res.status(200).json({
              message: {
                msgBody: "Successfully added note",
                msgError: false,
              },
            });
          }
        });
      }
    });
  }
);

userRouter
  .route("/notes/update/:id")
  .put(
    passport.authenticate("jwt", { session: false }),
    async (req, response) => {
      // update an existing note by the user

      const user = await User.findById(req.user._id);
      if (!user) {
        response.status(404).json({
          message: "Error user not found",
        });
      }
      const noteId = req.params.id;
      user.notes.id(noteId).title = req.body.title;
      user.notes.id(noteId).content = req.body.content;

      const updated = await user.save();

      if (!updated) {
        response.status(500).json({
          message: "Failed to update the notes",
        });
      }
    }
  );

userRouter
  .route("/notes/delete/:id")
  .delete(passport.authenticate("jwt", { session: false }), (req, response) => {
    let myQuery = {
      _id: req.user._id,
    };
    User.findById(req.user._id)
      .then((user) => {
        user.notes.pull({ _id: req.params.id });
        return user.save();
      })
      .then((obj) =>
        response.status(200).json({
          message: {
            msgBody: obj,
            msgError: false,
          },
        })
      )
      .catch((err) => {
        response.status(500).json({
          message: { msgBody: err, msgError: true },
        });
      });
  });

// get all the notes from the user
userRouter.get(
  "/notes",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById({ _id: req.user._id })
      .populate("notes")
      .exec((err, document) => {
        if (err || !document)
          res.status(500).json({
            message: { msgBody: "Error has occurred", msgError: true },
          });
        else
          res.status(200).json({ notes: document.notes, authenticated: true });
      });
  }
);


const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { return next() }
  res.redirect("https://keeper-app-hammad.netlify.app/login");
}

userRouter.get(
  '/google_authenticated', checkAuthenticated, (req, res) => {
    const {email} = req.user;
    res.status(200).json({isAuthenticated: true, user : {email}});
  }
)
// check if the user is authenticated
userRouter.get(
  "/authenticated",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { email } = req.user;
    res.status(200).json({ isAuthenticated: true, user: { email } });
  }
);

module.exports = userRouter;
