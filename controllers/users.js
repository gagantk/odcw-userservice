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

  res.status(201).json({
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

const profile = async (req, res, next) => {
  res.json(req.userData.user);
};

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.where('userType')
      .ne('admin')
      .select('name email age userType');
    res.json({ users });
  } catch (err) {
    console.log(err);
  }
};

const getUserById = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId).select('name email age userType');
  } catch (err) {
    const error = new HttpError(
      'Fetching user failed, please try again later.',
      500
    );
    console.log(err);
    return next(error);
  }
  if (!user) {
    const error = new HttpError('Could not find user for provided ID.', 404);
    return next(error);
  }
  res.json({ user: user.toObject({ getters: true }) });
};

const updateUser = async (req, res, next) => {
  const { name, email, age, userType } = req.body;
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update user.',
      500
    );
    console.log(err);
    return next(error);
  }
  if (!user) {
    const error = new HttpError('Could not find user by provided ID.', 404);
    return next(error);
  }
  user.name = name;
  user.email = email;
  user.age = age;
  user.userType = userType;

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update user.',
      500
    );
    console.log(err);
    return next(error);
  }

  res.json({ user: user.toObject({ getters: true }) });
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete user.',
      500
    );
    console.log(err);
    return next(error);
  }
  if (!user) {
    const error = new HttpError('Could not find user by provided ID.', 404);
    return next(error);
  }
  try {
    await user.remove();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete user.',
      500
    );
    console.log(err);
    return next(error);
  }

  res.json({ message: 'User deleted.' });
};

exports.signup = signup;
exports.login = login;
exports.profile = profile;
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
