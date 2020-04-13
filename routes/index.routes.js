const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");

router.get("/", (req, res, next) => {
  res.render("home");
});

router.get('/profile', ensureLogin.ensureLoggedIn(), (req, res, next) => {
    res.render('auth/profile')
})

module.exports = router;
