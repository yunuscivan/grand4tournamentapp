// Main JavaScript functionality
document.addEventListener("DOMContentLoaded", () => {
  // Initialize mobile menu
  const menuButton = document.querySelector(".menu-button");
  const navLinks = document.getElementById("nav-links");
  const mainHeader = document.querySelector(".main-header");
  const mainContent = document.getElementById("mainContent");

  // Tournament state management
  let tournaments = JSON.parse(localStorage.getItem("tournaments")) || [];
  let selectedTournament =
    JSON.parse(localStorage.getItem("selectedTournament")) || null;

  // Toggle mobile menu
  function toggleMenu() {
    navLinks.classList.toggle("active");
  }

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".menu-button") && !e.target.closest("#nav-links")) {
      navLinks.classList.remove("active");
    }
  });

  // Handle navigation
  document.querySelectorAll("#nav-links a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const view = e.target.getAttribute("href").replace("#", "");
      router.showView(view);
      navLinks.classList.remove("active");
    });
  });

  // Handle logout
  document.getElementById("logoutBtn").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    mainHeader.style.display = "none";
    mainContent.style.display = "none";
    router.showView("login");
  });

  // Check authentication on load
  function checkAuth() {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");

    if (token) {
      mainHeader.style.display = "block";
      mainContent.style.display = "block";
      router.showView(userType === "admin" ? "admin" : "home");
    } else {
      mainHeader.style.display = "none";
      mainContent.style.display = "none";
      router.showView("login");
    }
  }

  // Tournament List Functions
  function addTournamentRow() {
    const tbody = document.getElementById("tournamentBody");
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
      <td>
        <button class="save" onclick="saveTournament(this)">Save</button>
      </td>
    `;
    tbody.appendChild(newRow);
  }

  function saveTournament(button) {
    const row = button.parentNode.parentNode;
    const cells = row.querySelectorAll("td");
    const tournament = {
      name: cells[0].innerText,
      type: cells[1].innerText,
      players: cells[2].innerText,
      startDate: cells[3].innerText,
      endDate: cells[4].innerText,
      matches: [],
    };

    tournaments.push(tournament);
    localStorage.setItem("tournaments", JSON.stringify(tournaments));
    renderTournamentTable();
  }

  function editTournament(index) {
    const row = document.querySelector(
      `#tournamentBody tr:nth-child(${index + 1})`
    );
    row
      .querySelectorAll("td")
      .forEach((cell) => (cell.contentEditable = "true"));
  }

  function deleteTournament(index) {
    tournaments.splice(index, 1);
    localStorage.setItem("tournaments", JSON.stringify(tournaments));
    renderTournamentTable();
  }

  function searchTournament() {
    const searchValue = document
      .getElementById("searchInput")
      .value.toLowerCase();
    const filteredTournaments = tournaments.filter((t) =>
      t.name.toLowerCase().includes(searchValue)
    );
    renderTournamentTable(filteredTournaments);
  }

  function renderTournamentTable(list = tournaments) {
    const tbody = document.getElementById("tournamentBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (list.length === 0) {
      tbody.innerHTML =
        "<tr><td colspan='6'>No tournaments available.</td></tr>";
    } else {
      list.forEach((tournament, index) => {
        tbody.innerHTML += `
          <tr>
            <td contenteditable="false">${tournament.name}</td>
            <td contenteditable="false">${tournament.type}</td>
            <td contenteditable="false">${tournament.players}</td>
            <td contenteditable="false">${tournament.startDate}</td>
            <td contenteditable="false">${tournament.endDate}</td>
            <td>
              <button class="view" onclick="viewTournamentDetails(${index})">View</button>
              ${
                localStorage.getItem("userType") === "admin"
                  ? `
                <button class="edit" onclick="editTournament(${index})">Edit</button>
                <button class="delete" onclick="deleteTournament(${index})">Delete</button>
              `
                  : ""
              }
            </td>
          </tr>
        `;
      });
    }
  }

  // Tournament Detail Functions
  function viewTournamentDetails(index) {
    selectedTournament = tournaments[index];
    localStorage.setItem(
      "selectedTournament",
      JSON.stringify(selectedTournament)
    );
    router.showView("tournament-details");
    renderTournamentDetails();
  }

  function renderTournamentDetails() {
    if (!selectedTournament) return;

    const view = document.getElementById("tournamentDetailsView");
    view.innerHTML = `
      <div class="tournament-details fade-in">
        <h2>${selectedTournament.name}</h2>
        <div class="tournament-info">
          <p><strong>Type:</strong> ${selectedTournament.type}</p>
          <p><strong>Start Date:</strong> ${selectedTournament.startDate}</p>
          <p><strong>End Date:</strong> ${selectedTournament.endDate}</p>
        </div>
        
        <div class="players-section">
          <h3>Players</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="playersBody"></tbody>
          </table>
          ${
            localStorage.getItem("userType") === "admin"
              ? `<button onclick="addPlayerRow()">Add Player</button>`
              : ""
          }
        </div>

        <div class="matches-section">
          <h3>Matches</h3>
          <table>
            <thead>
              <tr>
                <th>Match</th>
                <th>Players</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="matchBody"></tbody>
          </table>
          ${
            localStorage.getItem("userType") === "admin"
              ? `<button onclick="addMatchRow()">Add Match</button>`
              : ""
          }
        </div>
      </div>
    `;

    renderPlayers();
    renderMatches();
  }

  function addPlayerRow() {
    const tbody = document.getElementById("playersBody");
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
      <td contenteditable="true"></td>
      <td>
        <button class="save" onclick="savePlayer(this)">Save</button>
      </td>
    `;
    tbody.appendChild(newRow);
  }

  function savePlayer(button) {
    const row = button.parentNode.parentNode;
    const playerName = row.cells[0].innerText;

    if (playerName && selectedTournament) {
      if (!selectedTournament.players) selectedTournament.players = [];
      selectedTournament.players.push(playerName);
      localStorage.setItem(
        "selectedTournament",
        JSON.stringify(selectedTournament)
      );
      renderPlayers();
    }
  }

  function deletePlayer(index) {
    if (selectedTournament && selectedTournament.players) {
      selectedTournament.players.splice(index, 1);
      localStorage.setItem(
        "selectedTournament",
        JSON.stringify(selectedTournament)
      );
      renderPlayers();
    }
  }

  function renderPlayers() {
    const tbody = document.getElementById("playersBody");
    if (!tbody || !selectedTournament) return;

    tbody.innerHTML = "";

    if (
      !selectedTournament.players ||
      selectedTournament.players.length === 0
    ) {
      tbody.innerHTML = "<tr><td colspan='2'>No players added.</td></tr>";
    } else {
      selectedTournament.players.forEach((player, index) => {
        tbody.innerHTML += `
          <tr>
            <td>${player}</td>
            <td>
              ${
                localStorage.getItem("userType") === "admin"
                  ? `<button class="delete" onclick="deletePlayer(${index})">Delete</button>`
                  : ""
              }
            </td>
          </tr>
        `;
      });
    }
  }

  function addMatchRow() {
    const tbody = document.getElementById("matchBody");
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
      <td>
        <button class="save" onclick="saveMatch(this)">Save</button>
      </td>
    `;
    tbody.appendChild(newRow);
  }

  function saveMatch(button) {
    const row = button.parentNode.parentNode;
    const matchName = row.cells[0].innerText;
    const players = row.cells[1].innerText;
    const score = row.cells[2].innerText;

    if (matchName && players && score && selectedTournament) {
      if (!selectedTournament.matches) selectedTournament.matches = [];
      selectedTournament.matches.push({ matchName, players, score });
      localStorage.setItem(
        "selectedTournament",
        JSON.stringify(selectedTournament)
      );
      renderMatches();
    }
  }

  function deleteMatch(index) {
    if (selectedTournament && selectedTournament.matches) {
      selectedTournament.matches.splice(index, 1);
      localStorage.setItem(
        "selectedTournament",
        JSON.stringify(selectedTournament)
      );
      renderMatches();
    }
  }

  function renderMatches() {
    const tbody = document.getElementById("matchBody");
    if (!tbody || !selectedTournament) return;

    tbody.innerHTML = "";

    if (
      !selectedTournament.matches ||
      selectedTournament.matches.length === 0
    ) {
      tbody.innerHTML = "<tr><td colspan='4'>No matches added.</td></tr>";
    } else {
      selectedTournament.matches.forEach((match, index) => {
        tbody.innerHTML += `
          <tr>
            <td>${match.matchName}</td>
            <td>${match.players}</td>
            <td>${match.score}</td>
            <td>
              ${
                localStorage.getItem("userType") === "admin"
                  ? `<button class="delete" onclick="deleteMatch(${index})">Delete</button>`
                  : ""
              }
            </td>
          </tr>
        `;
      });
    }
  }

  // Initialize
  checkAuth();

  // Add to window for global access
  window.toggleMenu = toggleMenu;
  window.addTournamentRow = addTournamentRow;
  window.saveTournament = saveTournament;
  window.editTournament = editTournament;
  window.deleteTournament = deleteTournament;
  window.searchTournament = searchTournament;
  window.viewTournamentDetails = viewTournamentDetails;
  window.addPlayerRow = addPlayerRow;
  window.savePlayer = savePlayer;
  window.deletePlayer = deletePlayer;
  window.addMatchRow = addMatchRow;
  window.saveMatch = saveMatch;
  window.deleteMatch = deleteMatch;
});
