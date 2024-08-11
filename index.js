require('./utils/config')();
require('./database/connection')();

const express = require('express');
const app = express();

app.use(express.json());

const user = require('./routes/user');
const driver = require('./routes/driver');
const trip = require('./routes/trip');

app.use('/user', user);
app.use('/driver', driver);
app.use('/trip',trip);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}..`));



