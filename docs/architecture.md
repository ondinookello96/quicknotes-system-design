# QuickNotes Architecture & Scaling Plan

## Requirements

- **Functional:** User authentication, full CRUD operations on notes, tagging, and search/filtering capabilities.
- **Non-Functional:** High availability, sub-100ms API response latency, and seamless scalability to support 1 million registered users.

---

## Load Estimates (1 Million Users)

- **Daily Active Users (DAU):** Assuming 10% activity rate = **100,000 active users per day**.
- **Writes per Second:** 100,000 users $\times$ 5 note creations per day $\div$ 86,400 seconds $\approx$ **5.8 writes/sec**.
- **Reads per Second:** 100,000 users $\times$ 50 read requests per day $\div$ 86,400 seconds $\approx$ **57.8 reads/sec** (Peak traffic at $5\times$ = **~290 reads/sec**).
- **Storage per Year:** 100,000 users $\times$ 5 notes/day $\times$ 365 days = 182.5 million notes/year $\approx$ **~91 GB/year** of text data.

---

## Architecture Diagram

````text
       [ Clients / Web App ]
                 │
                 ▼
          [ Cloudflare DNS ]
                 │
                 ▼
         [ CDN (Cloudflare) ]
                 │
                 ▼
       [ Load Balancer (Nginx) ]
                 │
         ┌───────┴───────┐
         ▼               ▼
  [ App Server 1 ]  [ App Server 2 ]
         │               │
         ├───────────────┼─────────────┐
         ▼               ▼             ▼
   [ Redis Cache ]  [ Message ]   [ Primary DB ]
                     [ Queue ]         │
                         │             ▼
                         ▼     [ Read Replica ]
                   [ Worker Node ]

Component DescriptionsDNS: Resolves domain names to server IP addresses globally for fast routing.CDN: Caches static web assets and frontend files at edge locations globally to reduce latency and protect app servers.Load Balancer: Distributes inbound traffic evenly across multiple application servers to prevent single-server overloads.App Servers: Stateless compute nodes that process backend business logic and API requests.Redis Cache: In-memory store used for lightning-fast session management and hot note caching.Message Queue: Buffers heavy asynchronous background tasks like search indexing or notification dispatch.Worker Node: Dedicated background process that continuously pulls tasks from the message queue to execute asynchronous jobs.Primary Database: Manages strict, ACID-compliant write operations (creates, updates, deletes).Read Replica: Offloads high-frequency read queries away from the primary database to boost performance.Request FlowsGET /notes Flow: Client sends request $\rightarrow$ DNS $\rightarrow$ CDN (for static assets) $\rightarrow$ Load Balancer $\rightarrow$ App Server $\rightarrow$ Read Replica fetches notes $\rightarrow$ JSON response returned to client.POST /notes Flow: Client sends payload $\rightarrow$ Load Balancer $\rightarrow$ App Server $\rightarrow$ Primary Database writes note $\rightarrow$ Cache is invalidated $\rightarrow$ 201 Created response sent back.Trade-offs & SPOF AvoidanceTrade-off: We choose eventual consistency for search index updates (processed asynchronously via the message queue and worker nodes) to ensure high write performance and availability.Single Points of Failure (SPOF) Avoidance: Outages are prevented by deploying redundant app servers behind a load balancer and configuring database master-slave replication with automated failover.

### 2. Updated `api.js`
Open your `api.js` file in VS Code, **replace its entire content** with the code below (which now disables the delete button during network calls), and save it:

```javascript
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

// Render notes securely using textContent and attach delete buttons
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

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => deleteNote(note.id, li, deleteBtn));

    li.appendChild(titleEl);
    li.appendChild(bodyEl);
    li.appendChild(deleteBtn);
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

    const li = document.createElement("li");
    li.dataset.id = createdNote.id;

    const titleEl = document.createElement("strong");
    titleEl.textContent = createdNote.title;

    const bodyEl = document.createElement("p");
    bodyEl.textContent = createdNote.body;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => deleteNote(createdNote.id, li, deleteBtn));

    li.appendChild(titleEl);
    li.appendChild(bodyEl);
    li.appendChild(deleteBtn);
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

// Task 3: DELETE (Remove note with button protection against rapid clicking)
async function deleteNote(id, listItemElement, deleteBtn) {
  deleteBtn.disabled = true;
  statusEl.textContent = `Deleting note ${id}...`;
  statusEl.className = "loading";

  try {
    await request(`${API_URL}/${id}`, { method: "DELETE" });

    listItemElement.remove();
    statusEl.textContent = `Note ${id} deleted successfully.`;
    statusEl.className = "success";

    if (notesList.children.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No notes available.";
      notesList.appendChild(li);
    }
  } catch (error) {
    statusEl.textContent = `Could not delete note ${id}.`;
    statusEl.className = "error";
    console.error(error);
    deleteBtn.disabled = false; // Re-enable if deletion fails
  }
}

loadBtn.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);
````
