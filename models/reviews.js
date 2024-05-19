const mongoose = require('mongoose');

let reviewSchema = mongoose.Schema({
    rating: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
          ref: "User",
      }
});

module.exports = mongoose.model('Reviews', reviewSchema);