const express = require('express');
const Sequelize = require('sequelize');
const appRoute = require('./routes/routes');
const cors = require("cors");
const app = express();

const path = require('path');
const PORT = 8080;

app.use(express.json({ limit: '30mb' }))
app.use(express.urlencoded({ extended: true, limit: "30mb", parameterLimit: 1000000 }));
app.use(cors({ credentials: true, origin: true }));

app.use('/', appRoute)
// app listen
app.listen(PORT, function() {
    console.log("Application is Running !!!")
});
