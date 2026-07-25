const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    verificationRemarks: {
      type: String,
      default: "",
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const sessionSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    interactionDate: {
      type: Date,
      required: true,
    },

    interactionType: {
      type: String,
      enum: ["online", "In Person","Phone Call"],
      required: true,
    },

    meetingSummary: {
      type: String,
      required: true,
      trim: true,
    },

    participants: [participantSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Session", sessionSchema);