const { register, login ,acceptRide,verify_otp,toggleStatus,getPendingRides,ride_cancelled,ride_completed} = require('../controller/driver.controller');
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/toggle-status', authMiddleware, toggleStatus);
router.get('/pending-rides', authMiddleware, getPendingRides);
router.post('/accept-ride/:uid', authMiddleware, acceptRide);
router.post('/verify-otp/:uid', authMiddleware, verify_otp);
router.post('/ride-completed/:uid', authMiddleware, ride_completed);
router.post('/ride-cacelled/:uid', authMiddleware, ride_cancelled);

 
//arrives in :you will get curr loc of driver based on that calculate distance and arrival time
module.exports = router;