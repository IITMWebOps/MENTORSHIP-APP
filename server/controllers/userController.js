const User = require("../models/User");

/* ============================================================================
   @desc    Get Logged-in User Profile
   @route   GET /api/users/me
   @access  Private
============================================================================ */

exports.getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ============================================================================
   @desc    Update Logged-in User Profile
   @route   PUT /api/users/me
   @access  Private
============================================================================ */

exports.updateProfile = async (req, res) => {
  try {
    // Fields editable by the user only
    const allowedFields = [
      "mobile",
      "hostel",
      "roomNo",
      "alternateMobile",
      "bio",
      "interests",
      "linkedin",
      "github",
      "profilePhoto",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).select("-googleId");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: user,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ============================================================================
   @desc    Get All Users
   @route   GET /api/users
   @access  Admin
============================================================================ */

exports.getAllUsers = async (req, res) => {
  try {

    const users = await User.find(
      {},
      "rollNo name email role department program status"
    ).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

/* ============================================================================
   @desc    Get User By ID
   @route   GET /api/users/:id
   @access  Admin
============================================================================ */

exports.getUserById = async (req, res) => {
  try {

    const user = await User.findById(req.params.id).select("-googleId");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

/* ============================================================================
   @desc    Update User Role
   @route   PUT /api/users/:id/role
   @access  Admin
============================================================================ */

exports.updateRole = async (req, res) => {
  try {

    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Role updated successfully.",
      data: user,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

/* ============================================================================
   @desc    Activate / Deactivate User
   @route   PUT /api/users/:id/status
   @access  Admin
============================================================================ */

exports.changeStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "User status updated successfully.",
      data: user,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};