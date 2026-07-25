const express = require("express");

const router = express.Router();

const {
  getDashboard,
} = require("../controllers/mentorDashboardController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

router.get(
  "/dashboard",
  protect,
  allowRoles("mentor"),
  getDashboard
);

module.exports = router;