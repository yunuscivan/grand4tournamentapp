const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
  createTournament,
  getTournaments,
  getTournamentById,
  joinTournament,
} = require("../controllers/tournamentController");
const {
  submitResult,
  approveResult,
  requestReschedule,
  respondToReschedule,
} = require("../controllers/matchController");

// @route   POST /api/tournaments
// @desc    Create a new tournament
// @access  Private (Admin only)
router.post("/", protect, admin, createTournament);

// @route   GET /api/tournaments
// @desc    Get all tournaments
// @access  Public
router.get("/", getTournaments);

// @route   GET /api/tournaments/:id
// @desc    Get tournament by ID
// @access  Public
router.get("/:id", getTournamentById);

// @route   POST /api/tournaments/:id/join
// @desc    Join a tournament
// @access  Private (User only)
router.post("/:id/join", protect, joinTournament);

// @route   POST /api/matches/:id/submit
// @desc    Submit a match result
// @access  Private (User only)
router.post("/matches/:id/submit", protect, submitResult);

// @route   POST /api/matches/:id/approve
// @desc    Approve a match result
// @access  Private (Admin only)
router.post("/matches/:id/approve", protect, admin, approveResult);

// @route   POST /api/matches/:id/reschedule
// @desc    Request a match reschedule
// @access  Private (User only)
router.post("/matches/:id/reschedule", protect, requestReschedule);

// @route   POST /api/matches/:id/reschedule/respond
// @desc    Respond to a match reschedule
// @access  Private (User only)
router.post("/matches/:id/reschedule/respond", protect, respondToReschedule);

module.exports = router;
 