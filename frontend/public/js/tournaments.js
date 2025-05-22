// Function to load all tournaments
async function loadTournaments() {
  const tournamentsList = document.getElementById("tournaments-list");

  try {
    const response = await fetch("/api/tournaments");
    const tournaments = await response.json();

    tournamentsList.innerHTML = tournaments.length
      ? tournaments
          .map(
            (tournament) => `
            <div class="tournament-card">
                <h3>${tournament.name}</h3>
                <p>Type: ${tournament.type}</p>
                <p>Location: ${tournament.location}</p>
                <p>Date: ${new Date(tournament.date).toLocaleDateString()}</p>
                <p>Players: ${tournament.players.length}</p>
                <p>Status: ${tournament.status || "Pending"}</p>
                <button onclick="viewTournamentDetails('${tournament._id}')">
                    View Details
                </button>
            </div>
        `
          )
          .join("")
      : "<p>No tournaments found</p>";
  } catch (error) {
    console.error("Error loading tournaments:", error);
    tournamentsList.innerHTML =
      "<p>Error loading tournaments. Please try again later.</p>";
  }
}

// Function to view tournament details
async function viewTournamentDetails(tournamentId) {
  try {
    const response = await fetch(`/api/tournaments/${tournamentId}`);
    const tournament = await response.json();

    // Create a modal or update the page with tournament details
    const details = `
            <h2>${tournament.name} Details</h2>
            <p>Type: ${tournament.type}</p>
            <p>Location: ${tournament.location}</p>
            <p>Date: ${new Date(tournament.date).toLocaleDateString()}</p>
            <h3>Players:</h3>
            <ul>
                ${tournament.players
                  .map((player) => `<li>${player}</li>`)
                  .join("")}
            </ul>
            <h3>Matches:</h3>
            <div>
                ${
                  tournament.matches
                    ? tournament.matches
                        .map(
                          (match) => `
                    <div class="match">
                        <p>${match.player1} vs ${match.player2}</p>
                        <p>Status: ${match.status}</p>
                        ${match.winner ? `<p>Winner: ${match.winner}</p>` : ""}
                    </div>
                `
                        )
                        .join("")
                    : "No matches yet"
                }
            </div>
        `;

    // For now, we'll just alert the details
    alert("Tournament details loaded! Check console for more info.");
    console.log("Tournament details:", tournament);
  } catch (error) {
    console.error("Error loading tournament details:", error);
    alert("Failed to load tournament details. Please try again.");
  }
}
