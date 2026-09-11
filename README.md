# ⛓️ NETRA — Bitcoin Intelligence & Investigation Platform

### **Smart India Hackathon (SIH 2026) · Problem Statement 26146 · NTRO**

> **NETRA** — Network Entity Tracking & Risk Analysis
> An intelligence-oriented platform for analyzing Bitcoin transactions, wallet behavior, network observations, suspicious patterns, and risk propagation.

---

## 🧭 Overview

**NETRA** is a Bitcoin transaction intelligence and investigation platform designed to help analysts move from raw transaction data to prioritized entities and explainable investigation leads.

The platform combines:

* Bitcoin transaction and UTXO-oriented data modeling
* Wallet/entity risk scoring
* Suspicious transaction-pattern detection
* Network/IP observations
* Graph-based entity investigation
* Explainable alert evidence
* Risk propagation analysis
* Dataset ingestion and analysis workflows
* Synthetic datasets for development and evaluation

The current repository contains the **NETRA frontend, API integration layer, mock intelligence data, data schemas, and synthetic dataset tooling**.

The backend API is designed to be connected through the frontend's configurable REST API layer but is **not included in the current repository**.

---

## 🎯 Problem Statement

The system is intended for cryptocurrency and cyber-forensics workflows where investigators need to identify potentially suspicious entities within large Bitcoin transaction datasets.

NETRA focuses on signals such as:

* Abnormal transaction behavior
* Peeling/layering chains
* CoinJoin/mixer-like transaction structures
* Fan-in and fan-out patterns
* Wallet risk indicators
* Network/IP correlations
* Entity relationships
* Risk propagation across connected wallets
* Explainable evidence behind generated alerts

> **Important:** A NETRA alert is a prioritization signal for investigation. It is not, by itself, proof of criminal activity.

---

# ✨ Core Capabilities

## 📊 Intelligence Dashboard

The dashboard provides a high-level view of the active dataset and investigation state.

It includes:

* Transaction count
* Wallet count
* Unique IP count
* ASN count
* Country count
* Valid/rejected records
* Active alerts
* Detection pipeline status
* Analysis results
* Alert filtering
* GeoIP ingress visualization

The dashboard also supports triggering an analysis job and polling its status until completion.

---

## 🚨 Alert Intelligence

NETRA maintains a ranked alert workflow around suspicious entities.

Alerts contain:

* Alert ID
* Entity type
* Entity identifier
* Risk score
* Risk level
* Confidence
* Pattern classifications
* Creation timestamp

Supported risk levels:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Supported pattern types:

```text
peeling_chain
coinjoin
anomaly
fan_out
fan_in
```

The Alert Log provides filtering and pagination, allowing analysts to focus on specific risk levels.

---

## 🔎 Investigation / Case File

Selecting an alert opens an investigation-oriented case file.

The investigation workflow combines:

### Connected Entity Graph

Interactive Cytoscape-based graph visualization showing:

* Wallet nodes
* Transaction nodes
* Transaction relationships
* Entity risk levels
* Focused investigation entities
* Directed transaction edges

### Explainable Evidence

Alerts can expose evidence vectors containing:

* Evidence type
* Description
* Evidence weight
* Feature-level signals
* Feature z-scores
* Chain statistics
* Transaction references

### Wallet Risk Breakdown

For wallet entities, risk can be decomposed into components such as:

```text
Anomaly
Peeling
CoinJoin
Cluster
Network
Propagation
```

### Risk Propagation

The investigation view can represent a propagation path:

```text
Seed Wallet
    ↓
Hop 1
    ↓
Hop 2
    ↓
...
    ↓
Target Wallet
```

Each hop can include the wallet, transaction and propagated risk score.

---

# 🧩 Frontend Architecture

The frontend is built with:

* **React 18**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **Lucide React**
* **Cytoscape.js**
* **D3.js**

The application currently has three primary navigation states:

```text
Overview
Alert Log
Case File
```

