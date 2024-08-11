const {
    successResponse,
    serverErrorResponse,
    badRequestResponse,
    notFoundResponse,
    handle304
} = require('../utils/response');
const {findUserById } = require('../repository/user.repository');
const { findDriverByEmail, findDriverById } = require('../repository/driver.repository');
const { getPendingTripByUniqueIdAndDelete,getPendingTripByUniqueId,getPendingTrips} = require('../repository/pending_trip.repository');
const {getTripByUniqueId} = require('../repository/trip.repository');
const joi = require('../joi/driver/index');
const Driver = require('../model/driver');
const Trip=require('../model/trip')
const joi_trip = require('../joi/trip/index');
const { generateOtp} = require('../utils/generate_otp');
const bcrypt = require('bcrypt');
const axios = require('axios');

// Load environment variables
require('dotenv').config();

// Use environment variables
const apiKey = process.env.API_KEY;


const ride_cancelled = async (req, res) => {
    try {
      const uniqueId = req.params.uid;
  
      const [err, trip] = await getTripByUniqueId(uniqueId);
      if (err) {
        if (err.code == 404) {
          return notFoundResponse(res, "Trip not found");
        }
            
        if (err.code == 500) {
          return serverErrorResponse(res, "Internal server error.");
        }
      }
  
      trip.tripStatus = 'cancelled';
      await trip.save();
      return successResponse(res, trip, 'Congrats you completed this ride');
  
    } catch (err) {
      console.log(err);
      return serverErrorResponse(res, 'Internal server error');
    }
  }

const ride_completed = async (req, res) => {
    try {
      const uniqueId = req.params.uid;
  
      const [err, trip] = await getTripByUniqueId(uniqueId);
      if (err) {
        if (err.code == 404) {
          return notFoundResponse(res, "Trip not found");
        }
            
        if (err.code == 500) {
          return serverErrorResponse(res, "Internal server error.");
        }
      }
  
      trip.tripStatus = 'completed';
      await trip.save();
  
      const [error, user] = await findUserById(trip.user_id);
      if (error) {
        if (error.code == 404) {
          return notFoundResponse(res, "Trip not found");
        }
            
        if (error.code == 500) {
          return serverErrorResponse(res, "Internal server error.");
        }
      }
  
        user.trips.push(trip);
        await user.save();
        
        const [err1, driver] = await findDriverById(trip.driver_id);
        if (err1) {
            if (err1.code == 404) {
              return notFoundResponse(res, "Trip not found");
            }
                
            if (err1.code == 500) {
              return serverErrorResponse(res, "Internal server error.");
            }
        }
        driver.trips.push(trip);
        await driver.save();
        
        return successResponse(res, trip, 'Congrats you completed this ride');
    }
    catch (err) {
      console.log(err);
      return serverErrorResponse(res, 'Internal server error');
    }
  }

const getPendingRides = async (req, res) => {
    try {
        const driverId = req.user._id;
  
        const [err, driver] = await findDriverById(driverId);
        if (err) {
            if (err.code == 404) {
                return badRequestResponse(res, "Driver not found");
            }
                
            if (err.code == 500) {
                return serverErrorResponse(res, "Internal server error.");
            }
        }
        if (!driver.isOnline) return badRequestResponse(res, 'You are offline,first toggle your status');
  
        const [error, rides] = await getPendingTrips(driver.vehicle_type);
        if (error) {
            if (error.code == 404) {
                return successResponse(res, rides,"No pending rides");
            }
                
            if (error.code == 500) {
                return serverErrorResponse(res, "Internal server error.");
            }
        }  
  
      return successResponse(res, rides, 'all rides that you can take');
  
    } catch (err) {
      console.log(err);
      return serverErrorResponse(res, 'Internal server error');
    }
  }

