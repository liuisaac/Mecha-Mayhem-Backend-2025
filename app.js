const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

// FIREBASE INIT
const { db } = require('./config/firebaseConfig');

const allowedOrigins = [
  'https://mecha-mayhem-frontend-1crs5fdcj-isaacs-projects-0e7865f8.vercel.app',
  'https://mecha-mayhem-frontend.vercel.app',
  'https://mechamayhem.ca',
  'http://localhost:3000'
];

// CORS
const cors = require('cors');
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// ROUTERS
const indexRouter = require('./views/index');
const usersRouter = require('./views/users');
const photosRouter = require('./views/photos-router');
const awardsRouter = require('./views/awards-router');
const teamsRouter = require('./views/teams-router');
const matchRouter = require('./views/matches-router');


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
app.use('/teams', teamsRouter);
app.use('/matches', matchRouter)

module.exports = app;

const PORT = process.env.DEV_PORT;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

const fs = require('fs');
const https = require('https');
const express = require('express');

const options = {
  key: fs.readFileSync('/path/to/your/private-key.pem'),
  cert: fs.readFileSync('/path/to/your/certificate.pem'),
};

https.createServer(options, app).listen(443, () => {
  console.log('HTTPS server running on port 443');
});