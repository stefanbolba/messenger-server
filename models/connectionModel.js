const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    // createdBy: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: [true, 'A connection must be created by an user!'],
    //   },
    // ],
    name: {
      type: String,
      required: [true, 'A connection must have a name!'],
      unique: [true, 'A connection must be unique!'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populate user with the createdBy array
// connectionSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'createdBy',
//     select: '-friends -__v',
//   });
//   next();
// });

//Virtual populate the messages for each Connection
connectionSchema.virtual('messages', {
  ref: 'Message',
  foreignField: 'connection',
  localField: '_id',
});

const Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection;
