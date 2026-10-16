# QuickNotes Data Model

## Entities & Schema

1. **`users`**: Stores user account profiles.
   - `id`: `INTEGER` (Primary Key, Auto-increment)
   - `name`: `TEXT` (NOT NULL)
   - `email`: `TEXT` (NOT NULL, UNIQUE)
2. **`notes`**: Stores note content and ownership.
   - `id`: `INTEGER` (Primary Key, Auto-increment)
   - `user_id`: `INTEGER` (Foreign Key referencing `users(id)`, NOT NULL)
   - `title`: `TEXT` (NOT NULL)
   - `body`: `TEXT`
   - `created_at`: `DATETIME` (DEFAULT CURRENT_TIMESTAMP)
3. **`tags`**: Stores category labels for organization.
   - `id`: `INTEGER` (Primary Key, Auto-increment)
   - `name`: `TEXT` (NOT NULL, UNIQUE)
4. **`note_tags`**: Join table handling the many-to-many relationship between notes and tags.
   - `note_id`: `INTEGER` (Foreign Key referencing `notes(id)`, NOT NULL)
   - `tag_id`: `INTEGER` (Foreign Key referencing `tags(id)`, NOT NULL)
   - _Primary Key_: `(note_id, tag_id)`

---

## Relationships

- **Users to Notes (One-to-Many):** One user can author multiple notes, but each individual note belongs to a single user.
- **Notes to Tags (Many-to-Many):** A note can have multiple tags, and a tag can be applied across multiple notes. The `note_tags` join table maps these pairs and prevents duplicate assignments.

---

## SQL Schema (`CREATE TABLE`)

```sql
CREATE TABLE users (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE notes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL UNIQUE
);

CREATE TABLE note_tags (
  note_id INTEGER NOT NULL,
  tag_id  INTEGER NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)   ON DELETE CASCADE
);

Example Queries
Get all notes for a specific user, newest first:
SELECT notes.* FROM notes
JOIN users ON notes.user_id = users.id
WHERE users.email = 'amina@example.com'
ORDER BY notes.created_at DESC;

Find all notes tagged with "urgent":
SELECT notes.title, notes.body FROM notes
JOIN note_tags ON notes.id = note_tags.note_id
JOIN tags ON tags.id = note_tags.tag_id
WHERE tags.name = 'urgent';

Count the number of notes per user:
SELECT users.name, COUNT(notes.id) AS note_count
FROM users
LEFT JOIN notes ON users.id = notes.user_id
GROUP BY users.id;

Indexes & Justification
Index 1: CREATE INDEX idx_notes_user ON notes(user_id);

Reason: Speeds up user-specific lookups and feed queries when filtering by user ownership.

Index 2: CREATE INDEX idx_tags_name ON tags(name);

Reason: Optimizes tag search performance across large datasets.

SQL vs. NoSQL Justification
For QuickNotes, a relational SQL database is chosen because the application relies on strict relational integrity (such as foreign key constraints linking notes to users, cascade deletes, and relational tag mappings). ACID compliance ensures that user records, notes, and tags never fall out of sync or become orphaned.

```
