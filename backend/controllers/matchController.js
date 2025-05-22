const Match = require("../models/Match");
const Tournament = require("../models/Tournament");
const nodemailer = require("nodemailer");

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// @desc    Submit match result
// @route   POST /api/matches/:id/submit
// @access  Private
exports.submitResult = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const { result } = req.body; // 'win' or 'lose'

    // Determine if user is player1 or player2
    const isPlayer1 = match.player1.toString() === req.user._id.toString();
    const isPlayer2 = match.player2.toString() === req.user._id.toString();

    if (!isPlayer1 && !isPlayer2) {
      return res
        .status(403)
        .json({ message: "Not authorized to submit result for this match" });
    }

    // Update match with result
    if (isPlayer1) {
      match.player1Result = result;
      match.player1Submitted = true;
    } else {
      match.player2Result = result;
      match.player2Submitted = true;
    }

    await match.save();

    // If both players submitted and results match, auto-approve
    if (match.player1Submitted && match.player2Submitted) {
      if (match.player1Result === "win" && match.player2Result === "lose") {
        match.winner = match.player1;
        match.adminApproved = true;
        match.status = "completed";
      } else if (
        match.player1Result === "lose" &&
        match.player2Result === "win"
      ) {
        match.winner = match.player2;
        match.adminApproved = true;
        match.status = "completed";
      }

      if (match.adminApproved) {
        await match.save();
        await advanceTournament(match.tournament);
      }
    }

    res.json(match);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Admin approve match result
// @route   POST /api/matches/:id/approve
// @access  Private (Admin only)
exports.approveResult = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const { winnerId } = req.body;

    match.winner = winnerId;
    match.adminApproved = true;
    match.status = "completed";
    await match.save();

    await advanceTournament(match.tournament);

    res.json(match);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Request match reschedule
// @route   POST /api/matches/:id/reschedule
// @access  Private
exports.requestReschedule = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("player1", "email username")
      .populate("player2", "email username");

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Check if user is part of the match
    const isPlayer1 = match.player1._id.toString() === req.user._id.toString();
    const isPlayer2 = match.player2._id.toString() === req.user._id.toString();

    if (!isPlayer1 && !isPlayer2) {
      return res
        .status(403)
        .json({ message: "Not authorized to reschedule this match" });
    }

    const { proposedTime } = req.body;
    const newTime = new Date(proposedTime);

    if (newTime < new Date()) {
      return res
        .status(400)
        .json({ message: "Cannot schedule match in the past" });
    }

    // Add reschedule request
    match.rescheduledRequests.push({
      requestedBy: req.user._id,
      proposedTime: newTime,
      status: "pending",
    });

    // Notify other player via email
    const otherPlayer = isPlayer1 ? match.player2 : match.player1;
    const emailText = `${
      req.user.username
    } has requested to reschedule your match to ${newTime.toLocaleString()}. Please log in to accept or reject this request.`;

    await sendEmail(otherPlayer.email, "Match Reschedule Request", emailText);
    await match.save();

    res.json(match);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Respond to reschedule request
// @route   POST /api/matches/:id/reschedule/respond
// @access  Private
exports.respondToReschedule = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("player1", "email username")
      .populate("player2", "email username");

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const { requestId, accept } = req.body;
    const request = match.rescheduledRequests.id(requestId);

    if (!request) {
      return res.status(404).json({ message: "Reschedule request not found" });
    }

    request.status = accept ? "accepted" : "rejected";

    if (accept) {
      match.scheduledTime = request.proposedTime;
      match.rescheduledCount += 1;
      match.status = "scheduled";

      // Notify both players
      const emailText = `Match has been rescheduled to ${request.proposedTime.toLocaleString()}.`;
      await sendEmail(match.player1.email, "Match Rescheduled", emailText);
      await sendEmail(match.player2.email, "Match Rescheduled", emailText);
    }

    await match.save();
    res.json(match);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Helper function to advance tournament
async function advanceTournament(tournamentId) {
  try {
    const tournament = await Tournament.findById(tournamentId);
    const completedMatches = await Match.find({
      tournament: tournamentId,
      round: tournament.currentRound,
      status: "completed",
    });

    // If all matches in current round are complete
    if (completedMatches.length === Math.pow(2, 3 - tournament.currentRound)) {
      const winners = completedMatches.map((match) => match.winner);

      // If this was the final match
      if (tournament.currentRound === 3) {
        tournament.status = "completed";
        await tournament.save();

        // Send email to tournament admin
        const emailText = `Tournament ${tournament.name} has been completed!`;
        await sendEmail(
          process.env.EMAIL_USER,
          "Tournament Completed",
          emailText
        );

        return;
      }

      // Create next round matches
      for (let i = 0; i < winners.length; i += 2) {
        await Match.create({
          tournament: tournamentId,
          round: tournament.currentRound + 1,
          player1: winners[i],
          player2: winners[i + 1],
        });
      }

      tournament.currentRound += 1;
      await tournament.save();
    }
  } catch (error) {
    console.error("Error advancing tournament:", error);
  }
}

// Helper function to send emails
async function sendEmail(to, subject, text) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
