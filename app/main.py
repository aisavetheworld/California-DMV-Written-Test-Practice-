from __future__ import annotations

import json
import os
import random
import sqlite3
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DATA_PATH = PROJECT_ROOT / "output" / "dmv_quiz_bilingual.json"
SAMPLE_DATA_PATH = PROJECT_ROOT / "sample_data" / "dmv_quiz_bilingual.json"
STATIC_DIR = PROJECT_ROOT / "static"

SUPPORTED_LANGS = {"zh-hant", "zh-hans", "en"}
SUPPORTED_MODES = {"practice", "exam"}
DEFAULT_EXAM_QUESTION_COUNT = 36
DEFAULT_EXAM_TIME_LIMIT_MINUTES = 45
EXAM_PASS_LINE = 0.83

TAG_LABELS: dict[str, dict[str, str]] = {
    "right_of_way": {
        "zh-hans": "路权与让行",
        "zh-hant": "路權與讓行",
        "en": "Right of Way",
    },
    "signs": {"zh-hans": "交通标志", "zh-hant": "交通標誌", "en": "Road Signs"},
    "dui": {"zh-hans": "酒驾法规", "zh-hant": "酒駕法規", "en": "DUI Rules"},
    "parking": {"zh-hans": "停车规则", "zh-hant": "停車規則", "en": "Parking Rules"},
    "lane_turn": {"zh-hans": "车道与转向", "zh-hant": "車道與轉向", "en": "Lanes & Turns"},
    "speed_distance": {
        "zh-hans": "车速与车距",
        "zh-hant": "車速與車距",
        "en": "Speed & Distance",
    },
    "intersection_lights": {
        "zh-hans": "路口与信号灯",
        "zh-hant": "路口與信號燈",
        "en": "Intersections & Lights",
    },
    "pedestrian": {"zh-hans": "行人安全", "zh-hant": "行人安全", "en": "Pedestrians"},
    "safety": {"zh-hans": "安全驾驶", "zh-hant": "安全駕駛", "en": "Safe Driving"},
    "other": {"zh-hans": "其他", "zh-hant": "其他", "en": "Other"},
}

TAG_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("dui", ("酒", "醉", "酒精", "implied consent", "bac")),
    ("signs", ("標誌", "标志", "路牌", "sign")),
    ("right_of_way", ("讓", "让", "優先", "优先", "路權", "路权")),
    ("parking", ("停車", "停车", "路邊", "路边", "curb", "parallel park")),
    ("lane_turn", ("轉彎", "转弯", "車道", "车道", "左轉", "右轉", "merge")),
    ("speed_distance", ("限速", "車速", "车速", "跟車", "跟车", "距離", "距离")),
    ("intersection_lights", ("路口", "信號燈", "信号灯", "红灯", "綠燈", "绿灯")),
    ("pedestrian", ("行人", "自行車", "自行车", "crosswalk", "pedestrian")),
    ("safety", ("安全帶", "安全带", "頭盔", "头盔", "盲點", "盲点", "防禦性", "防御性")),
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def resolve_data_path() -> Path:
    env_value = os.environ.get("DMV_DATA_PATH", "").strip()
    if env_value:
        candidate = Path(env_value)
        if not candidate.is_absolute():
            candidate = PROJECT_ROOT / candidate
        return candidate
    if DEFAULT_DATA_PATH.exists():
        return DEFAULT_DATA_PATH
    return SAMPLE_DATA_PATH


DATA_PATH = resolve_data_path()


def resolve_db_path() -> Path:
    env_value = os.environ.get("DMV_DB_PATH", "").strip()
    if env_value:
        candidate = Path(env_value)
        if not candidate.is_absolute():
            candidate = PROJECT_ROOT / candidate
        return candidate
    if os.environ.get("VERCEL"):
        return Path("/tmp/app.db")
    return PROJECT_ROOT / "app.db"


DB_PATH = resolve_db_path()


def load_questions() -> dict[int, dict[str, Any]]:
    if not DATA_PATH.exists():
        raise RuntimeError(f"Dataset not found: {DATA_PATH}")
    raw = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    out: dict[int, dict[str, Any]] = {}
    for row in raw:
        page_num = int(row["page_num"])
        out[page_num] = row
    return out


def _classify_tags(row: dict[str, Any]) -> list[str]:
    text = (
        f"{row.get('question_zh_hant', '')} "
        f"{' '.join(row.get('options_zh_hant', []))} "
        f"{row.get('question_en', '')}"
    ).lower()
    tags: list[str] = []
    for tag, keywords in TAG_RULES:
        if any(keyword.lower() in text for keyword in keywords):
            tags.append(tag)
    return tags if tags else ["other"]


