const Connection = require('../models/connectionModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createConnection = catchAsync(async (req, res, next) => {
  const connection = await Connection.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      connection,
    },
  });
});

exports.getConnection = catchAsync(async (req, res, next) => {
  const connections = await Connection.find().populate('messages');

  if (!connections) {
    return next(new AppError('This connections does not exist!', 400));
  }

  res.status(200).json({
    status: 'success',
    length: connections.length,
    data: {
      connections,
    },
  });
});
