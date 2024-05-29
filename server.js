require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const path = require("path");
const session = require("express-session"); // Add this line
const cookieSession = require("cookie-session");
require("./passport");
const cookieParser = require("cookie-parser");

mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Add this block for session management
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Use a secret key for session
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure to true if using HTTPS
  })
);
// app.use(
//   cookieSession({
//     maxAge: 24 * 60 * 60 * 1000, //
//     keys: [process.env.COOKIE_SESSION],
//   })
// );
app.use(express.static(path.join(__dirname, "./frontend/build")));
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session()); // Add this line to enable persistent login sessions

const routes = require("./routes");
app.use("/", routes);

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
