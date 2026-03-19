const state = {
  sessionId: null,
  questionIds: [],
  currentIndex: 0,
  currentQuestion: null,
  lang: "zh-hans",
  mode: "practice",
  summary: null,
  meta: null,
  timerId: null,
  timeRemaining: null,
};

const $ = (id) => document.getElementById(id);

const els = {
  langSelect: $("lang-select"),
  modeSelect: $("mode-select"),
  questionCountInput: $("question-count"),
  timeLimitInput: $("time-limit"),
  shuffleCheckbox: $("shuffle-checkbox"),
  startBtn: $("start-btn"),
  submitBtn: $("submit-btn"),
  showWrongBtn: $("show-wrong-btn"),
  modeLabel: $("mode-label"),
  timer: $("timer"),
  totalCount: $("total-count"),
  answeredCount: $("answered-count"),
  correctCount: $("correct-count"),
  wrongCount: $("wrong-count"),
  accuracy: $("accuracy"),
  progress: $("progress"),
  qPosition: $("q-position"),
  qId: $("q-id"),
  qTags: $("q-tags"),
  qText: $("q-text"),
  qImage: $("q-image"),
  options: $("options"),
  answerResult: $("answer-result"),
  prevBtn: $("prev-btn"),
  nextBtn: $("next-btn"),
  knowledgeList: $("knowledge-list"),
  resultPanel: $("result-panel"),
  resultScore: $("result-score"),
  resultPass: $("result-pass"),
  resultUnanswered: $("result-unanswered"),
  wrongPanel: $("wrong-panel"),
  wrongList: $("wrong-list"),
};

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    const contentType = res.headers.get("content-type") || "";
    try {
      if (contentType.includes("application/json")) {
        const obj = await res.json();
        msg = obj.detail || JSON.stringify(obj);
      } else {
        msg = (await res.text()) || msg;
      }
    } catch {
      msg = `HTTP ${res.status}`;
    }
    throw new Error(msg);
  }
  return res.json();
}

