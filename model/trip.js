const mongoose = require('mongoose');

const trip = new mongoose.Schema({
    driver_id: String,
    user_id:String,
    origin: String,
    destination: String,
    amount:String,
    distance: String,
    time: String,
    otp: String,
    vehicle_no:String,
    vehicle_type: {
        type: String,
        enum:['Car','Bike']
    },
    tripStatus: {
        type: String,
        enum:['not_satarted','en_route','started','cancelled','completed']
    },
    uid: String,
    arrivingIn:String
});

const Trip = mongoose.model('Trip', trip);
module.exports = Trip;