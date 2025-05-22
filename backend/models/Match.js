const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament",
    required: true,
  },
  round: {
    type: Number,
    required: true,
  },
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  scheduledTime: {
    type: Date,
    required: true,
    default: () => new Date(+new Date() + 24 * 60 * 60 * 1000), // Default to 24 hours from creation
  },
  rescheduledCount: {
    type: Number,
    default: 0,
  },
  rescheduledRequests: [
    {
      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      proposedTime: Date,
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
    },
  ],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["pending", "scheduled", "completed", "forfeited"],
    default: "pending",
  },
  player1Submitted: {
    type: Boolean,
    default: false,
  },
  player2Submitted: {
    type: Boolean,
    default: false,
  },
  player1Result: {
    type: String,
    enum: ["win", "lose", null],
    default: null,
  },
  player2Result: {
    type: String,
    enum: ["win", "lose", null],
    default: null,
  },
  adminApproved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Match = mongoose.model("Match", matchSchema);
module.exports = Match;
