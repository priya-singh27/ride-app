const joi = require('joi');

module.exports = joi.object().keys({
    origin: joi.string().required(),
    destination: joi.string().required(),
    amount: joi.string().required(),
    distance: joi.string().required(),
    time: joi.string().required(),
    vehicle_type:joi.string().required()
});

// const joi = require('joi');

// module.exports = joi.object().keys({
//     fullname: joi.string().required(),
//     email: joi.string().email().required(),
//     password: joi.string().min(8).max(15).required(),
// });

