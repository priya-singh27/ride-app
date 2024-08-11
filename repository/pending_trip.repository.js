const Pending_Trip = require('../model/pending_trip');

const getPendingTripByUniqueId=async (uniqueId) => {
    try {
        const ride = await Pending_Trip.findOne({uid:uniqueId})
        if (!ride) {
            let errObj = {
                code: 404,
                message:'no rides found yet'
            }
            return [errObj,null];
        } 
        return [null, ride];
    }
    catch (err) {
        console.log(err);
        let errObj = {
            code: 500,
            message: 'Internal server error'
        };
        return [errObj, null]; 
    }
}

const getPendingTripByUniqueIdAndDelete=async (uniqueId) => {
    try {
        const ride = await Pending_Trip.findOne({uid:uniqueId})
        if (!ride) {
            let errObj = {
                code: 404,
                message:'no rides found yet'
            }
            return [errObj,null];
        } 
        const deletedTrip=await Pending_Trip.findByIdAndDelete(ride._id);
        return [null, deletedTrip];
    }
    catch (err) {
        console.log(err);
        let errObj = {
            code: 500,
            message: 'Internal server error'
        };
        return [errObj, null]; 
    }
}

const getPendingTripById = async (tripId) => {
    try {
        const rides = await Pending_Trip.findById(tripId);
        if (!rides) {
            let errObj = {
                code: 404,
                message:'no rides found yet'
            }
            return [errObj,null];
        } else {
            return [null,rides];
        }
    }
    catch (err) {
        console.log(err);
        let errObj = {
            code: 500,
            message: 'Internal server error'
        };
        return [errObj, null]; 
    }
}

const getPendingTrips=async (vehicleType) =>  {
    try {
        const rides = await Pending_Trip.find({vehicle_type:vehicleType});
        if (!rides) {
            let errObj = {
                code: 404,
                message:'no rides found yet'
            }
            return [errObj,null];
        } else {
            return [null,rides];
        }
    }
    catch (err) {
        console.log(err);
        let errObj = {
            code: 500,
            message: 'Internal server error'
        };
        return [errObj, null]; 
    }
}

module.exports = {
    getPendingTrips,
    getPendingTripById,
    getPendingTripByUniqueIdAndDelete,
    getPendingTripByUniqueId
}