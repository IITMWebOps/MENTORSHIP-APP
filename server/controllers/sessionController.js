const Session = require("../models/Session");
const Mentorship = require("../models/Mentorship");
const Feedback = require("../models/Feedback");

const isHttpUrl = (value) => {
  try {
    const url = new URL(String(value).trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

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
      imageLink,
      menteeIds,
    } = req.body;

    if (
      !interactionDate ||
      !interactionType ||
      !meetingSummary ||
      !imageLink ||
      !Array.isArray(menteeIds) ||
      menteeIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields, including the image link.",
      });
    }

    if (!isHttpUrl(imageLink)) {
      return res.status(400).json({
        success: false,
        message: "Image link must be a valid http(s) URL.",
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
      imageLink: String(imageLink).trim(),
      coordinatorEvidenceStatus: "pending",
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

    const userId = req.user._id.toString();

    // Only return this mentee's participant row (hide peers' status/remarks)
    const data = sessions.map((session) => {
      const mine = session.participants.find(
        (p) => p.mentee.toString() === userId
      );

      return {
        _id: session._id,
        mentor: session.mentor,
        interactionDate: session.interactionDate,
        interactionType: session.interactionType,
        meetingSummary: session.meetingSummary,
        imageLink: session.imageLink || "",
        coordinatorEvidenceStatus:
          session.coordinatorEvidenceStatus || "pending",
        myParticipation: mine
          ? {
              verificationStatus: mine.verificationStatus,
              verificationRemarks: mine.verificationRemarks || "",
              verifiedAt: mine.verifiedAt,
            }
          : null,
        createdAt: session.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
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
      req.body?.verificationRemarks || "";
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

/* ============================================================================
   @desc    Get one interaction (full detail card)
   @route   GET /api/sessions/:id
   @access  Mentor (own) / Mentee (participant) / Coordinator / Admin
============================================================================ */

exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate("mentor", "name rollNo email department")
      .populate("participants.mentee", "name rollNo email department")
      .populate("coordinatorVerifiedBy", "name rollNo role");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interaction not found.",
      });
    }

    const role = req.user.role;
    const userId = req.user._id.toString();
    const mentorId = session.mentor?._id?.toString() || session.mentor.toString();

    const isMentor = role === "mentor" && mentorId === userId;
    const isMentee =
      role === "mentee" &&
      session.participants.some(
        (p) => (p.mentee?._id || p.mentee).toString() === userId
      );
    const isStaff = [
      "coordinator",
      "super_coordinator",
      "admin",
    ].includes(role);

    if (!isMentor && !isMentee && !isStaff) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this interaction.",
      });
    }

    // Feedback is mentee-only. Mentors use meeting summary instead.
    // Coordinators/admins: all mentee feedback for the session
    // Mentees: their own submission
    // Mentors: none
    let feedbackFilter = { session: session._id, submittedBy: "mentee" };
    if (role === "mentee") {
      feedbackFilter = {
        session: session._id,
        submittedBy: "mentee",
        mentee: req.user._id,
      };
    } else if (role === "mentor" || (!isStaff && role !== "mentee")) {
      feedbackFilter = { _id: null };
    }

    const feedbacks = await Feedback.find(feedbackFilter)
      .populate("mentor", "name rollNo")
      .populate("mentee", "name rollNo")
      .sort({ createdAt: -1 });

    const approved = [];
    const pending = [];
    const rejected = [];

    session.participants.forEach((p) => {
      const student = p.mentee;
      if (!student) return;
      if (p.verificationStatus === "approved") approved.push({ student, remarks: p.verificationRemarks, verifiedAt: p.verifiedAt });
      else if (p.verificationStatus === "pending") pending.push({ student });
      else rejected.push({ student, remarks: p.verificationRemarks, verifiedAt: p.verifiedAt });
    });

    res.status(200).json({
      success: true,
      data: {
        _id: session._id,
        interactionDate: session.interactionDate,
        interactionType: session.interactionType,
        meetingSummary: session.meetingSummary,
        imageLink: session.imageLink || "",
        mentor: session.mentor,
        coordinatorEvidenceStatus:
          session.coordinatorEvidenceStatus || "pending",
        coordinatorEvidenceRemarks:
          session.coordinatorEvidenceRemarks || "",
        coordinatorVerifiedAt: session.coordinatorVerifiedAt,
        coordinatorVerifiedBy: session.coordinatorVerifiedBy,
        approved,
        pending,
        rejected,
        feedbacks,
        createdAt: session.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ============================================================================
   @desc    Coordinator verifies / rejects meeting image evidence
   @route   PUT /api/sessions/:id/evidence
   @access  Coordinator / Super Coordinator
============================================================================ */

exports.verifyEvidence = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'verified' or 'rejected'.",
      });
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interaction not found.",
      });
    }

    session.coordinatorEvidenceStatus = status;
    session.coordinatorEvidenceRemarks = remarks || "";
    session.coordinatorVerifiedAt = new Date();
    session.coordinatorVerifiedBy = req.user._id;

    await session.save();

    res.status(200).json({
      success: true,
      message:
        status === "verified"
          ? "Meeting evidence verified."
          : "Meeting evidence rejected.",
      data: {
        sessionId: session._id,
        coordinatorEvidenceStatus: session.coordinatorEvidenceStatus,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};