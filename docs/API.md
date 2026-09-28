# AETHER REST API Reference

Base URL: `http://localhost:8000` (or `/api` via Vite dev proxy)

## Endpoints Summary

### System & Health
- `GET /api/health`: Health status, active AI mode, and indexed vector count.
- `GET /api/system/status`: Environment details and provider capabilities.

### Dashboard
- `GET /api/dashboard/stats`: Returns KPI metrics (Total Feedback, Active Issues, Emerging Issues, Sentiment breakdown).
- `GET /api/dashboard/emerging-issues`: Top issues meeting the $+25\%$ period-over-period growth threshold.
- `GET /api/dashboard/trends`: Daily/weekly sentiment time-series data (positive, neutral, negative).
- `GET /api/dashboard/top-themes`: Top feedback themes ranked by mention volume and sentiment.
- `GET /api/dashboard/insight`: Executive AI synthesis of active friction areas and channel signals.

### Feedback Ingestion & Management
- `POST /api/feedback`: Ingest single feedback item. Automatically invokes AI extraction, embedding, vector memory query, issue mapping, and trend update.
- `GET /api/feedback`: Filterable feedback list (by `channel`, `sentiment`, `issue_id`, `search`, `limit`, `offset`).
- `GET /api/feedback/{id}`: Detailed feedback metadata and connected issue.
- `DELETE /api/feedback/{id}`: Delete feedback and purge associated vector from memory.
- `POST /api/feedback/upload`: Bulk CSV feedback ingestion with embedding and cluster linking.

### Issues & Problem Spaces
- `GET /api/issues`: List clustered issues with status, total mentions, and channel counts.
- `GET /api/issues/{id}`: Deep dive into issue with timeline chart, channel distribution, and representative verbatims.

### Persistent Memory
- `GET /api/memory/similar/{feedback_id}`: Retrieves semantically similar historical feedback items from vector memory.
- `GET /api/memory/graph`: Node-link graph structure (Issues -> Feedbacks -> Channels) for the Visual Memory Explorer.

### AI Analyst
- `POST /api/ai/chat`: Natural language question answering grounded in SQL statistics and vector memory evidence.
  - Body: `{"query": "What are the biggest emerging issues?"}`
  - Returns: `answer`, `metrics`, `evidence` (list of supporting records), `suggested_followups`.

### Product Releases
- `POST /api/releases`: Register a new release (`name`, `description`, `release_date`, `features`).
- `GET /api/releases`: List releases with pre vs post 14-day feedback volume and negative sentiment correlation analysis.
- `GET /api/releases/{id}`: Single release correlation report.

### Demo Seeding
- `POST /api/seed/demo-data`: Re-seed 500+ realistic feedback records with intentional emerging issue trends.
