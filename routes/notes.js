const express = require("express");
const auth = require("../auth/auth");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const noteRoutes = express.Router();

const dbConnect = require("../db/conn");
const Notes = require("../models/notes");

// connect to the database
dbConnect();
const ObjectId = require("mongodb").ObjectId;
noteRoutes.use(bodyParser.json());
noteRoutes.use(bodyParser.urlencoded({ extended: true }));

noteRoutes.route("/notes").get(auth, (req, res) => {
  // get all the notes by the user
  Notes.find({ author: ObjectId(req.user.userId) }, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});



noteRoutes.route("/notes/add").post(auth, (req, res) => {
  // add a note by the user
  const newNote = {
    title: req.body.title,
    content: req.body.content,
    author: ObjectId(req.user.userId),
  };
  Notes.create(newNote, (err, response) => {
    if (err) throw err;
    res.json(response);
  });
});

noteRoutes.route("/notes/update/:id").post(auth, (req, response) => {
  // update an existing note by the user
  let myQuery = {
    _id: ObjectId(req.params.id),
    author: ObjectId(req.user.userId),
  };
  let newValues = {
    $set: {
      title: req.body.title,
      content: req.body.content,
    },
  };
  Notes.updateOne(myQuery, newValues, (err, res) => {
    if (err) throw err;
    console.log("1 document updated");
    response.json(res);
  });
});

noteRoutes.route("/notes/delete/:id").delete(auth, (req, response) => {
  // delete an existing note by the user
  console.log(req.user);
  let myQuery = {
    _id: ObjectId(req.params.id),
    author: ObjectId(req.user.userId),
  };
  Notes.deleteOne(myQuery, (err, obj) => {
    if (err) throw err;
    console.log("1 document deleted");
    response.json(obj);
  });
});

// Search for a specific note

module.exports = noteRoutes;
