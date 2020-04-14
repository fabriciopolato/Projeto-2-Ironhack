const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const User = require("../models/user");

router.get("/", (req, res, next) => {
  res.render("home");
});

router.get("/profile", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render("auth/profile");
});

router.get("/search", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render("auth/search");
});

router.post("/search", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const { username, state, city } = req.body;
  User.find({
    "username": { "$regex": username, "$options": "i" }
  })
    .then((user) => {
      console.log(user);
      res.render("auth/search", { user });
    })
    .catch((err) => console.log(err));
});
module.exports = router;
