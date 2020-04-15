const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const User = require("../models/user");

router.get("/", (req, res, next) => {
  // User.collection.drop();
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
    state,
    city,
    specialty,
    level,
    musicalInfluence,
    facebook,
    instagram,
    email,
  } = req.body;

  let {gender} = req.body;

  console.log(gender)
  if(gender === 'both') {
    gender = ['male', 'female']
  } else {
    gender = [gender]
  }

  let query = {};

  if(musicalInfluence) {
    
    if(level) {
      query = { $and: [{username: { $regex: username, $options: "i" }}, {gender: {$in: gender}}, {state: { $regex: state, $options: "i" }}, {city: { $regex: city, $options: "i" }}, {musicalInfluence: {$in: musicalInfluence}}, {level: {$in: level}}] }
    } else {
      query = { $and: [{username: { $regex: username, $options: "i" }}, {gender: {$in: gender}}, {state: { $regex: state, $options: "i" }}, {city: { $regex: city, $options: "i" }}, {musicalInfluence: {$in: musicalInfluence}}] }
    }

  } else {

    if(level) {
      query = { $and: [{username: { $regex: username, $options: "i" }}, {gender: {$in: gender}}, {state: { $regex: state, $options: "i" }}, {city: { $regex: city, $options: "i" }}, {level: {$in: level}}] }
    } else {
      query = { $and: [{username: { $regex: username, $options: "i" }}, {gender: {$in: gender}}, {state: { $regex: state, $options: "i" }}, {city: { $regex: city, $options: "i" }}] }
    }
  }


  User.find(query,{ password: 0 })
  // User.find({ state: state },{ password: 0 })
    .sort({username: 1})
    .then((users) => {
      res.render("auth/search", { users });
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
