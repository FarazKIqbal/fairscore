# FairScore

**Explainable credit scoring that connects borrowers directly to lenders — every score backed by the reasons behind it.**

[![Python](https://img.shields.io/badge/Python-3.11-3776AB.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4.svg)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-slate-black.svg)](https://ui.shadcn.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E.svg)](https://supabase.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.8-F7931E.svg)](https://scikit-learn.org/)
[![LightGBM](https://img.shields.io/badge/LightGBM-4.6-white.svg)](https://lightgbm.readthedocs.io/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.11-EE4C2C.svg)](https://pytorch.org/)
[![SHAP](https://img.shields.io/badge/SHAP-0.50-8B5CF6.svg)](https://shap.readthedocs.io/)
[![LIME](https://img.shields.io/badge/LIME-0.2-9CA3AF.svg)](https://github.com/marcotcr/lime)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-8E75B2.svg)](https://ai.google.dev/)
[![Pandas](https://img.shields.io/badge/Pandas-3.0-150458.svg)](https://pandas.pydata.org/)
[![NumPy](https://img.shields.io/badge/NumPy-2.3-013243.svg)](https://numpy.org/)
[![imbalanced-learn](https://img.shields.io/badge/imbalanced--learn-0.14-8C564B.svg)](https://imbalanced-learn.org/)
[![Docker](https://img.shields.io/badge/Docker-optional-2496ED.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## What It Is

FairScore is a full-stack lending platform where a machine-learning model produces a credit score, then **shows its work**. Borrowers see which factors pushed their score up or down and what to change; lenders see the same reasoning before approving or declining.

The score comes from a stacked ensemble — Random Forest, LightGBM, and a TabTransformer feeding a Linear Regression meta-learner — trained on 279,856 credit profiles. Every prediction is explained with SHAP (which features mattered globally) and LIME (which rules drove this specific score), then rewritten into plain English for the borrower.

**Built for:** borrowers who need a score they can understand and act on, and individual lenders who need to underwrite applicants with evidence rather than a black-box number.

## Why It's Needed

Conventional credit scoring hands back a number and nothing else. A borrower who gets declined cannot tell whether to lower their loan-to-value ratio, clear an existing loan, or wait out a short credit history — so nothing changes.

FairScore inverts that. The same explanations that make a score defensible under regulation also make it actionable to the person living with it, and legible to the lender making the approval decision. Both sides argue from the same evidence.

## What You Get

- **A score with a receipt.** SHAP feature importance and LIME local rules are merged into one ranked list of reasons, each marked as helping or hurting.
- **Plain-English advice.** Gemini 2.5 Flash rewrites model output into sentences a borrower can act on. Without an API key, the app falls back to deterministic tips — it never hard-fails.
- **Two-sided marketplace.** Borrowers browse lenders by type, amount range, and interest rate, then apply. Lenders see pre-scored applicants, the reasons behind each score, and approve or skip in one click.
- **A lender-side summary.** `GET /lender/review-insights` returns the borrower's SHAP breakdown plus a Gemini-written underwriting recommendation.
- **Graceful degradation.** Unknown categorical values (a state the model never saw) encode as `-1` instead of crashing. Missing Gemini key, rate limits, and unavailable model artifacts all fall back rather than fail.

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

## Quick Start

```bash
git clone https://github.com/FarazKIqbal/fairscore.git
cd fairscore

# 1. Create a virtual environment
py -3.11 -m venv .venv && .\.venv\Scripts\Activate.ps1   # Windows
# python3 -m venv .venv && source .venv/bin/activate      # macOS / Linux

# 2. Configure Supabase credentials
#    The backend reads .env from backend/, not the repo root
cp .env.example backend/.env
# Edit backend/.env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and optionally GEMINI_API_KEY

# 3. Launch backend + frontend
python scripts/bootstrap_and_run.py
```

The launcher installs missing dependencies, checks for model artifacts, and starts both services:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Interactive API docs | http://localhost:8000/docs |

Press **Ctrl+C** once to stop both.

<details>
<summary><b>macOS / Linux setup and troubleshooting</b></summary>

- Use `python3` instead of `python` throughout.
- On Apple Silicon, if PyTorch or SHAP fails to build: `ARCHFLAGS=-Qunused-arguments CPPFLAGS=-QunusedArguments python scripts/bootstrap_and_run.py`
- Port already in use: `python scripts/bootstrap_and_run.py --backend-port 9000 --frontend-port 5174`
- Full OS-specific guides live in [SETUP_GUIDE.md](./SETUP_GUIDE.md), [MAC_SETUP.md](./MAC_SETUP.md), and [CROSS_PLATFORM.md](./CROSS_PLATFORM.md).

</details>

### Bootstrap flags

| Flag | Effect |
|------|--------|
| `--train-missing-models` | Trains missing model artifacts before launch (~5–10 min) |
| `--force-install` | Reinstalls dependencies even if the check passes |
| `--skip-python-install` / `--skip-node-install` | Skips that install step |
| `--backend-port` / `--frontend-port` / `--backend-host` / `--frontend-host` | Overrides the default bind addresses |

For a legacy launcher that skips the bootstrap logic and starts both services directly, use `python scripts/dev_runner.py`.

### Docker

```bash
docker compose up --build
```

Or without Compose:

```bash
docker build -t fairscore .
docker run -p 8000:8000 -p 5173:5173 --env-file .env fairscore
```

Inside a container the credentials come from the process environment, so a **root-level** `.env` is what Compose and `--env-file` read here — unlike a local run, which reads `backend/.env`. Compose only forwards `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; add `GEMINI_API_KEY` to the `environment:` block if you want AI advice in Docker.

The image has no `.dockerignore`, so the build context includes `.venv/` and `node_modules/` — expect a slow first build.

## Data & Model Pipeline

Two things are **not** committed to the repository, and both are needed for live predictions:

1. **The dataset** (`backend/dataset/`, ~80 MB) — the source CSV and its preprocessed form are gitignored. Place `credit_data.csv` in `backend/dataset/` with these columns: `Age`, `Gender`, `Income`, `Credit Score`, `Credit History Length`, `Number of Existing Loans`, `Loan Amount`, `Loan Tenure`, `Existing Customer`, `State`, `City`, `LTV Ratio`, `Employment Profile`, `Profile Score`, `Occupation`.
2. **The trained artifacts** — `random_forest_model.joblib`, `lightgbm_model.joblib`, `meta_learner.joblib`, `label_encoders.joblib`, and `scaler.joblib` are gitignored (`*.joblib`). Only `tab_transformer_model.pth` and `ensemble_config.json` are committed.

With the dataset in place, retrain everything with:

```bash
python backend/models/preprocessing.py      # encode + scale + SMOTE-ENN balance
python backend/models/random_forest.py      # base model 1
python backend/models/lightgbm_model.py     # base model 2
python backend/models/tab_transformer.py    # base model 3 (PyTorch)
python backend/models/stacked_ensemble.py   # linear meta-learner
```

Or let the launcher handle it: `python scripts/bootstrap_and_run.py --train-missing-models`.

The launcher runs a **preflight check** on startup. If artifacts are missing, both services still start — but prediction and explanation endpoints will fail until the models are trained. The app's scoring path also falls back to a deterministic heuristic when the predictor cannot load, so the UI stays navigable.

The pipeline uses **SMOTE-ENN** (Synthetic Minority Over-sampling + Edited Nearest Neighbours) to rebalance the target class, then `SafeLabelEncoder` so unseen categories at inference time encode as `-1` instead of raising.

### Measured performance

| Model | R² | MAE | RMSE |
|-------|-----|-----|------|
| Random Forest | 0.9932 | 11.02 | 13.47 |
| LightGBM | 0.9920 | 12.04 | 14.58 |
| TabTransformer | 0.9782 | 19.67 | 24.11 |
| **Stacked Ensemble** | **0.9950** | **8.99** | **11.50** |

The ensemble beats its best base model by a modest margin — the real value is the diversity it buys and the explanations it makes possible.

### Feature importance (SHAP)

`Number of Existing Loans` dominates at **48.31**, followed by `Income` (2.17), `State` (1.92), and `Credit History Length` (0.90). `Age` and `LTV Ratio` contribute minimally.

This is worth stating plainly: a model that leans this hard on one feature has a narrow fairness profile, and location features carrying non-trivial weight are a known audit target. The repository documents both as open questions in [`EXPLAINABILITY_SUMMARY.md`](./backend/models/EXPLAINABILITY_SUMMARY.md).

> **On fairness:** the name is aspirational. The codebase ships *explainability* — SHAP and LIME let you see which features moved a score — but no fairness metric (disparate impact, equalized odds) is implemented, and `Gender` is present in the source dataset yet excluded from the model's ten features. Treat bias auditing as work still to be done, not a property this project already has.

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

The backend expects these Supabase (Postgres) tables to exist: `users`, `borrower`, `borrower_credit_info`, `borrower_loan_details`, `lender`, `loan`, and `borrower_score_insights_cache` (optional — the app falls back to an in-memory cache if it is absent). There is no migration script in the repository, so create them in the Supabase SQL editor before first run.

The frontend calls `http://localhost:8000/api/v1` with the URL hardcoded in `frontend/src/services/api.ts`. If your backend runs on a different port, update that constant.

## Tech Stack

**Backend** — FastAPI, Uvicorn, Pydantic v2, Supabase (Postgres + Auth), bcrypt
**ML** — scikit-learn, LightGBM, PyTorch (TabTransformer), SHAP, LIME, imbalanced-learn (SMOTE-ENN), joblib
**Frontend** — React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query, Axios, Lucide, Sonner
**LLM** — Google Gemini 2.5 Flash via `google-generativeai` (optional — deterministic fallbacks when absent)

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
│   │   ├── random_forest.py   # lightgbm_model.py, tab_transformer.py
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
└── docker-compose.yml
```

## Further Reading

The `backend/models/` directory contains detailed technical documentation:

- [`backend/models/README.md`](./backend/models/README.md) — preprocessing pipeline and unknown-value handling
- [`backend/models/STACKED_ENSEMBLE_README.md`](./backend/models/STACKED_ENSEMBLE_README.md) — ensemble architecture and meta-learner analysis
- [`backend/models/EXPLAINABILITY_GUIDE.md`](./backend/models/EXPLAINABILITY_GUIDE.md) — full SHAP/LIME implementation guide
- [`backend/models/EXPLAINABILITY_SUMMARY.md`](./backend/models/EXPLAINABILITY_SUMMARY.md) — implementation summary and key findings
- [`backend/models/UNKNOWN_VALUES_GUIDE.md`](./backend/models/UNKNOWN_VALUES_GUIDE.md) — safe encoding patterns
- [`backend/models/Utilities/README.md`](./backend/models/Utilities/README.md) — `CreditScorePredictor` API reference

## License

[MIT](./LICENSE) © 2026 Faraz Karukappadath Iqbal

## About the Author

Built by the FairScore team — [FarazKIqbal](https://github.com/FarazKIqbal) and contributors.
