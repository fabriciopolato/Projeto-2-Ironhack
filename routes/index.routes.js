require("dotenv").config();

const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const multer = require("multer");
const Picture = require("../models/picture");

router.get("/", (req, res, next) => {
  res.render("home");
});

router.get("/profile", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id)
    .then((user) => {
      if (user.firstLogin === false) {
        res.render("auth/edit-profile", user);
      } else {
        Picture.find((err, pictures) => {
          res.render("auth/profile", { pictures, user });
        });
      }
    })
    .catch((err) => console.log(err));
});

const upload = multer({ dest: "./public/uploads/" });

router.post("/profile", upload.single("photo"), (req, res) => {
  const user = req.user;
  const pic = new Picture({
    name: req.body.namePhoto,

    path: `/uploads/${req.file.filename}`,
    originalName: req.file.originalname,
  });
  console.log('****************', pic)

  User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        imgPath: pic.path,
      },
    },
    {
      new: true,
    }
  )
    .then((user) => console.log(user))
    .catch((err) => console.log(err));

  Picture.collection.drop();
  pic.save((err) => {
    res.redirect("/profile");
  });
});

router.get("/profile/:id", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const { id } = req.params;
  User.find({ _id: id })
    .then((user) => {
      res.render("auth/profile", user[0]);
    })
    .catch((err) => console.log(err));
});

router.get("/search", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render("auth/search");
});

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

  let { gender } = req.body;

  if (gender === "both") {
    gender = ["Homem", "Mulher"];
  } else {
    gender = [gender];
  }

  let query = {};

  if (musicalInfluence) {
    if (level) {
      query = {
        $and: [
          { username: { $regex: username, $options: "i" } },
          { gender: { $in: gender } },
          { state: { $regex: state, $options: "i" } },
          { city: { $regex: city, $options: "i" } },
          { musicalInfluence: { $in: musicalInfluence } },
          { level: { $in: level } },
        ],
      };
    } else {
      query = {
        $and: [
          { username: { $regex: username, $options: "i" } },
          { gender: { $in: gender } },
          { state: { $regex: state, $options: "i" } },
          { city: { $regex: city, $options: "i" } },
          { musicalInfluence: { $in: musicalInfluence } },
        ],
      };
    }
  } else {
    if (level) {
      query = {
        $and: [
          { username: { $regex: username, $options: "i" } },
          { gender: { $in: gender } },
          { state: { $regex: state, $options: "i" } },
          { city: { $regex: city, $options: "i" } },
          { level: { $in: level } },
        ],
      };
    } else {
      query = {
        $and: [
          { username: { $regex: username, $options: "i" } },
          { gender: { $in: gender } },
          { state: { $regex: state, $options: "i" } },
          { city: { $regex: city, $options: "i" } },
        ],
      };
    }
  }

  User.find(query, { password: 0 })
    .sort({ username: 1 })
    .then((users) => {
      console.log(query);
      console.log("*************", req.body);
      res.render("auth/search", { users });
    })
    .catch((err) => console.log(err));
});

router.get("/edit", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const user = ({
    _id,
    username,
    name,
    lastName,
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
  } = req.user);

  res.render("auth/edit-profile", user);
});

router.post("/edit", (req, res, next) => {
  const {
    _id,
    username,
    name,
    lastName,
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
  console.log("***************",req.body)

  User.findByIdAndUpdate(
    _id,
    {
      $set: {
        username,
        name,
        lastName,
        firstLogin: true,
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
      res.redirect("/profile");
    })
    .catch((err) => console.log(err));
});

router.get("/delete", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const user = req.user;
  res.render("auth/delete", { user });
});

router.get("/delete/:id", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const userId = req.params.id;
  User.findByIdAndRemove(userId)
    .then((response) => {
      console.log(response);
      res.redirect("/");
    })
    .catch((error) => console.log(error));
});

router.post("/send-email", (req, res, next) => {
  let { email, subject, message } = req.body;
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASS,
    },
  });
  transporter
    .sendMail({
      from: '"Fabricio " <support@bandmate.com>',
      to: email,
      subject: subject,
      text: message,
      html: `<b>${message}</b>`,
    })
    .then((info) =>
      res.render("auth/send-email", { email, subject, message, info })
    )
    .catch((error) => console.log(error));
});

module.exports = router;
