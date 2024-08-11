const Trip = require('../model/trip');

const getTripByUniqueId = async (uniqueId) => {
    try {
        const ride = await Trip.findOne({ uid: uniqueId });
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

module.exports = {
    getTripByUniqueId
}