const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');
const User = require('../models/user');

exports.user = async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error('Authentication failed!');
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken._id);
    req.userData = { userId: decodedToken._id, user: user };
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!', 403);
    console.log(err);
    return next(error);
  }
};

exports.admin = async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error('Authentication failed!');
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken._id);
    if (user.userType.toLowerCase() !== 'admin') {
      throw new Error('Authentication failed!');
    }
    req.userData = { userId: decodedToken._id, user: user };
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!', 403);
    console.log(err);
    return next(error);
  }
};
