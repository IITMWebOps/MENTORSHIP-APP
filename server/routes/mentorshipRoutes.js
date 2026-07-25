const express = require("express");

const router = express.Router();

const {
  addMentee,
  getMyMentees,
  getMyMentor,
  removeMentee,
} = require("../controllers/mentorshipController");

const { protect } = require("../middleware/authMiddleware");

const { allowRoles } = require("../middleware/roleMiddleware");

/*
|--------------------------------------------------------------------------
| Mentor APIs
|--------------------------------------------------------------------------
*/

router.post(
  "/add",
  protect,
  allowRoles("mentor"),
  addMentee
);

router.get(
  "/my-mentees",
  protect,
  allowRoles("mentor"),
  getMyMentees
);

router.delete(
  "/:id",
  protect,
  allowRoles("mentor"),
  removeMentee
);

/*
|--------------------------------------------------------------------------
| Mentee APIs
|--------------------------------------------------------------------------
*/

router.get(
  "/my-mentor",
  protect,
  allowRoles("mentee"),
  getMyMentor
);

module.exports = router;