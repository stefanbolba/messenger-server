const express = require('express');
const authController = require('../controllers/authControllers');
const connectionController = require('../controllers/connectionController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(connectionController.getConnection)
  .post(connectionController.createConnection);

module.exports = router;
