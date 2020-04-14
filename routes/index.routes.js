const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");

router.get("/", (req, res, next) => {
  res.render("home");
});

router.get('/profile', ensureLogin.ensureLoggedIn(), (req, res, next) => {
    res.render('auth/profile')
})

router.get('/search', (req, res, next) => {
  res.render('auth/search')
})

module.exports = router;
