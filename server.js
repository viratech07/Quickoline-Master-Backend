const express = require('express')
const app = express()
const port = 3000;
const connectDB = require('./src/config/db');

connectDB();

//JSON parser
app.use(express.json());

//URL encoding parser
app.use(express.urlencoded({ extended: true }));



app.listen ( port, () => {
    console.log(`Vimal server is running on ${port}`)
})