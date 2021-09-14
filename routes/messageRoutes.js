const express = require('express');
const messageController = require('../controllers/messageController');
const authController = require('../controllers/authControllers');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(messageController.getAllMessages)
  .post(messageController.createMessage)
  .patch(messageController.updateMessage);

router.patch('/deleteMessage', messageController.deleteMessage);
router.patch('/updateAllMessages', messageController.allMessagesViewd);

module.exports = router;
