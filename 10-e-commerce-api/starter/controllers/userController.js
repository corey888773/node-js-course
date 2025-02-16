const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const User = require("../models/User");
const { createTokenUser, checkPermissions } = require("../utils");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");

  res.status(StatusCodes.OK).json({ success: true, users });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");

  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ success: true, user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ success: true, user: req.user });
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    throw new CustomError.BadRequestError("Please provide name and email");
  }
  const user = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { name, email },
    { new: true, runValidators: true }
  );
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ success: true, user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      "Please provide current and new password"
    );
  }

  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePasswords(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthorizedError("Incorrect password");
  }

  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({ success: true });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
