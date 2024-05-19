const express = require('express');
const router = express.Router();

const Listings = require('../models/listings');
const Reviews = require('../models/reviews');
const WrapAsync = require('../utils/wrapAsync');
const { isLogedIn } = require('../utils/middlewares');


router.post('/review/:id', WrapAsync(async (req, res) => {

    if (!req.isAuthenticated()) {
        req.flash('error', "Must login")
        res.redirect('/login');
    } else {
        let { rating, comment } = req.body;
        let listing = await Listings.findById(req.params.id);
        let r1 = new Reviews({
            rating: rating,
            comment: comment
        });
        r1.author = req.user;
        listing.reviews.push(r1);
        await listing.save();
        await r1.save();
        req.flash('success', 'Review Added');
        res.redirect(`/show/${req.params.id}`);
    }
}));

router.get("/delete/:id/review/:rid", isLogedIn, WrapAsync(async (req, res) => {
    const { id, rid } = req.params;
    await Reviews.findByIdAndDelete(rid);
    await Listings.updateOne({ _id: id }, { $pull: { reviews: rid } });
    req.flash('success', 'Review Deleted');
    res.redirect(`/show/${id}`);
}));


module.exports = router;

function capitalizeFirstLetter(str) {
    // Check if the string is empty or null
    str = str.trim();
    if (!str) return '';
    // Capitalize the first letter and make the rest lowercase
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}