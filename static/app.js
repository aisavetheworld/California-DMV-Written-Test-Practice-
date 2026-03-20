const state = {
  sessionId: null,
  questionIds: [],
  currentIndex: 0,
  currentQuestion: null,
  lang: "zh-hans",
  uiLang: "zh-hans",
  mode: "practice",
  summary: null,
  meta: null,
  timerId: null,
  timeRemaining: null,
  knowledgeStats: null,
  result: null,
  wrongQuestions: null,
};

const UI_TEXT = {
  "zh-hans": {
    pageTitle: "美国加州驾考笔试题库模拟题（2026最新）",
    siteTitle: "美国加州驾考笔试题库模拟题（2026最新）",
    siteSubtitle: "题库来源自作业搜集至网络 亲测大量与真题重复 刷完即可考试。",
    githubRepo: "GitHub 开源仓库",
    uiLangLabel: "Language",
    questionLangLabel: "题目语言",
    langHans: "简体中文",
    langHant: "繁體中文",
    langEn: "English",
    modeLabel: "模式",
    modePractice: "练习模式",
    modeExam: "模拟考试",
    questionCount: "题量",
    timeLimit: "限时(分钟)",
    shuffle: "随机顺序",
    start: "开始",
    submit: "交卷",
    showWrong: "查看错题",
    scoreMode: "模式",
    scoreTimer: "剩余时间",
    scoreTotal: "总题数",
    scoreAnswered: "已答",
    scoreCorrect: "正确",
    scoreWrong: "错误",
    scoreAccuracy: "正确率",
    scoreProgress: "进度",
    modePracticeLabel: "练习模式",
    modeExamLabel: "模拟考试",
    timerSubmitted: "已交卷",
    questionPosition: "题目 {current}/{total}",
    wrongQuestionTitle: "题 {id}",
    clickStart: "请点击“开始”",
    prev: "上一题",
    next: "下一题",
    knowledgeTitle: "知识点统计",
    knowledgeStart: "请先开始练习。",
    knowledgeNoData: "暂无统计数据。",
    kColName: "知识点",
    kColTotal: "题量",
    kColAnswered: "已答",
    kColCorrect: "正确",
    kColWrong: "错误",
    kColAccuracy: "正确率",
    resultTitle: "考试结果",
    resultScore: "得分",
    resultPass: "结果",
    resultUnanswered: "未作答",
    passed: "通过",
    failed: "未通过",
    passLine: "及格线",
    weakPoints: "薄弱知识点",
    weakNone: "无",
    wrongTitle: "错题回顾",
    wrongNone: "目前没有错题。",
    knowledgePointLabel: "知识点",
    yourChoiceLabel: "你的选择",
    correctAnswerLabel: "正确答案",
    noteText: "说明：本项目仅用于个人学习。题库来源于公开网页收集，你需要自行确认数据使用范围与合规要求。",
    linksTitle: "加州驾考常用链接",
    linkHandbookZh: "加州驾驶员手册（中文 PDF）",
    linkHandbookEn: "California Driver Handbook（英文）",
    linkDlEntry: "加州驾照申请总入口（DMV 官方）",
    linkChecklist: "考试所需材料清单（REAL ID Checklist）",
    linkAppointment: "DMV 预约入口",
    linkI94: "I-94 打印入口（CBP）",
    autoSubmitAlert: "时间到，系统已自动交卷。",
    submitAnswerFail: "提交答案失败",
    startFail: "启动失败",
    submitFail: "交卷失败",
    wrongLoadFail: "读取错题失败",
    initFail: "初始化失败",
    startFirstExam: "请先开始练习/考试。",
    startFirstPractice: "请先开始练习。",
    answeredCorrect: "已作答：正确",
    answeredWrong: "已作答：错误",
    answerCorrect: "回答正确",
    answerWrongWithCorrect: "回答错误，正确答案是 {no}. {text}",
    imageAlt: "题目配图",
  },
  "zh-hant": {
    pageTitle: "美國加州駕考筆試題庫模擬題（2026最新）",
    siteTitle: "美國加州駕考筆試題庫模擬題（2026最新）",
    siteSubtitle: "題庫來源自作業蒐集至網路 親測大量與真題重複 刷完即可考試。",
    githubRepo: "GitHub 開源倉庫",
    uiLangLabel: "Language",
    questionLangLabel: "題目語言",
    langHans: "簡體中文",
    langHant: "繁體中文",
    langEn: "English",
    modeLabel: "模式",
    modePractice: "練習模式",
    modeExam: "模擬考試",
    questionCount: "題量",
    timeLimit: "限時(分鐘)",
    shuffle: "隨機順序",
    start: "開始",
    submit: "交卷",
    showWrong: "查看錯題",
    scoreMode: "模式",
    scoreTimer: "剩餘時間",
    scoreTotal: "總題數",
    scoreAnswered: "已答",
    scoreCorrect: "正確",
    scoreWrong: "錯誤",
    scoreAccuracy: "正確率",
    scoreProgress: "進度",
    modePracticeLabel: "練習模式",
    modeExamLabel: "模擬考試",
    timerSubmitted: "已交卷",
    questionPosition: "題目 {current}/{total}",
    wrongQuestionTitle: "題 {id}",
    clickStart: "請點擊「開始」",
    prev: "上一題",
    next: "下一題",
    knowledgeTitle: "知識點統計",
    knowledgeStart: "請先開始練習。",
    knowledgeNoData: "暫無統計資料。",
    kColName: "知識點",
    kColTotal: "題量",
    kColAnswered: "已答",
    kColCorrect: "正確",
    kColWrong: "錯誤",
    kColAccuracy: "正確率",
    resultTitle: "考試結果",
    resultScore: "得分",
    resultPass: "結果",
    resultUnanswered: "未作答",
    passed: "通過",
    failed: "未通過",
    passLine: "及格線",
    weakPoints: "薄弱知識點",
    weakNone: "無",
    wrongTitle: "錯題回顧",
    wrongNone: "目前沒有錯題。",
    knowledgePointLabel: "知識點",
    yourChoiceLabel: "你的選擇",
    correctAnswerLabel: "正確答案",
    noteText: "說明：本專案僅用於個人學習。題庫來源於公開網頁蒐集，你需要自行確認資料使用範圍與合規要求。",
    linksTitle: "加州駕考常用連結",
    linkHandbookZh: "加州駕駛員手冊（中文 PDF）",
    linkHandbookEn: "California Driver Handbook（英文）",
    linkDlEntry: "加州駕照申請總入口（DMV 官方）",
    linkChecklist: "考試所需材料清單（REAL ID Checklist）",
    linkAppointment: "DMV 預約入口",
    linkI94: "I-94 列印入口（CBP）",
    autoSubmitAlert: "時間到，系統已自動交卷。",
    submitAnswerFail: "提交答案失敗",
    startFail: "啟動失敗",
    submitFail: "交卷失敗",
    wrongLoadFail: "讀取錯題失敗",
    initFail: "初始化失敗",
    startFirstExam: "請先開始練習/考試。",
    startFirstPractice: "請先開始練習。",
    answeredCorrect: "已作答：正確",
    answeredWrong: "已作答：錯誤",
    answerCorrect: "回答正確",
    answerWrongWithCorrect: "回答錯誤，正確答案是 {no}. {text}",
    imageAlt: "題目配圖",
  },
  en: {
    pageTitle: "California DMV Written Test Practice (2026)",
    siteTitle: "California DMV Written Test Practice (2026)",
    siteSubtitle: "Dataset collected from public resources for study use only; many questions overlap with real tests.",
    githubRepo: "GitHub Repository",
    uiLangLabel: "Language",
    questionLangLabel: "Question Language",
    langHans: "Simplified Chinese",
    langHant: "Traditional Chinese",
    langEn: "English",
    modeLabel: "Mode",
    modePractice: "Practice",
    modeExam: "Mock Exam",
    questionCount: "Question Count",
    timeLimit: "Time Limit (min)",
    shuffle: "Shuffle",
    start: "Start",
    submit: "Submit",
    showWrong: "Wrong Questions",
    scoreMode: "Mode",
    scoreTimer: "Time Left",
    scoreTotal: "Total",
    scoreAnswered: "Answered",
    scoreCorrect: "Correct",
    scoreWrong: "Wrong",
    scoreAccuracy: "Accuracy",
    scoreProgress: "Progress",
    modePracticeLabel: "Practice",
    modeExamLabel: "Mock Exam",
    timerSubmitted: "Submitted",
    questionPosition: "Question {current}/{total}",
    wrongQuestionTitle: "Question {id}",
    clickStart: "Click Start to begin",
    prev: "Previous",
    next: "Next",
    knowledgeTitle: "Knowledge Statistics",
    knowledgeStart: "Start a session to view stats.",
    knowledgeNoData: "No stats available yet.",
    kColName: "Topic",
    kColTotal: "Total",
    kColAnswered: "Answered",
    kColCorrect: "Correct",
    kColWrong: "Wrong",
    kColAccuracy: "Accuracy",
    resultTitle: "Exam Result",
    resultScore: "Score",
    resultPass: "Result",
    resultUnanswered: "Unanswered",
    passed: "Pass",
    failed: "Fail",
    passLine: "Pass line",
    weakPoints: "Weak topics",
    weakNone: "None",
    wrongTitle: "Wrong Question Review",
    wrongNone: "No wrong questions right now.",
    knowledgePointLabel: "Topic",
    yourChoiceLabel: "Your choice",
    correctAnswerLabel: "Correct answer",
    noteText: "Note: This project is for personal learning only. Data is collected from public webpages; you are responsible for compliance.",
    linksTitle: "Useful California DMV Links",
    linkHandbookZh: "California Driver Handbook (Chinese PDF)",
    linkHandbookEn: "California Driver Handbook (English)",
    linkDlEntry: "California Driver License Portal (Official DMV)",
    linkChecklist: "Required Materials (REAL ID Checklist)",
    linkAppointment: "DMV Appointment",
    linkI94: "I-94 Print Portal (CBP)",
    autoSubmitAlert: "Time is up. The exam was auto-submitted.",
    submitAnswerFail: "Failed to submit answer",
    startFail: "Failed to start session",
    submitFail: "Failed to submit exam",
    wrongLoadFail: "Failed to load wrong questions",
    initFail: "Failed to initialize",
    startFirstExam: "Start a practice/exam session first.",
    startFirstPractice: "Start a session first.",
    answeredCorrect: "Answered: Correct",
    answeredWrong: "Answered: Wrong",
    answerCorrect: "Correct",
    answerWrongWithCorrect: "Incorrect, correct answer is {no}. {text}",
    imageAlt: "Question illustration",
  },
};

