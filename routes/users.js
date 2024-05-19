const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const Listings = require('../models/listings');
const Reviews = require('../models/reviews');
const User = require('../models/user');
const ejsmate = require('ejs-mate');
const mongoose = require('mongoose');
const session = require("express-session");
const flash = require('connect-flash');
let { isLogedIn, saveRedirectUrl } = require('../utils/middlewares');
const ExpressError = require('../utils/ExpressError');
const WrapAsync = require('../utils/wrapAsync');

const router = express.Router();

const passport = require('passport');

router.get('/signup', (req, res) => {
    res.render('signup.ejs');
})

router.post('/signup', WrapAsync(async (req, res) => {
    let { username, email, password } = req.body;
    let u1 = new User({
      email: email.trim(),
      username: username.trim(),
    });
    
    try {
      let rUser = await User.register(u1, password);
      req.login(rUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "SignUp Successfully");
        res.redirect("/home");
      });
    } catch (e) {
      console.log(e.message);
      req.flash('error', e.message); // Change 'success' to 'error' for consistency in message type
      res.redirect('/signup');
    }
  }));
  
router.get('/login', (req, res) => {
    res.render('login.ejs');
})
router.post('/login',saveRedirectUrl, passport.authenticate('local',{ failureRedirect: '/login', failureFlash: true, failureMessage: "Wrong info" }), async (req, res) => {
    req.flash('success', "Logedin successfully");
    const redirectUrl = res.locals.rUrl || '/home'; // default to '/home' if no redirect URL
    delete req.session.rUrl; // clear the session URL after redirecting
    res.redirect(redirectUrl);
})

router.get('/logout', isLogedIn, (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'You are logged out');
        res.redirect('/home');
    });
});

module.exports = router;