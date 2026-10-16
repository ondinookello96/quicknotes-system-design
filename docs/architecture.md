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
                                       ▼
                               [ Read Replica ]


Component DescriptionsDNS: Resolves domain names to server IP addresses globally for fast routing.Load Balancer: Distributes inbound traffic evenly across multiple application servers to prevent single-server overloads.App Servers: Stateless compute nodes that process backend business logic and API requests.Redis Cache: In-memory store used for lightning-fast session management and hot note caching.Message Queue: Buffers heavy asynchronous background tasks like search indexing or notification dispatch.Primary Database: Manages strict, ACID-compliant write operations (creates, updates, deletes).Read Replica: Offloads high-frequency read queries away from the primary database to boost performance.Request FlowsGET /notes Flow: Client sends request $\rightarrow$ DNS $\rightarrow$ Load Balancer $\rightarrow$ App Server $\rightarrow$ Read Replica fetches notes $\rightarrow$ JSON response returned to client.POST /notes Flow: Client sends payload $\rightarrow$ Load Balancer $\rightarrow$ App Server $\rightarrow$ Primary Database writes note $\rightarrow$ Cache is invalidated $\rightarrow$ 201 Created response sent back.Trade-offs & SPOF AvoidanceTrade-off: We choose eventual consistency for search index updates to ensure high write performance and availability.Single Points of Failure (SPOF) Avoidance: Outages are prevented by deploying redundant app servers behind a load balancer and configuring database master-slave replication with automated failover.

```