const $ = (id) => document.getElementById(id);

const els = {
  siteTitle: $("site-title"),
  siteSubtitle: $("site-subtitle"),
  githubLink: $("github-link"),
  uiLangLabel: $("ui-lang-label"),
  uiLangSelect: $("ui-lang-select"),
  questionLangLabel: $("question-lang-label"),
  langSelect: $("lang-select"),
  modeSelectLabel: $("mode-select-label"),
  modeSelect: $("mode-select"),
  questionCountLabel: $("question-count-label"),
  questionCountInput: $("question-count"),
  timeLimitLabel: $("time-limit-label"),
  timeLimitInput: $("time-limit"),
  shuffleLabel: $("shuffle-label"),
  shuffleCheckbox: $("shuffle-checkbox"),
  startBtn: $("start-btn"),
  submitBtn: $("submit-btn"),
  showWrongBtn: $("show-wrong-btn"),
  scoreModeLabel: $("score-mode-label"),
  scoreTimerLabel: $("score-timer-label"),
  scoreTotalLabel: $("score-total-label"),
  scoreAnsweredLabel: $("score-answered-label"),
  scoreCorrectLabel: $("score-correct-label"),
  scoreWrongLabel: $("score-wrong-label"),
  scoreAccuracyLabel: $("score-accuracy-label"),
  scoreProgressLabel: $("score-progress-label"),
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
  knowledgeTitle: $("knowledge-title"),
  knowledgeList: $("knowledge-list"),
  resultPanel: $("result-panel"),
  resultTitle: $("result-title"),
  resultScore: $("result-score"),
  resultPass: $("result-pass"),
  resultUnanswered: $("result-unanswered"),
  wrongPanel: $("wrong-panel"),
  wrongTitle: $("wrong-title"),
  wrongList: $("wrong-list"),
  noteText: $("note-text"),
  linksTitle: $("links-title"),
  linkHandbookZh: $("link-handbook-zh"),
  linkHandbookEn: $("link-handbook-en"),
  linkDlEntry: $("link-dl-entry"),
  linkChecklist: $("link-checklist"),
  linkAppointment: $("link-appointment"),
  linkI94: $("link-i94"),
};

