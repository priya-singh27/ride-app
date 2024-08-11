const Trip = require('../model/trip');

async function generateOtp() {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++){
        OTP = OTP + digits[Math.floor(Math.random() * 10)] ;
    }
    const existingUser = await Trip.findOne({ otp: OTP });
    if (existingUser) {
        return generateOtp();
    }

    return OTP;
}

module.exports = {
    generateOtp
}