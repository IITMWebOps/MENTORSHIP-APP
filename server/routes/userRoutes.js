const express = require("express");

const router = express.Router();

const {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateRole,
  changeStatus,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");



router.get(
  "/me",
  protect,
  getProfile
);

router.put(
  "/me",
  protect,
  updateProfile
);



router.get(
  "/",
  protect,
  allowRoles("admin"),
  getAllUsers
);

router.get(
  "/:id",
  protect,
  allowRoles("admin"),
  getUserById
);

router.put(
  "/:id/role",
  protect,
  allowRoles("admin"),
  updateRole
);

router.put(
  "/:id/status",
  protect,
  allowRoles("admin"),
  changeStatus
);

module.exports = router;