const toggleStatus = async (req, res) => {
    try {
        const driverId = req.user._id;
        const [err, driver] = await findDriverById(driverId);
        if (err) {
            if (err.code == 404) {
                return notFoundResponse(res, "Driver not found");
            }
                
            if (err.code == 500) {
                return serverErrorResponse(res, "Internal server error.");
            }
        }

        driver.isOnline = !(driver.isOnline);
        await driver.save();
        return successResponse(res, driver, 'Status updated');

    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}

const verify_otp = async (req, res) => {
    try {
        const { error } = joi_trip.verify_otp.validate(req.body);
        if (error) return badRequestResponse(res, 'Invalid otp entered');

        const uniqueId = req.params.uid;

        const [err, trip] = await getTripByUniqueId(uniqueId);
        if (err) {
            if (err.code == 404) {
                return notFoundResponse(res, "Trip not found");
            }
                
            if (err.code == 500) {
                return serverErrorResponse(res, "Internal server error.");
            }
        }

        if (trip.otp != req.body.otp) {
            return badRequestResponse(res, 'Incorrect otp');
        }

        trip.tripStatus = 'started';
        await trip.save();

        return successResponse(res, trip, 'Otp verified');
      
    } catch (err) {
      console.log(err);
      return serverErrorResponse(res, 'Internal server error');
    }
  } 

const acceptRide = async (req, res) => {
    try {
        const driverId = req.user._id;
        const uniqueId = req.params.uid;
        if (!uniqueId) return badRequestResponse(res, 'params is missing');

        const [err, driver] = await findDriverById(driverId);
        if (err) {
            if (err.code == 404) {
                return notFoundResponse(res, "Driver not found");
            }
                
            if (err.code == 500) {
                return serverErrorResponse(res, "Internal server error.");
            }
        }

        const [err2, pendingTrip] = await getPendingTripByUniqueId(uniqueId);
        if (err2) {
            if (err2.code == 404) {
                return notFoundResponse(res, "Pending trip with given unique id not found");
            }
                
            if (err2.code == 500) {
                return serverErrorResponse(res, "Internal server error.");
            }
        }

        const vehicle_no = driver.vehicle_no;
        const otp = await generateOtp();

        let currLoc = req.body.currLoc;

        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${currLoc}&destinations=${pendingTrip.origin}&key=${apiKey}`;
        const response = await axios.get(url);
        const result = response.data;
        let timeInSec = result.rows[0].elements[0].duration.value;

        let trip = new Trip({
            driver_id: driverId,
            user_id: pendingTrip.user_id,
            origin: pendingTrip.origin,
            destination: pendingTrip.destination,
            amount: pendingTrip.amount,
            distance: pendingTrip.distance,
            time: pendingTrip.time,
            otp: otp,
            vehicle_type: pendingTrip.vehicle_type,
            vehicle_no: vehicle_no,
            tripStatus: 'en_route',
            uid: uniqueId,
            // arrivingIn: (timeInSec / 60).toFixed()+" "+ "min"
        });

        await trip.save();
        await getPendingTripByUniqueIdAndDelete(uniqueId);

        return successResponse(res, trip, 'Trip is accepted by the driver');

    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}


const login = async (req,res) => {
    try { 
        const { error } = joi.loginDriver.validate(req.body);
        if (error) {
            return badRequestResponse(res,"Invalid data entered");
        }
    
        let [err, driver] = await findDriverByEmail(req.body.email.toLowerCase());
        if (err) {
            if (err.code == 404) {
                return notFoundResponse(res, "Driver not found");
            }
                
            if (err.code == 500) {
                return serverErrorResponse(res, "Internal server error.");
            }
        }
        const isValid = await bcrypt.compare(req.body.password, driver.password);
        if (!isValid) {
            return badRequestResponse(res, 'Invalid Email or Password');
        }
    
        const token = driver.generateAuthToken();
        driver = await driver.save();

        res.setHeader('x-auth-token', token);
        return successResponse(res, null, "Successfully logged in");
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, "Internal server error");
    }
    
}

const register = async (req, res) => {
    try {
        const [err, driver] = await findDriverByEmail(req.body.email);
        if (err) {//If no driver
            if (err.code == 404) {//If driver not found then create a driver
                try {
                    const {error} = joi.registerDriver.validate(req.body);
    
                    if (error) {
                        return badRequestResponse(res,"Invalid data entered");
                    }
                    let driver = new Driver({
                        fullname: req.body.fullname,
                        email: req.body.email.toLowerCase(),
                        password: req.body.password,
                        vehicle_no: req.body.vehicle_no,
                        vehicle_type:req.body.vehicle_type
                    });
                    const salt = await bcrypt.genSalt(12);
                    driver.password = await bcrypt.hash(driver.password, salt);
                    driver = await driver.save();
                    return successResponse(res,driver,"driver saved in database");
                } catch (err) {//If there is some error while creating the driver do this 
                    console.log(err);
                    return serverErrorResponse(res,"Internal server error");
                }
            } else {//If error code is other than 404
                return serverErrorResponse(res,"Internal Server Error");
            }
        
        } else {//If no error => user exist with the given data
            return badRequestResponse(res,"Driver already registered");
        }
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}

module.exports = {
    register,
    login,
    acceptRide,
    verify_otp,
    toggleStatus,
    getPendingRides,
    ride_completed,
    ride_cancelled,
}