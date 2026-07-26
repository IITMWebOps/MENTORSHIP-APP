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

// Mentee feedback only (mentor notes live in meeting summary)
router.post(
  "/",
  protect,
  allowRoles("mentee"),
  submitFeedback
);

module.exports = router;