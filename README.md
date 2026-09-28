# AETHER — AI Feedback Memory Agent

> **Tagline:** *"From scattered feedback to connected memory and emerging product insights."*

---

## 1. Executive Summary & Problem

Modern product teams receive customer feedback from fragmented channels:
- Customer reviews (App Store, Play Store)
- Support tickets (Zendesk, Intercom)
- In-app surveys (Delighted, Typeform)
- Customer emails
- Social media (X, Reddit, LinkedIn)
- Customer interviews

The core problem is that **feedback is fragmented across time and communication channels**. The exact same underlying friction point appears in different phrasing:
- *"Checkout is confusing."* (Review)
- *"I can't find where to enter my card."* (Support Ticket)
- *"The payment page is difficult to understand."* (Survey)
- *"Where do I put my billing details?"* (Email)

Standard tools merely perform shallow sentiment classification without memory. They cannot connect related feedback across time or detect emerging issues before customer churn escalates.

---

## 2. The Solution & Core Innovation (USP)

> **"AETHER doesn't just analyze what customers said. It remembers what they said before, connects related feedback across channels and time, detects emerging problems, and provides evidence-backed insights to product teams."**

AETHER introduces:
1. **Persistent AI Memory**: Vector embeddings stored in a persistent memory engine that remembers every customer voice.
2. **Semantic Cross-Channel Connections**: Automatically connects incoming comments with historical feedback based on cosine semantic similarity ($sim \ge 0.65$).
3. **Cross-Time Trend Analysis**: Tracks problem spaces across weeks and months.
4. **Emerging Issue Detection**: An explainable period-over-period algorithm ($\Delta_{growth} \ge +25\%$, $mentions \ge 5$) that flags emerging issues early.
5. **Zero-Hallucination Evidence Grounding**: The AI Analyst provides grounded answers where every numerical metric and claim is linked to verified customer verbatim records.

---

## 3. Key Features

- **Executive AI Dashboard**: Real-time KPI cards, dynamic sentiment trend line chart, top themes, and executive AI summary insight banner.
- **Explainable Emerging Issue Detection**: Period-over-period comparison (e.g. Previous 30d: 9 mentions vs Current 30d: 35 mentions = $+288\%$ growth), severity badges, and channel distribution tags.
- **Continuous Feedback Ingestion**: Add feedback manually via UI modal or bulk-ingest via CSV with automatic validation and vector embedding.
- **Deep Issue Management**: Dedicated issue detail pages with mentions timeline, channel distribution breakdown, and representative verbatims.
- **Visual Memory Explorer**: Interactive graph visualizing **Feedback $\rightarrow$ Connected Memories $\rightarrow$ Issue $\rightarrow$ Channel**, including a live semantic similarity tester.
- **AI Analyst (Conversational Product Intelligence)**: ChatGPT-like conversational UI answering product questions backed by real SQL database statistics and supporting evidence records.
- **Product Release Correlation**: Evaluate before vs after release feedback volume and negative sentiment shifts with cautious correlation language.
- **Seamless Demo AI Mode**: Operates out-of-the-box in offline Demo AI Mode or with live Google Gemini 1.5 Flash.

---

## 4. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide React
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, SQLite (with PostgreSQL compatibility)
- **AI Engine**: Google Gemini API (`gemini-1.5-flash` & `text-embedding-004`) + Intelligent Demo AI heuristic fallback
- **Memory Engine**: Persistent Vector Memory (dense normalized semantic embeddings with cosine similarity) + ChromaDB compatibility
- **Deployment**: Google Cloud Run ready with multi-stage Dockerfile

---

## 5. System Architecture

```
                    ┌─────────────────────────┐
                    │  React + Vite Frontend  │
                    │   (Tailwind, Recharts)  │
                    └────────────┬────────────┘
                                 │ HTTP / REST
                    ┌────────────▼────────────┐
                    │     FastAPI Gateway     │
                    │        /api/*           │
                    └──────┬───────────┬──────┘
                           │           │
            ┌──────────────▼───┐   ┌───▼──────────────┐
            │   AI Service     │   │  Vector Memory   │
            │ (Gemini/Demo AI) │   │ (Persistent Hub) │
            └──────┬───────────┘   └───┬──────────────┘
                   │                   │
            ┌──────▼───────────────────▼──────┐
            │       SQLite Database           │
            │  (Feedbacks, Issues, Releases)  │
            └──────────────────┬──────────────┘
                               │
            ┌──────────────────▼──────────────┐
            │   Emerging Issue & AI Analyst   │
            │    Evidence Grounding Engine    │
            └─────────────────────────────────┘
```

