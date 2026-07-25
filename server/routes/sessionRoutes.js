const express = require("express");

const router = express.Router();

const {
  createSession,
  getMySessions,
  getMyInteractions,
  approveSession,
  rejectSession,
} = require("../controllers/sessionController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

/* ============================================================================
   Mentor Routes
============================================================================ */

// Submit Interaction
router.post(
  "/",
  protect,
  allowRoles("mentor"),
  createSession
);

// View Submitted Interactions
router.get(
  "/my-sessions",
  protect,
  allowRoles("mentor"),
  getMySessions
);

/* ============================================================================
   Mentee Routes
============================================================================ */

// View My Pending / Approved / Rejected Interactions
router.get(
  "/my-interactions",
  protect,
  allowRoles("mentee"),
  getMyInteractions
);

// Approve Interaction
router.put(
  "/:id/approve",
  protect,
  allowRoles("mentee"),
  approveSession
);

// Reject Interaction
router.put(
  "/:id/reject",
  protect,
  allowRoles("mentee"),
  rejectSession
);

module.exports = router;