The codebase also contains additional investigation-oriented UI modules for datasets, clusters, graph exploration, streaming transactions, transaction exploration, and wallet-risk analysis.

---

# 📁 Repository Structure

```text
netra-bitcoin-intelligence/
│
├── README.md
├── .gitignore
│
├── frontend/
│   ├── .env.local.example
│   ├── .gitignore
│   ├── OPEN_QUESTION_FOR_BACKEND.txt
│   ├── README.md
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   │
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css
│       ├── vite-env.d.ts
│       │
│       ├── api/
│       │   └── client.ts
│       │
│       ├── components/
│       │   ├── AlertsView.tsx
│       │   ├── ClustersView.tsx
│       │   ├── DashboardView.tsx
│       │   ├── DatasetImportView.tsx
│       │   ├── GraphExplorerView.tsx
│       │   ├── GraphView.tsx
│       │   ├── RiskBadge.tsx
│       │   ├── Sidebar.tsx
│       │   ├── StatCard.tsx
│       │   ├── StreamView.tsx
│       │   ├── TransactionsExplorerView.tsx
│       │   ├── WalletRiskView.tsx
│       │   └── WorkflowStepper.tsx
│       │
│       ├── data/
│       │   └── mockData.ts
│       │
│       ├── pages/
│       │   ├── AlertsPage.tsx
│       │   ├── DashboardHome.tsx
│       │   └── InvestigationPage.tsx
│       │
│       └── types/
│           └── index.ts
│
├── schema/
│   ├── SCHEMA_README.md
│   ├── db_schema.sql
│   ├── generate_sample_dataset.py
│   └── raw_record_schema.json
│
└── output/
    └── sih-idea-ppt-guide.html
```

---

# 🖥️ Frontend Code Organization

## `src/App.tsx`

The main application shell.

It manages:

* Current page
* Selected alert
* Navigation between dashboard, alerts and investigation
* Rendering of the active page

---

## `src/components/Sidebar.tsx`

NETRA's primary navigation sidebar.

Current sections:

```text
Overview
Alert Log
Case File
```

The sidebar also identifies the SIH problem statement and NETRA's offline/local-data orientation.

---

## `src/pages/`

### `DashboardHome.tsx`

Provides the main case overview and analysis pipeline.

Responsibilities include:

* Loading dataset information
* Restoring stored analysis jobs
* Triggering analysis
* Polling analysis status
* Displaying pipeline stages
* Displaying analysis statistics

### `AlertsPage.tsx`

Provides the ranked alert log.

Features:

* Risk filtering
* Pagination
* Alert ranking
* Pattern labels
* Alert-to-investigation navigation

### `InvestigationPage.tsx`

Provides the detailed investigation/case-file experience.

It combines:

* Alert details
* Risk score
* Connected entity graph
* Explainable evidence
* Wallet risk breakdown
* Propagation path

---

# 🧱 Reusable Components

### `RiskBadge.tsx`

Displays risk levels and optional risk scores using NETRA's visual risk language.

### `StatCard.tsx`

Reusable intelligence metric card supporting:

* Values
* Risk/status tones
* Increasing/decreasing indicators
* Flagged values

### `GraphView.tsx`

Cytoscape-powered entity relationship visualization.

Nodes are differentiated by:

* Entity type
* Risk level

The currently investigated entity can be visually focused.

### `WorkflowStepper.tsx`

Represents the investigation workflow stages.

### Additional Investigation Modules

The repository also contains reusable components for:

* Alert evidence workbench
* Dataset import
* Cluster analysis
* Graph exploration
* Live transaction stream
* Transaction explorer
* Wallet risk analysis

These modules are structured to consume the same API/type layer and can be wired into the primary navigation as the backend and investigation workflow evolve.

---

# 🔌 API Integration Layer

`frontend/src/api/client.ts` is the central API abstraction.

It supports two modes.

## Mock Mode

Enabled by default:

```env
VITE_USE_MOCK=true
```

This allows the frontend to operate without the backend.

Mock data covers:

