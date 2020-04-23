require("dotenv").config();

const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const uploadCloud = require("../config/cloudinary.js");

router.get("/", (req, res, next) => {
  res.render("home");
});

router.get("/profile", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id)
    .then((user) => {
      if (user.firstLogin) {
        res.render("auth/edit-profile", user);
      } else {
        User.find({ _id: user.invitationReceived })
          .then((usersRequestingFriendship) => {
            User.find({ _id: user.friendship })
              .then((friends) =>
                res.render("auth/profile", {
                  user,
                  usersRequestingFriendship,
                  friends,
                })
              )
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
});

router.post("/profile", uploadCloud.single("photo"), (req, res) => {
  const user = req.user;
  const path = req.file.url;

  User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        imgPath: path,
        originalName: req.file.originalname,
      },
    },
    {
      new: true,
    }
  )
    .then((user) => res.redirect("/profile"))
    .catch((err) => console.log(err));
});

router.get("/profile/:id", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  const userId = "" + req.user._id;

  User.find({ _id: id })
    .then((profile) => {
      const visitedProfile = profile[0];
      let data = { visitedProfile };

      if (visitedProfile.invitationReceived.includes(userId)) {
        data.invitationId = userId;
      } else if (visitedProfile.friendship.includes(userId)) {
        data.user = user;
      }
      res.render("auth/others-profile", data);
    })
    .catch((err) => console.log(err));
});

router.post("/profile/:id", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const { id } = req.params;
  const userId = "" + req.user._id;

  User.find({ _id: id })
    .then((user) => {
      if (user[0].invitationReceived.includes(userId) === false) {
        User.findByIdAndUpdate(
          id,
          {
            $push: { invitationReceived: userId },
          },
          {
            new: true,
          }
        )
          .then((resp) => res.redirect(`/profile/${id}`))
          .catch((err) => console.log(err));
      } else {
        res.redirect(`/profile/${id}`);
      }
    })
    .catch((err) => console.log(err));
});

