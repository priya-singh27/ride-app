const Driver = require('../model/driver');

const findDriverByEmail=async (email) =>  {
    try {
        const driver = await Driver.findOne({ email: email });
        console.log("driver: "+driver);

        if (!driver) {
            let errObj = {
                code: 404,
                message:'Driver not found'
            }
            return [errObj,null];
        } else {
            return [null,driver];
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

const findDriverById = async(id) => {
    try {
        const user = await Driver.findById(id);
        if (!user) {
            let errObj = {
                code: 404,
                message:'Drier not found'
            }

            return [errObj, null];
        }
        
        else {
            return [null, user];
        }
    } catch (err) {
        console.log(err);
        let errObj = {
            code: 500,
            message: 'Internal server error'
        };
        return [errObj, null];
    }
}

module.exports = {
    findDriverByEmail,
    findDriverById
}