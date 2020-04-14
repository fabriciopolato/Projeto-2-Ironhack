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
  console.log(req.body)
  const { username, state, city, gender } = req.body;
  User.find({
    "username": { "$regex": username, "$options": "i" }
  },{password: 0})
    .then((user) => {
      console.log(user);
      res.render("auth/search", { user });
    })
    .catch((err) => console.log(err));
});

router.get('/edit', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const user = {
    _id,
    username,
    gender,
    age,
    state,
    city,
    specialty,
    level,
    musicalInfluence,
    facebook,
    instagram,
    email
  } = req.user;

  res.render('auth/edit-profile', user)
})

router.post('/edit', (req, res, next) => {
  const {
    _id,
    username,
    gender,
    age,
    state,
    city,
    specialty,
    level,
    musicalInfluence,
    facebook,
    instagram,
    email
  } = req.body

  console.log(req.body.level)

  User.findByIdAndUpdate(_id, {
    $set: {
      username,
      gender,
      age,
      state,
      city,
      specialty,
      level,
      musicalInfluence,
      facebook,
      instagram,
      email
    }}, {
      new:true
    })
    .then(response => {
      console.log(response)
      res.redirect('/profile')
    })
    .catch(err => console.log(err))
})
module.exports = router;