function t(key, params = {}) {
  const bundle = UI_TEXT[state.uiLang] || UI_TEXT["zh-hans"];
  let msg = bundle[key] || UI_TEXT["zh-hans"][key] || key;
  for (const [name, value] of Object.entries(params)) {
    msg = msg.replaceAll(`{${name}}`, String(value));
  }
  return msg;
}

function setSelectOptionText(selectEl, value, text) {
  const option = Array.from(selectEl.options).find((x) => x.value === value);
  if (option) option.textContent = text;
}

function modeName(mode) {
  return mode === "exam" ? t("modeExamLabel") : t("modePracticeLabel");
}

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

function applyUiLanguage() {
  document.title = t("pageTitle");
  document.documentElement.lang = state.uiLang === "en" ? "en" : state.uiLang === "zh-hant" ? "zh-Hant" : "zh-CN";

  els.siteTitle.textContent = t("siteTitle");
  els.siteSubtitle.textContent = t("siteSubtitle");
  els.githubLink.textContent = t("githubRepo");

  els.uiLangLabel.textContent = t("uiLangLabel");
  els.questionLangLabel.textContent = t("questionLangLabel");
  els.modeSelectLabel.textContent = t("modeLabel");
  els.questionCountLabel.textContent = t("questionCount");
  els.timeLimitLabel.textContent = t("timeLimit");
  els.shuffleLabel.textContent = t("shuffle");
  els.startBtn.textContent = t("start");
  els.submitBtn.textContent = t("submit");
  els.showWrongBtn.textContent = t("showWrong");

  setSelectOptionText(els.uiLangSelect, "zh-hans", t("langHans"));
  setSelectOptionText(els.uiLangSelect, "zh-hant", t("langHant"));
  setSelectOptionText(els.uiLangSelect, "en", t("langEn"));
  setSelectOptionText(els.langSelect, "zh-hans", t("langHans"));
  setSelectOptionText(els.langSelect, "zh-hant", t("langHant"));
  setSelectOptionText(els.langSelect, "en", t("langEn"));
  setSelectOptionText(els.modeSelect, "practice", t("modePractice"));
  setSelectOptionText(els.modeSelect, "exam", t("modeExam"));

  els.scoreModeLabel.textContent = t("scoreMode");
  els.scoreTimerLabel.textContent = t("scoreTimer");
  els.scoreTotalLabel.textContent = t("scoreTotal");
  els.scoreAnsweredLabel.textContent = t("scoreAnswered");
  els.scoreCorrectLabel.textContent = t("scoreCorrect");
  els.scoreWrongLabel.textContent = t("scoreWrong");
  els.scoreAccuracyLabel.textContent = t("scoreAccuracy");
  els.scoreProgressLabel.textContent = t("scoreProgress");

  els.prevBtn.textContent = t("prev");
  els.nextBtn.textContent = t("next");
  els.knowledgeTitle.textContent = t("knowledgeTitle");
  els.resultTitle.textContent = t("resultTitle");
  els.wrongTitle.textContent = t("wrongTitle");
  els.noteText.textContent = t("noteText");
  els.linksTitle.textContent = t("linksTitle");
  els.linkHandbookZh.textContent = t("linkHandbookZh");
  els.linkHandbookEn.textContent = t("linkHandbookEn");
  els.linkDlEntry.textContent = t("linkDlEntry");
  els.linkChecklist.textContent = t("linkChecklist");
  els.linkAppointment.textContent = t("linkAppointment");
  els.linkI94.textContent = t("linkI94");
  els.qImage.alt = t("imageAlt");

  if (!state.currentQuestion) {
    els.qText.textContent = t("clickStart");
    els.qPosition.textContent = t("questionPosition", { current: "-", total: "-" });
    els.qId.textContent = "ID: -";
  }

  if (!state.sessionId) {
    els.knowledgeList.textContent = t("knowledgeStart");
  }

  if (state.summary) {
    setSummary(state.summary);
  }
  if (state.currentQuestion) {
    renderQuestion();
  }
  if (state.knowledgeStats) {
    renderKnowledgeStats(state.knowledgeStats);
  }
  if (state.result) {
    renderResult(state.result);
  }
  if (state.wrongQuestions && !els.wrongPanel.classList.contains("hidden")) {
    renderWrongQuestions(state.wrongQuestions);
  }
}

