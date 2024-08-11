const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const secretKey = process.env.SECRET_KEY;

const driverSchema = new mongoose.Schema({
    fullname: String,
    email: String,
    password: String,
    vehicle_no: String,
    vehicle_type: {
        type: String,
        enum:['Car','Bike']
    },
    trips: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trips'
    }],
    isOnline: {
        type: Boolean,
        default:true
    },
    // currLoc:String
});

driverSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, secretKey);
    return token;
}
const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;