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
//             title: "Ohio Rainy Retreat",
//             image: 'https://www.redfin.com/blog/wp-content/uploads/2023/09/GettyImages-108352226.jpg',
//             price: 444,
//             location: 'Ohio',
//             country: 'FinLand',
//             ctgry: 'Rainy',
//             desc: 'Great place for rain lovers'
//         },
//         {
//             title: "Ohio Rainy Retreat",
//             image: 'https://www.worldatlas.com/r/w768/upload/d3/ef/9d/shutterstock-148201862.jpg',
//             price: 444,
//             location: 'Ohio',
//             country: 'FinLand',
//             ctgry: 'Rainy',
//             desc: 'Great place for rain lovers'
//         },
//         {
//             title: "Ohio Rainy Retreat",
//             image: 'https://nenow.in/wp-content/uploads/2023/06/the-splendid-munnar-kerala-during-monsoon.jpg',
//             price: 444,
//             location: 'Ohio',
//             country: 'FinLand',
//             ctgry: 'Rainy',
//             desc: 'Great place for rain lovers'
//         },

//         {
//             title: "California Beach Escape",
//             image: 'https://www.backpacknxplore.com/wp-content/uploads/2019/06/agumbe-park-min.jpg',
//             price: 333,
//             location: 'California',
//             country: 'USA',
//             ctgry: 'Beach',
//             desc: 'Perfect getaway for beach enthusiasts'
//         },

//         {
//             title: "London Birthday Celebration",
//             image: 'https://media.istockphoto.com/id/2149209960/photo/beautiful-background-for-photos-decor-of-the-place-for-photos.jpg?s=612x612&w=0&k=20&c=EmEO29CQ0B5rZVYebSLOn5Ocj9JwtQjiNw7GJNRBtRY=',
//             price: 555,
//             location: 'London',
//             country: 'UK',
//             ctgry: 'Birthday',
//             desc: 'Celebrate your special day in style'
//         }
//         ,
//         {
//             title: "Tokyo Rainy Sanctuary",
//             image: 'https://media.istockphoto.com/id/512754938/photo/milecastle-42-on-hadrians-wall.jpg?s=612x612&w=0&k=20&c=lujDChEsCjcEalvS9YkC73OqZ3vuICQ_-18xtaURaPo=',
//             price: 777,
//             location: 'Tokyo',
//             country: 'Japan',
//             ctgry: 'Rainy',
//             desc: 'Relax in the midst of soothing rain showers'
//         }
//         ,
//         {
//             title: "Sydney Beach Bliss",
//             image: 'https://static.toiimg.com/thumb/msid-104298293,width-748,height-499,resizemode=4,imgsize-118448/.jpg',
//             price: 888,
//             location: 'Sydney',
//             country: 'Australia',
//             ctgry: 'Beach',
//             desc: 'Enjoy sun, sand, and waves at the beach'
//         },
//         {
//             title: "Sydney Beach Bliss",
//             image: 'https://www.travelandleisure.com/thmb/3_WqlhapMlbFfKZK4EmzFrGyfHc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/palawan-CHEAPBEACH0120-f525a1e1febc4b18b6bb045cb50f8863.jpg',
//             price: 888,
//             location: 'Sydney',
//             country: 'Australia',
//             ctgry: 'Beach',
//             desc: 'Enjoy sun, sand, and waves at the beach'
//         },
//         {
//             title: "Sydney Beach Bliss",
//             image: 'https://travel-blog.happyeasygo.com/wp-content/uploads/2019/01/Goa-950-x-600.jpg',
//             price: 888,
//             location: 'Sydney',
//             country: 'Australia',
//             ctgry: 'Beach',
//             desc: 'Enjoy sun, sand, and waves at the beach'
//         },
//         {
//             title: "Sydney Beach Bliss",
//             image: 'https://static.wanderon.in/wp-content/uploads/2024/05/relaxing-beach-destinations.jpg',
//             price: 888,
//             location: 'Sydney',
//             country: 'Australia',
//             ctgry: 'Beach',
//             desc: 'Enjoy sun, sand, and waves at the beach'
//         },

