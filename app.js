const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const bodyParser = require('body-parser');

const AppError = require('./utils/appError');
const globalErrorHadler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const connectionRouter = require('./routes/connectionRoutes');
const messageRouter = require('./routes/messageRoutes');

const app = express();

//Used for static files like html etc
app.use(express.static(path.join(__dirname, 'dist')));

//Set  security HTTP headers
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));

  //Limit the number of request from the same IP
  const limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from thus IP. Please try again in an hour!',
  });
  app.use('/api', limiter);
}

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection sanitization
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

//ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/connection', connectionRouter);
app.use('/api/v1/messages', messageRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//ERROR HANDLING MIDLEWARE
app.use(globalErrorHadler);

module.exports = app;
