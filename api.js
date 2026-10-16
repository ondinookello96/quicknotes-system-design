const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.querySelector("#load-btn");
const statusEl = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");

// Reusable async request function with error checking
async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

// Render notes securely using textContent
function renderNotes(notes) {
  notesList.innerHTML = "";
  if (notes.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No notes available.";
    notesList.appendChild(li);
    return;
  }

  notes.forEach(note => {
    const li = document.createElement("li");
    li.dataset.id = note.id;

    const titleEl = document.createElement("strong");
    titleEl.textContent = note.title;

    const bodyEl = document.createElement("p");
    bodyEl.textContent = note.body;

    li.appendChild(titleEl);
    li.appendChild(bodyEl);
    notesList.appendChild(li);
  });
}

// Task 1: GET (Load 10 notes)
async function loadNotes() {
  loadBtn.disabled = true;
  statusEl.textContent = "Loading notes...";
  statusEl.className = "loading";
  notesList.innerHTML = "";

  try {
    const notes = await request(`${API_URL}?_limit=10`);
    renderNotes(notes);
    statusEl.textContent = `Loaded ${notes.length} notes from the server.`;
    statusEl.className = "success";
  } catch (error) {
    statusEl.textContent = "Could not load notes. Please try again.";
    statusEl.className = "error";
    console.error(error);
  } finally {
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener("click", loadNotes);