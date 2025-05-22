document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("createTournamentForm");
  const playerEmailInput = document.getElementById("player-email");
  const addPlayerBtn = document.getElementById("add-player");
  const playerList = document.getElementById("player-list");

  const players = [];

  // Add player to the list
  addPlayerBtn.addEventListener("click", () => {
    const email = playerEmailInput.value.trim();
    if (email && !players.includes(email)) {
      players.push(email);

      const li = document.createElement("li");
      li.textContent = email;
      playerList.appendChild(li);

      playerEmailInput.value = "";
    } else {
      alert("Invalid or duplicate email.");
    }
  });

  // Form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent default form submission

    const name = document.getElementById("name").value.trim();
    const type = document.getElementById("type").value;
    const location = document.getElementById("location").value.trim();
    const date = document.getElementById("date").value;

    if (!name || !type || !location || !date || players.length === 0) {
      alert("Please fill all fields and add at least one player.");
      return;
    }

    const tournamentData = {
      name,
      type,
      location,
      date,
      players,
    };

    console.log("Tournament Created:", tournamentData);

    // Send to backend
    /*
    fetch('/admin/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tournamentData)
    })
      .then(res => res.json())
      .then(data => {
        alert('Tournament and player invites sent!');
      })
      .catch(err => {
        console.error('Error:', err);
      });
    */
  });
});
