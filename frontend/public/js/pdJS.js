document.addEventListener("DOMContentLoaded", () => {
  // This event listener ensures the code inside runs only after the full HTML page has loaded.

  const playerNameElem = document.getElementById("player-name");
  const tournamentResultsBody = document.getElementById(
    "tournament-results-body"
  );
  const profileForm = document.getElementById("profile-form");

  // Example player data — normally this would come from a server or database
  const playerData = {
    name: "Ivan Petrov",
    email: "ivan.petrov@example.com",
    tournaments: [
      {
        name: "Spring Open",
        date: "2025-04-20",
        type: "Knockout",
        score: "3-1",
        status: "Finished",
      },
      {
        name: "City Championship",
        date: "2025-05-15",
        type: "Round Robin",
        score: "2-2",
        status: "Ongoing",
      },
    ],
  };

  // Update the greeting with the player's name
  playerNameElem.textContent = playerData.name;

  // Generate table rows for each tournament the player participated in
  tournamentResultsBody.innerHTML = playerData.tournaments
    .map(
      (tournament) => `
    <tr>
      <td>${tournament.name}</td>
      <td>${tournament.date}</td>
      <td>${tournament.type}</td>
      <td>${tournament.score}</td>
      <td>${tournament.status}</td>
    </tr>
  `
    )
    .join("");

  // Fill the profile edit form inputs with the player's current data
  document.getElementById("edit-name").value = playerData.name;
  document.getElementById("edit-email").value = playerData.email;

  // Listen for the profile form submission
  profileForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page

    // In a real app, here you would send the updated profile data to the server
    alert("Profile updated: " + profileForm["edit-name"].value);
  });
});
