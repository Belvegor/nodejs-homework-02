const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/user.controller');
const verifyToken = require('../../controllers/auth.middleware');

router.post('/signup', UserController.signup);
router.post('/login', UserController.login);
router.get('/logout', verifyToken, UserController.logout);
router.get('/current', verifyToken, UserController.getCurrentUser);

module.exports = router;

