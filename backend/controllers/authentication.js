const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("../utils/user-authentication/passport-config");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.sign_up_post = [
  body("firstName", "First name must not be empty.")
    .trim()
    .isLength({ min: 1, max: 30 })
    .escape(),
  body("lastName", "Last name must not be empty.")
    .trim()
    .isLength({ min: 1, max: 30 })
    .escape(),
  body("email", "Email must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .custom(async (value) => {
      const user = await prisma.userAccount.findUnique({
        where: { email: value },
      });
      if (user) {
        throw new Error("email is already in use");
      }
    }),
  body("password", "Password name must not be empty.")
    .trim()
    .isLength({ min: 1, max: 30 })
    .escape(),
  body("confirmPassword", "Confirm password must match password.")
    .trim()
    .isLength({ min: 1, max: 30 })
    .escape()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("passwords do not match");
      }
      return true;
    }),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsMessages = errors.array().map((error) => error.msg);
      return res.status(400).json({ error: errorsMessages });
    } else {
      try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await prisma.userAccount.create({
          data: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
          },
        });

        res.status(200).json({ message: "Registration successful" });
      } catch (error) {
        console.error("An error occurred while processing the request:", error);
        res.status(500).send("An error occurred while processing the request.");
      }
    }
  }),
];

exports.sign_in_post = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .isLength({ min: 1 })
    .withMessage("Email is required")
    .trim(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .trim(),
  (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (!user) {
        return res.status(401).json({ error: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login Failed" });
        }
        return res.status(200).json("Authentication successful");
      });
    })(req, res, next);
  },
];

exports.demo_account_get = (req, res, next) => {
  req.body.email = process.env.DEMO_ACCOUNT_EMAIL;
  req.body.password = process.env.DEMO_ACCOUNT_PASSWORD;
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (!user) {
      return res.status(401).json({ error: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: "Login Failed" });
      }
      return res.status(200).json("Authentication successful");
    });
  })(req, res, next);
};

exports.authentication_check_get = (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({ authenticated: true });
  }
  return res.status(200).json({ authenticated: false });
};

exports.logout_get = asyncHandler(async (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        return res
          .status(500)
          .json({ logoutError: "Error occurred while logging out." });
      }
      res.status(200).json({ message: "Logout successful" });
    });
  } catch (error) {
    res.status(500).json({ logoutError: "Error occurred while logging out." });
  }
});
