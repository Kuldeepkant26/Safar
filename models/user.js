const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
let userSchema = mongoose.Schema({
    email: {
        type: String,
  
    }
})
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);