const express = require("express");
const router = express.Router();
const {
  register,
  login,
  checkAdmin,
} = require("../controllers/authController");

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", login);

// @route   GET /api/auth/check-admin
// @desc    Check if admin exists
// @access  Public
router.get("/check-admin", checkAdmin);

module.exports = router;
