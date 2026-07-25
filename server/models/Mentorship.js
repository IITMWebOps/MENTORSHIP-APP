const mongoose = require("mongoose");

const mentorshipSchema = new mongoose.Schema(
  {
    // Mentor
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Mentee
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Mentorship Academic Year
    academicYear: {
      type: String,
      default: "2026-27",
    },

    // Relationship Status
    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| One mentee can have only one mentor in one academic year
|--------------------------------------------------------------------------
*/

mentorshipSchema.index(
  {
    mentee: 1,
    academicYear: 1,
  },
  {
    unique: true,
  }
);

/*
|--------------------------------------------------------------------------
| Faster lookup for mentor dashboard
|--------------------------------------------------------------------------
*/

mentorshipSchema.index({
  mentor: 1,
  status: 1,
});

module.exports = mongoose.model("Mentorship", mentorshipSchema);