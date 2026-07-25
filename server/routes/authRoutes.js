const express=require("express")
const jwt=require("jsonwebtoken")

const router = express.Router();

const {
  googleLogin,
  googleCallback,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Google Login
router.get(
  "/google",
  googleLogin
);

// Google Callback
router.get(
  "/google/callback",
  googleCallback
);

// Logged in User
router.get(
  "/me",
  protect,
  getMe
);

module.exports = router;