async function handleAutoSubmitByTime() {
  if (!state.sessionId || !state.summary || state.summary.submitted) {
    return;
  }
  try {
    await submitExam(true);
    alert(t("autoSubmitAlert"));
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

  els.modeLabel.textContent = modeName(summary.mode);
  els.totalCount.textContent = summary.total_questions;
  els.answeredCount.textContent = summary.answered_count;
  els.correctCount.textContent = summary.correct_count;
  els.wrongCount.textContent = summary.wrong_count;
  els.accuracy.textContent = `${(summary.accuracy * 100).toFixed(1)}%`;
  els.progress.textContent = `${(summary.completion * 100).toFixed(1)}%`;

  if (summary.mode === "exam") {
    if (summary.submitted) {
      clearTimer();
      els.timer.textContent = t("timerSubmitted");
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
  state.knowledgeStats = stats;

  if (!stats || !stats.length) {
    els.knowledgeList.textContent = state.sessionId ? t("knowledgeNoData") : t("knowledgeStart");
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
          <th>${t("kColName")}</th>
          <th>${t("kColTotal")}</th>
          <th>${t("kColAnswered")}</th>
          <th>${t("kColCorrect")}</th>
          <th>${t("kColWrong")}</th>
          <th>${t("kColAccuracy")}</th>
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
  state.result = result;
  els.resultPanel.classList.remove("hidden");

  const summary = result.summary;
  els.resultScore.textContent = `${t("resultScore")}: ${result.score_percent}% (${summary.correct_count}/${summary.total_questions})`;
  els.resultPass.textContent = `${t("resultPass")}: ${result.passed ? t("passed") : t("failed")}（${t("passLine")} ${result.pass_line_percent}%）`;

  const weak =
    result.knowledge_stats.filter((x) => x.wrong > 0).slice(0, 3).map((x) => x.name).join("、") || t("weakNone");
  els.resultUnanswered.textContent = `${t("resultUnanswered")}: ${result.unanswered_count}，${t("weakPoints")}: ${weak}`;
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

  els.qPosition.textContent = t("questionPosition", {
    current: state.currentIndex + 1,
    total: state.questionIds.length,
  });
  els.qId.textContent = `ID: ${q.question_id}`;
  els.qText.textContent = q.question;
  els.qTags.innerHTML = (q.tags || []).map((tag) => `<span class="tag-chip">${tag.name}</span>`).join("");

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
    els.answerResult.textContent = t("answeredCorrect");
    els.answerResult.className = "ok";
  } else {
    els.answerResult.textContent = t("answeredWrong");
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
    alert(`${t("submitAnswerFail")}: ${err.message}`);
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
    els.answerResult.textContent = t("answerCorrect");
    els.answerResult.className = "ok";
  } else {
    const correctText = state.currentQuestion.options.find((x) => x.option_no === resp.correct_option_no)?.text || "";
    els.answerResult.textContent = t("answerWrongWithCorrect", {
      no: resp.correct_option_no,
      text: correctText,
    });
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
  state.result = null;
  state.wrongQuestions = null;
  state.knowledgeStats = null;
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
    if (!isAuto) alert(t("startFirstExam"));
    return;
  }
  const result = await api(`/api/sessions/${state.sessionId}/submit?lang=${encodeURIComponent(state.lang)}`, {
    method: "POST",
  });
  setSummary(result.summary);
  renderResult(result);
  await refreshKnowledgeStats();
  renderQuestion();
}

function renderWrongQuestions(list) {
  state.wrongQuestions = list;
  els.wrongList.innerHTML = "";

  if (!list || !list.length) {
    els.wrongList.textContent = t("wrongNone");
    return;
  }

  for (const item of list) {
    const div = document.createElement("div");
    div.className = "wrong-item";
    const correct = item.options.find((x) => x.option_no === item.correct_option_no)?.text || "";
    const selected = item.options.find((x) => x.option_no === item.selected_option_no)?.text || "";
    const tags = (item.tags || []).map((x) => x.name).join(" / ");
    div.innerHTML = `
      <h4>${t("wrongQuestionTitle", { id: item.question_id })}: ${item.question}</h4>
      <p>${t("knowledgePointLabel")}：${tags || "-"}</p>
      <p>${t("yourChoiceLabel")}：${item.selected_option_no}. ${selected}</p>
      <p>${t("correctAnswerLabel")}：${item.correct_option_no}. ${correct}</p>
    `;
    els.wrongList.appendChild(div);
  }
}

async function showWrongQuestions() {
  if (!state.sessionId) {
    alert(t("startFirstPractice"));
    return;
  }
  const data = await api(`/api/sessions/${state.sessionId}/wrong-questions?lang=${encodeURIComponent(state.lang)}`);
  renderWrongQuestions(data.wrong_questions);
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
          const result = await api(`/api/sessions/${state.sessionId}/result?lang=${encodeURIComponent(state.lang)}`);
          renderResult(result);
        } catch {
          // practice mode without submit result is acceptable
        }
      }
    }
  });

  els.uiLangSelect.addEventListener("change", (e) => {
    state.uiLang = e.target.value;
    localStorage.setItem("ui_lang", state.uiLang);
    applyUiLanguage();
  });

  els.startBtn.addEventListener("click", async () => {
    try {
      await startSession();
    } catch (err) {
      alert(`${t("startFail")}: ${err.message}`);
    }
  });

  els.submitBtn.addEventListener("click", async () => {
    try {
      await submitExam(false);
    } catch (err) {
      alert(`${t("submitFail")}: ${err.message}`);
    }
  });

  els.showWrongBtn.addEventListener("click", async () => {
    try {
      await showWrongQuestions();
    } catch (err) {
      alert(`${t("wrongLoadFail")}: ${err.message}`);
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
  const storedUiLang = localStorage.getItem("ui_lang");
  if (["zh-hans", "zh-hant", "en"].includes(storedUiLang)) {
    state.uiLang = storedUiLang;
  }

  els.uiLangSelect.value = state.uiLang;
  state.lang = els.langSelect.value;

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
  applyUiLanguage();
}

bootstrap().catch((err) => {
  alert(`${t("initFail")}: ${err.message}`);
});
