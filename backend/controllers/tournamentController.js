const Tournament = require("../models/Tournament");
const Match = require("../models/Match");
const User = require("../models/User");

// @desc    Create new tournament
// @route   POST /api/tournaments
// @access  Private (Admin only)
exports.createTournament = async (req, res) => {
  try {
    const { name } = req.body;

    const tournament = await Tournament.create({
      name,
      admin: req.user._id,
      maxPlayers: 8,
    });

    res.status(201).json(tournament);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
exports.getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate("admin", "username email")
      .populate("players", "username email");
    res.json(tournaments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get tournament by ID
// @route   GET /api/tournaments/:id
// @access  Public
exports.getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("admin", "username email")
      .populate("players", "username email");

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.json(tournament);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Join tournament
// @route   POST /api/tournaments/:id/join
// @access  Private
exports.joinTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (tournament.players.length >= tournament.maxPlayers) {
      return res.status(400).json({ message: "Tournament is full" });
    }

    if (tournament.players.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "Already joined this tournament" });
    }

    tournament.players.push(req.user._id);
    await tournament.save();

    // If we have 8 players, start the tournament
    if (tournament.players.length === 8) {
      await startTournament(tournament._id);
    }

    res.json(tournament);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Helper function to start tournament and create first round matches
async function startTournament(tournamentId) {
  try {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return;

    // Shuffle players array for random matchups
    const players = [...tournament.players];
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }

    // Create matches for first round
    for (let i = 0; i < players.length; i += 2) {
      await Match.create({
        tournament: tournamentId,
        round: 1,
        player1: players[i],
        player2: players[i + 1],
      });
    }

    tournament.status = "active";
    tournament.currentRound = 1;
    await tournament.save();
  } catch (error) {
    console.error("Error starting tournament:", error);
  }
}
