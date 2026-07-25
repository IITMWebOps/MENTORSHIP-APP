const Feedback = require("../models/Feedback");
const Session = require("../models/Session");

/* ============================================================================
   @desc    Submit Feedback
   @route   POST /api/feedback
   @access  Mentor / Mentee
============================================================================ */

exports.submitFeedback = async (req, res) => {

  try {

    const {
      sessionId,
      rating,
      feedback,
    } = req.body;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interaction not found.",
      });
    }

    let mentor = session.mentor;
    let mentee = null;

    if (req.user.role === "mentor") {

      mentee = null;

    } else {

      const participant = session.participants.find(
        (p) =>
          p.mentee.toString() === req.user._id.toString() &&
          p.verificationStatus === "approved"
      );

      if (!participant) {

        return res.status(403).json({
          success: false,
          message: "You cannot submit feedback.",
        });

      }

      mentee = req.user._id;
    }

    const existing = await Feedback.findOne({

      session: sessionId,

      submittedBy: req.user.role,

      mentee,

    });

    if (existing) {

      return res.status(400).json({

        success: false,

        message: "Feedback already submitted.",

      });

    }

    const newFeedback = await Feedback.create({

      session: sessionId,

      mentor,

      mentee,

      submittedBy: req.user.role,

      rating,

      feedback,

    });

    res.status(201).json({

      success: true,

      message: "Feedback submitted successfully.",

      data: newFeedback,

    });

  } catch (err) {

    res.status(500).json({

      success: false,

      message: err.message,

    });

  }

};