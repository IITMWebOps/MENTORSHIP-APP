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
           Pending Verifications (meeting image evidence)
        ============================================================ */

        const pendingSessions = await Session.find({
            coordinatorEvidenceStatus: "pending",
        })
        .populate("mentor", "name rollNo department")
        .populate("participants.mentee", "name rollNo")
        .sort({
            interactionDate: -1,
        });

        const pendingVerificationList = pendingSessions.map((session) => ({
            sessionId: session._id,
            interactionDate: session.interactionDate,
            interactionType: session.interactionType,
            meetingSummary: session.meetingSummary,
            imageLink: session.imageLink || "",
            mentor: session.mentor,
            department: session.mentor?.department || "",
            mentees: session.participants.map((p) => p.mentee).filter(Boolean),
            menteeStatuses: session.participants.map((p) => ({
                mentee: p.mentee,
                verificationStatus: p.verificationStatus,
            })),
        }));

        const pendingVerifications =
            pendingVerificationList.length;

        /* ============================================================
           Mentee feedback (coordinator-only; mentors use meeting summary)
        ============================================================ */

        const feedbackPopulate = [
            { path: "mentor", select: "rollNo name department" },
            { path: "mentee", select: "rollNo name department" },
            {
                path: "session",
                select:
                    "interactionDate interactionType meetingSummary imageLink coordinatorEvidenceStatus",
            },
        ];

        const menteeFeedbacks = await Feedback.find({
            submittedBy: "mentee",
        })
            .populate(feedbackPopulate)
            .sort({ createdAt: -1 });

        const menteeFeedbackSubmitted = menteeFeedbacks.length;

        res.status(200).json({
            success: true,
            data: {
                cards: {
                    totalMentors,
                    pendingVerifications,
                    menteeFeedbackSubmitted,
                },
                mentorList,
                pendingVerificationList,
                menteeFeedbacks,
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