const {
    successResponse,
    serverErrorResponse,
    badRequestResponse,
    notFoundResponse,
    handle304
} = require('../utils/response');
const { findUserByEmail, findUserById } = require('../repository/user.repository');
const joi = require('../joi/user/index');
const User = require('../model/user');
const bcrypt = require('bcrypt');



const login = async (req,res) => {
    try { 
        const { error } = joi.loginUser.validate(req.body);
        if (error) {
            return badRequestResponse(res,"Invalid data entered");
        }
    
        let [err,user] = await findUserByEmail(req.body.email);
        if (err) {
            if (err.code == 404) {
                return badRequestResponse(res, "User not found");
            }
                
            if (err.code == 500) {
                return serverErrorResponse(res, "Internal server error.");
            }
        }
    
        const isValid = await bcrypt.compare(req.body.password, user.password);
        if (!isValid) {
            return badRequestResponse(res, 'Invalid Email or Password');
        }
    
        const token = user.generateAuthToken();
        user = await user.save();

        res.setHeader('x-auth-token', token);
        return successResponse(res, null, "Successfully logged in");
    } catch (err) {
        return serverErrorResponse(res, "Something went wrong");
    }
    
}

const register = async (req, res) => {
    try {
        const [err, user] = await findUserByEmail(req.body.email);
        if (err) {//If no user
            if (err.code == 404) {//If user not found then create a user
                try {
                    const {error} = joi.registerUser.validate(req.body);
    
                    if (error) {
                        return badRequestResponse(res,"Invalid data entered");
                    }
                    let user = new User({
                        fullname: req.body.fullname,
                        email: req.body.email.toLowerCase(),
                        password: req.body.password,
                    });
                    
                    const salt = await bcrypt.genSalt(12);
                    user.password = await bcrypt.hash(user.password, salt);
                    user = await user.save();
                    return successResponse(res,user,"User saved in database");
                } catch (err) {//If there is some error while creating the user do this 
                    console.log(err);
                    return serverErrorResponse(res,"Internal server error");
                }
            } else {//If error code is other than 404
                return serverErrorResponse(res,"Internal Server Error");
            }
        
        } else {//If no error => user exist with the given data
            return badRequestResponse(res,"User already registered");
        }
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}

module.exports = {
    register,
    login
}