---

## 6. Installation & Quickstart

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+

### Clone & Setup
```bash
git clone https://github.com/your-username/aether.git
cd aether
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Contents of `.env`:
```env
GEMINI_API_KEY=
ENVIRONMENT=development
PORT=8000
HOST=127.0.0.1
DATABASE_URL=sqlite:///./backend/data/aether.db
VECTOR_STORE_PATH=./backend/data/vector_store.json
```
*(If `GEMINI_API_KEY` is left blank, AETHER automatically runs in high-fidelity **Demo AI Mode**).*

### Backend Installation & Startup
```bash
# Install Python packages
pip install -r backend/requirements.txt

# Start backend server (port 8000)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
On first launch, AETHER automatically generates database tables and seeds **520+ realistic customer feedback records** with pre-configured emerging issue trends.

### Frontend Installation & Startup
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Open your browser at `http://127.0.0.1:5173`.

---

## 7. The Hackathon Demo Flow (12-Step Walkthrough)

1. **Step 1 — Launch & 500+ Historical Records**: Open dashboard; notice 520+ pre-seeded records spanning Customer Reviews, Support Tickets, Surveys, and Emails.
2. **Step 2 — Dashboard Overview**: Inspect the Emerging Issues section, Sentiment Trend line chart, and AI Executive Insight banner.
3. **Step 3 — Inspect Checkout UX**: Notice Checkout Usability currently flagged as `EMERGING` with $+288\%$ growth.
4. **Step 4 — Add Feedback**: Click `+ Add Feedback`. Enter:
   `"The new checkout is confusing and I can't find where to enter my card."`
5. **Step 5 — AI Analysis**: Watch the AI analyze sentiment (`negative`, confidence `0.75`), topic (`Checkout`), and severity (`high`).
6. **Step 6 — Persistent Memory Search**: Vector memory scans historical customer verbatims.
7. **Step 7 — Semantic Match**: Finds high-confidence semantic matches from previous weeks.
8. **Step 8 — Connection**: Links the new feedback directly to **Checkout Usability**.
9. **Step 9 — Dynamic Update**: Total mentions and trend percentages update in real-time.
10. **Step 10 — Conversational Analyst**: Navigate to **AI Analyst** and ask:
    `"What are the biggest emerging issues?"`
11. **Step 11 — Grounded Answer**: AI responds with exact database figures (PoP growth $+288.9\%$, 35 current mentions vs 9 previous mentions, affected channels).
12. **Step 12 — Grounding Evidence**: Click **"View Supporting Feedback"** to open the Evidence Drawer displaying the exact verbatim records backing the insight.

---

## 8. Automated Test Suite

Run the complete automated test suite verifying all 7 core modules:
```bash
python backend/test_suite.py
```
Outputs:
```text
==================================================
      AETHER COMPREHENSIVE END-TO-END TESTS       
==================================================
[1] Health Check & Mode Verification: PASSED
[2] Dashboard KPI Stats: PASSED (520+ records)
[3] Emerging Issue Detection: PASSED (+288% growth detected)
[4] Ingesting New Customer Feedback: PASSED
[5] Vector Memory Retrieval: PASSED (100% semantic match)
[6] AI Analyst Grounded Chat Query: PASSED (Verified Evidence)
[7] Product Release Correlation Analysis: PASSED
==================================================
   ALL VERIFICATIONS PASSED SUCCESSFULLY! (100%)  
==================================================
```

---

## 9. Google Cloud Run Deployment

AETHER includes a production multi-stage `Dockerfile`.

### Build & Deploy to Google Cloud Run:
```bash
# 1. Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID

# 2. Build and deploy container to Cloud Run
gcloud run deploy aether \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your-api-key-here"
```

Cloud Run will provide an automated HTTPS URL with autoscaling from 0 to N instances.

---

## 10. Future Scope & Roadmap

- **Bidirectional Webhooks**: Real-time integration with Zendesk, Jira, and Slack alert webhooks.
- **Automated Root-Cause PR Suggestions**: Automatically draft GitHub pull requests addressing code areas correlated with feedback spikes.
- **Multilingual Semantic Memory**: Cross-lingual embeddings connecting customer comments in Spanish, Japanese, and French to unified English issue clusters.
- **Predictive Churn Scoring**: Correlate customer sentiment degradation with account churn risk.
