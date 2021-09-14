const { ObjectId } = require('mongodb');
const Message = require('../models/messageModel');
const Connection = require('../models/connectionModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllMessages = catchAsync(async (req, res, next) => {
  const messages = await Message.find();

  res.status(200).json({
    status: 'success',
    length: messages.length,
    data: {
      messages,
    },
  });
});

exports.createMessage = catchAsync(async (req, res, next) => {
  const message = await Message.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      message,
    },
  });
});

exports.updateMessage = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  const message = `${req.body.message}/|*ThisMessageWasUpdated/|*`;

  const newMessage = await Message.findByIdAndUpdate(
    id,
    { message },
    { new: true, runValidators: true }
  );

  res.status(201).json({
    status: 'success',
    data: {
      newMessage,
    },
  });
});

exports.deleteMessage = catchAsync(async (req, res, next) => {
  const { id } = req.body;

  const message = 'Message Deleted';

  const newMessage = await Message.findByIdAndUpdate(
    id,
    { message },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(201).json({
    status: 'success',
    data: {
      newMessage,
    },
  });
});

exports.allMessagesViewd = catchAsync(async (req, res, next) => {
  const { connectionName } = req.body;
  const connection = await Connection.find({ name: connectionName });
  await Message.updateMany(
    {
      connection: ObjectId(connection[0].id),
      viewd: false,
    },
    { viewd: true }
  );
  res.status(200).json({
    status: 'success',
    data: '',
  });
});
