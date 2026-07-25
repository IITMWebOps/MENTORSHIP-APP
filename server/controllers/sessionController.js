const Session = require("../models/Session");
const Mentorship = require("../models/Mentorship");

/* ============================================================================
   @desc    Mentor submits an interaction
   @route   POST /api/sessions
   @access  Mentor
============================================================================ */

exports.createSession = async (req, res) => {
  try {

    const {
      interactionDate,
      interactionType,
      meetingSummary,
      menteeIds,
    } = req.body;

    if (
      !interactionDate ||
      !interactionType ||
      !meetingSummary ||
      !Array.isArray(menteeIds) ||
      menteeIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // Verify all selected mentees belong to this mentor
    const mentorships = await Mentorship.find({
      mentor: req.user._id,
      mentee: { $in: menteeIds },
      status: "active",
    });

    if (mentorships.length !== menteeIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more selected students are not your mentees.",
      });
    }

    const participants = menteeIds.map((id) => ({
      mentee: id,
      verificationStatus: "pending",
    }));

    const session = await Session.create({
      mentor: req.user._id,
      interactionDate,
      interactionType,
      meetingSummary,
      participants,
    });

    res.status(201).json({
      success: true,
      message: "Interaction submitted successfully.",
      data: session,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

/* ============================================================================
   @desc    Mentor - View My Interactions
   @route   GET /api/sessions/my-sessions
   @access  Mentor
============================================================================ */

exports.getMySessions = async (req, res) => {

  try {

    const sessions = await Session.find({
      mentor: req.user._id,
    })
      .populate(
        "participants.mentee",
        "rollNo name email department"
      )
      .sort({
        interactionDate: -1,
      });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

/* ============================================================================
   @desc    Mentee - View My Interactions
   @route   GET /api/sessions/my-interactions
   @access  Mentee
============================================================================ */

exports.getMyInteractions = async (req, res) => {

  try {

    const sessions = await Session.find({
      "participants.mentee": req.user._id,
    })
      .populate(
        "mentor",
        "name email department"
      )
      .sort({
        interactionDate: -1,
      });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

/* ============================================================================
   @desc    Mentee Approves Interaction
   @route   PUT /api/sessions/:id/approve
   @access  Mentee
============================================================================ */

exports.approveSession = async (req, res) => {

  try {

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interaction not found.",
      });
    }

    const participant = session.participants.find(
      (p) => p.mentee.toString() === req.user._id.toString()
    );

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this interaction.",
      });
    }

    participant.verificationStatus = "approved";
    participant.verifiedAt = new Date();

    await session.save();

    res.status(200).json({
      success: true,
      message: "Interaction approved successfully.",
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

/* ============================================================================
   @desc    Mentee Rejects Interaction
   @route   PUT /api/sessions/:id/reject
   @access  Mentee
============================================================================ */

exports.rejectSession = async (req, res) => {

  try {

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interaction not found.",
      });
    }

    const participant = session.participants.find(
      (p) => p.mentee.toString() === req.user._id.toString()
    );

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this interaction.",
      });
    }

    participant.verificationStatus = "rejected";
    participant.verificationRemarks =
      req.body.verificationRemarks || "";
    participant.verifiedAt = new Date();

    await session.save();

    res.status(200).json({
      success: true,
      message: "Interaction rejected.",
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};