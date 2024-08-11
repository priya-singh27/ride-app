const { register, login } = require('../controller/user.controller');
const express = require('express');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;