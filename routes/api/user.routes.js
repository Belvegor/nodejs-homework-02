const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/user.controller');
const verifyToken = require('../../controllers/auth.middleware');
const multer = require('multer');


router.post('/signup', UserController.signup);
router.post('/login', UserController.login);
router.get('/logout', verifyToken, UserController.logout);
router.get('/current', verifyToken, UserController.getCurrentUser);
router.get('/verify/:verificationToken', UserController.verifyUser);

const upload = multer({ dest: 'tmp/' });
router.patch('/avatars', verifyToken, upload.single('avatar'), UserController.uploadAvatar);

module.exports = router;

