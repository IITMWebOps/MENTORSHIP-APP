const jwt = require("jsonwebtoken");
const passport = require("passport");

exports.googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});

exports.googleCallback = [
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/?error=unauthorized`,
  }),

  (req, res) => {

    const token = jwt.sign(
      {
        id: req.user._id,
        role: req.user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.redirect(
      `${process.env.CLIENT_URL}/dashboard?token=${token}&user=${encodeURIComponent(
        JSON.stringify(req.user)
      )}`
    );

  },
];

exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};