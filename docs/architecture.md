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

```text
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
```
