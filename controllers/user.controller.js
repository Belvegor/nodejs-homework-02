const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const gravatar = require('gravatar');
const mg = require('../mailgunConfig');
const { v4: uuidv4 } = require('uuid');

const verifyUser = async (req, res, next) => {
  try {
    const verificationToken = req.params.verificationToken;
        const user = await User.findOne({ verificationToken });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });    }
    user.verify = true;
    user.verificationToken = null;
    await user.save();
    res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const sendVerificationEmail = async (email, verificationToken) => {
  const mailOptions = {
    from: process.env.EMAIL_SENDER,
    to: email,
    subject: 'Email Verification',
    text: `Click the following link to verify your email: ${process.env.BASE_URL}/api/users/verify/${verificationToken}`,
  };

  await mg.messages().send(mailOptions);
};

const resendVerificationEmail = async (req, res, next) => {
  try {
     if (!req.body.email) {
      return res.status(400).json({ message: 'Missing required field email' });
    }
     const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
     if (user.verify) {
      return res.status(400).json({ message: 'Verification has already been passed' });
    }
     const verificationToken = uuidv4();
     user.verificationToken = verificationToken;
    await user.save();
    await sendVerificationEmail(user.email, verificationToken);
     res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const avatarURL = gravatar.url(email, { s: '250', d: 'identicon', r: 'pg' }); 

    const verificationToken = uuidv4();

    const newUser = new User({ email, password, avatarURL, verificationToken }); 
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    await newUser.save();

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

        const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

        const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

       const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        user.token = token;
    await user.save();

        res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
    try {
      req.user.token = null;
      await req.user.save();
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
  
  const getCurrentUser = async (req, res, next) => {
    try {
      res.json({
        email: req.user.email,
        subscription: req.user.subscription
      });
    } catch (error) {
      next(error);
    }
  };

  const uploadAvatar = async (req, res, next) => {
    try {
            const user = req.user;  
            if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
              const image = await Jimp.read(req.file.path);
                  await image.resize(250, 250);
              const filename = `${user._id}-${Date.now()}${path.extname(req.file.originalname)}`;
              await image.writeAsync(path.join(__dirname, '..', '..', 'public', 'avatars', filename));
              user.avatarURL = `/avatars/${filename}`;
      await user.save();
              fs.unlinkSync(req.file.path);
              res.status(200).json({ avatarURL: user.avatarURL });
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = { signup, login, logout, getCurrentUser, uploadAvatar, verifyUser, resendVerificationEmail };