def _tag_label(tag: str, lang: str) -> str:
    labels = TAG_LABELS.get(tag, TAG_LABELS["other"])
    return labels.get(lang, labels["en"])


QUESTIONS = load_questions()
QUESTION_IDS = sorted(QUESTIONS.keys())
QUESTION_TAGS: dict[int, list[str]] = {qid: _classify_tags(QUESTIONS[qid]) for qid in QUESTION_IDS}
DATASET_TAG_COUNTS: dict[str, int] = {tag: 0 for tag in TAG_LABELS}
for qid in QUESTION_IDS:
    for tag in QUESTION_TAGS.get(qid, ["other"]):
        DATASET_TAG_COUNTS[tag] = DATASET_TAG_COUNTS.get(tag, 0) + 1

app = FastAPI(title="DMV Quiz API", version="1.1.0")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _ensure_session_columns(conn: sqlite3.Connection) -> None:
    columns = {row["name"] for row in conn.execute("PRAGMA table_info(sessions)").fetchall()}
    wanted = {
        "mode": "TEXT NOT NULL DEFAULT 'practice'",
        "time_limit_seconds": "INTEGER",
        "started_at": "TEXT",
        "submitted_at": "TEXT",
    }
    for col, ddl in wanted.items():
        if col not in columns:
            conn.execute(f"ALTER TABLE sessions ADD COLUMN {col} {ddl}")


