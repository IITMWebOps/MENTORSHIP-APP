const jwt = require("jsonwebtoken");
const passport = require("passport");

const clientUrl = () =>
  (process.env.CLIENT_URL || "http://localhost:5174").trim().replace(/\/$/, "");

exports.googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});

exports.googleCallback = [
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        return res.redirect(`${clientUrl()}/?error=auth`);
      }

      if (!user) {
        const message = String(info?.message || "");
        if (
          message.includes("SMAIL") ||
          message.includes("IIT Madras")
        ) {
          return res.redirect(`${clientUrl()}/?error=domain`);
        }
        return res.redirect(`${clientUrl()}/?error=unauthorized`);
      }

      req.user = user;
      return next();
    })(req, res, next);
  },

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

    // Token only — embedding the full user JSON made redirects fragile
    res.redirect(`${clientUrl()}/dashboard?token=${encodeURIComponent(token)}`);
  },
];

exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};
