const User = require("../models/User");
const Mentorship = require("../models/Mentorship");
const Session = require("../models/Session");
const Feedback = require("../models/Feedback");

/* ============================================================================
   @desc    Coordinator Dashboard
   @route   GET /api/coordinator/dashboard
   @access  Coordinator
============================================================================ */

exports.getDashboard = async (req, res) => {

    try {

        /* ============================================================
           Dashboard Cards
        ============================================================ */

        const totalMentors = await User.countDocuments({
            role: "mentor",
            status: true,
        });

        /* ============================================================
           Mentor List
        ============================================================ */

        const mentors = await User.find({
            role: "mentor",
            status: true,
        })
        .select(
            "rollNo name department email"
        )
        .sort({
            name: 1,
        });

        const mentorList = await Promise.all(

            mentors.map(async (mentor) => {

                const assignedMentees =
                    await Mentorship.countDocuments({

                        mentor: mentor._id,

                        status: "active",

                    });

                const interactions =
                    await Session.countDocuments({

                        mentor: mentor._id,

                    });

                return {

                    _id: mentor._id,

                    rollNo: mentor.rollNo,

                    name: mentor.name,

                    department: mentor.department,

                    email: mentor.email,

                    assignedMentees,

                    interactions,

                };

            })

        );
                /* ============================================================
           Pending Verifications
        ============================================================ */

        const pendingSessions = await Session.find({
            "participants.verificationStatus": "pending",
        })
        .populate("mentor", "name rollNo")
        .populate("participants.mentee", "name rollNo")
        .sort({
            interactionDate: -1,
        });

        const pendingVerificationList = [];

        pendingSessions.forEach((session) => {

            session.participants.forEach((participant) => {

                if (participant.verificationStatus === "pending") {

                    pendingVerificationList.push({

                        sessionId: session._id,

                        interactionDate: session.interactionDate,

                        interactionType: session.interactionType,

                        mentor: session.mentor,

                        mentee: participant.mentee,

                    });

                }

            });

        });

        const pendingVerifications =
            pendingVerificationList.length;

        /* ============================================================
           Pending Reviews
        ============================================================ */

        const approvedSessions = await Session.find({
            "participants.verificationStatus": "approved",
        })
        .populate("mentor", "name rollNo")
        .populate("participants.mentee", "name rollNo");

        const pendingReviewList = [];

        for (const session of approvedSessions) {

            const mentorFeedback = await Feedback.findOne({
                session: session._id,
                submittedBy: "mentor",
            });

            if (!mentorFeedback) {

                pendingReviewList.push({

                    sessionId: session._id,

                    interactionDate: session.interactionDate,

                    interactionType: session.interactionType,

                    mentor: session.mentor,

                    reason: "Mentor feedback pending",

                });

            }

        }

        const pendingReviews =
            pendingReviewList.length;

        /* ============================================================
           Mentor Feedback
        ============================================================ */

        const mentorFeedbacks = await Feedback.find({
            submittedBy: "mentor",
        })
        .populate(
            "mentor",
            "rollNo name department"
        )
        .populate({
    path: "session",
    select:
        "interactionDate interactionType meetingSummary",
})
        .sort({
            createdAt: -1,
        });

        const mentorFeedbackSubmitted =
            mentorFeedbacks.length;
                    res.status(200).json({

            success: true,

            data: {

                cards: {

                    totalMentors,

                    pendingVerifications,

                    pendingReviews,

                    mentorFeedbackSubmitted,

                },

                mentorList,

                pendingVerificationList,

                pendingReviewList,

                mentorFeedbacks,

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