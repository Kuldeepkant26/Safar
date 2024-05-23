if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}

const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const Listings = require('./models/listings');
const Reviews = require('./models/reviews');
const User = require('./models/user');
const ejsmate = require('ejs-mate');
const mongoose = require('mongoose');
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const Secret = process.env.SECRET
const ExpressError = require('./utils/ExpressError');
const WrapAsync = require('./utils/wrapAsync');

//Routes
const rlistings = require('./routes/listings');
const rreviews = require('./routes/reviews');
const userRoute = require('./routes/users');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const { error } = require('console');

const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
}
app.listen(port, () => {
    console.log("Server is listening on port " + port);
});

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((e) => {
        console.log(e);
    });



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views/body'));

app.use(express.urlencoded({ extended: true }));//to access the data inside request
app.use(express.static(path.join(__dirname, '/public'))); //to serve static files like css, js

app.engine('ejs', ejsmate);

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: Secret
    },
    touchAfter: 24 * 3600
})

store.on("error", () => {
    console.log("Error in Mongo Session Store", err);
})

const sopt = {
    store: store,
    secret: Secret, //this secrete is used for signed cookie session id
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true //To prevent cross scripting attacks
    },
};


app.use(session(sopt));
app.use(flash())


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {

    res.locals.error = req.flash("error");
    res.locals.success = req.flash('success');
    res.locals.currUser = req.user;
    next();

});

app.get('/', (req, res) => {
    res.redirect('/home');
});

app.use('/', rlistings);
app.use('/', rreviews);
app.use('/', userRoute);



app.all("*", (req, res, next) => {
    // res.send('Page not found');
    next(new ExpressError(404, "Page not Found"));
});

app.use((err, req, res, next) => {
    let { statusCode, message } = err;
    res.render('error.ejs', { statusCode, message });
    // res.status(statusCode).send(message);
});

// async function addData() {
//     await Listings.insertMany([
//         {
//             title: "Seaside Oasis Lodge",
//             image: { url: 'https://a0.muscache.com/im/pictures/miso/Hosting-52960006/original/6e21b2e3-4a50-44f7-9641-dc9ae2e2ef4e.jpeg?im_w=720', filename: 'xyz' },
//             price: 44000,
//             location: 'Delhi',
//             country: 'India',
//             ctgry: 'Islands',
//             desc: 'Nestled amidst palm trees and azure waters, our hotel offers a blissful escape',
//             owner: '664a46ed0b7746dcd647e026',
//         },
//         {
//             title: "Azure Isle Retreat",
//             image: { url: 'https://a0.muscache.com/im/pictures/monet/Luxury-54351340/original/fcfd79d3-778a-42bc-9cc3-11d82cf49205?im_w=720', filename: 'xyz' },
//             price: 44000,
//             location: 'Shanghai',
//             country: 'China',
//             ctgry: 'Islands',
//             desc: 'Nestled amidst palm trees and azure waters, our hotel offers a blissful escape',
//             owner: '664a46ed0b7746dcd647e026',
//         },
//         {
//             title: "Paradise Cove Inn",
//             image: { url: 'https://a0.muscache.com/im/pictures/miso/Hosting-853512929423214729/original/d2731d23-980b-4fc1-8ccc-926d0e3f4eed.jpeg?im_w=720', filename: 'xyz' },
//             price: 8900,
//             location: 'Espoo',
//             country: 'FinLand',
//             ctgry: 'Islands',
//             desc: 'Nestled amidst palm trees and azure waters, our hotel offers a blissful escape',
//             owner: '664a46ed0b7746dcd647e026',
//         },

//         {
//             title: "Palm Breeze",
//             image: { url: 'https://a0.muscache.com/im/pictures/miso/Hosting-738879331663769852/original/d1f074a9-ed6c-4ffe-a3a6-b6c3578d205b.jpeg?im_w=720', filename: 'xyz' },
//             price: 33000,
//             location: 'California',
//             country: 'Canada',
//             ctgry: 'Islands',
//             desc: 'Nestled amidst palm trees and azure waters, our hotel offers a blissful escape',
//             owner: '664a46ed0b7746dcd647e026',
//         },

//         {
//             title: "Coral Bay Resort",
//             image: { url: 'https://a0.muscache.com/im/pictures/miso/Hosting-852441565106208849/original/35039868-f966-4cd6-b12a-d42612535dc2.jpeg?im_w=720', filename: 'xyz' },
//             price: 55000,
//             location: 'London',
//             country: 'Usa',
//             ctgry: 'Islands',
//             desc: 'Nestled amidst palm trees and azure waters, our hotel offers a blissful escape',
//             owner: '664a46ed0b7746dcd647e026',
//         }

//     ])
// }
// addData();


