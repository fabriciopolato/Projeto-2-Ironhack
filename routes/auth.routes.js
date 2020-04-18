const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const User = require("../models/user");
const Picture = require("../models/picture");
const passport = require("passport");

router.get("/signup", (req, res, next) => {
  res.render("signup");
});

router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username })
    .then((user) => {
      if (user !== null) {
        res.render("signup", { message: "The username already exists" });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);
      
      const initialPhoto = new Picture({
        name: 'no photo',
        path: `/images/noPhoto.png`,
        originalName: 'no photo',
      });

      const newUser = new User({
        username,
        password: hashPass,
        firstLogin: false,
        welcomeMessage: "Você está muito próximo de montar sua primeira banda de sucesso. Para que os outros integrantes da banda possam te encontrar, complete o seu cadastro!",
        imgPath: initialPhoto.path
      });


      initialPhoto.save()

      newUser.save((err) => {
        if (err) {
          res.render("signup", { message: "Something went wrong" });
        } else {
          res.redirect("/profile");
        }
      });
    })
    .catch((error) => {
      next(error);
    });
});

router.get("/login", (req, res, next) => {
  const user = req.user;
  res.render("login");
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true,
  })
);

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

module.exports = router;
