# California DMV Bilingual Quiz Platform

An end-to-end data engineering + web application project:

- Transforms and normalizes content into bilingual/trilingual formats (Traditional Chinese, Simplified Chinese, English)
- Serves a production-ready quiz web app with language switching, scoring, wrong-question tracking, knowledge-tag analytics, and timed mock exams

## Project Positioning

### Data Sourcing

- Compiled and normalized a bilingual dataset from publicly accessible California DMV practice resources.
- The core value is not a single scraper target; it is the full data pipeline and productization workflow.

### ETL Pipeline

- `Extract`: Ingests source quiz content from user-managed data inputs
- `Transform`: Cleaning, normalization, schema mapping, Traditional/Simplified conversion, English translation, retry/error handling
- `Load`: Export to standardized JSON/CSV and load into the FastAPI-powered quiz application

## Tech Stack

- Backend: `Python`, `FastAPI`, `SQLite`
- Frontend: `Vanilla JS`, `HTML`, `CSS`
- Data Pipeline: Python (`json`, `csv`) + OpenAI API for translation

## Features

- Language switching per question: `zh-hans` / `zh-hant` / `en`
- Practice mode: instant answer feedback, progress metrics, wrong-question review
- Mock exam mode: configurable question count, time limit, submit, result page
- Knowledge-point analytics: `total / answered / correct / wrong / accuracy` by tag
- Exported dataset files:
  - `output/dmv_quiz_bilingual.json`
  - `output/dmv_quiz_bilingual.csv`
- Open-source friendly sample dataset:
  - `sample_data/dmv_quiz_bilingual.json`
  - `sample_data/dmv_quiz_bilingual.csv`

## Requirements

- Python 3.9+
- Web app dependencies: `fastapi`, `uvicorn`

Install dependencies:

```bash
pip install -r requirements.txt
```

## Dataset Usage

- For open-source usage, this repository ships with `sample_data/` only.
- To use your private full dataset, set `DMV_DATA_PATH` to your local JSON file path.

## Run the Web App

By default, the app reads dataset in this order:

1. `DMV_DATA_PATH` (if provided)
2. `output/dmv_quiz_bilingual.json` (if exists)
3. `sample_data/dmv_quiz_bilingual.json` (fallback for open-source usage)

Run:

```bash
uvicorn app.main:app --reload
```

Optional: force a specific dataset path:

```bash
export DMV_DATA_PATH="sample_data/dmv_quiz_bilingual.json"
uvicorn app.main:app --reload
```

Open in browser:

```text
http://127.0.0.1:8000
```

## Core APIs

- `GET /api/meta`
- `GET /api/tags?lang=zh-hans`
- `GET /api/questions/{id}?lang=zh-hans`
- `POST /api/sessions` (`practice` / `exam`)
- `GET /api/sessions/{id}`
- `POST /api/sessions/{id}/answers`
- `GET /api/sessions/{id}/knowledge-stats?lang=zh-hans`
- `POST /api/sessions/{id}/submit?lang=zh-hans`
- `GET /api/sessions/{id}/result?lang=zh-hans`
- `GET /api/sessions/{id}/wrong-questions?lang=zh-hans`

## Data Notice

- This repository focuses on code and pipeline methodology.
- Dataset generation should be based on publicly accessible materials and processed for educational purposes.
- Users are responsible for complying with source-site terms, copyright rules, and local laws.
- This repo includes self-authored `sample_data` for demo and testing.
- For public open-source distribution, prefer publishing code + sample data only, and manage full datasets separately.

## Open-Source Scope

- Included in repo: application code and `sample_data` only.
- Not included by default: full externally collected dataset.
- If you collect your own dataset, keep it in a private location and load it via `DMV_DATA_PATH`.

## Compliance Reminder

- Keep crawl frequency low and avoid aggressive traffic.
- Review source terms and copyright boundaries before public release.
- Provide clear data-source disclosure and a disclaimer page in production.
