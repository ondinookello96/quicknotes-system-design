const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.querySelector("#load-btn");
const statusEl = document.querySelector("#status");
const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitBtn = document.querySelector("#submit-btn");
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

// Task 2: POST (Create note)
async function createNote(event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  // Validation: Title required, max 100 characters
  if (!title || title.length > 100) {
    statusEl.textContent = "Validation error: Title is required and must be max 100 characters.";
    statusEl.className = "error";
    return;
  }

  submitBtn.disabled = true;
  statusEl.textContent = "Creating note...";
  statusEl.className = "loading";

  try {
    const newNoteData = { title, body, userId: 1 };
    const createdNote = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(newNoteData)
    });

    statusEl.textContent = `Note created (status 201, id ${createdNote.id}).`;
    statusEl.className = "success";

    // Create list item for the new note and prepend it to the top
    const li = document.createElement("li");
    li.dataset.id = createdNote.id;

    const titleEl = document.createElement("strong");
    titleEl.textContent = createdNote.title;

    const bodyEl = document.createElement("p");
    bodyEl.textContent = createdNote.body;

    li.appendChild(titleEl);
    li.appendChild(bodyEl);
    notesList.prepend(li);

    noteForm.reset();
  } catch (error) {
    statusEl.textContent = "Failed to create note. Please try again.";
    statusEl.className = "error";
    console.error(error);
  } finally {
    submitBtn.disabled = false;
  }
}

loadBtn.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);