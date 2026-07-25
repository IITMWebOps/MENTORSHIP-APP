const Mentorship = require("../models/Mentorship");
const Session = require("../models/Session");

exports.getDashboard = async (req, res) => {
  try {

    // ===========================
    // Assigned Mentees
    // ===========================

    const mentorships = await Mentorship.find({
      mentor: req.user._id,
      status: "active",
    }).populate(
      "mentee",
      "rollNo name email mobile department hostel roomNo profilePhoto"
    );

    const assignedMentees = mentorships.map(
      (item) => item.mentee
    );

    // ===========================
    // Interaction History
    // ===========================

    const sessions = await Session.find({
      mentor: req.user._id,
    })
      .populate(
        "participants.mentee",
        "rollNo name"
      )
      .sort({
        interactionDate: -1,
      });

    const interactionHistory = sessions.map((session) => {

      const approved = [];
      const pending = [];
      const rejected = [];

      session.participants.forEach((participant) => {

        const student = {
          _id: participant.mentee._id,
          rollNo: participant.mentee.rollNo,
          name: participant.mentee.name,
        };

        if (participant.verificationStatus === "approved") {

          approved.push(student);

        } else if (participant.verificationStatus === "pending") {

          pending.push(student);

        } else {

          rejected.push(student);

        }

      });

      return {

        _id: session._id,

        interactionDate: session.interactionDate,

        interactionType: session.interactionType,

        meetingSummary: session.meetingSummary,

        approved,

        pending,

        rejected,

      };

    });

    res.status(200).json({

      success: true,

      data: {

        assignedMentees,

        interactionHistory,

      },

    });

  } catch (err) {

    res.status(500).json({

      success: false,

      message: err.message,

    });

  }

};