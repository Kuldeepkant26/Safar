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
//             title: "Icicle Retreat",
//             image: { url: 'https://a0.muscache.com/im/pictures/201223a2-3881-44c9-add5-af5ad71aac65.jpg?im_w=720', filename: 'xyz' },
//             price: 44000,
//             location: 'Delhi',
//             country: 'India',
//             ctgry: 'Snow',
//             desc: 'This cozy room offers a breathtaking view of the falling snow through its large bay windows.',
//             owner: '664a46ed0b7746dcd647e026',
//         },
//         {
//             title: "Blizzard Bungalow",
//             image: { url: 'https://a0.muscache.com/im/pictures/miso/Hosting-795129726304842162/original/f5a0bf8c-b58d-43b6-be04-94b3cad47aa6.jpeg?im_w=720', filename: 'xyz' },
//             price: 44000,
//             location: 'Shanghai',
//             country: 'China',
//             ctgry: 'Snow',
//             desc: 'This cozy room offers a breathtaking view of the falling snow through its large bay windows.',
//             owner: '664a46ed0b7746dcd647e026',
//         },
//         {
//             title: "Somerset cog",
//             image: { url: 'https://a0.muscache.com/im/pictures/5558e791-a541-4ad4-8475-bc0ad2cc9175.jpg?im_w=720', filename: 'xyz' },
//             price: 8900,
//             location: 'Espoo',
//             country: 'FinLand',
//             ctgry: 'Snow',
//             desc: 'This cozy room offers a breathtaking view of the falling snow through its large bay windows.',
//             owner: '664a46ed0b7746dcd647e026',
//         },

//         {
//             title: "Snowfall Suite",
//             image: { url: 'https://a0.muscache.com/im/pictures/825dd086-c1e0-4224-903d-5447991c8197.jpg?im_w=720', filename: 'xyz' },
//             price: 33000,
//             location: 'California',
//             country: 'Canada',
//             ctgry: 'Snow',
//             desc: 'This cozy room offers a breathtaking view of the falling snow through its large bay windows.',
//             owner: '664a46ed0b7746dcd647e026',
//         },

//         {
//             title: "Frosty Haven",
//             image: { url: 'https://a0.muscache.com/im/pictures/fe9495e3-08e8-4d59-b81f-f59bde09dbcd.jpg?im_w=720', filename: 'xyz' },
//             price: 55000,
//             location: 'London',
//             country: 'Usa',
//             ctgry: 'Snow',
//             desc: 'This cozy room offers a breathtaking view of the falling snow through its large bay windows.',
//             owner: '664a46ed0b7746dcd647e026',
//         }

//     ])
// }
// addData();


