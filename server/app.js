const express = require("express");
const cors = require("cors");
const passport = require("./config/passport");
const userRoutes = require("./routes/userRoutes");
const dotenv = require("dotenv");
const adminRoutes = require("./routes/adminRoutes");
const mentorshipRoutes = require("./routes/mentorshipRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const mentorDashboardRoutes = require("./routes/mentorDashboardRoutes");
const menteeDashboardRoutes = require("./routes/menteeDashboardRoutes");
const coordinatorDashboardRoutes = require("./routes/coordinatorDashboardRoutes");


const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");

dotenv.config();

connectDB();

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/admin", adminRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/mentee", menteeDashboardRoutes);
app.use(
  "/api/coordinator",
  coordinatorDashboardRoutes
);
app.use("/api/mentor", mentorDashboardRoutes);


// Passport
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);

// Health Check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Saathi Backend Running 🚀"
    });
});

module.exports = app;