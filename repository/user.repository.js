const User = require('../model/user');

const findUserByEmail=async (email) =>  {
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            let errObj = {
                code: 404,
                message:'User not found'
            }
            return [errObj,null];
        } else {
            return [null,user];
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

const findUserById = async(id) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            let errObj = {
                code: 404,
                message:'User not found'
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
    findUserById,
    findUserByEmail
}