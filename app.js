const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
var bodyParser = require('body-parser');
const userRoutes = require('./api/routes/user');
require('dotenv').config()

const mongoDbUri =
    mongoose.connect(`mongodb+srv://new_user:${process.env.DB_PASSWORD}@cluster0-uofuc.mongodb.net/Cluster0?retryWrites=true&w=majority
`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

mongoose.connection.on('connected', () => {
    console.log('mongoose is connected')
})


app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//to prevent cors errors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,DELETE,GET');
        return res.status(200).json({})
    }
    next();
})



//Routes
app.use('/products', productRoutes);
app.use('/orders', orderRoutes)
app.use('/user', userRoutes)

//with these methods being below the routes, they wil catch all errors that arent successful
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app; 