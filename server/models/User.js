const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic Details (From Admin CSV)
    rollNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },

    program: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: "",
    },

    // Access Control
    role: {
      type: String,
      enum: [
        "admin",
        "super_coordinator",
        "coordinator",
        "mentor",
        "mentee",
      ],
      default: "mentee",
    },

    status: {
    type: Boolean,
    default: true
},

    // Profile (Editable by User)
    hostel: {
      type: String,
      default: "",
    },

    roomNo: {
      type: String,
      default: "",
    },

    alternateMobile: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    interests: {
      type: [String],
      default: [],
    },

    linkedin: {
      type: String,
      default: "",
    },

    github: {
      type: String,
      default: "",
    },

    profilePhoto: {
      type: String,
      default: "",
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    // Google Login
    googleId: {
      type: String,
      default: "",
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);