def init_db() -> None:
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                total_questions INTEGER NOT NULL,
                mode TEXT NOT NULL DEFAULT 'practice',
                time_limit_seconds INTEGER,
                started_at TEXT,
                submitted_at TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS session_questions (
                session_id TEXT NOT NULL,
                position INTEGER NOT NULL,
                question_id INTEGER NOT NULL,
                PRIMARY KEY (session_id, position)
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS answers (
                session_id TEXT NOT NULL,
                question_id INTEGER NOT NULL,
                selected_option_no INTEGER NOT NULL,
                is_correct INTEGER NOT NULL,
                answered_at TEXT NOT NULL,
                PRIMARY KEY (session_id, question_id)
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_answers_session ON answers(session_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sq_session ON session_questions(session_id)")
        _ensure_session_columns(conn)
        conn.execute("UPDATE sessions SET mode='practice' WHERE mode IS NULL OR mode = ''")
        conn.execute("UPDATE sessions SET started_at=created_at WHERE started_at IS NULL")
        conn.commit()


@app.on_event("startup")
def on_startup() -> None:
    init_db()


class CreateSessionRequest(BaseModel):
    shuffle: bool = False
    mode: str = "practice"
    question_count: int | None = Field(default=None, ge=1)
    time_limit_minutes: int | None = Field(default=None, ge=1, le=300)


class SubmitAnswerRequest(BaseModel):
    question_id: int = Field(..., ge=1)
    selected_option_no: int = Field(..., ge=1, le=8)


def _text_by_lang(row: dict[str, Any], lang: str) -> tuple[str, list[str]]:
    if lang == "zh-hant":
        return row["question_zh_hant"], row["options_zh_hant"]
    if lang == "zh-hans":
        return row["question_zh_hans"], row["options_zh_hans"]
    return row["question_en"], row["options_en"]


def _question_payload(row: dict[str, Any], lang: str) -> dict[str, Any]:
    question_text, options = _text_by_lang(row, lang)
    qid = int(row["page_num"])
    tags = QUESTION_TAGS.get(qid, ["other"])
    return {
        "question_id": qid,
        "total_pages": row["total_pages"],
        "page_url": row["page_url"],
        "image_url": row["image_url"],
        "lang": lang,
        "tags": [{"id": tag, "name": _tag_label(tag, lang)} for tag in tags],
        "question": question_text,
        "options": [{"option_no": idx, "text": text} for idx, text in enumerate(options, start=1)],
    }


def _session_row(conn: sqlite3.Connection, session_id: str) -> sqlite3.Row:
    row = conn.execute(
        """
        SELECT id, total_questions, created_at, mode, time_limit_seconds, started_at, submitted_at
        FROM sessions
        WHERE id = ?
        """,
        (session_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return row


def _session_question_ids(conn: sqlite3.Connection, session_id: str) -> list[int]:
    rows = conn.execute(
        """
        SELECT question_id
        FROM session_questions
        WHERE session_id = ?
        ORDER BY position ASC
        """,
        (session_id,),
    ).fetchall()
    return [int(r["question_id"]) for r in rows]


def _parse_iso(ts: str) -> datetime:
    dt = datetime.fromisoformat(ts)
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _exam_seconds_left(row: sqlite3.Row, clamp: bool = False) -> int | None:
    if str(row["mode"]) != "exam":
        return None
    if row["time_limit_seconds"] is None or row["started_at"] is None:
        return None
    end_at = _parse_iso(str(row["started_at"])) + timedelta(seconds=int(row["time_limit_seconds"]))
    seconds_left = int((end_at - datetime.now(timezone.utc)).total_seconds())
    return max(seconds_left, 0) if clamp else seconds_left


def _auto_submit_if_needed(conn: sqlite3.Connection, row: sqlite3.Row) -> sqlite3.Row:
    if str(row["mode"]) != "exam":
        return row
    if row["submitted_at"] is not None:
        return row
    seconds_left = _exam_seconds_left(row, clamp=False)
    if seconds_left is not None and seconds_left <= 0:
        conn.execute("UPDATE sessions SET submitted_at = ? WHERE id = ?", (utc_now(), str(row["id"])))
        conn.commit()
        return _session_row(conn, str(row["id"]))
    return row


def _knowledge_stats(conn: sqlite3.Connection, session_id: str, lang: str) -> list[dict[str, Any]]:
    qids = _session_question_ids(conn, session_id)
    answer_rows = conn.execute(
        """
        SELECT question_id, is_correct
        FROM answers
        WHERE session_id = ?
        """,
        (session_id,),
    ).fetchall()
    answer_map = {int(r["question_id"]): int(r["is_correct"]) for r in answer_rows}

    stats: dict[str, dict[str, Any]] = {}
    for qid in qids:
        tags = QUESTION_TAGS.get(qid, ["other"])
        answered = qid in answer_map
        is_correct = answer_map.get(qid) == 1
        for tag in tags:
            item = stats.setdefault(
                tag,
                {
                    "id": tag,
                    "name": _tag_label(tag, lang),
                    "total": 0,
                    "answered": 0,
                    "correct": 0,
                    "wrong": 0,
                    "accuracy": 0.0,
                },
            )
            item["total"] += 1
            if answered:
                item["answered"] += 1
                if is_correct:
                    item["correct"] += 1
                else:
                    item["wrong"] += 1

    out = list(stats.values())
    for item in out:
        answered = int(item["answered"])
        item["accuracy"] = round((item["correct"] / answered) if answered else 0.0, 4)
    out.sort(key=lambda x: (-int(x["wrong"]), -int(x["total"]), str(x["id"])))
    return out


def _session_summary(conn: sqlite3.Connection, session_id: str) -> dict[str, Any]:
    session = _session_row(conn, session_id)
    session = _auto_submit_if_needed(conn, session)

    rows = conn.execute(
        """
        SELECT question_id, selected_option_no, is_correct
        FROM answers
        WHERE session_id = ?
        ORDER BY question_id ASC
        """,
        (session_id,),
    ).fetchall()

    answered_count = len(rows)
    correct_count = sum(int(r["is_correct"]) for r in rows)
    wrong_count = answered_count - correct_count
    total = int(session["total_questions"])
    accuracy = (correct_count / answered_count) if answered_count else 0.0
    completion = (answered_count / total) if total else 0.0
    score = (correct_count / total) if total else 0.0

    answers: dict[str, dict[str, Any]] = {}
    for r in rows:
        answers[str(r["question_id"])] = {
            "selected_option_no": int(r["selected_option_no"]),
            "is_correct": bool(r["is_correct"]),
        }

    mode = str(session["mode"])
    submitted = session["submitted_at"] is not None
    time_remaining = _exam_seconds_left(session, clamp=True) if mode == "exam" else None
    can_answer = not submitted
    if mode == "exam" and time_remaining is not None and time_remaining <= 0:
        can_answer = False

    return {
        "session_id": str(session["id"]),
        "created_at": str(session["created_at"]),
        "mode": mode,
        "submitted": submitted,
        "submitted_at": str(session["submitted_at"]) if session["submitted_at"] else None,
        "time_limit_seconds": int(session["time_limit_seconds"]) if session["time_limit_seconds"] else None,
        "time_remaining_seconds": time_remaining,
        "can_answer": can_answer,
        "total_questions": total,
        "answered_count": answered_count,
        "correct_count": correct_count,
        "wrong_count": wrong_count,
        "accuracy": round(accuracy, 4),
        "completion": round(completion, 4),
        "score": round(score, 4),
        "answers": answers,
    }


def _session_result(conn: sqlite3.Connection, session_id: str, lang: str) -> dict[str, Any]:
    summary = _session_summary(conn, session_id)
    total = int(summary["total_questions"])
    correct = int(summary["correct_count"])
    answered = int(summary["answered_count"])
    unanswered = total - answered
    score_ratio = (correct / total) if total else 0.0

    return {
        "session_id": session_id,
        "mode": summary["mode"],
        "submitted": bool(summary["submitted"]),
        "submitted_at": summary["submitted_at"],
        "score_percent": round(score_ratio * 100, 2),
        "pass_line_percent": round(EXAM_PASS_LINE * 100, 2),
        "passed": score_ratio >= EXAM_PASS_LINE,
        "unanswered_count": unanswered,
        "summary": summary,
        "knowledge_stats": _knowledge_stats(conn, session_id, lang),
    }


@app.get("/")
def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/meta")
def meta() -> dict[str, Any]:
    return {
        "total_questions": len(QUESTION_IDS),
        "min_question_id": min(QUESTION_IDS),
        "max_question_id": max(QUESTION_IDS),
        "supported_languages": sorted(SUPPORTED_LANGS),
        "supported_modes": sorted(SUPPORTED_MODES),
        "default_exam_question_count": DEFAULT_EXAM_QUESTION_COUNT,
        "default_exam_time_limit_minutes": DEFAULT_EXAM_TIME_LIMIT_MINUTES,
    }


@app.get("/api/questions/ids")
def question_ids() -> dict[str, Any]:
    return {"question_ids": QUESTION_IDS}


@app.get("/api/tags")
def tags(lang: str = Query("zh-hans", description="zh-hant | zh-hans | en")) -> dict[str, Any]:
    if lang not in SUPPORTED_LANGS:
        raise HTTPException(status_code=400, detail=f"Unsupported lang: {lang}")
    items = []
    for tag in TAG_LABELS:
        items.append(
            {
                "id": tag,
                "name": _tag_label(tag, lang),
                "dataset_count": int(DATASET_TAG_COUNTS.get(tag, 0)),
            }
        )
    items.sort(key=lambda x: (-x["dataset_count"], x["id"]))
    return {"lang": lang, "tags": items}


@app.get("/api/questions/{question_id}")
def question_detail(
    question_id: int,
    lang: str = Query("zh-hans", description="zh-hant | zh-hans | en"),
) -> dict[str, Any]:
    if lang not in SUPPORTED_LANGS:
        raise HTTPException(status_code=400, detail=f"Unsupported lang: {lang}")
    row = QUESTIONS.get(question_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return _question_payload(row, lang)


@app.post("/api/sessions")
def create_session(payload: CreateSessionRequest) -> dict[str, Any]:
    mode = payload.mode.strip().lower()
    if mode not in SUPPORTED_MODES:
        raise HTTPException(status_code=400, detail=f"Unsupported mode: {payload.mode}")

    ids = QUESTION_IDS.copy()
    if payload.shuffle:
        random.shuffle(ids)

    if mode == "exam":
        q_count = payload.question_count or min(DEFAULT_EXAM_QUESTION_COUNT, len(ids))
        time_limit_minutes = payload.time_limit_minutes or DEFAULT_EXAM_TIME_LIMIT_MINUTES
    else:
        q_count = payload.question_count or len(ids)
        time_limit_minutes = payload.time_limit_minutes

    q_count = max(1, min(int(q_count), len(ids)))
    ids = ids[:q_count]
    time_limit_seconds = (
        int(time_limit_minutes) * 60 if (mode == "exam" and time_limit_minutes is not None) else None
    )

    session_id = uuid.uuid4().hex
    now = utc_now()

    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO sessions (
                id, created_at, total_questions, mode, time_limit_seconds, started_at, submitted_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (session_id, now, len(ids), mode, time_limit_seconds, now, None),
        )
        conn.executemany(
            """
            INSERT INTO session_questions (session_id, position, question_id)
            VALUES (?, ?, ?)
            """,
            [(session_id, idx, qid) for idx, qid in enumerate(ids)],
        )
        conn.commit()

    return {
        "session_id": session_id,
        "created_at": now,
        "mode": mode,
        "time_limit_minutes": time_limit_minutes if mode == "exam" else None,
        "total_questions": len(ids),
    }


@app.get("/api/sessions/{session_id}/question-ids")
def session_question_ids(session_id: str) -> dict[str, Any]:
    with get_conn() as conn:
        _session_row(conn, session_id)
        qids = _session_question_ids(conn, session_id)
    return {"session_id": session_id, "question_ids": qids}


@app.get("/api/sessions/{session_id}")
def session_summary(session_id: str) -> dict[str, Any]:
    with get_conn() as conn:
        return _session_summary(conn, session_id)


@app.get("/api/sessions/{session_id}/knowledge-stats")
def session_knowledge_stats(
    session_id: str,
    lang: str = Query("zh-hans", description="zh-hant | zh-hans | en"),
) -> dict[str, Any]:
    if lang not in SUPPORTED_LANGS:
        raise HTTPException(status_code=400, detail=f"Unsupported lang: {lang}")
    with get_conn() as conn:
        _session_row(conn, session_id)
        stats = _knowledge_stats(conn, session_id, lang)
    return {"session_id": session_id, "lang": lang, "knowledge_stats": stats}


@app.post("/api/sessions/{session_id}/submit")
def submit_session(
    session_id: str,
    lang: str = Query("zh-hans", description="zh-hant | zh-hans | en"),
) -> dict[str, Any]:
    if lang not in SUPPORTED_LANGS:
        raise HTTPException(status_code=400, detail=f"Unsupported lang: {lang}")
    with get_conn() as conn:
        session = _session_row(conn, session_id)
        session = _auto_submit_if_needed(conn, session)
        if session["submitted_at"] is None:
            conn.execute("UPDATE sessions SET submitted_at = ? WHERE id = ?", (utc_now(), session_id))
            conn.commit()
        return _session_result(conn, session_id, lang)


@app.get("/api/sessions/{session_id}/result")
def session_result(
    session_id: str,
    lang: str = Query("zh-hans", description="zh-hant | zh-hans | en"),
) -> dict[str, Any]:
    if lang not in SUPPORTED_LANGS:
        raise HTTPException(status_code=400, detail=f"Unsupported lang: {lang}")
    with get_conn() as conn:
        session = _session_row(conn, session_id)
        session = _auto_submit_if_needed(conn, session)
        if session["mode"] == "exam" and session["submitted_at"] is None:
            raise HTTPException(status_code=400, detail="Exam not submitted yet")
        return _session_result(conn, session_id, lang)


@app.post("/api/sessions/{session_id}/answers")
def submit_answer(session_id: str, payload: SubmitAnswerRequest) -> dict[str, Any]:
    row = QUESTIONS.get(payload.question_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Question not found")

    with get_conn() as conn:
        session = _session_row(conn, session_id)
        session = _auto_submit_if_needed(conn, session)
        if session["submitted_at"] is not None:
            raise HTTPException(status_code=400, detail="Session already submitted")

        in_session = conn.execute(
            """
            SELECT 1
            FROM session_questions
            WHERE session_id = ? AND question_id = ?
            """,
            (session_id, payload.question_id),
        ).fetchone()
        if in_session is None:
            raise HTTPException(status_code=400, detail="Question not in this session")

        option_count = len(row["options_zh_hant"])
        if payload.selected_option_no > option_count:
            raise HTTPException(status_code=400, detail="Invalid option number")

        correct_option_no = int(row["correct_option_no"])
        is_correct = 1 if payload.selected_option_no == correct_option_no else 0

        conn.execute(
            """
            INSERT INTO answers (session_id, question_id, selected_option_no, is_correct, answered_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(session_id, question_id) DO UPDATE SET
                selected_option_no=excluded.selected_option_no,
                is_correct=excluded.is_correct,
                answered_at=excluded.answered_at
            """,
            (session_id, payload.question_id, payload.selected_option_no, is_correct, utc_now()),
        )
        conn.commit()
        summary = _session_summary(conn, session_id)

    return {
        "session_id": session_id,
        "question_id": payload.question_id,
        "selected_option_no": payload.selected_option_no,
        "correct_option_no": correct_option_no,
        "is_correct": bool(is_correct),
        "summary": summary,
    }


@app.get("/api/sessions/{session_id}/wrong-questions")
def wrong_questions(
    session_id: str,
    lang: str = Query("zh-hans", description="zh-hant | zh-hans | en"),
) -> dict[str, Any]:
    if lang not in SUPPORTED_LANGS:
        raise HTTPException(status_code=400, detail=f"Unsupported lang: {lang}")

    with get_conn() as conn:
        _session_row(conn, session_id)
        rows = conn.execute(
            """
            SELECT question_id, selected_option_no
            FROM answers
            WHERE session_id = ? AND is_correct = 0
            ORDER BY question_id ASC
            """,
            (session_id,),
        ).fetchall()

    result: list[dict[str, Any]] = []
    for r in rows:
        qid = int(r["question_id"])
        row = QUESTIONS[qid]
        item = _question_payload(row, lang)
        item["selected_option_no"] = int(r["selected_option_no"])
        item["correct_option_no"] = int(row["correct_option_no"])
        result.append(item)

    return {"session_id": session_id, "lang": lang, "wrong_questions": result}
