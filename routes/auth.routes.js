const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const User = require("../models/user");
const passport = require("passport");

router.get("/signup", (req, res, next) => {
  res.render("home");
});

router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("home", { message: "Coloque um nome de usuário e um password" });
    return;
  }

  User.findOne({ username })
    .then((user) => {
      if (user !== null) {
        res.render("home", { message: "Este nome de usuário já existe" });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        username,
        password: hashPass,
        firstLogin: false,
        welcomeMessage: "Você está muito próximo de montar sua primeira banda de sucesso. Para que os outros integrantes da banda possam te encontrar, complete o seu cadastro!",
        imgPath: 'images/noPhoto.png'
      });

      newUser.save((err) => {
        if (err) {
          res.render("home", { message: "Desculpe, algo deu errado!" });
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