* Dataset information
* Analysis jobs
* Analysis statistics
* Alerts
* Alert evidence
* Alert graphs
* Risk propagation
* Wallet risk
* Transactions
* Live stream samples

---

## Backend Mode

When the backend becomes available:

```env
VITE_USE_MOCK=false
```

The API base URL can be configured with:

```env
VITE_API_BASE=http://localhost:8000/api/v1
```

The active dataset can be configured using:

```env
VITE_DATASET_ID=demo_01
```

The frontend API layer includes request timeouts and error handling so an unavailable backend does not leave requests hanging indefinitely.

---

# 🔗 API Endpoint Contract

The frontend is structured around the following REST resources:

### Datasets

```text
GET  /api/v1/datasets/{dataset_id}/
POST /api/v1/datasets/import/
```

### Analysis

```text
POST /api/v1/analysis/
GET  /api/v1/analysis/{job_id}/
GET  /api/v1/analysis/{job_id}/stats/
```

### Alerts

```text
GET /api/v1/alerts/
GET /api/v1/alerts/{alert_id}/
GET /api/v1/alerts/{alert_id}/evidence/
GET /api/v1/alerts/{alert_id}/graph/
GET /api/v1/alerts/{alert_id}/propagation/
```

### Transactions

```text
GET /api/v1/transactions/
GET /api/v1/transactions/{txid}/
```

### Wallets

```text
GET /api/v1/wallets/
GET /api/v1/wallets/{address}/risk/
```

### Graph

```text
GET /api/v1/graph/neighborhood/
```

### Clusters

```text
GET /api/v1/clusters/
```

### Stream

```text
GET /api/v1/stream/sample/
```

> These paths represent the frontend's API contract. The corresponding backend implementation is not currently included in this repository.

---

# 🧪 Synthetic Dataset Generator

The repository includes a deterministic synthetic dataset generator so development and detection work can begin without the official dataset.

Location:

```text
schema/generate_sample_dataset.py
```

It generates normal Bitcoin-like records plus four injected scenarios:

1. **Ransomware convergence**
2. **Layering / peeling-chain behavior**
3. **Mixer-like transaction structure**
4. **IP-to-wallet anomaly**

Example:

```bash
cd schema
python3 generate_sample_dataset.py --rows 5000 --out sample_dataset.json
```

The generator produces:

```text
sample_dataset.json
sample_dataset_ground_truth.json
```

The ground-truth file is intended for evaluating detection performance and should **not** be supplied as model input.

---

# 🗄️ Data Schema

The `schema/` directory defines the data foundation used by the platform.

## Raw Record Schema

```text
schema/raw_record_schema.json
```

Defines the expected structure of incoming transaction/network records.

## Normalized Database Schema

```text
schema/db_schema.sql
```

Defines normalized relational entities including:

```text
transactions
wallets
ip_observations
tx_wallet_links
rejected_rows
```

The schema explicitly preserves rejected records rather than silently discarding invalid input.

---

# ⚙️ Installation

## Requirements

* Node.js
* npm
* Python 3.x for synthetic dataset generation
* A compatible backend if live API mode is required

---

## 1. Clone the repository

```bash
git clone https://github.com/nishantnayakx/netra-bitcoin-intelligence.git
cd netra-bitcoin-intelligence
```

---

## 2. Install frontend dependencies

```bash
cd frontend
npm install
```

---

## 3. Configure environment

Copy:

```text
frontend/.env.local.example
```

to:

```text
frontend/.env.local
```

For frontend-only development:

```env
VITE_USE_MOCK=true
VITE_API_BASE=http://localhost:8000/api/v1
VITE_DATASET_ID=demo_01
```

For a running backend:

```env
VITE_USE_MOCK=false
VITE_API_BASE=http://localhost:8000/api/v1
VITE_DATASET_ID=demo_01
```

Do not commit `.env.local`.

---

# ▶️ Run the Frontend

From `frontend/`:

```bash
npm run dev
```

Then open:

