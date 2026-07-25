const express = require("express");

const router = express.Router();

const {
  submitFeedback,
} = require("../controllers/feedbackController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

/* ============================================================================
   Feedback Routes
============================================================================ */

// Mentor Feedback
router.post(
  "/",
  protect,
  allowRoles("mentor", "mentee"),
  submitFeedback
);

module.exports = router;