function formatSeconds(value) {
  const total = Math.max(0, Number(value || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function clearTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

async function handleAutoSubmitByTime() {
  if (!state.sessionId || !state.summary || state.summary.submitted) {
    return;
  }
  try {
    await submitExam(true);
    alert("时间到，系统已自动交卷。");
  } catch (err) {
    console.error(err);
  }
}

function startTimer(seconds) {
  clearTimer();
  state.timeRemaining = Math.max(0, Number(seconds || 0));
  els.timer.textContent = formatSeconds(state.timeRemaining);

  state.timerId = setInterval(() => {
    if (state.timeRemaining === null) return;
    state.timeRemaining -= 1;
    if (state.timeRemaining < 0) state.timeRemaining = 0;
    els.timer.textContent = formatSeconds(state.timeRemaining);
    if (state.timeRemaining <= 0) {
      clearTimer();
      handleAutoSubmitByTime();
    }
  }, 1000);
}

function syncModeInputState() {
  const isExam = els.modeSelect.value === "exam";
  els.timeLimitInput.disabled = !isExam;
  if (isExam && !els.questionCountInput.value) {
    els.questionCountInput.value = String(state.meta?.default_exam_question_count || 36);
  }
  if (!isExam && !els.questionCountInput.value) {
    els.questionCountInput.value = String(state.meta?.total_questions || "");
  }
}

function setSummary(summary) {
  state.summary = summary;
  state.mode = summary.mode;

  els.modeLabel.textContent = summary.mode === "exam" ? "模拟考试" : "练习模式";
  els.totalCount.textContent = summary.total_questions;
  els.answeredCount.textContent = summary.answered_count;
  els.correctCount.textContent = summary.correct_count;
  els.wrongCount.textContent = summary.wrong_count;
  els.accuracy.textContent = `${(summary.accuracy * 100).toFixed(1)}%`;
  els.progress.textContent = `${(summary.completion * 100).toFixed(1)}%`;

  if (summary.mode === "exam") {
    if (summary.submitted) {
      clearTimer();
      els.timer.textContent = "已交卷";
    } else if (summary.time_remaining_seconds !== null) {
      startTimer(summary.time_remaining_seconds);
    } else {
      clearTimer();
      els.timer.textContent = "-";
    }
  } else {
    clearTimer();
    els.timer.textContent = "-";
  }

  const canSubmit = summary.mode === "exam" && !summary.submitted;
  els.submitBtn.disabled = !canSubmit;
}

async function refreshSummary() {
  if (!state.sessionId) return;
  const summary = await api(`/api/sessions/${state.sessionId}`);
  setSummary(summary);
}

function renderKnowledgeStats(stats) {
  if (!stats || !stats.length) {
    els.knowledgeList.textContent = "暂无统计数据。";
    return;
  }

  const rows = stats
    .map(
      (x) =>
        `<tr>
          <td>${x.name}</td>
          <td>${x.total}</td>
          <td>${x.answered}</td>
          <td>${x.correct}</td>
          <td>${x.wrong}</td>
          <td>${x.answered ? (x.accuracy * 100).toFixed(1) + "%" : "-"}</td>
        </tr>`
    )
    .join("");

  els.knowledgeList.innerHTML = `
    <table class="knowledge-table">
      <thead>
        <tr>
          <th>知识点</th><th>题量</th><th>已答</th><th>正确</th><th>错误</th><th>正确率</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function refreshKnowledgeStats() {
  if (!state.sessionId) return;
  const data = await api(
    `/api/sessions/${state.sessionId}/knowledge-stats?lang=${encodeURIComponent(state.lang)}`
  );
  renderKnowledgeStats(data.knowledge_stats);
}

function renderResult(result) {
  els.resultPanel.classList.remove("hidden");
  const summary = result.summary;
  els.resultScore.textContent = `得分: ${result.score_percent}% (${summary.correct_count}/${summary.total_questions})`;
  els.resultPass.textContent = `结果: ${result.passed ? "通过" : "未通过"}（及格线 ${result.pass_line_percent}%）`;
  const weak = result.knowledge_stats.filter((x) => x.wrong > 0).slice(0, 3).map((x) => x.name).join("、") || "无";
  els.resultUnanswered.textContent = `未作答: ${result.unanswered_count}，薄弱知识点: ${weak}`;
}

async function loadQuestion() {
  if (!state.sessionId || state.questionIds.length === 0) return;
  const qid = state.questionIds[state.currentIndex];
  const data = await api(`/api/questions/${qid}?lang=${encodeURIComponent(state.lang)}`);
  state.currentQuestion = data;
  renderQuestion();
}

function getAnswerStatus(questionId) {
  if (!state.summary || !state.summary.answers) return null;
  return state.summary.answers[String(questionId)] || null;
}

function renderQuestion() {
  const q = state.currentQuestion;
  if (!q) return;

  els.qPosition.textContent = `题目 ${state.currentIndex + 1}/${state.questionIds.length}`;
  els.qId.textContent = `ID: ${q.question_id}`;
  els.qText.textContent = q.question;
  els.qTags.innerHTML = (q.tags || [])
    .map((tag) => `<span class="tag-chip">${tag.name}</span>`)
    .join("");

  if (q.image_url) {
    els.qImage.src = q.image_url;
    els.qImage.style.display = "block";
  } else {
    els.qImage.style.display = "none";
    els.qImage.removeAttribute("src");
  }

  const answerStatus = getAnswerStatus(q.question_id);
  const selectedNo = answerStatus ? answerStatus.selected_option_no : null;
  const canAnswer = !!(state.summary && state.summary.can_answer);

  els.options.innerHTML = "";
  q.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = `${opt.option_no}. ${opt.text}`;
    btn.dataset.optionNo = String(opt.option_no);
    btn.disabled = !canAnswer;

    if (selectedNo === opt.option_no) {
      btn.classList.add("selected");
    }

    btn.addEventListener("click", async () => {
      await submitAnswer(opt.option_no);
    });

    els.options.appendChild(btn);
  });

  if (!answerStatus) {
    els.answerResult.textContent = "";
    els.answerResult.className = "";
  } else if (answerStatus.is_correct) {
    els.answerResult.textContent = "已作答：正确";
    els.answerResult.className = "ok";
  } else {
    els.answerResult.textContent = "已作答：错误";
    els.answerResult.className = "bad";
  }
}

async function submitAnswer(optionNo) {
  if (!state.sessionId || !state.currentQuestion) return;
  const qid = state.currentQuestion.question_id;

  let resp;
  try {
    resp = await api(`/api/sessions/${state.sessionId}/answers`, {
      method: "POST",
      body: JSON.stringify({
        question_id: qid,
        selected_option_no: optionNo,
      }),
    });
  } catch (err) {
    await refreshSummary();
    renderQuestion();
    alert(`提交答案失败: ${err.message}`);
    return;
  }

  setSummary(resp.summary);
  await refreshKnowledgeStats();

  const buttons = Array.from(document.querySelectorAll(".option-btn"));
  buttons.forEach((btn) => {
    const no = Number(btn.dataset.optionNo);
    btn.classList.remove("selected", "correct", "wrong");
    if (no === optionNo) btn.classList.add("selected");
    if (no === resp.correct_option_no) btn.classList.add("correct");
    if (no === optionNo && !resp.is_correct) btn.classList.add("wrong");
  });

  if (resp.is_correct) {
    els.answerResult.textContent = "回答正确";
    els.answerResult.className = "ok";
  } else {
    const correctText =
      state.currentQuestion.options.find((x) => x.option_no === resp.correct_option_no)?.text || "";
    els.answerResult.textContent = `回答错误，正确答案是 ${resp.correct_option_no}. ${correctText}`;
    els.answerResult.className = "bad";
  }
}

async function startSession() {
  const mode = els.modeSelect.value;
  const questionCount = Number.parseInt(els.questionCountInput.value, 10);
  const timeLimit = Number.parseInt(els.timeLimitInput.value, 10);

  const payload = {
    shuffle: els.shuffleCheckbox.checked,
    mode,
  };
  if (Number.isInteger(questionCount) && questionCount > 0) {
    payload.question_count = questionCount;
  }
  if (mode === "exam" && Number.isInteger(timeLimit) && timeLimit > 0) {
    payload.time_limit_minutes = timeLimit;
  }

  const created = await api("/api/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  state.sessionId = created.session_id;
  state.mode = created.mode;
  state.currentIndex = 0;
  els.resultPanel.classList.add("hidden");
  els.wrongPanel.classList.add("hidden");

  const qids = await api(`/api/sessions/${state.sessionId}/question-ids`);
  state.questionIds = qids.question_ids;

  await refreshSummary();
  await loadQuestion();
  await refreshKnowledgeStats();
}

async function submitExam(isAuto = false) {
  if (!state.sessionId) {
    if (!isAuto) alert("请先开始练习/考试。");
    return;
  }
  const result = await api(
    `/api/sessions/${state.sessionId}/submit?lang=${encodeURIComponent(state.lang)}`,
    { method: "POST" }
  );
  setSummary(result.summary);
  renderResult(result);
  await refreshKnowledgeStats();
  renderQuestion();
}

async function showWrongQuestions() {
  if (!state.sessionId) {
    alert("请先开始练习。");
    return;
  }
  const data = await api(
    `/api/sessions/${state.sessionId}/wrong-questions?lang=${encodeURIComponent(state.lang)}`
  );
  const list = data.wrong_questions;

  els.wrongList.innerHTML = "";
  if (!list.length) {
    els.wrongList.textContent = "目前没有错题。";
  } else {
    for (const item of list) {
      const div = document.createElement("div");
      div.className = "wrong-item";
      const correct = item.options.find((x) => x.option_no === item.correct_option_no)?.text || "";
      const selected =
        item.options.find((x) => x.option_no === item.selected_option_no)?.text || "";
      const tags = (item.tags || []).map((t) => t.name).join(" / ");
      div.innerHTML = `
        <h4>题 ${item.question_id}: ${item.question}</h4>
        <p>知识点：${tags || "-"}</p>
        <p>你的选择：${item.selected_option_no}. ${selected}</p>
        <p>正确答案：${item.correct_option_no}. ${correct}</p>
      `;
      els.wrongList.appendChild(div);
    }
  }
  els.wrongPanel.classList.remove("hidden");
}

function bindEvents() {
  els.modeSelect.addEventListener("change", () => {
    syncModeInputState();
  });

  els.langSelect.addEventListener("change", async (e) => {
    state.lang = e.target.value;
    if (state.sessionId && state.questionIds.length > 0) {
      await loadQuestion();
      await refreshKnowledgeStats();
      if (state.summary && state.summary.submitted) {
        try {
          const result = await api(
            `/api/sessions/${state.sessionId}/result?lang=${encodeURIComponent(state.lang)}`
          );
          renderResult(result);
        } catch {
          // practice mode without submit result is acceptable
        }
      }
    }
  });

  els.startBtn.addEventListener("click", async () => {
    try {
      await startSession();
    } catch (err) {
      alert(`启动失败: ${err.message}`);
    }
  });

  els.submitBtn.addEventListener("click", async () => {
    try {
      await submitExam(false);
    } catch (err) {
      alert(`交卷失败: ${err.message}`);
    }
  });

  els.showWrongBtn.addEventListener("click", async () => {
    try {
      await showWrongQuestions();
    } catch (err) {
      alert(`读取错题失败: ${err.message}`);
    }
  });

  els.prevBtn.addEventListener("click", async () => {
    if (!state.sessionId || state.questionIds.length === 0) return;
    state.currentIndex = Math.max(0, state.currentIndex - 1);
    await loadQuestion();
  });

  els.nextBtn.addEventListener("click", async () => {
    if (!state.sessionId || state.questionIds.length === 0) return;
    state.currentIndex = Math.min(state.questionIds.length - 1, state.currentIndex + 1);
    await loadQuestion();
  });
}

async function bootstrap() {
  const meta = await api("/api/meta");
  state.meta = meta;

  els.totalCount.textContent = meta.total_questions;
  els.questionCountInput.value = String(meta.total_questions);
  els.timeLimitInput.value = String(meta.default_exam_time_limit_minutes || 45);
  els.modeLabel.textContent = "-";
  els.timer.textContent = "-";
  els.submitBtn.disabled = true;

  syncModeInputState();
  bindEvents();
}

bootstrap().catch((err) => {
  alert(`初始化失败: ${err.message}`);
});
