# QuickNotes System Design & API Client

## Description

QuickNotes is a full-stack note-taking application transition project. It includes a functional frontend vanilla JavaScript client interacting with a REST API, accompanied by robust backend system design documentation supporting 1 million users.

---

## How to Run the API Client

1. Clone the repository.
2. Open `index.html` using a local web server (like VS Code Live Server).
3. Interact with the UI to load notes (`GET`), create new notes (`POST`), and delete notes (`DELETE`).

---

## Documentation Links

- [API Design Document](docs/api-design.md)
- [Data Model Document](docs/data-model.md)
- [Architecture Document](docs/architecture.md)

---

## What I Learned

1. **Asynchronous JavaScript & Error Handling:** Implementing robust `async/await`, `try/catch/finally` blocks, and request state management.
2. **Relational Database Design:** Structuring normalized tables with foreign keys, join tables, and optimized indexes.
3. **Scalability & System Architecture:** Estimating system load, designing read/write split patterns, and mapping out high-availability cloud components.
