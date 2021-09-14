const express = require('express');

const authController = require('../controllers/authControllers');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/guestLogIn', authController.guestLogIn, authController.login);

//Protect this routes. Make sure the user has a valid token before access

router.route('/getMe').get(authController.protect, userController.getMe);

router.use(authController.protect);

router.route('/').get(userController.getAllUsers);

router.patch('/addFriend', userController.addFriend);
router.patch('/removeFriend', userController.removeFriend);
router.patch('/updatePassword', authController.updatePassword);
router.patch('/updateMe', userController.updateMe);

router.post(
  '/updatePhoto',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto
);

router.get('/getAll', userController.getAllUsers);

module.exports = router;
