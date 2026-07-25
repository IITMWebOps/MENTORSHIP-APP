const Mentorship = require("../models/Mentorship");
const User = require("../models/User");

/* ============================================================================
   @desc    Add Mentee
   @route   POST /api/mentorship/add
   @access  Mentor
============================================================================ */

exports.addMentee = async (req, res) => {
  try {

    const { rollNo } = req.body;

    if (!rollNo) {
      return res.status(400).json({
        success: false,
        message: "Roll number is required.",
      });
    }

    // Find mentee
    const mentee = await User.findOne({
      rollNo: rollNo.toUpperCase(),
      role: "mentee",
      status: true,
    });

    if (!mentee) {
      return res.status(404).json({
        success: false,
        message: "Mentee not found.",
      });
    }

    // Check if already assigned
    const existing = await Mentorship.findOne({
      mentee: mentee._id,
      status: "active",
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Mentee is already assigned to a mentor.",
      });
    }

    const mentorship = await Mentorship.create({
      mentor: req.user._id,
      mentee: mentee._id,
    });

    res.status(201).json({
      success: true,
      message: "Mentee added successfully.",
      data: mentorship,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

/* ============================================================================
   @desc    View My Mentees
   @route   GET /api/mentorship/my-mentees
   @access  Mentor
============================================================================ */

exports.getMyMentees = async (req, res) => {
  try {

    const mentorships = await Mentorship.find({
      mentor: req.user._id,
      status: "active",
    })
      .populate(
        "mentee",
        "rollNo name email mobile department hostel"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: mentorships.length,
      data: mentorships,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

/* ============================================================================
   @desc    View My Mentor
   @route   GET /api/mentorship/my-mentor
   @access  Mentee
============================================================================ */

exports.getMyMentor = async (req, res) => {
  try {

    const mentorship = await Mentorship.findOne({
      mentee: req.user._id,
      status: "active",
    }).populate(
      "mentor",
      "rollNo name email mobile department"
    );

    if (!mentorship) {
      return res.status(404).json({
        success: false,
        message: "Mentor not assigned yet.",
      });
    }

    res.status(200).json({
      success: true,
      data: mentorship,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

/* ============================================================================
   @desc    Remove Mentee
   @route   DELETE /api/mentorship/:id
   @access  Mentor
============================================================================ */

exports.removeMentee = async (req, res) => {
  try {

    const mentorship = await Mentorship.findOne({
      _id: req.params.id,
      mentor: req.user._id,
    });

    if (!mentorship) {
      return res.status(404).json({
        success: false,
        message: "Relationship not found.",
      });
    }

    await mentorship.deleteOne();

    res.status(200).json({
      success: true,
      message: "Mentee removed successfully.",
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};