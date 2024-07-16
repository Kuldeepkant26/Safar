const express = require('express');
const router = express.Router();
const multer = require('multer')

const Listings = require('../models/listings');
const Reviews = require('../models/reviews');
const WrapAsync = require('../utils/wrapAsync');

const { storage } = require('../cloudConfig.js');
const upload = multer({ storage })

let { isLogedIn } = require('../utils/middlewares');

router.get('/home', WrapAsync(async (req, res) => {
    let listings = await Listings.find();
    res.render('home.ejs', { listings });
}));


router.get('/home', WrapAsync(async (req, res) => {
    let listings = await Listings.find();
    res.render('home.ejs', { listings });
}));
router.get('/home/:ct', WrapAsync(async (req, res) => {
    let { ct } = req.params;
    let listings = await Listings.find({ ctgry: ct });
    res.render('home.ejs', { listings });
}));
router.get('/add', isLogedIn, (req, res) => {
    res.render('add.ejs');

});
router.post('/add', isLogedIn, upload.single('image'), WrapAsync(async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    let { title, price, desc, location, country, ctgry, image } = req.body;
    let l1 = new Listings({
        title: capitalizeFirstLetter(title),
        price: price,
        desc: capitalizeFirstLetter(desc),
        location: capitalizeFirstLetter(location),
        country: capitalizeFirstLetter(country),
        ctgry: capitalizeFirstLetter(ctgry)
    });
    l1.image = { url, filename };
    l1.owner = req.user;
    await l1.save();
    req.flash('success', 'Successfully uploaded');
    res.redirect('/home');
}));
router.get('/show/:id', WrapAsync(async (req, res) => {
    let listing = await Listings.findById(req.params.id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    let listings = await Listings.find({ ctgry: listing.ctgry });
    res.render('show.ejs', { listing, listings });

}))
router.get('/testx/:ct', WrapAsync(async (req, res) => {
    let { ct } = req.params;
    let listings = await Listings.find({ $or: [{ ctgry: ct }, { country: ct }, { title: ct }, { location: ct }] });
    const jsonData = JSON.stringify(listings);

    res.send(jsonData);
}))

router.get('/edit/:id', isLogedIn, WrapAsync(async (req, res) => {
    let listing = await Listings.findById(req.params.id);
    res.render('eform.ejs', { listing });
}))
router.post('/edit/:id', isLogedIn, WrapAsync(async (req, res) => {
    let { title, price, desc, location, country, ctgry, image } = req.body;
    await Listings.findByIdAndUpdate(req.params.id, {
        image: image,
        title: capitalizeFirstLetter(title),
        price: price,
        desc: desc,
        location: capitalizeFirstLetter(location),
        country: capitalizeFirstLetter(country),
        ctgry: capitalizeFirstLetter(ctgry)
    });
    req.flash('success', 'Changes saved successfully');
    res.redirect(`/show/${req.params.id}`);
}));

router.get('/delete/:id', isLogedIn, WrapAsync(async (req, res) => {

    const listingId = req.params.id;

    // Find the listing to get the associated reviews
    const listing = await Listings.findById(listingId);

    if (!listing) {
        // Handle case where the listing is not found
        return res.status(404).send('Listing not found');
    }

    // Find and delete the related reviews
    await Reviews.deleteMany({ _id: { $in: listing.reviews } });

    // Remove the listing
    await Listings.findByIdAndDelete(listingId);

    // Redirect to the home page or another appropriate page
    req.flash('success', 'Post Deleted');
    res.redirect('/home');

}));

module.exports = router;

function capitalizeFirstLetter(str) {
    // Check if the string is empty or null
    str = str.trim();
    if (!str) return '';
    // Capitalize the first letter and make the rest lowercase
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}