const mongoose = require('mongoose');

const trip = new mongoose.Schema({
    user_id: {
        type: String,
        ref:'users'
    },
    origin: String,
    destination: String,
    amount: String,
    distance: String,
    time: String,
    tripStatus: {
        type: String,
        enum:['not_satarted','en_route','started','cancelled','completed']
    },
    vehicle_type: {
        type: String,
        enum:['Car','Bike']
    },
    
    uid:String
        
});

const Pending_Trip = mongoose.model('Pending_Trip', trip);
module.exports = Pending_Trip;