router.get(
  "/invitation-accepted/:id",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    let { id } = req.params;
    let userId = "" + req.user._id;

    User.findByIdAndUpdate(
      id,
      {
        $push: { friendship: userId },
      },
      {
        new: true,
      }
    )
      .then((requested) => {
        const resp = req.user;
        userId = req.user._id;
        id += "";

        User.findByIdAndUpdate(
          userId,
          {
            $push: { friendship: id },
            $pull: { invitationReceived: id },
          },
          {
            new: true,
          }
        )
          .then((resp) => {
            res.redirect("/profile");
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

router.get(
  "/invitation-refused/:id",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    const { id } = req.params;
    let userId = req.user._id;

    User.findByIdAndUpdate(
      userId,
      {
        $pull: { invitationReceived: id },
      },
      {
        new: true,
      }
    )
      .then((resp) => {
        res.redirect("/profile");
      })
      .catch((err) => console.log(err));
  }
);

router.get(
  "/delete-friend/:id",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    const { id } = req.params;
    let userId = req.user._id;

    User.findByIdAndUpdate(
      userId,
      {
        $pull: { friendship: id },
      },
      {
        new: true,
      }
    )
      .then((resp) => {
        userId += "";

        User.findByIdAndUpdate(
          id,
          {
            $pull: { friendship: userId },
          },
          {
            new: true,
          }
        )
          .then((resp) => {
            res.redirect("/profile");
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

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
  } = req.body;

  let { gender } = req.body;

  if (gender === "both") {
    gender = ["Homem", "Mulher"];
  } else {
    gender = [gender];
  }

  let { lookingFor } = req.body;

  if (lookingFor === "all") {
    lookingFor = [
      " Guitarrista/Violão",
      " Baixista",
      " Baterista",
      " Percussionista",
      " Vocalista",
      " Pianista/Tecladista",
      " Violinista",
      " Saxofonista",
    ];
  } else {
    lookingFor = [lookingFor];
  }

  let query = {};

  if (musicalInfluence) {
    if (level) {
      if (specialty) {
        query = {
          $and: [
            {
              $or: [
                { name: { $regex: username, $options: "i" } },
                { username: { $regex: username, $options: "i" } },
                { lastName: { $regex: username, $options: "i" } },
              ],
            },
            { gender: { $in: gender } },
            { state: { $regex: state, $options: "i" } },
            { city: { $regex: city, $options: "i" } },
            { lookingFor: { $in: lookingFor } },
            { musicalInfluence: { $in: musicalInfluence } },
            { level: { $in: level } },
            { specialty: { $in: specialty } },
          ],
        };
      } else {
        query = {
          $and: [
            {
              $or: [
                { name: { $regex: username, $options: "i" } },
                { username: { $regex: username, $options: "i" } },
                { lastName: { $regex: username, $options: "i" } },
              ],
            },
            { gender: { $in: gender } },
            { state: { $regex: state, $options: "i" } },
            { city: { $regex: city, $options: "i" } },
            { lookingFor: { $in: lookingFor } },
            { musicalInfluence: { $in: musicalInfluence } },
            { level: { $in: level } },
          ],
        };
      }
    } else {
      if (specialty) {
        query = {
          $and: [
            {
              $or: [
                { name: { $regex: username, $options: "i" } },
                { username: { $regex: username, $options: "i" } },
                { lastName: { $regex: username, $options: "i" } },
              ],
            },
            { gender: { $in: gender } },
            { state: { $regex: state, $options: "i" } },
            { city: { $regex: city, $options: "i" } },
            { lookingFor: { $in: lookingFor } },
            { musicalInfluence: { $in: musicalInfluence } },
            { specialty: { $in: specialty } },
          ],
        };
      } else {
        query = {
          $and: [
            {
              $or: [
                { name: { $regex: username, $options: "i" } },
                { username: { $regex: username, $options: "i" } },
                { lastName: { $regex: username, $options: "i" } },
              ],
            },
            { gender: { $in: gender } },
            { state: { $regex: state, $options: "i" } },
            { city: { $regex: city, $options: "i" } },
            { lookingFor: { $in: lookingFor } },
            { musicalInfluence: { $in: musicalInfluence } },
          ],
        };
      }
    }
  } else {
    if (level) {
      if (specialty) {
        query = {
          $and: [
            {
              $or: [
                { name: { $regex: username, $options: "i" } },
                { username: { $regex: username, $options: "i" } },
                { lastName: { $regex: username, $options: "i" } },
              ],
            },
            { gender: { $in: gender } },
            { state: { $regex: state, $options: "i" } },
            { city: { $regex: city, $options: "i" } },
            { lookingFor: { $in: lookingFor } },
            { level: { $in: level } },
            { specialty: { $in: specialty } },
          ],
        };
      } else {
        query = {
          $and: [
            {
              $or: [
                { name: { $regex: username, $options: "i" } },
                { username: { $regex: username, $options: "i" } },
                { lastName: { $regex: username, $options: "i" } },
              ],
            },
            { gender: { $in: gender } },
            { state: { $regex: state, $options: "i" } },
            { city: { $regex: city, $options: "i" } },
            { lookingFor: { $in: lookingFor } },
            { level: { $in: level } },
          ],
        };
      }
    } else {
      if (specialty) {
        query = {
          $and: [
            {
              $or: [
                { name: { $regex: username, $options: "i" } },
                { username: { $regex: username, $options: "i" } },
                { lastName: { $regex: username, $options: "i" } },
              ],
            },
            { gender: { $in: gender } },
            { state: { $regex: state, $options: "i" } },
            { city: { $regex: city, $options: "i" } },
            { lookingFor: { $in: lookingFor } },
            { specialty: { $in: specialty } },
          ],
        };
      } else {
        query = {
          $and: [
            {
              $or: [
                { name: { $regex: username, $options: "i" } },
                { username: { $regex: username, $options: "i" } },
                { lastName: { $regex: username, $options: "i" } },
              ],
            },
            { gender: { $in: gender } },
            { state: { $regex: state, $options: "i" } },
            { city: { $regex: city, $options: "i" } },
            { lookingFor: { $in: lookingFor } },
          ],
        };
      }
    }
  }

  User.find(query, { password: 0 })
    .sort({ username: 1 })
    .then((users) => {
      res.render("auth/search", { users });
    })
    .catch((err) => console.log(err));
});

router.get("/edit", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const user = req.user;

  res.render("auth/edit-profile", user);
});

router.post("/edit", (req, res, next) => {
  const {
    _id,
    username,
    name,
    lastName,
    age,
    state,
    city,
    gender,
    musicalInfluence,
    specialty,
    lookingFor,
    level,
    bio,
    facebook,
    instagram,
    email,
  } = req.body;

  User.findByIdAndUpdate(
    _id,
    {
      firstLogin: false,
      username: username,
      name: name,
      lastName: lastName,
      age: age,
      state: state,
      city: city,
      gender: gender,
      musicalInfluence: musicalInfluence,
      specialty: specialty,
      lookingFor: lookingFor,
      level: level,
      bio: bio,
      facebook: facebook,
      instagram: instagram,
      email: email,
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
  console.log('******************', email, subject, message)

  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASS,
    },
  });

  transporter
    .sendMail({
      from: '"BandMate Support" <bandmate100@gmail.com>',
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
