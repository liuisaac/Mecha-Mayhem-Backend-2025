const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

// FIREBASE INIT

const { db } = require('./config/firebaseConfig');


// CORS
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000'
}));


const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// ROUTERS
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const photosRouter = require('./routes/photos');
const awardsRouter = require('./routes/awards');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/photos', photosRouter);
app.use('/awards', awardsRouter);

module.exports = app;

const PORT = process.env.DEV_PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
