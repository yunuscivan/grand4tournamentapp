document.getElementById('create-link').addEventListener('click', () => {
  const formWrapper = document.getElementById('create-form-wrapper');
  formWrapper.style.display = formWrapper.style.display === 'none' ? 'block' : 'none';
});

const form = document.getElementById('createTournamentForm');
const nameInput = document.getElementById('player-name');
const emailInput = document.getElementById('player-email');
const addPlayerBtn = document.getElementById('add-player');
const playerList = document.getElementById('player-list');
const players = [];
const MAX_PLAYERS = 8;

// Email validation helper
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Handle player addition
addPlayerBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!name || !email || !isValidEmail(email) || players.some(p => p.email === email)) {
    alert('Invalid or duplicate email.');
    return;
  }

  if (players.length >= MAX_PLAYERS) {
    alert(`Max ${MAX_PLAYERS} players allowed.`);
    return;
  }

  players.push({ name, email });
  const li = document.createElement('li');
  li.textContent = `${name} (${email})`;
  const del = document.createElement('button');
  del.textContent = '🗑️';
  del.className = 'delete-btn';
  del.addEventListener('click', () => {
    const index = players.findIndex(p => p.email === email);
    if (index > -1) players.splice(index, 1);
    li.remove();
  });
  li.appendChild(del);
  playerList.appendChild(li);

  nameInput.value = '';
  emailInput.value = '';
});

// Handle tournament form submission
form.addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const type = document.getElementById('type').value;
  const location = document.getElementById('location').value.trim();
  const date = document.getElementById('date').value;

  if (!name || !type || !location || !date || players.length < 2) {
    alert('Fill all fields and add minimum 2 players.');
    return;
  }

  const tournament = { name, type, location, date, players };

  try {
    const response = await fetch('/admin/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tournament)
    });

    if (response.ok) {
      alert('Tournament created successfully.');
      renderTournaments();
    } else {
      alert('Failed to create tournament.');
    }
  } catch (err) {
    alert('Error creating tournament.');
    console.error(err);
  }

  generateMatchInputs(players);
  document.getElementById('score-entry-section').style.display = 'block';
});

// Load tournaments from backend and display them
async function renderTournaments() {
  const list = document.getElementById('tournament-list-display');
  list.innerHTML = '';

  try {
    const response = await fetch('/admin/tournaments');
    const tournaments = await response.json();

    tournaments.forEach(t => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${t.name}</strong> (${t.date} - ${t.location})
        <button class="delete-btn" data-id="${t.id}">🗑️</button>`;
      list.appendChild(li);
    });

  } catch (err) {
    console.error('Fetch tournaments error:', err);
    alert('Could not load tournaments.');
  }
}

// Handle deletion of a tournament
document.getElementById('tournament-list-display').addEventListener('click', async e => {
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.dataset.id;
    try {
      const res = await fetch(`/admin/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        renderTournaments();
      } else {
        alert('Failed to delete tournament.');
      }
    } catch (err) {
      alert('Error deleting tournament.');
      console.error(err);
    }
  }
});

// Generate input fields for entering match scores
function generateMatchInputs(players) {
  const container = document.getElementById('matches-container');
  container.innerHTML = '';
  for (let i = 0; i < players.length; i += 2) {
    const p1 = players[i];
    const p2 = players[i + 1] || { name: 'BYE' };
    const div = document.createElement('div');
    div.innerHTML = `
      <p><strong>${p1.name}</strong> vs <strong>${p2.name}</strong></p>
      <label>${p1.name} Score: <input type="number" name="score-${p1.name}" required></label>
      <label>${p2.name} Score: <input type="number" name="score-${p2.name}" ${p2.name === 'BYE' ? 'disabled value="0"' : 'required'}></label>
      <hr>
    `;
    container.appendChild(div);
  }
}

// Handle submission of match scores to backend
document.getElementById('submit-scores').addEventListener('click', async () => {
  const inputs = document.querySelectorAll('#matches-container input');
  const scores = {};

  inputs.forEach(input => {
    const name = input.name || input.previousElementSibling?.textContent || 'unknown';
    scores[name] = parseInt(input.value, 10) || 0;
  });

  try {
    const res = await fetch('/admin/submit-scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scores)
    });

    if (res.ok) {
      alert('Scores submitted successfully.');
    } else {
      alert('Failed to submit scores.');
    }
  } catch (err) {
    alert('Error submitting scores.');
    console.error(err);
  }
});

// Load tournaments on initial page load
renderTournaments();