```text
http://localhost:5173
```

The default mock mode allows the UI to be explored without a backend.

---

# 🏗️ Production Build

Run:

```bash
npm run build
```

The build performs:

```text
TypeScript compilation
        ↓
Vite production build
```

To preview the production build:

```bash
npm run preview
```

---

# 🧠 Detection & Investigation Philosophy

NETRA is designed around an investigation pipeline rather than a single binary classification.

```text
Raw Data
   │
   ▼
Ingestion
   │
   ▼
Normalization
   │
   ▼
Feature Extraction
   │
   ├── Transaction anomalies
   ├── Peeling/layering
   ├── CoinJoin-like patterns
   ├── Network correlations
   └── Entity relationships
   │
   ▼
Risk Scoring
   │
   ▼
Alert Ranking
   │
   ▼
Explainable Evidence
   │
   ▼
Graph Investigation
   │
   ▼
Risk Propagation
   │
   ▼
Analyst Decision
```

The goal is to help investigators answer:

> **What was detected, why was it detected, how is it connected, and where does the associated risk propagate?**

---

# 🔐 Responsible Use

NETRA is intended as an intelligence and prioritization system.

A high risk score should be interpreted as:

```text
"Prioritize this entity for investigation"
```

and not:

```text
"This entity is definitely criminal."
```

Any real-world deployment should include appropriate validation, human review, false-positive analysis, data-quality checks, privacy controls, and legal/organizational safeguards.

---

# 📌 Current Project Status

### Frontend

* ✅ NETRA rebrand implemented
* ✅ React/TypeScript frontend
* ✅ Dashboard
* ✅ Alert log
* ✅ Investigation/case-file workflow
* ✅ Risk visualization
* ✅ Explainable evidence UI
* ✅ Graph visualization
* ✅ Mock API mode
* ✅ Configurable live API mode
* ✅ Synthetic dataset generator
* ✅ Database/schema foundation
* ✅ Production build verified

### Backend

The frontend API contract is prepared, but the backend implementation is currently maintained separately from this repository.

---

# 🛠️ Development Roadmap

Potential next stages include:

* [ ] Integrate production FastAPI backend
* [ ] Connect real PostgreSQL database
* [ ] Implement complete ingestion pipeline
* [ ] Implement transaction feature extraction
* [ ] Implement wallet/entity clustering
* [ ] Implement anomaly detection
* [ ] Implement peeling-chain detection
* [ ] Implement CoinJoin/mixer detection
* [ ] Implement network/IP intelligence
* [ ] Implement graph neighborhood APIs
* [ ] Implement risk propagation engine
* [ ] Add analyst authentication and authorization
* [ ] Add forensic report generation
* [ ] Add automated evaluation against ground-truth datasets
* [ ] Add production deployment configuration

---

# 📚 Project Structure at a Glance

| Area                                | Purpose                                |
| ----------------------------------- | -------------------------------------- |
| `frontend/`                         | NETRA web application                  |
| `frontend/src/api/`                 | REST API integration layer             |
| `frontend/src/components/`          | Reusable intelligence/investigation UI |
| `frontend/src/pages/`               | Primary application screens            |
| `frontend/src/types/`               | Shared TypeScript data contracts       |
| `frontend/src/data/`                | Development mock intelligence data     |
| `schema/`                           | Raw/normalized data definitions        |
| `schema/generate_sample_dataset.py` | Synthetic forensic dataset generator   |
| `output/`                           | SIH presentation/reference material    |

---

# 🏆 Smart India Hackathon

**Problem Statement:** 26146
**Organization:** National Technical Research Organisation (NTRO)
**Domain:** Cryptocurrency & Cyber Forensics
**Project:** NETRA — Network Entity Tracking & Risk Analysis

---

## 👨‍💻 Author

**Nishant Nayak**

B.Tech CSE · NIT Durgapur

GitHub: [@nishantnayakx](https://github.com/nishantnayakx)

Built for **Smart India Hackathon 2026**.
