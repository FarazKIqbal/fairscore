<div align="center">

# FairScore

**Explainable credit scoring that connects borrowers directly to lenders — every score backed by the reasons behind it.**

[![Python 3.11](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Uvicorn](https://img.shields.io/badge/Uvicorn-0.42-000000)](https://www.uvicorn.org/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-slate-black)](https://ui.shadcn.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.28-3ECF8E?logo=supabase)](https://supabase.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.8-F7931E?logo=scikit-learn)](https://scikit-learn.org/)
[![LightGBM](https://img.shields.io/badge/LightGBM-4.6-00A86B?logo=lightgbm)](https://lightgbm.readthedocs.io/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.11-EE4C2C?logo=pytorch)](https://pytorch.org/)
[![SHAP](https://img.shields.io/badge/SHAP-0.50-8B5CF6?logo=shap)](https://shap.readthedocs.io/)
[![LIME](https://img.shields.io/badge/LIME-0.2-9CA3AF)](https://github.com/marcotcr/lime)
[![Gemini 2.5 Flash](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google)](https://ai.google.dev/)
[![Pandas](https://img.shields.io/badge/Pandas-3.0-150458?logo=pandas)](https://pandas.pydata.org/)
[![NumPy](https://img.shields.io/badge/NumPy-2.3-013243?logo=numpy)](https://numpy.org/)
[![imbalanced-learn](https://img.shields.io/badge/imbalanced--learn-0.14-8C564B)](https://imbalanced-learn.org/)
[![Docker](https://img.shields.io/badge/Docker-optional-2496ED?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-See%20repository%20license-blue.svg)](./LICENSE)

</div>

---

## What It Is

FairScore is a full-stack lending platform where a machine-learning model produces a credit score, then **shows its work**. Borrowers see which factors pushed their score up or down and what to change; lenders see the same reasoning before approving or declining.

The score comes from a stacked ensemble — Random Forest, LightGBM, and a TabTransformer feeding a Linear Regression meta-learner — trained on 279,856 credit profiles. Every prediction is explained with SHAP (which features mattered globally) and LIME (which rules drove this specific score), then rewritten into plain English for the borrower.

**Built for:** borrowers who need a score they can understand and act on, and individual lenders who need to underwrite applicants with evidence rather than a black-box number.

## Why It's Needed

Conventional credit scoring hands back a number and nothing else. A borrower who gets declined cannot tell whether to lower their loan-to-value ratio, clear an existing loan, or wait out a short credit history — so nothing changes.

FairScore inverts that. The same explanations that make a score defensible under regulation also make it actionable to the person living with it, and legible to the lender making the approval decision. Both sides argue from the same evidence.

## Quick Start

### One-command startup (recommended)

```bash
git clone https://github.com/FarazKIqbal/fairscore.git
cd fairscore

# Create virtual environment
py -3.11 -m venv .venv && .\.venv\Scripts\Activate.ps1   # Windows
python3 -m venv .venv && source .venv/bin/activate       # macOS / Linux

# Configure Supabase
cp .env.example .env
# Edit .env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and optionally GEMINI_API_KEY

# Launch both services
python scripts/bootstrap_and_run.py
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Interactive API docs | http://localhost:8000/docs |

Press **Ctrl+C** once to stop both.

### Bootstrap flags

| Flag | Effect |
|------|--------|
| `--train-missing-models` | Trains missing model artifacts before launch (~5–10 min) |
| `--force-install` | Reinstalls dependencies even if the check passes |
| `--skip-python-install` / `--skip-node-install` | Skips that install step |
| `--backend-port` / `--frontend-port` / `--backend-host` / `--frontend-host` | Overrides default bind addresses |

### Docker (alternative)

```bash
docker compose up --build
# Or without Compose:
docker build -t fairscore .
docker run -p 8000:8000 -p 5173:5173 --env-file .env fairscore
```

### Manual setup (without bootstrap)

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev   # serves on http://localhost:8080
```

## Model Pipeline

Two things are **not** committed and must be provided or generated:

1. **The dataset** (`backend/dataset/credit_data.csv`, ~80 MB) — gitignored. Columns: `Age`, `Gender`, `Income`, `Credit Score`, `Credit History Length`, `Number of Existing Loans`, `Loan Amount`, `Loan Tenure`, `Existing Customer`, `State`, `City`, `LTV Ratio`, `Employment Profile`, `Profile Score`, `Occupation`.

2. **Trained artifacts** — `random_forest_model.joblib`, `lightgbm_model.joblib`, `meta_learner.joblib`, `label_encoders.joblib`, and `scaler.joblib` are gitignored. Only `tab_transformer_model.pth` and `ensemble_config.json` are committed.

Generate artifacts with the dataset in place:

```bash
python backend/models/preprocessing.py      # encode + scale + SMOTE-ENN balance
python backend/models/random_forest.py      # base model 1
python backend/models/lightgbm_model.py     # base model 2
python backend/models/tab_transformer.py    # base model 3 (PyTorch)
python backend/models/stacked_ensemble.py   # linear meta-learner
```

Or let the launcher handle it: `python scripts/bootstrap_and_run.py --train-missing-models`.

### Measured performance

| Model | R² | MAE | RMSE |
|-------|-----|-----|------|
| Random Forest | 0.9932 | 11.02 | 13.47 |
| LightGBM | 0.9920 | 12.04 | 14.58 |
| TabTransformer | 0.9782 | 19.67 | 24.11 |
| **Stacked Ensemble** | **0.9950** | **8.99** | **11.50** |

### Feature importance (SHAP)

`Number of Existing Loans` dominates at **48.31**, followed by `Income` (2.17), `State` (1.92), and `Credit History Length` (0.90). `Age` and `LTV Ratio` contribute minimally.

> **On fairness:** the name is aspirational. The codebase ships *explainability* — SHAP and LIME let you see which features moved a score — but no fairness metric (disparate impact, equalized odds) is implemented, and `Gender` is present in the source dataset yet excluded from the model's ten features. Treat bias auditing as work still to be done.

## How It Works

```
Borrower profile (10 features)
        ↓
  SafeLabelEncoder + StandardScaler
        ↓
  ┌─────────────┬─────────────┬──────────────────┐
  │ Random      │ LightGBM    │ TabTransformer   │
  │ Forest      │             │ (PyTorch)         │
  └─────────────┴─────────────┴──────────────────┘
        ↓
  Linear Regression meta-learner  →  credit score (300–900)
        ↓
  SHAP (global) + LIME (local)  →  merged reasons
        ↓
  Gemini rewrite  →  borrower-facing advice
```

The meta-learner's weights are the interesting part: Random Forest carries **+3.66**, LightGBM **−2.66**, TabTransformer **+0.0007**. LightGBM's negative weight means it is not averaging — it is correcting Random Forest's systematic errors.

## What You Get

- **A score with a receipt.** SHAP feature importance and LIME local rules are merged into one ranked list of reasons, each marked as helping or hurting.
- **Plain-English advice.** Gemini 2.5 Flash rewrites model output into sentences a borrower can act on. Without an API key, the app falls back to deterministic tips — it never hard-fails.
- **Two-sided marketplace.** Borrowers browse lenders by type, amount range, and interest rate, then apply. Lenders see pre-scored applicants, the reasons behind each score, and approve or skip in one click.
- **Graceful degradation.** Unknown categorical values (a state the model never saw) encode as `-1` instead of crashing. Missing Gemini key, rate limits, and unavailable model artifacts all fall back rather than fail.

## API

All routes are prefixed `/api/v1`. Interactive docs at `/docs`.

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/register`, `/login` | Account creation and sign-in |
| `POST` | `/borrower/details` | Onboard a borrower and compute their first score |
| `GET` | `/borrower/credit-info` | Score, risk bucket, and estimated credit line |
| `GET` | `/borrower/score-reasons` | Merged SHAP + LIME reasons, ranked by impact |
| `GET` | `/borrower/score-advice` | Gemini-written improvement advice |
| `GET` | `/borrower/score-insights` | Reasons and advice in one call |
| `GET` | `/borrower/lender-info` | Available lenders with rates and amount ranges |
| `POST` | `/borrower/apply` | Apply to a lender |
| `GET` | `/lender/loan-requests` | Pending applications for a lender |
| `GET` | `/lender/review-insights` | SHAP breakdown + underwriting recommendation |
| `POST` | `/lender/approve`, `/lender/skip` | Decide on an application |

Responses are cached per borrower in `borrower_score_insights_cache` and invalidated whenever the borrower edits their profile.

### Database

The backend expects these Supabase (Postgres) tables to exist: `users`, `borrower`, `borrower_credit_info`, `borrower_loan_details`, `lender`, `loan`, and `borrower_score_insights_cache` (optional — the app falls back to an in-memory cache if absent). There is no migration script in the repository, so create them in the Supabase SQL editor before first run.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | yes | Project URL from Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Service-role key (bypasses RLS) |
| `GEMINI_API_KEY` | no | AI advice via Gemini 2.5 Flash |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | no | Optional local Postgres override |
| `API_TIMEOUT` | no | Request timeout seconds (default 30) |
| `DEBUG` | no | Enable debug logging (default false) |

## Project Layout

```
fairscore/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, /api/v1 router
│   │   ├── db/supabase.py     # Supabase client
│   │   ├── routes/            # auth, borrower, lender
│   │   ├── schemas/           # Pydantic request models
│   │   └── services/          # business logic, scoring, explanations
│   ├── models/
│   │   ├── preprocessing.py   # encoding, scaling, SMOTE-ENN
│   │   ├── random_forest.py   # base model 1
│   │   ├── lightgbm_model.py  # base model 2
│   │   ├── tab_transformer.py # base model 3 (PyTorch)
│   │   ├── stacked_ensemble.py# meta-learner training
│   │   ├── inference.py       # StackedEnsemblePredictor + explainability
│   │   ├── safe_encoders.py   # unknown-value handling
│   │   └── Utilities/         # CreditScorePredictor public API
│   └── dataset/               # credit_data.csv (not committed)
├── frontend/
│   ├── src/pages/             # public/, borrower/, lender/
│   ├── src/components/        # ui/ (shadcn), layout components
│   └── src/services/          # api.ts, authService.ts
├── scripts/
│   ├── bootstrap_and_run.py    # installs deps, preflights models, starts both
│   └── dev_runner.py           # legacy launcher, no bootstrap
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Configuration

The frontend calls `http://localhost:8000/api/v1` with the URL hardcoded in `frontend/src/services/api.ts`. If your backend runs on a different port, update that constant.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `python` command not found | Use `python3` (macOS/Linux) or ensure `.venv/bin` is activated |
| Port 8000 or 5173 already in use | `python scripts/bootstrap_and_run.py --backend-port 9000 --frontend-port 5174` |
| M1/M2 Mac compilation errors | `ARCHFLAGS=-Qunused-arguments CPPFLAGS=-QunusedArguments python scripts/bootstrap_and_run.py` |
| Model artifacts missing | Add `--train-missing-models` flag or run training scripts manually |
| Frontend not loading | Ensure `.env` exists at repo root with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` |

## License

No license file is present in the repository. Licensing is **unresolved** — add a `LICENSE` file (e.g., MIT, Apache-2.0) before publishing if you intend open-source distribution.

## About the Author

Built by **FarazKIqbal**.  
GitHub: [@FarazKIqbal](https://github.com/FarazKIqbal)
