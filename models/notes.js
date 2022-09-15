const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  content: {
    type: String,
    required: [true, "Content is required"],
  },
  author : {type: Schema.Types.ObjectId, ref: "User"}
});


module.exports = mongoose.model.Note || mongoose.model("Note", noteSchema);
