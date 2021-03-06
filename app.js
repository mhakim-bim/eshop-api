const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const errorhandler = require('./helpers/error-handler');
require('dotenv/config');

//Enabling cors
app.use(cors());
app.options('*', cors());
app.use(authJwt());
app.use(errorhandler);

//api url prefix from enviroment file
const apiPrefix = process.env.API_URL;

//routers
const productsRouter = require('../backend/routers/products');
const categoriesRouter = require('../backend/routers/categories');
const ordersRouter = require('../backend/routers/orders');
const usersRouter = require('../backend/routers/users');

//Middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));


app.use(`${apiPrefix}/products`, productsRouter);
app.use(`${apiPrefix}/categories`, categoriesRouter);
app.use(`${apiPrefix}/orders`, ordersRouter);
app.use(`${apiPrefix}/users`, usersRouter);

//Start database
const connectionString = process.env.CONNECTION_STRING;
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('Database connected');
}).catch((error) => {
    console.log(error);
});

//listen to port 3000
app.listen(3000, () => {
    console.log(apiPrefix);
    console.log('server is running at http://localhost:3000');
});