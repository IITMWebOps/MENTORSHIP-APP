const express = require("express");

const router = express.Router();

const {
    getDashboard,
} = require("../controllers/menteeDashboardController");

const {
    protect,
} = require("../middleware/authMiddleware");

const {
    allowRoles,
} = require("../middleware/roleMiddleware");

router.get(
    "/dashboard",
    protect,
    allowRoles("mentee"),
    getDashboard
);

module.exports = router;