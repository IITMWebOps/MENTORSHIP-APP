const fs = require("fs");
const Papa = require("papaparse");

const User = require("../models/User");
const Mentorship = require("../models/Mentorship");
const Session = require("../models/Session");
const Feedback = require("../models/Feedback");

/*
|--------------------------------------------------------------------------
| Upload Users CSV
|--------------------------------------------------------------------------
*/

exports.uploadUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CSV file is required.",
      });
    }

    const csvData = fs.readFileSync(req.file.path, "utf8");

    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    const rows = parsed.data;

    if (!rows.length) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message: "CSV is empty.",
      });
    }

    // ===============================
    // Step 1 : Collect all emails
    // ===============================

    const csvEmails = rows
      .map((row) => row.EmailId?.trim().toLowerCase())
      .filter(Boolean);

    // ===============================
    // Step 2 : Fetch existing users
    // ONE DATABASE QUERY
    // ===============================

    const existingUsers = await User.find(
      {
        email: { $in: csvEmails },
      },
      "email"
    );

    // ===============================
    // Step 3 : Store existing emails
    // ===============================

    const existingEmails = new Set(
      existingUsers.map((user) => user.email)
    );

    // ===============================
    // Step 4 : Prepare new users
    // ===============================

    const usersToInsert = [];

    let skipped = 0;

    const allowedRoles = [
      "admin",
      "super_coordinator",
      "coordinator",
      "mentor",
      "mentee",
    ];

    for (const row of rows) {

      const email = row.EmailId?.trim().toLowerCase();

      const role = row.Role?.trim().toLowerCase();

      // Duplicate email
      if (existingEmails.has(email)) {
        skipped++;
        continue;
      }

      // Invalid role
      if (!allowedRoles.includes(role)) {
        skipped++;
        continue;
      }

      usersToInsert.push({

        rollNo: row["Roll No"]?.trim().toUpperCase(),

        name: row.Name?.trim(),

        email,

        mobile: row.Mobile?.trim() || "",

        gender: row.Gender?.trim(),

        program: row.Program?.trim(),

        department: row.Department?.trim(),

        role,

        status: true,

        hostel: "",

        roomNo: "",

        alternateMobile: "",

        bio: "",

        interests: [],

        linkedin: "",

        github: "",

        profilePhoto: "",

        isProfileComplete: false,

        googleId: "",

        lastLogin: null,
      });

      // Prevent duplicates within the same CSV
      existingEmails.add(email);
    }

    // ===============================
    // Step 5 : Bulk Insert
    // ===============================

    if (usersToInsert.length > 0) {
      await User.insertMany(usersToInsert);
    }

    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      imported: usersToInsert.length,
      skipped,
      total: rows.length,
      message: "Users imported successfully.",
    });

  } catch (err) {

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};
/*
|--------------------------------------------------------------------------
| Dashboard Statistics
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Dashboard Statistics
|--------------------------------------------------------------------------
*/

exports.getDashboardStats = async (req, res) => {

  try {

    const [
      totalUsers,
      mentors,
      mentees,
      coordinators,
      superCoordinators,
      admins,
      totalMentorships,
      totalInteractions,
      totalFeedbackSubmitted,
    ] = await Promise.all([

      User.countDocuments(),

      User.countDocuments({
        role: "mentor",
      }),

      User.countDocuments({
        role: "mentee",
      }),

      User.countDocuments({
        role: "coordinator",
      }),

      User.countDocuments({
        role: "super_coordinator",
      }),

      User.countDocuments({
        role: "admin",
      }),

      Mentorship.countDocuments({
        status: "active",
      }),

      Session.countDocuments(),

      Feedback.countDocuments(),

    ]);

    res.status(200).json({

      success: true,

      data: {

        totalUsers,

        mentors,

        mentees,

        coordinators,

        superCoordinators,

        admins,

        totalMentorships,

        totalInteractions,

        totalFeedbackSubmitted,

      },

    });

  } catch (err) {

    res.status(500).json({

      success: false,

      message: err.message,

    });

  }

};