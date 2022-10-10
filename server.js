const express = require("express");
const app = express();
require("./auth/passport");

app.use(require("./routes/user"));

app.get("/", (req, res) => {
  res.json({messsage: "Hello! I am your server!"});
})


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Successfully running on ${port}`);
})




