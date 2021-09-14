const multer = require('multer');
const multerS3 = require('multer-s3');
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

//Upload and resize photos
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.includes('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `${req.user.id}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`dist/img/users/${req.file.filename}`);

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { photo: `/img/users/${req.file.filename}` },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'succes',
    data: updatedUser,
  });
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const { id } = req.user;
  const friends = await User.find({ _id: { $ne: id } }).select(id);
  const arr = friends.map((el) => el._id);
  const me = await User.findByIdAndUpdate(
    id,
    { $addToSet: { friends: { $each: arr } } },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'succes',
    data: {
      user: me,
    },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const me = await User.findById(id);

  if (!me) {
    return next(new AppError('This user does not exist!', 404));
  }

  res.status(200).json({
    status: 'succes',
    data: {
      user: me,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }

  //2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredObj = filterObj(req.body, 'name', 'email');
  // 2.1) Check if req.file exist for photo field update
  if (req.file) filteredObj.photo = req.file.filename;

  //2) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'succes',
    data: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'succes',
    data: null,
  });
});

exports.addFriend = catchAsync(async (req, res, next) => {
  const newUser = await User.findByIdAndUpdate(
    req.body.id,
    { $addToSet: { friends: req.body.friend_id } },
    {
      new: true,
      runValidators: true,
    }
  );

  return res.status(200).json({
    status: 'succes',
    data: {
      newUser,
    },
  });
});

exports.removeFriend = catchAsync(async (req, res, next) => {
  const newUser = await User.findByIdAndUpdate(
    req.body.id,
    {
      $pull: { friends: { $in: [req.body.friend_id] } },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  return res.status(200).json({
    status: 'success',
    data: {
      newUser,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) Create an error if the user POSTs password date
  if (req.body.password || req.body.passwordConfirm) {
    next(
      new AppError(
        'This route is not for password updates. Pleaase use /updateMyPassword',
        400
      )
    );
  }
  //2) Filtere out unwanted fields name that are now allowed
  const filteredObj = filterObj(req.body, 'name', 'email');
  // 2.1) Check if req.file exist for photo field update
  if (req.file) filteredObj.photo = req.file.filename;

  //3) Update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'succes',
    data: {
      user: updateUser,
    },
  });
});
