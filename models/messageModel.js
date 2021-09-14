const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    require: [true, 'A message must exist!'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  viewd: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A message must be created by an user!'],
  },
  connection: {
    type: mongoose.Schema.ObjectId,
    ref: 'Connection',
    required: [true, 'A message must be part of a connection!'],
  },
});

messageSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'createdBy',
    select: '-friends name _id',
  });
  next();
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
