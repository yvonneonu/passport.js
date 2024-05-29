const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const path = require("path"); // Import path module
const User = require("./models/user");

function verifyToken(req, res, next) {
  // console.log("verifyToken", req.cookies);
  const token = req.cookies["jwt"];
  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error("Token verification failed:", err);
      return res.status(401).json({ message: "Token verification failed" });
    }
    req.user = { user: decoded.user, token }; // Include the token in the user object
    next();
  });
}

router.post("/signup", (req, res, next) => {
  passport.authenticate("signup", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({ message: info.message });
    }
    res.json({
      message: "Signup successful",
      user: user,
    });
  })(req, res, next);
});

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   User.findById(id).then((user) => {
//     done(null, user);
//   });
// });

router.post("/login", async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err) {
        return next(new Error("An error occurred."));
      }
      if (!user) {
        return res.status(400).json({ message: info.message });
      }
      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);
        const body = { _id: user._id, username: user.username };
        const token = jwt.sign({ user: body }, process.env.JWT_SECRET_KEY);
        return res.json({ token, body });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    // successRedirect: `${process.env.FRONTEND_URL}/dashboard`,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  (req, res) => {
    try {
      const body = {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        thumbnail: req.user.thumbnail, // Add thumbnail to the response body
      };
      const token = jwt.sign({ user: body }, process.env.JWT_SECRET_KEY);

      console.log("authgoogle", req.user);
      // Set the JWT token in a secure, HTTP-only cookie
      res.cookie("jwt", token, {
        httpOnly: true, // Ensures the cookie is sent only over HTTP(S), not accessible via client-side JavaScript
        secure: false, // For development environment, set to false; in production, set to true
        maxAge: 3600000, // Cookie expiration time in milliseconds (e.g., 1 hour)
        sameSite: "Strict", // Ensures the cookie is sent only to the same site
      });

      // Redirect to the frontend

      res.redirect(`${process.env.FRONTEND_URL}/dashboard`);

      // res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
    } catch (error) {
      console.error("Error in Google OAuth callback:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { session: false }),
//   async (req, res) => {
//     try {
//       // Retrieve user details from req.user
//       const { googleId, displayName, email } = req.user;

//       // Check if user already exists in the database
//       let existingUser = await User.findOne({ googleId });

//       if (!existingUser) {
//         // If user doesn't exist, create a new user in the database
//         const newUser = new User({
//           googleId,
//           username: displayName,
//           email,
//         });
//         await newUser.save();

//         existingUser = newUser;
//       }

//       // Set up session and generate session cookie
//       req.session.userId = existingUser._id;

//       // Redirect to frontend route or send response

//       res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
//     } catch (error) {
//       console.error("Error in Google OAuth callback:", error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   }
// );

router.get("/auth/google", (req, res, next) => {
  console.log("Redirecting to Google OAuth");
  next();
});

router.get("/auth/google/callback", (req, res, next) => {
  console.log("Handling Google OAuth callback");
  res.status(200).json({ message: "Logged in successfully" });
  // next();
});

// router.post("/logout", verifyToken, (req, res) => {
//   // Clear JWT cookie
//   res.clearCookie("jwt");

//   // Respond with a success message
//   res.status(200).json({ message: "Logged out successfully" });
// });

router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.status(500).json({ error: "Failed to logout" });
    }
    // Clear any cookies or session-related information if necessary
    res.clearCookie("jwt");

    // Respond to the client
    res.status(200).json({ message: "Logged out successfully" });
  });
});

router.get("/profile", verifyToken, (req, res) => {
  const { user, token } = req.user;

  res.status(200).json({
    user: user,
    token: token, // Optionally send the token in the response if needed
  });
});

// router.get("/profile", (req, res) => {
//   req.logIn((err) => {
//     if (err) {
//       return res.status(500).json({ error: "Failed to sign in user" });
//     }
//     return res.status(200).json({ message: "User is successfully signed in" });
//   });
// });

module.exports = router;
