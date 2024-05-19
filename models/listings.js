const mongoose = require('mongoose');

let listingschema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    image: {
        url:String,
        filename:String
    },
    price: {
        type: Number,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    ctgry: {
        type: String,
        required: true
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reviews"
        }
    ],
    owner:{
        required:false,
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

module.exports = mongoose.model('Listings', listingschema);