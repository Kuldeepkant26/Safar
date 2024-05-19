module.exports.isLogedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.session.redirectUrl = req.orignalUrl;
     
      req.flash("success", "You must be Login");
      res.redirect("/login");
    }
    next();
  };
