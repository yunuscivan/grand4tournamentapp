// Function to load matches
async function loadMatches() {
  const matchesList = document.getElementById("matches-list");

  try {
    const response = await fetch("/api/matches");
    const matches = await response.json();

    matchesList.innerHTML = matches.length
      ? matches
          .map(
            (match) => `
            <div class="match-card">
                <h3>Match #${match._id}</h3>
                <p>Players: ${match.player1} vs ${match.player2}</p>
                <p>Date: ${new Date(match.date).toLocaleDateString()}</p>
                <p>Status: ${match.status}</p>
                <button onclick="updateMatch('${match._id}')" ${
              match.status === "completed" ? "disabled" : ""
            }>
                    Update Result
                </button>
            </div>
        `
          )
          .join("")
      : "<p>No matches found</p>";
  } catch (error) {
    console.error("Error loading matches:", error);
    matchesList.innerHTML =
      "<p>Error loading matches. Please try again later.</p>";
  }
}

// Function to update match result
async function updateMatch(matchId) {
  // Implementation for updating match results
  const winner = prompt("Enter winner email:");
  if (!winner) return;

  try {
    const response = await fetch(`/api/matches/${matchId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ winner }),
    });

    if (response.ok) {
      alert("Match updated successfully!");
      loadMatches(); // Reload matches
    } else {
      throw new Error("Failed to update match");
    }
  } catch (error) {
    console.error("Error updating match:", error);
    alert("Failed to update match. Please try again.");
  }
}
