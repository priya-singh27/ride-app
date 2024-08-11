const {
  successResponse,
  serverErrorResponse,
  badRequestResponse,
  notFoundResponse,
  handle304
} = require('../utils/response');
const axios = require('axios');
const Pending_Trip = require('../model/pending_trip');
const { getPendingTrips,getPendingTripByUniqueId} = require('../repository/pending_trip.repository');
const { findDriverById } = require('../repository/driver.repository');
const {getTripByUniqueId } = require('../repository/trip.repository');
const joi = require('../joi/trip/index');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
require('dotenv').config();

// Use environment variables
const apiKey = process.env.API_KEY;
const farePerKm = process.env.FARE_KM;
const farePerMin = process.env.FARE_MINUTE;
const bookingFee = process.env.BOOKING_FEE;
const basePrice = process.env.BASE_PRICE;




const getTrip = async (req, res) => {
  try {
    const uniqueId = req.params.uid;

    const [err, trip] = await getTripByUniqueId(uniqueId);

    if (err) {
      if (err.code == 404) {
        return notFoundResponse(res,'trip not found');//9707845569
      }
          
      if (err.code == 500) {
          return serverErrorResponse(res, "Internal server error.");
      }
    }
    
    
    return successResponse(res, trip,'Your trip details');
  } catch (err) {
    console.log(err);
    return serverErrorResponse(res, 'Internal server error');
  }
}

//call every 10 sec
const reqRide =async (req,res) => {
  try {
    const uniqueId = req.params.uid;
    const [err, trip] = await getPendingTripByUniqueId(uniqueId);

    if (err) {
      if (err.code == 404) {
        return successResponse(res, [], 'your ride has been confirmed');
      }
          
      if (err.code == 500) {
          return serverErrorResponse(res, "Internal server error.");
      }
    }
    
    return successResponse(res, trip,'Your request is still pending');
  } catch (err) {
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
          return notFoundResponse(res, "Driver not found");
      }
          
      if (err.code == 500) {
          return serverErrorResponse(res, "Internal server error.");
      }
    }

    const [error, rides] = await getPendingTrips(driver.vehicle_type);
    if (error) {
      if (error.code == 404) {
          return notFoundResponse(res, "Driver not found");
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



const initiate_booking = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const { error } = joi.initiateBookingRide.validate(req.body);
    if (error) {
      return badRequestResponse(res, 'Invalid data entered');
    }
    const uniqueId = uuidv4();

    let pending_trip = new Pending_Trip({
      user_id: userId,
      destination:  req.body.destination,
      origin: req.body.origin,
      amount: req.body.amount,
      distance: req.body.distance,
      time: req.body.time,
      tripStatus: 'not_satarted',
      vehicle_type: req.body.vehicle_type,
      uid:uniqueId
    });
    const result = await pending_trip.save();

    return successResponse(res, result, 'Your pending_ride has been created');

  } catch (err) {
    console.log(err);
    return serverErrorResponse(res, 'Internal server error');
  }
}

/**
 * per km:rs 5
 * per min:rs 10
 * booking fee:rs 5
 * base price: rs 10
 */
const totalFare = async (req, res) => {
  
  let pickUp = req.body.origin;

  let destination = req.body.destination;

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickUp}&destinations=${destination}&key=${apiKey}`;
  try {
    const response = await axios.get(url);
    const result = response.data;

    const distanceInMeters = result.rows[0].elements[0].distance.value;
    let timeInSec = result.rows[0].elements[0].duration.value;

    const distanceFare = (distanceInMeters / 1000) * farePerKm;
    const timeFare = (timeInSec / 60) * farePerMin;
    const fare =  distanceFare+ timeFare + basePrice+ bookingFee;
    const obj = {
      amount:parseFloat(fare).toFixed(),
      distance: (distanceInMeters / 1000)+" "+"km",
      time: (timeInSec / 60).toFixed()+" "+ "min"
    }
    return successResponse(res, obj, 'The total fare for your ride');

  } catch (error) {
    console.error("Error fetching data: ", error);
    return res.send(error);
  }
  
}

module.exports = {
  totalFare,
  initiate_booking,
  getPendingRides,
  reqRide,
  getTrip
}

