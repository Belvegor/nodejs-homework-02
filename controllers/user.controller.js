const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const gravatar = require('gravatar');

const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const avatarURL = gravatar.url(email, { s: '250', d: 'identicon', r: 'pg' }); 

    const newUser = new User({ email, password, avatarURL }); 
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    await newUser.save();

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
  
  module.exports = { signup, login, logout, getCurrentUser, uploadAvatar };
