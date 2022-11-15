var express = require('express');
var router = express.Router();


const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4 } = require('uuid');
const { db } = require("../mongo");

let user = {};

/* GET users listing. */
// router.get('/', function (req, res, next) {
//   res.send('respond with a resource');
// });


// registering a new user into the databse
router.post('/register', async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const saltRounds = 5; // For prod apps, saltRounds are going to be between 5 and 10
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    user = {
      id: v4(),
      email: email,
      password: passwordHash,
    }; // Simulating us creating a user in the database

    const insertResult = await db().collection("users").insertOne(user);
    console.log(insertResult)

    res.json({
      success: true,
      user: user
    })
  }

  catch (err) {
    res.json({
      success: false,
      error: err.toString()
    })
  }
})


router.post('/login', async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const hashedUserPassword = user.password;
    const userEmail = user.email;

    // looking for a specific user based on email input by user
    // *************
    const user = await db().collection("users").findOne({
      email,
    });
    // *************

    const userMatch = await bcrypt.compare(email, userEmail);

    // bcrypt compare takes two arguments, the first is the input plain text password and the second is the hashed password that is being stored on the user document. The compare function returns a boolean which will be true of the passwords match and false if they do not.
    const passwordMatch = await bcrypt.compare(password, hashedUserPassword);

    // comparing email in database to email input by user. If its not there then render the message below. Otherwise; return.
    if (!userMatch) {
      // The input password is incorrect
      res.json({
        success: false,
        message: "Could not find user.",
      });
      return;
    }

    // comparing password in database to password input by user. If passwords don't match render the message below. Otherwise; return.
    if (!passwordMatch) {
      // The input password is incorrect
      res.json({
        success: false,
        message: "Password was incorrect.",
      });
      return;
    }

    const userType = email.includes('codeimmersives.com') ? "admin" : "user";

    const userData = {
      date: new Date(),
      userId: user.id,
      scope: userType,

    }

    const exp = Math.floor(Date.now() / 1000) + (60 * 60);

    const payload = {
      userData: userData,
      // numerical value in seconds of 24 hours in the future
      exp: exp,
    }

    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    const token = jwt.sign(payload, jwtSecretKey);

    res.json({
      success: true, token, email
    });

  }
  catch (err) {
    res.json({
      success: false,
      error: err.toString()
    })
  }
})

module.exports = router;
