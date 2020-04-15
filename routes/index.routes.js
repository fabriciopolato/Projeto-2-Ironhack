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

router.get("/profile/:id", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const { id } = req.params;
  User.find({ _id:id })
    .then((user) => {
      res.render("auth/profile",  user[0] )})
    .catch((err) => console.log(err));
});

router.get("/search", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render("auth/search");
});


//TO-DO
router.post("/search", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const {
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
    email,
  } = req.body;

  User.find({ username: { $regex: username, $options: "i" }},{ password: 0 })
    .then((user) => {
      res.render("auth/search", { user });
    })
    .catch((err) => console.log(err));
});

router.get("/edit", ensureLogin.ensureLoggedIn(), (req, res, next) => {
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
    bio,
    facebook,
    instagram,
    email,
  } = req.user;

  res.render("auth/edit-profile", user);
});

router.post("/edit", (req, res, next) => {
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
    bio,
    facebook,
    instagram,
    email,
  } = req.body;

  User.findByIdAndUpdate(
    _id,
    {
      $set: {
        username,
        gender,
        age,
        state,
        city,
        specialty,
        level,
        musicalInfluence,
        bio,
        facebook,
        instagram,
        email,
      },
    },
    {
      new: true,
    }
  )
    .then((response) => {
      console.log(response);
      res.redirect("/profile");
    })
    .catch((err) => console.log(err));
});

router.get('/delete', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const user = req.user;
  console.log(user)
  res.render('auth/delete', { user })
})

router.get('/delete/:id', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const userId = req.params.id;
  User.findByIdAndRemove(userId)
    .then(response => {
    console.log(response);
    res.redirect('/');
  }).catch(error => console.log(error));
})
module.exports = router;
