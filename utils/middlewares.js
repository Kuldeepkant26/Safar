module.exports.isLogedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.rUrl = req.originalUrl
        req.flash('error', "You must be logedin")
        res.redirect('/login');
    } else {
        next();
    }
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.rUrl) {
        res.locals.rUrl = req.session.rUrl;
    }
    next();
}