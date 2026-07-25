const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

const { protect } = require("../middleware/authMiddleware");

const { allowRoles } = require("../middleware/roleMiddleware");

const {
  uploadUsers,
  getDashboardStats,
} = require("../controllers/adminController");

/*
|--------------------------------------------------------------------------
| Upload Users CSV
|--------------------------------------------------------------------------
*/

router.post(
  "/upload-users",
  protect,
  allowRoles("admin"),
  upload.single("file"),
  uploadUsers
);

router.get(
  "/dashboard",
  protect,
  allowRoles("admin"),
  getDashboardStats
);

module.exports = router;