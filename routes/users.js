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
    const user = await db().collection("users").findOne({
      email,
    });

    const userMatch = await bcrypt.compare(email, userEmail);

    // bcrypt compare takes two arguments, the first is the input plain text password and the second is the hashed password that is being stored on the user document. The compare function returns a boolean which will be true of the passwords match and false if they do not.
    const passwordMatch = await bcrypt.compare(password, hashedUserPassword);

    // comparing email in database to email input by user. If its not there then render the message below. Otherwise; return.
    if (userMatch === false) {
      // The input password is incorrect
      res.json({
        success: false,
        message: "Could not find user.",
      });
      return;
    }

    // comparing password in database to password input by user. If passwords don't match render the message below. Otherwise; return.
    if (passwordMatch === false) {
      // The input password is incorrect
      res.json({
        success: false,
        message: "Password was incorrect.",
      });
      return;
    }

    const adminHandler = () => {
      user.email.includes('codeimmersives.com') ? userData.scope = "admin" : userData.scope = "user"
    }


    const userData = {
      date: new Date(),
      userId: user.id,
      scope: { adminHandler },

    }
  }
  catch (err) {
    res.json({
      success: false,
      error: err.toString()
    })
  }
})

module.exports = router;
