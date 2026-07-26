const Mentorship = require("../models/Mentorship");
const Session = require("../models/Session");
const Feedback = require("../models/Feedback");

exports.getDashboard = async (req, res) => {

    try {

        // ==========================
        // My Mentor
        // ==========================

        const mentorship = await Mentorship.findOne({
            mentee: req.user._id,
            status: "active",
        }).populate(
            "mentor",
            "rollNo name email mobile department hostel profilePhoto"
        );

        // ==========================
        // My Interactions
        // ==========================

        const sessions = await Session.find({
            "participants.mentee": req.user._id,
        })
        .populate(
            "mentor",
            "name rollNo"
        )
        .sort({
            interactionDate: -1,
        });

        const pending = [];
        const approved = [];
        const rejected = [];

        sessions.forEach((session) => {

            const participant = session.participants.find(
                (p) => p.mentee.toString() === req.user._id.toString()
            );

            if (!participant) return;

            const interaction = {

                _id: session._id,

                mentor: session.mentor,

                interactionDate: session.interactionDate,

                interactionType: session.interactionType,

                meetingSummary: session.meetingSummary,

                imageLink: session.imageLink || "",

                coordinatorEvidenceStatus:
                    session.coordinatorEvidenceStatus || "pending",

                verificationStatus:
                    participant.verificationStatus,

            };

            if (participant.verificationStatus === "approved") {

                approved.push(interaction);

            } else if (participant.verificationStatus === "pending") {

                pending.push(interaction);

            } else {

                rejected.push(interaction);

            }

        });

        // ==========================
        // Feedback History
        // ==========================

       // ==========================
// Feedback History
// ==========================

const sessionIds = sessions.map(session => session._id);

const feedbacks = await Feedback.find({
    session: { $in: sessionIds }
})
.populate(
    "session",
    "interactionDate interactionType meetingSummary"
)
.sort({
    createdAt: -1,
});

const feedbackHistory = sessionIds.map((sessionId) => {

    const session = sessions.find(
        s => s._id.toString() === sessionId.toString()
    );

    const myFeedback = feedbacks.find(
        f =>
            f.session._id.toString() === sessionId.toString() &&
            f.submittedBy === "mentee" &&
            f.mentee &&
            f.mentee.toString() === req.user._id.toString()
    );

    return {

        sessionId,

        interactionDate: session.interactionDate,

        interactionType: session.interactionType,

        meetingSummary: session.meetingSummary,

        myFeedback: myFeedback
            ? {
                  rating: myFeedback.rating,
                  feedback: myFeedback.feedback,
                  submittedAt: myFeedback.createdAt,
              }
            : null,

    };

});

        res.status(200).json({

            success: true,

            data: {

                mentor: mentorship ? mentorship.mentor : null,

                pendingInteractions: pending,

                approvedInteractions: approved,

                rejectedInteractions: rejected,

                feedbackHistory,

            },

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};