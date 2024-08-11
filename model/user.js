const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const secretKey = process.env.SECRET_KEY;

const userSchema = new mongoose.Schema({
    fullname: String,
    email: String,
    password: String,
    trips: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trip'
    }]
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, secretKey);
    return token;
}
const User = mongoose.model('User', userSchema);

module.exports = User;