//         {
//             title: "Paris Birthday Extravaganza",
//             image: 'https://media.istockphoto.com/id/1469403410/photo/delicious-desserts-on-the-candy-bar-in-pinks-color.jpg?s=612x612&w=0&k=20&c=cnbAPbaTGYodr2PRwh1R4tUdjevi-THZioxFcOGkEmE=',
//             price: 999,
//             location: 'Paris',
//             country: 'France',
//             ctgry: 'Birthday',
//             desc: 'Make your birthday unforgettable'
//         }
//         ,
//         {
//             title: "Paris Birthday Extravaganza",
//             image: 'https://media.istockphoto.com/id/1421042732/photo/birthday-holiday-event-for-children-with-decoration-in-a-unicorn.jpg?s=612x612&w=0&k=20&c=T5SA9xNLa_bl3_ergt3olBK5LZRfhe6i9rtn96QUBno=',
//             price: 999,
//             location: 'Paris',
//             country: 'France',
//             ctgry: 'Birthday',
//             desc: 'Make your birthday unforgettable'
//         }
//         ,
//         {
//             title: "Paris Birthday Extravaganza",
//             image: 'https://media.istockphoto.com/id/1358636622/photo/beautiful-christmas-decor-in-silvery-pink-tones-christmas-lights-and-toys-on-a-concrete.jpg?s=612x612&w=0&k=20&c=0R-ZqBJf8EKjkLQp2FJY0lchp1zmFd0c-qoWoYuUgJ0=',
//             price: 999,
//             location: 'Paris',
//             country: 'France',
//             ctgry: 'Birthday',
//             desc: 'Make your birthday unforgettable'
//         }
//         ,
//         {
//             title: "Athens Historic Adventure",
//             image: 'https://phgcdn.com/images/uploads/historichotels/package/HHA-hp-offers-Friends-of-HHA.jpg',
//             price: 111,
//             location: 'Athens',
//             country: 'Greece',
//             ctgry: 'Historic',
//             desc: 'Step back in time to ancient civilizations'
//         }
//         ,
//         {
//             title: "Athens Historic Adventure",
//             image: 'https://cdn.choosechicago.com/uploads/2019/05/Huber_Palmer_House_Lobby_2013_Adjusted_92b57941-89ae-4b6c-a2a3-a10b2efe068c-2400x1600.jpg',
//             price: 111,
//             location: 'Athens',
//             country: 'Greece',
//             ctgry: 'Historic',
//             desc: 'Step back in time to ancient civilizations'
//         }
//         ,
//         {
//             title: "Athens Historic Adventure",
//             image: 'https://digital.ihg.com/is/image/ihg/kimpton_london_1700x750',
//             price: 111,
//             location: 'Athens',
//             country: 'Greece',
//             ctgry: 'Historic',
//             desc: 'Step back in time to ancient civilizations'
//         }
//         ,
//         {
//             title: "Athens Historic Adventure",
//             image: 'https://phgcdn.com/images/uploads/JBKCC/masthead/JBKCC-masthead-claremontexterior.jpg',
//             price: 111,
//             location: 'Athens',
//             country: 'Greece',
//             ctgry: 'Historic',
//             desc: 'Step back in time to ancient civilizations'
//         }
//         ,
//         {
//             title: "Athens Historic Adventure",
//             image: 'https://phgcdn.com/images/uploads/WASWI/masthead/HHA-int-masthead-The-Willard-InterContinental.jpg',
//             price: 111,
//             location: 'Athens',
//             country: 'Greece',
//             ctgry: 'Historic',
//             desc: 'Step back in time to ancient civilizations'
//         }
//         ,
//         {
//             title: "Vancouver Rainy Getaway",
//             image: 'https://media.istockphoto.com/id/578828950/photo/mithraic-temple-at-hadrians-wall-england.jpg?s=612x612&w=0&k=20&c=GXL7gWyOxu6O1aKttHpnfBTbvuZmBuzvbzrMJf4VAec=',
//             price: 222,
//             location: 'Vancouver',
//             country: 'Canada',
//             ctgry: 'Rainy',
//             desc: 'Embrace the serenity of rainy days'
//         }

//     ])
// }
// addData();


