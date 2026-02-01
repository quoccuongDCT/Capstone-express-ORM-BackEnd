const express = require("express");
const app = express();

app.use(express.json());

app.use("/api/v1/auth", require("./routes/auth.route"));
app.use("/api/v1/images", require("./routes/image.route"));
app.use("/api/v1/comments", require("./routes/comment.route"));

module.exports = app;
