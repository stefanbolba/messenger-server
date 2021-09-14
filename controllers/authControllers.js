const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'succes',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) Check if email and password exist
  if (!email || !password) {
    return next(
      new AppError('Please provide a valid email and password!', 400)
    );
  }

  //2) Check if the user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorect email or password!', 401));
  }

  //3) If eveything is okay, send the token to the client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //1) Getting the token and check if it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in for access', 401)
    );
  }

  //2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user beloging to this token does no longer exists', 401)
    );
  }
  //4) Check if user changed password after the token was issued;
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'The user recently changed their password. Please log in again!',
        401
      )
    );
  }

  //5) Grant access to protected route
  req.user = currentUser;
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { password, newPassword, confirmPassword } = req.body;
  const { id } = req.user;
  console.log(id, password, newPassword, confirmPassword);

  //1) Get the user from the collection
  const user = await User.findById(id).select('+password');
  //2) Check if the POSTed password is correct
  if (!(await user.correctPassword(password, user.password))) {
    return next(
      new AppError('Please make sure the password are the same!', 401)
    );
  }
  //3) If so update the password
  user.password = newPassword;
  user.passwordConfirm = confirmPassword;
  await user.save();

  //4) Log in the user and send the JWT
  createSendToken(user, 200, res);
});

exports.guestLogIn = (req, res, next) => {
  req.body.email = process.env.guest_email;
  req.body.password = process.env.guest_password;
  next();
};
