const User = require('../models/user');
const HttpError = require('../models/http-error');

const signup = async (req, res, next) => {
  const { email } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    console.log(err);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'User already exists, please login instead.',
      422
    );
    return next(error);
  }

  const createdUser = new User({
    ...req.body,
    cars: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    console.log(err);
    return next(error);
  }

  const token = await createdUser.generateAuthToken();

  res
    .status(201)
    .json({
      userId: createdUser._id,
      email: createdUser.email,
      token: token,
      userType: createdUser.userType,
    });
};

const login = async (req, res, next) => {
  try {
    const existingUser = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await existingUser.generateAuthToken();
    res.json({
      userId: existingUser.id,
      email: existingUser.email,
      token,
      userType: existingUser.userType,
    });
  } catch (err) {
    const error =
      err || new HttpError('Logging in failed, please try again later.', 500);
    return next(error);
  }
};

exports.signup = signup;
exports.login = login;
