const express = require("express");

const router = express.Router();

const {
  getDashboard,
} = require("../controllers/coordinatorDashboardController");

const { protect } = require("../middleware/authMiddleware");

const {
  allowRoles,
} = require("../middleware/roleMiddleware");

router.get(
  "/dashboard",
  protect,
  allowRoles("coordinator", "super_coordinator"),
  getDashboard
);

module.exports = router;