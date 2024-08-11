const authMiddleware=require('../middleware/authMiddleware')
const { totalFare, initiate_booking ,reqRide,getTrip} = require('../controller/trip.controller');
const express = require('express');
const router = express.Router();

router.post('/get-fare', authMiddleware,totalFare);

//Make sure that when we are intiating booking for pending ride , recalculate the fare , 
//so that the updated fare should be added to the db and proceed accordingly
router.post('/book-ride', authMiddleware, initiate_booking);
router.get('/requesting-ride/:uid', authMiddleware, reqRide);
router.get('/get-trip/:uid',getTrip);

module.exports = router;