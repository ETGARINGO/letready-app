/* =========================================================
   LETReady — application logic
   ========================================================= */
(function () {
  "use strict";

  const { SUBJECTS, TOPICS, QUESTIONS, LESSONS, FLASHCARDS, TRACKS, MAJORS } = window.DATA;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  let user = null;
  let state = null;
  let session = null;
  let timerInterval = null;
  let deferredInstall = null;
  let currentPage = "home";

  /* =======================================================
     STATE
     ======================================================= */
  function blankState() {
    return {
      theme: "dark",
      profile: { track: "sec", major: "Not applicable", examDate: "", dailyGoal: 30, reminders: true, sound: true },
      totalAnswered: 0, totalCorrect: 0, studySeconds: 0,
      streak: 0, bestStreak: 0, lastActiveDate: null,
      dailyProgress: { date: today(), questions: 0, seconds: 0 },
      history: {},          // "YYYY-MM-DD": { questions, correct, seconds }
      subjectStats: { gened: { answered: 0, correct: 0 }, profed: { answered: 0, correct: 0 }, major: { answered: 0, correct: 0 } },
      topicStats: {},       // topic: { answered, correct }
      questionStats: {},    // id: { seen, correct, wrong, box, due }
      mistakes: [], bookmarks: [], sessions: [],
      onboarded: false
    };
  }

  function today() { return new Date().toISOString().slice(0, 10); }
  function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }

  function loadState() {
    const saved = Store.get("progress:" + user.id);
    state = Object.assign(blankState(), saved || {});
    state.profile = Object.assign(blankState().profile, state.profile || {});
    if (state.dailyProgress.date !== today()) state.dailyProgress = { date: today(), questions: 0, seconds: 0 };
    if (state.lastActiveDate && daysBetween(state.lastActiveDate, today()) > 1) state.streak = 0;
  }

  function save() { Store.set("progress:" + user.id, state); }

  /* =======================================================
     THEME
     ======================================================= */
  const THEMES = ["dark", "light", "neu"];
  const THEME_ICON = { dark: "🌙", light: "☀️", neu: "🧊" };
  const THEME_COLOR = { dark: "#070b14", light: "#eef1f7", neu: "#e6e9f0" };

  function applyTheme(t) {
    document.body.setAttribute("data-theme", t);
    const btn = $("themeBtn"); if (btn) btn.textContent = THEME_ICON[t];
    document.querySelectorAll(".theme-opt").forEach(el => el.classList.toggle("active", el.dataset.t === t));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLOR[t]);
    Store.set("theme", t);
  }

  window.setTheme = function (t) {
    if (state) { state.theme = t; save(); }
    applyTheme(t);
    toast(t === "dark" ? "Dark theme on" : t === "light" ? "Light theme on" : "Soft theme on");
  };

  window.cycleTheme = function () {
    const next = THEMES[(THEMES.indexOf(document.body.getAttribute("data-theme")) + 1) % THEMES.length];
    setTheme(next);
  };

  /* =======================================================
     FEEDBACK
     ======================================================= */
  let toastTimer;
  function toast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }
  window.toast = toast;

  function buzz(pattern) {
    if (state && state.profile.sound === false) return;
    if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) {} }
  }

  /* =======================================================
     AUTH SCREENS
     ======================================================= */
  function authError(msg) {
    const el = $("authError");
    el.textContent = msg;
    el.classList.toggle("show", !!msg);
  }

  window.switchAuthTab = function (tab) {
    authError("");
    document.querySelectorAll(".auth-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    $("loginForm").classList.toggle("hidden", tab !== "login");
    $("signupForm").classList.toggle("hidden", tab !== "signup");
    $("authHeading").textContent = tab === "login" ? "Welcome back" : "Create your account";
    $("authLede").textContent = tab === "login"
      ? "Sign in to pick up your review where you left it."
      : "Your progress stays on this device. No email verification needed.";
  };

  window.togglePw = function (inputId, btn) {
    const input = $(inputId);
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.textContent = show ? "🙈" : "👁️";
  };

  window.checkStrength = function (value) {
    const bar = $("pwStrengthBar");
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    const pct = [0, 30, 55, 80, 100][score];
    const color = score <= 1 ? "var(--danger)" : score === 2 ? "var(--warning)" : "var(--success)";
    bar.style.width = pct + "%";
    bar.style.background = color;
  };

  window.doLogin = async function () {
    authError("");
    const email = $("loginEmail").value.trim();
    const pw = $("loginPassword").value;
    if (!email || !pw) return authError("Enter your email and password.");
    const btn = $("loginBtn"); btn.disabled = true; btn.textContent = "Signing in…";
    try {
      user = await Auth.login(email, pw);
      enterApp();
    } catch (e) {
      authError(e.message);
    } finally { btn.disabled = false; btn.textContent = "Sign in"; }
  };

  window.doSignup = async function () {
    authError("");
    const name = $("signupName").value.trim();
    const email = $("signupEmail").value.trim();
    const pw = $("signupPassword").value;
    if (name.length < 2) return authError("Enter the name you want shown in the app.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return authError("Enter a valid email address.");
    if (pw.length < 8) return authError("Use at least 8 characters for your password.");
    const btn = $("signupBtn"); btn.disabled = true; btn.textContent = "Creating…";
    try {
      user = await Auth.register(name, email, pw);
      enterApp();
    } catch (e) {
      authError(e.message);
    } finally { btn.disabled = false; btn.textContent = "Create account"; }
  };

  window.continueAsGuest = function () {
    user = Auth.guest();
    enterApp();
  };

  window.logout = function () {
    if (!confirm("Sign out of LETReady? Your progress stays saved on this device.")) return;
    Auth.logout();
    user = null; state = null;
    $("app").classList.remove("show");
    document.body.classList.remove("in-app");
    $("authScreen").classList.add("show");
    switchAuthTab("login");
    $("loginPassword").value = "";
  };

  /* =======================================================
     ONBOARDING
     ======================================================= */
  let onbStep = 0;
  const onbDraft = { track: "sec", major: "Not applicable", examDate: "", dailyGoal: 30 };

  function startOnboarding() {
    onbStep = 0;
    $("onboarding").classList.add("show");
    renderOnboarding();
  }

  function renderOnboarding() {
    const body = $("onbBody");
    $("onbSteps").innerHTML = [0, 1, 2].map(i => `<div class="${i <= onbStep ? "done" : ""}"></div>`).join("");

    if (onbStep === 0) {
      body.innerHTML = `
        <h1>Which exam are you taking?</h1>
        <p class="lede">This decides which subjects appear in your review and practice.</p>
        <div class="choice-grid">
          ${TRACKS.map(t => `<button class="choice-tile ${onbDraft.track === t.id ? "selected" : ""}" onclick="onbPick('track','${t.id}')">
            <strong>${t.name}</strong><span>${t.blurb}</span></button>`).join("")}
        </div>
        ${onbDraft.track === "sec" ? `
        <div class="form-group" style="margin-top:16px;">
          <label for="onbMajor">Your major</label>
          <select class="form-control" id="onbMajor" onchange="onbDraftSet('major', this.value)">
            ${MAJORS.map(m => `<option ${onbDraft.major === m ? "selected" : ""}>${m}</option>`).join("")}
          </select>
        </div>` : ""}`;
    } else if (onbStep === 1) {
      body.innerHTML = `
        <h1>When is your exam?</h1>
        <p class="lede">LETReady counts the days down and paces your daily goal against it.</p>
        <div class="form-group">
          <label for="onbDate">Exam date</label>
          <input type="date" class="form-control" id="onbDate" value="${onbDraft.examDate}" onchange="onbDraftSet('examDate', this.value)">
          <small class="hint">You can change or clear this later in Settings.</small>
        </div>`;
    } else {
      body.innerHTML = `
        <h1>Set your daily goal</h1>
        <p class="lede">A goal you can actually hit beats an ambitious one you skip.</p>
        <div class="choice-grid">
          ${[15, 30, 50, 100].map(n => `<button class="choice-tile ${onbDraft.dailyGoal === n ? "selected" : ""}" onclick="onbPick('dailyGoal',${n})">
            <strong>${n} questions a day</strong><span>${n <= 15 ? "About 10 minutes" : n <= 30 ? "About 20 minutes" : n <= 50 ? "About 35 minutes" : "Intensive, about an hour"}</span></button>`).join("")}
        </div>`;
    }
    $("onbBack").classList.toggle("hidden", onbStep === 0);
    $("onbNext").textContent = onbStep === 2 ? "Start reviewing" : "Continue";
  }

  window.onbPick = function (key, value) { onbDraft[key] = value; renderOnboarding(); };
  window.onbDraftSet = function (key, value) { onbDraft[key] = value; };
  window.onbBack = function () { if (onbStep > 0) { onbStep--; renderOnboarding(); } };
  window.onbNext = function () {
    if (onbStep < 2) { onbStep++; renderOnboarding(); return; }
    state.profile.track = onbDraft.track;
    state.profile.major = onbDraft.major;
    state.profile.examDate = onbDraft.examDate;
    state.profile.dailyGoal = onbDraft.dailyGoal;
    state.onboarded = true;
    save();
    $("onboarding").classList.remove("show");
    renderAll();
    toast("You are set. Start with a quick practice.");
  };

  /* =======================================================
     APP ENTRY
     ======================================================= */
  function enterApp() {
    loadState();
    applyTheme(state.theme || Store.get("theme") || "dark");
    $("authScreen").classList.remove("show");
    $("app").classList.add("show");
    document.body.classList.add("in-app");
    if (!state.onboarded) { startOnboarding(); return; }
    navigate("home");
    renderAll();
  }

  /* =======================================================
     SCOPE HELPERS
     ======================================================= */
  function activeSubjects() {
    return state.profile.track === "elem" ? ["gened", "profed"] : ["gened", "profed", "major"];
  }
  function bank() { return QUESTIONS.filter(q => activeSubjects().indexOf(q.subject) !== -1); }
  function qById(id) { return QUESTIONS.filter(q => q.id === id)[0]; }

  function accuracy() {
    return state.totalAnswered ? Math.round((state.totalCorrect / state.totalAnswered) * 100) : 0;
  }

  /* Readiness blends accuracy, coverage of the bank and consistency. */
  function readiness() {
    if (!state.totalAnswered) return 0;
    const acc = state.totalCorrect / state.totalAnswered;
    const seen = Object.keys(state.questionStats).length;
    const coverage = Math.min(1, seen / Math.max(1, bank().length));
    const consistency = Math.min(1, state.streak / 14);
    return Math.round((acc * 0.65 + coverage * 0.25 + consistency * 0.10) * 100);
  }

  function readinessBand(score) {
    if (!state.totalAnswered) return { word: "Getting started", color: "var(--muted)", status: "Getting started" };
    if (score >= 80) return { word: "excellent", color: "var(--success)", status: "Excellent readiness" };
    if (score >= 65) return { word: "good", color: "var(--success)", status: "Good readiness" };
    if (score >= 50) return { word: "fair", color: "var(--warning)", status: "Fair readiness" };
    return { word: "still building", color: "var(--danger)", status: "Needs more practice" };
  }

  function weakTopics(threshold) {
    threshold = threshold || 0.75;
    return Object.keys(state.topicStats).filter(t => {
      const s = state.topicStats[t];
      return s.answered >= 2 && s.correct / s.answered < threshold;
    });
  }

  function dueQuestions() {
    const now = Date.now();
    return bank().filter(q => {
      const s = state.questionStats[q.id];
      return s && s.due && s.due <= now;
    });
  }

  function daysToExam() {
    if (!state.profile.examDate) return null;
    return daysBetween(today(), state.profile.examDate);
  }

  /* =======================================================
     NAVIGATION
     ======================================================= */
  window.navigate = function (page) {
    currentPage = page;
    document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
    const target = $(page + "Page");
    if (target) target.classList.add("active");
    const navMap = { mistakes: "practice", bookmarks: "profile", flashcards: "review", lesson: "review", settings: "profile" };
    const navKey = navMap[page] || page;
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.page === navKey));

    if (page === "home") renderHome();
    if (page === "review") renderReview();
    if (page === "practice") renderPractice();
    if (page === "progress") renderProgress();
    if (page === "mistakes") renderMistakes();
    if (page === "bookmarks") renderBookmarks();
    if (page === "flashcards") renderFlashcard();
    if (page === "profile") renderProfile();
    if (page === "settings") renderSettings();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* =======================================================
     HOME
     ======================================================= */
  function greeting() {
    const h = new Date().getHours();
    const first = (user.name || "there").split(" ")[0];
    if (h < 12) return "Good morning, " + first;
    if (h < 18) return "Good afternoon, " + first;
    return "Good evening, " + first;
  }

  function renderHome() {
    $("greeting").textContent = greeting();
    const score = readiness();
    const band = readinessBand(score);

    $("scoreValue").textContent = score + "%";
    $("scoreRing").style.setProperty("--score-pct", score + "%");
    $("readinessWord").textContent = band.word;
    $("readinessWord").style.color = band.color;

    $("streakPill").textContent = "🔥 " + state.streak + "-day streak";
    const weak = weakTopics().length;
    $("weakPill").textContent = "🎯 " + weak + (weak === 1 ? " weak topic" : " weak topics");
    const due = dueQuestions().length;
    $("duePill").textContent = "🔁 " + due + " due for review";

    $("statQuestions").textContent = state.totalAnswered.toLocaleString();
    $("statAccuracy").textContent = accuracy() + "%";
    $("statTime").textContent = fmtDuration(state.studySeconds);
    $("statStreak").textContent = state.streak;

    /* countdown */
    const d = daysToExam();
    const cd = $("countdown");
    if (d === null) {
      cd.innerHTML = `<div class="countdown-num">📅</div>
        <div style="flex:1"><strong>Add your exam date</strong>
        <p>LETReady will count down and pace your daily goal.</p></div>
        <button class="btn btn-secondary" style="min-height:38px;padding:0 13px;" onclick="navigate('settings')">Add</button>`;
    } else if (d >= 0) {
      const perDay = d > 0 ? Math.ceil(Math.max(0, bank().length - Object.keys(state.questionStats).length) / d) : 0;
      cd.innerHTML = `<div class="countdown-num">${d}</div>
        <div style="flex:1"><strong>${d === 0 ? "Your exam is today" : d === 1 ? "day until your exam" : "days until your exam"}</strong>
        <p>${d === 0 ? "Rest, eat well and trust your preparation." : perDay > 0 ? "Cover about " + perDay + " new questions a day to finish the bank in time." : "You have seen every question. Keep drilling your weak topics."}</p></div>`;
    } else {
      cd.innerHTML = `<div class="countdown-num">✓</div><div style="flex:1"><strong>Exam date has passed</strong>
        <p>Set a new date in Settings if you are reviewing for another schedule.</p></div>`;
    }

    /* goal */
    const goal = state.profile.dailyGoal;
    const done = state.dailyProgress.questions;
    const pct = Math.min(100, Math.round((done / goal) * 100));
    $("goalPct").textContent = pct + "% done";
    $("goalCount").textContent = done + " of " + goal + " questions";
    $("goalBar").style.width = pct + "%";
    $("goalHeadline").textContent = pct >= 100 ? "Daily goal reached" : pct > 0 ? "You are on your way" : "Nothing logged today yet";
    $("goalQ").textContent = done;
    $("goalMin").textContent = Math.round(state.dailyProgress.seconds / 60) + "m";
    $("goalStreak").textContent = "🔥 " + state.streak;

    /* recommendation */
    let title, body, action;
    if (due > 0) {
      title = due + (due === 1 ? " question is due" : " questions are due");
      body = "Spaced review brings these back just before you would forget them.";
      action = "smart";
    } else if (weak > 0) {
      const t = weakTopics().sort((a, b) =>
        state.topicStats[a].correct / state.topicStats[a].answered - state.topicStats[b].correct / state.topicStats[b].answered)[0];
      const p = Math.round((state.topicStats[t].correct / state.topicStats[t].answered) * 100);
      title = "Focus on " + t;
      body = "You are at " + p + "% there. A short drill will move it fastest.";
      action = "weak";
    } else if (state.totalAnswered === 0) {
      title = "Take your first practice session";
      body = "Ten questions is enough for LETReady to start reading your strengths.";
      action = "quick";
    } else {
      title = "Try a timed practice test";
      body = "Your topics look healthy. Practice under time pressure next.";
      action = "test";
    }
    $("recTitle").textContent = title;
    $("recBody").textContent = body;
    $("recBtn").onclick = () => openPractice(action);

    /* subjects */
    const grid = $("subjectGrid");
    grid.innerHTML = activeSubjects().map(key => {
      const meta = SUBJECTS[key];
      const s = state.subjectStats[key] || { answered: 0, correct: 0 };
      const p = s.answered ? Math.round((s.correct / s.answered) * 100) : 0;
      const label = !s.answered ? "Not started" : p >= 80 ? "Strong" : p >= 60 ? "Developing" : "Needs work";
      const color = !s.answered ? "var(--muted)" : p >= 80 ? "var(--success)" : p >= 60 ? "var(--warning)" : "var(--danger)";
      return `<button class="subject-card" onclick="quickSubject('${key}')">
        <div class="subject-top">
          <div class="subject-info">
            <div class="subject-icon">${meta.icon}</div>
            <div><strong>${meta.name}</strong><span>${label} · ${s.answered} answered</span></div>
          </div>
          <div class="subject-score" style="color:${color}">${s.answered ? p + "%" : "—"}</div>
        </div>
        <div class="subject-bar"><div class="progress"><div style="width:${p}%"></div></div></div>
      </button>`;
    }).join("");
  }

  window.quickSubject = function (key) {
    openPractice("quick");
    $("cfgSubject").value = key;
  };

  function fmtDuration(sec) {
    if (sec < 3600) return Math.round(sec / 60) + "m";
    return (sec / 3600).toFixed(1) + "h";
  }

  /* =======================================================
     REVIEW
     ======================================================= */
  let reviewTab = "topics";

  window.setReviewTab = function (tab) {
    reviewTab = tab;
    document.querySelectorAll("#reviewSegment button").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    renderReview();
  };

  function masteryTag(topic) {
    const s = state.topicStats[topic];
    if (!s || !s.answered) return `<small>Not started</small>`;
    const p = Math.round((s.correct / s.answered) * 100);
    const bg = p >= 80 ? "rgba(33,201,130,.16)" : p >= 60 ? "rgba(246,183,60,.16)" : "rgba(255,95,109,.16)";
    const fg = p >= 80 ? "var(--success)" : p >= 60 ? "var(--warning)" : "var(--danger)";
    return `<span class="mastery-tag" style="background:${bg};color:${fg}">${p}%</span>`;
  }

  function renderReview() {
    const wrap = $("reviewContent");
    $("reviewSearch").parentElement.classList.toggle("hidden", reviewTab !== "topics");

    if (reviewTab === "cards") {
      wrap.innerHTML = `<div class="analytics-card">
        <div class="analytics-head"><strong>Flashcards</strong><span>${FLASHCARDS.length} cards</span></div>
        <p style="color:var(--muted);font-size:12px;line-height:1.6;margin:0 0 14px;">Tap a card to flip it. Use these for the terms and laws that are pure recall.</p>
        <button class="btn btn-primary btn-full" onclick="navigate('flashcards')">Open flashcards</button>
      </div>` + Object.keys(LESSONS).filter(inScope).map(t => `
        <div class="topic" style="margin-bottom:7px;">
          <span>${t}</span><small>${FLASHCARDS.filter(c => c.topic === t).length} cards</small>
        </div>`).join("");
      return;
    }

    wrap.innerHTML = activeSubjects().map(key => {
      const meta = SUBJECTS[key];
      const list = TOPICS[key].map(t => {
        const count = bank().filter(q => q.topic === t).length;
        return `<button class="topic" onclick="openLesson('${esc(t)}')">
          <span>${t}</span>
          <span style="display:flex;align-items:center;gap:8px;">${masteryTag(t)}<small>${count} item${count === 1 ? "" : "s"}</small></span>
        </button>`;
      }).join("");
      return `<div class="category-card topic-group">
        <div class="category-head">
          <div class="category-icon">${meta.icon}</div>
          <div><strong>${meta.name}</strong><span>${TOPICS[key].length} topics</span></div>
        </div>
        <div class="topic-list">${list}</div>
      </div>`;
    }).join("");
  }

  function inScope(topic) {
    return activeSubjects().some(k => TOPICS[k].indexOf(topic) !== -1);
  }

  window.filterTopics = function (value) {
    const q = value.toLowerCase().trim();
    document.querySelectorAll(".topic-group").forEach(group => {
      let visible = 0;
      group.querySelectorAll(".topic").forEach(t => {
        const match = t.textContent.toLowerCase().indexOf(q) !== -1;
        t.style.display = match ? "flex" : "none";
        if (match) visible++;
      });
      group.style.display = visible ? "block" : "none";
    });
  };

  window.openLesson = function (topic) {
    const notes = LESSONS[topic] || [];
    const count = bank().filter(q => q.topic === topic).length;
    $("lessonTitle").textContent = topic;
    $("lessonSubtitle").textContent = count + " practice item" + (count === 1 ? "" : "s") + " available";
    $("lessonBody").innerHTML = notes.length
      ? notes.map(n => `<div class="lesson-note"><h3>${n.h}</h3><p>${n.p}</p></div>`).join("")
      : `<div class="empty-state"><div class="emoji">📝</div>No notes for this topic yet. Add them in data.js under LESSONS.</div>`;
    $("lessonPracticeBtn").onclick = () => practiceTopic(topic);
    navigate("lesson");
  };

  window.practiceTopic = function (topic) {
    const pool = shuffle(bank().filter(q => q.topic === topic));
    if (!pool.length) return toast("No questions for this topic yet.");
    beginSession(pool, 0, true, "Topic: " + topic);
  };

  /* ---------- Flashcards ---------- */
  let cardIndex = 0, cardDeck = [];

  function renderFlashcard() {
    if (!cardDeck.length) cardDeck = shuffle(FLASHCARDS.filter(c => inScope(c.topic)).slice());
    const c = cardDeck[cardIndex % cardDeck.length];
    $("cardCounter").textContent = (cardIndex % cardDeck.length + 1) + " of " + cardDeck.length;
    $("flashcard").classList.remove("flipped");
    $("cardFront").innerHTML = `<small>${c.topic}</small><strong>${esc(c.front)}</strong>`;
    $("cardBack").innerHTML = `<small>${c.topic}</small><p>${esc(c.back)}</p>`;
  }

  window.flipCard = function () { $("flashcard").classList.toggle("flipped"); buzz(8); };
  window.nextCard = function () { cardIndex++; renderFlashcard(); };
  window.prevCard = function () { cardIndex = (cardIndex - 1 + cardDeck.length) % cardDeck.length; renderFlashcard(); };
  window.shuffleCards = function () { cardDeck = shuffle(cardDeck); cardIndex = 0; renderFlashcard(); toast("Deck shuffled"); };

  /* =======================================================
     PRACTICE
     ======================================================= */
  function renderPractice() {
    const s = state.sessions[0];
    const card = $("recentPracticeCard");
    if (!s) {
      card.innerHTML = `<div class="analytics-head"><strong>No sessions yet</strong><span>—</span></div>
        <p style="color:var(--muted);font-size:12px;line-height:1.6;margin:0 0 14px;">Finish one session and your history appears here.</p>
        <button class="btn btn-secondary btn-full" onclick="openPractice('quick')">Start practising</button>`;
    } else {
      card.innerHTML = state.sessions.slice(0, 5).map(x => `
        <div class="metric-row">
          <div class="metric-label"><span>${x.label}</span><span>${x.correct}/${x.count} · ${x.score}%</span></div>
          <div class="progress"><div style="width:${x.score}%"></div></div>
        </div>`).join("") +
        `<button class="btn btn-secondary btn-full" style="margin-top:14px;" onclick="openPractice('quick')">Start another session</button>`;
    }
    $("dueBadge").textContent = dueQuestions().length + " due";
    $("mistakeBadge").textContent = state.mistakes.length + " saved";
  }

  const MODES = {
    quick:    { title: "Quick practice",   sub: "A short session with instant feedback.", count: "10", time: "0", feedback: true },
    smart:    { title: "Smart review",     sub: "Questions you are about to forget, scheduled by spaced repetition.", count: "20", time: "0", feedback: true },
    weak:     { title: "Weak topics",      sub: "Drills drawn from the topics holding your score down.", count: "10", time: "0", feedback: true },
    bank:     { title: "Question bank",    sub: "Choose exactly what you want to practise.", count: "10", time: "0", feedback: true },
    test:     { title: "Practice test",    sub: "Timed, with results shown at the end.", count: "20", time: "1200", feedback: false },
    mock:     { title: "Mock LET",         sub: "Full simulation across all your subjects.", count: "all", time: "3600", feedback: false },
    mistakes: { title: "Mistake drill",    sub: "Only the questions you have gotten wrong.", count: "all", time: "0", feedback: true },
    bookmarks:{ title: "Bookmarked items", sub: "The questions you marked to revisit.", count: "all", time: "0", feedback: true }
  };

  let practiceMode = "quick";

  window.openPractice = function (mode) {
    practiceMode = mode;
    const m = MODES[mode] || MODES.quick;
    $("modalTitle").textContent = m.title;
    $("modalSubtitle").textContent = m.sub;
    $("cfgCount").value = m.count;
    $("cfgTime").value = m.time;
    $("cfgFeedback").checked = m.feedback;
    $("cfgSubject").value = "all";
    const scoped = mode === "quick" || mode === "bank" || mode === "test" || mode === "mock";
    $("cfgSubjectGroup").classList.toggle("hidden", !scoped);
    $("cfgDifficultyGroup").classList.toggle("hidden", !scoped);
    const opts = $("cfgSubject");
    opts.innerHTML = `<option value="all">All subjects</option>` +
      activeSubjects().map(k => `<option value="${k}">${SUBJECTS[k].name}</option>`).join("");
    $("practiceModal").classList.add("show");
  };

  window.closePractice = function () { $("practiceModal").classList.remove("show"); };

  window.startConfiguredSession = function () {
    const subject = $("cfgSubject").value;
    const countVal = $("cfgCount").value;
    const difficulty = $("cfgDifficulty").value;
    const time = parseInt($("cfgTime").value, 10);
    const feedback = $("cfgFeedback").checked;

    let pool = bank().slice();

    if (practiceMode === "mistakes") {
      pool = pool.filter(q => state.mistakes.indexOf(q.id) !== -1);
      if (!pool.length) { closePractice(); return toast("No mistakes saved. That is a good problem."); }
    } else if (practiceMode === "bookmarks") {
      pool = pool.filter(q => state.bookmarks.indexOf(q.id) !== -1);
      if (!pool.length) { closePractice(); return toast("You have not bookmarked any questions yet."); }
    } else if (practiceMode === "smart") {
      const due = dueQuestions();
      const fresh = pool.filter(q => !state.questionStats[q.id]);
      pool = due.concat(shuffle(fresh));
      if (!pool.length) { closePractice(); return toast("Nothing is due. Try a quick practice instead."); }
    } else if (practiceMode === "weak") {
      const weak = weakTopics();
      if (weak.length) pool = pool.filter(q => weak.indexOf(q.topic) !== -1);
      else toast("No weak topics detected yet — showing a mixed set.");
    }

    if (subject !== "all") pool = pool.filter(q => q.subject === subject);
    if (difficulty !== "all") pool = pool.filter(q => q.difficulty === difficulty);
    if (!pool.length) return toast("No questions match those filters. Loosen one of them.");

    if (practiceMode !== "smart") pool = shuffle(pool);
    const count = countVal === "all" ? pool.length : Math.min(parseInt(countVal, 10), pool.length);
    pool = pool.slice(0, count);

    closePractice();
    beginSession(pool, time, feedback, MODES[practiceMode].title);
  };

  function beginSession(questions, timeLimit, feedback, label) {
    session = {
      questions, index: 0,
      answers: new Array(questions.length).fill(null),
      timeLimit, timeLeft: timeLimit, feedback, label,
      startedAt: Date.now()
    };
    $("testScreen").classList.add("show");
    renderQuestion();
    startTimer();
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- timer ---------- */
  function startTimer() {
    clearInterval(timerInterval);
    if (!session.timeLimit) { $("timer").textContent = "∞"; $("timer").classList.remove("urgent"); return; }
    updateTimer();
    timerInterval = setInterval(() => {
      session.timeLeft--;
      if (session.timeLeft <= 0) { clearInterval(timerInterval); finishSession(true); return; }
      updateTimer();
    }, 1000);
  }

  function updateTimer() {
    const m = Math.floor(session.timeLeft / 60), s = session.timeLeft % 60;
    const el = $("timer");
    el.textContent = m + ":" + String(s).padStart(2, "0");
    el.classList.toggle("urgent", session.timeLeft <= 60);
  }

  /* ---------- question ---------- */
  function renderQuestion() {
    const q = session.questions[session.index];
    const answered = session.answers[session.index];

    $("questionNumber").textContent = session.index + 1;
    $("questionTotal").textContent = session.questions.length;
    $("questionProgress").style.width = (((session.index + 1) / session.questions.length) * 100) + "%";
    $("qSubjectPill").textContent = SUBJECTS[q.subject].short;
    $("qTopicPill").textContent = q.topic;
    $("qDifficultyPill").textContent = q.difficulty;
    $("questionText").textContent = q.question;

    const wrap = $("choices");
    wrap.innerHTML = "";
    q.choices.forEach((choice, i) => {
      const b = document.createElement("button");
      b.className = "choice";
      b.innerHTML = `<span class="choice-letter">${String.fromCharCode(65 + i)}</span><span class="choice-text">${esc(choice)}</span>`;
      b.onclick = () => selectChoice(i);
      if (answered !== null) {
        if (session.feedback) {
          b.disabled = true;
          if (i === q.answer) b.classList.add("correct");
          if (i === answered && answered !== q.answer) b.classList.add("incorrect");
        }
        if (i === answered) b.classList.add("selected");
      }
      wrap.appendChild(b);
    });

    const box = $("explainBox");
    if (answered !== null && session.feedback) {
      box.innerHTML = `<b>${answered === q.answer ? "Correct" : "Correct answer: " + String.fromCharCode(65 + q.answer)}</b>${esc(q.explanation)}`;
      box.classList.add("show");
    } else {
      box.classList.remove("show");
    }

    const marked = state.bookmarks.indexOf(q.id) !== -1;
    $("bookmarkBtn").classList.toggle("active", marked);
    $("bookmarkBtn").textContent = marked ? "🔖 Saved" : "🔖 Save";
    $("nextBtn").textContent = session.index >= session.questions.length - 1 ? "Finish" : "Next";
  }

  function selectChoice(i) {
    const q = session.questions[session.index];
    if (session.answers[session.index] !== null && session.feedback) return;
    const first = session.answers[session.index] === null;
    session.answers[session.index] = i;

    if (first) recordAnswer(q, i === q.answer);
    buzz(i === q.answer ? 12 : [18, 40, 18]);
    renderQuestion();

    if (session.feedback) {
      setTimeout(() => {
        const box = $("explainBox");
        if (box.scrollIntoView) box.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 120);
    } else if (session.index < session.questions.length - 1) {
      setTimeout(() => { session.index++; renderQuestion(); }, 180);
    }
  }

  /* Leitner intervals in days per box */
  const BOX_DAYS = [0, 1, 3, 7, 16, 35];

  function recordAnswer(q, correct) {
    state.totalAnswered++;
    if (correct) state.totalCorrect++;

    const sub = state.subjectStats[q.subject] || (state.subjectStats[q.subject] = { answered: 0, correct: 0 });
    sub.answered++; if (correct) sub.correct++;

    const top = state.topicStats[q.topic] || (state.topicStats[q.topic] = { answered: 0, correct: 0 });
    top.answered++; if (correct) top.correct++;

    const qs = state.questionStats[q.id] || (state.questionStats[q.id] = { seen: 0, correct: 0, wrong: 0, box: 0, due: 0 });
    qs.seen++;
    if (correct) { qs.correct++; qs.box = Math.min(BOX_DAYS.length - 1, qs.box + 1); }
    else { qs.wrong++; qs.box = Math.max(1, qs.box - 1); }
    qs.due = Date.now() + BOX_DAYS[qs.box] * 86400000;

    /* daily + streak */
    const d = today();
    if (state.dailyProgress.date !== d) state.dailyProgress = { date: d, questions: 0, seconds: 0 };
    state.dailyProgress.questions++;

    const h = state.history[d] || (state.history[d] = { questions: 0, correct: 0, seconds: 0 });
    h.questions++; if (correct) h.correct++;

    if (state.lastActiveDate !== d) {
      state.streak = state.lastActiveDate && daysBetween(state.lastActiveDate, d) === 1 ? state.streak + 1 : 1;
      state.bestStreak = Math.max(state.bestStreak || 0, state.streak);
      state.lastActiveDate = d;
    }

    const mi = state.mistakes.indexOf(q.id);
    if (!correct && mi === -1) state.mistakes.unshift(q.id);
    if (correct && mi !== -1) state.mistakes.splice(mi, 1);

    trimHistory();
    save();
  }

  function trimHistory() {
    const keys = Object.keys(state.history).sort();
    while (keys.length > 60) delete state.history[keys.shift()];
  }

  window.nextQuestion = function () {
    if (session.answers[session.index] === null) return toast("Pick an answer first.");
    if (session.index >= session.questions.length - 1) return finishSession(false);
    session.index++;
    renderQuestion();
  };

  window.previousQuestion = function () {
    if (session.index <= 0) return toast("This is the first question.");
    session.index--;
    renderQuestion();
  };

  window.toggleBookmark = function () {
    const q = session.questions[session.index];
    const i = state.bookmarks.indexOf(q.id);
    if (i === -1) { state.bookmarks.push(q.id); toast("Saved to bookmarks"); }
    else { state.bookmarks.splice(i, 1); toast("Removed from bookmarks"); }
    save();
    renderQuestion();
  };

  window.exitSession = function () {
    if (!confirm("Leave this session? Answers already submitted are kept, the rest are discarded.")) return;
    clearInterval(timerInterval);
    recordTime();
    $("testScreen").classList.remove("show");
    navigate(currentPage);
  };

  function recordTime() {
    const elapsed = Math.round((Date.now() - session.startedAt) / 1000);
    state.studySeconds += elapsed;
    state.dailyProgress.seconds += elapsed;
    const h = state.history[today()] || (state.history[today()] = { questions: 0, correct: 0, seconds: 0 });
    h.seconds += elapsed;
    save();
    return elapsed;
  }

  /* ---------- results ---------- */
  function finishSession(timedOut) {
    clearInterval(timerInterval);
    const elapsed = recordTime();

    /* In exam mode answers were not scored yet */
    if (!session.feedback) {
      session.answers.forEach((a, i) => { if (a !== null) recordAnswer(session.questions[i], a === session.questions[i].answer); });
    }

    const answered = session.answers.filter(a => a !== null).length;
    const correct = session.answers.reduce((n, a, i) => n + (a === session.questions[i].answer ? 1 : 0), 0);
    const score = session.questions.length ? Math.round((correct / session.questions.length) * 100) : 0;

    state.sessions.unshift({ date: today(), label: session.label, count: session.questions.length, correct, score, seconds: elapsed });
    state.sessions = state.sessions.slice(0, 20);
    save();

    $("testScreen").classList.remove("show");
    $("finalScore").textContent = score;
    $("finalCorrect").textContent = correct;
    $("finalWrong").textContent = session.questions.length - correct;
    $("finalTime").textContent = Math.floor(elapsed / 60) + ":" + String(elapsed % 60).padStart(2, "0");

    const band = score >= 80 ? ["Excellent work", "var(--success)"] : score >= 60 ? ["Solid session", "var(--warning)"] : ["Keep drilling", "var(--danger)"];
    const st = $("finalStatus");
    st.textContent = band[0];
    st.style.color = band[1];
    st.style.background = "color-mix(in srgb," + band[1] + " 16%, transparent)";
    st.style.border = "1px solid color-mix(in srgb," + band[1] + " 30%, transparent)";
    $("finalNote").textContent = timedOut ? "Time ran out, so unanswered items count as missed."
      : answered < session.questions.length ? (session.questions.length - answered) + " item(s) were left blank."
      : "Every item was answered.";

    /* answer sheet */
    $("answerSheet").innerHTML = session.questions.map((q, i) => {
      const a = session.answers[i];
      const cls = a === null ? "" : a === q.answer ? "correct" : "wrong";
      return `<button class="sheet-cell ${cls}" onclick="reviewItem(${i})">${i + 1}</button>`;
    }).join("");

    $("resultScreen").classList.add("show");
    buzz(score >= 60 ? [12, 60, 12] : 25);
  }

  window.reviewItem = function (i) {
    const q = session.questions[i];
    const a = session.answers[i];
    alert(
      "Q" + (i + 1) + ". " + q.question + "\n\n" +
      "Your answer: " + (a === null ? "blank" : q.choices[a]) + "\n" +
      "Correct answer: " + q.choices[q.answer] + "\n\n" + q.explanation
    );
  };

  window.closeResults = function (dest) {
    $("resultScreen").classList.remove("show");
    session = null;
    navigate(dest);
    renderAll();
  };

  /* =======================================================
     PROGRESS
     ======================================================= */
  function lastNDays(n) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      out.push({ date: d, data: state.history[d] || { questions: 0, correct: 0, seconds: 0 } });
    }
    return out;
  }

  function renderProgress() {
    const score = readiness();
    const band = readinessBand(score);
    $("progressScore").textContent = score;
    const st = $("progressStatus");
    st.textContent = band.status;
    st.style.color = band.color;
    st.style.background = "color-mix(in srgb," + band.color + " 16%, transparent)";
    st.style.border = "1px solid color-mix(in srgb," + band.color + " 30%, transparent)";

    /* 7-day bars */
    const days = lastNDays(7);
    const max = Math.max(1, ...days.map(d => d.data.questions));
    $("weekBars").innerHTML = days.map(d => {
      const h = Math.round((d.data.questions / max) * 100);
      const label = new Date(d.date).toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2);
      return `<div title="${d.data.questions} questions">
        <div class="bar ${d.data.questions ? "" : "empty"}" style="height:${Math.max(3, h)}%"></div>
        <small>${label}</small></div>`;
    }).join("");
    const wq = days.reduce((n, d) => n + d.data.questions, 0);
    const wc = days.reduce((n, d) => n + d.data.correct, 0);
    const ws = days.reduce((n, d) => n + d.data.seconds, 0);
    $("weekQuestions").textContent = wq;
    $("weekTime").textContent = fmtDuration(ws);
    $("weekAccuracy").textContent = wq ? Math.round((wc / wq) * 100) + "%" : "0%";

    /* accuracy trend */
    const trend = lastNDays(14).map(d => d.data.questions ? (d.data.correct / d.data.questions) * 100 : null);
    $("trendSpark").innerHTML = sparkline(trend);

    /* subjects */
    $("progressSubjects").innerHTML = activeSubjects().map(k => {
      const s = state.subjectStats[k] || { answered: 0, correct: 0 };
      const p = s.answered ? Math.round((s.correct / s.answered) * 100) : 0;
      return `<div class="metric-row">
        <div class="metric-label"><span>${SUBJECTS[k].name}</span><span>${s.answered ? p + "% of " + s.answered : "No data"}</span></div>
        <div class="progress"><div style="width:${p}%"></div></div>
      </div>`;
    }).join("");

    /* topic mastery */
    const topics = Object.keys(state.topicStats).filter(inScope);
    let strong = 0, dev = 0, weak = 0;
    topics.forEach(t => {
      const p = (state.topicStats[t].correct / state.topicStats[t].answered) * 100;
      if (p >= 80) strong++; else if (p >= 60) dev++; else weak++;
    });
    const total = topics.length || 1;
    $("masteryCount").textContent = topics.length + " of " + activeSubjects().reduce((n, k) => n + TOPICS[k].length, 0) + " topics started";
    $("masteryStrong").textContent = strong;
    $("masteryDev").textContent = dev;
    $("masteryWeak").textContent = weak;
    $("masteryStrongBar").style.width = Math.round((strong / total) * 100) + "%";
    $("masteryDevBar").style.width = Math.round((dev / total) * 100) + "%";
    $("masteryWeakBar").style.width = Math.round((weak / total) * 100) + "%";

    /* topic table */
    const rows = topics.sort((a, b) =>
      state.topicStats[a].correct / state.topicStats[a].answered - state.topicStats[b].correct / state.topicStats[b].answered);
    $("topicBreakdown").innerHTML = rows.length ? rows.map(t => {
      const s = state.topicStats[t];
      const p = Math.round((s.correct / s.answered) * 100);
      return `<div class="metric-row">
        <div class="metric-label"><span>${t}</span><span>${p}% · ${s.answered} items</span></div>
        <div class="progress"><div style="width:${p}%;background:${p >= 80 ? "linear-gradient(90deg,var(--success),var(--cyan))" : p >= 60 ? "linear-gradient(90deg,var(--warning),var(--primary))" : "linear-gradient(90deg,var(--danger),var(--warning))"}"></div></div>
      </div>`;
    }).join("") : `<div class="empty-state" style="padding:20px;">Answer a few questions and your topic breakdown builds here.</div>`;

    $("bestStreak").textContent = (state.bestStreak || 0) + " days";
    $("coverage").textContent = Object.keys(state.questionStats).length + " of " + bank().length;
  }

  function sparkline(values) {
    const w = 300, h = 90, pad = 6;
    const points = [];
    values.forEach((v, i) => {
      if (v === null) return;
      const x = pad + (i / Math.max(1, values.length - 1)) * (w - pad * 2);
      const y = h - pad - (v / 100) * (h - pad * 2);
      points.push([x, y]);
    });
    if (points.length < 2) {
      return `<svg class="spark" viewBox="0 0 ${w} ${h}"><text x="${w / 2}" y="${h / 2}" text-anchor="middle" fill="var(--muted)" font-size="12">Practise on two different days to see a trend</text></svg>`;
    }
    const d = points.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const area = d + ` L${points[points.length - 1][0].toFixed(1)} ${h - pad} L${points[0][0].toFixed(1)} ${h - pad} Z`;
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--primary)" stop-opacity=".35"/>
        <stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="${area}" fill="url(#sg)"/>
      <path d="${d}" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${points.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="var(--primary)"/>`).join("")}
    </svg>`;
  }

  /* =======================================================
     MISTAKES / BOOKMARKS
     ======================================================= */
  function renderMistakes() {
    const items = state.mistakes.map(qById).filter(Boolean);
    $("mistakeCountText").textContent = items.length
      ? items.length + (items.length === 1 ? " question needs review" : " questions need review")
      : "Nothing to review right now";
    const list = $("mistakesList");
    if (!items.length) {
      list.innerHTML = `<div class="empty-state"><div class="emoji">✅</div>Missed questions land here automatically, and leave once you answer them correctly.</div>`;
      return;
    }
    list.innerHTML = items.map((q, i) => `
      <div class="mistake-card">
        <small style="color:var(--danger)">${SUBJECTS[q.subject].short} · ${q.topic}</small>
        <strong>${esc(q.question)}</strong>
        <div class="mistake-answer">Correct answer: <b>${esc(q.choices[q.answer])}</b></div>
        <button class="btn btn-secondary btn-full" style="margin-top:12px;" onclick="toggleExplain('mx${i}')">Why this is the answer</button>
        <div class="explain-box" id="mx${i}">${esc(q.explanation)}</div>
      </div>`).join("") +
      `<button class="btn btn-primary btn-full" onclick="openPractice('mistakes')">Drill these questions</button>`;
  }

  window.toggleExplain = function (id) { $(id).classList.toggle("show"); };

  function renderBookmarks() {
    const items = state.bookmarks.map(qById).filter(Boolean);
    const list = $("bookmarksList");
    if (!items.length) {
      list.innerHTML = `<div class="empty-state"><div class="emoji">🔖</div>Tap Save on any question during practice to keep it here.</div>`;
      return;
    }
    list.innerHTML = items.map(q => `
      <div class="mistake-card">
        <small style="color:var(--primary)">${SUBJECTS[q.subject].short} · ${q.topic}</small>
        <strong>${esc(q.question)}</strong>
        <div class="mistake-answer">Correct answer: <b>${esc(q.choices[q.answer])}</b></div>
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button class="btn btn-secondary" style="flex:1" onclick="removeBookmark('${q.id}')">Remove</button>
        </div>
      </div>`).join("") +
      `<button class="btn btn-primary btn-full" onclick="openPractice('bookmarks')">Practise these</button>`;
  }

  window.removeBookmark = function (id) {
    state.bookmarks = state.bookmarks.filter(b => b !== id);
    save(); renderBookmarks(); toast("Removed from bookmarks");
  };

  /* =======================================================
     PROFILE + SETTINGS
     ======================================================= */
  function initials(name) {
    return name.split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase() || "LR";
  }

  function renderProfile() {
    $("profileAvatar").textContent = initials(user.name);
    $("profileName").textContent = user.name;
    $("profileEmail").textContent = user.guest ? "Guest session on this device" : user.email;
    const track = TRACKS.filter(t => t.id === state.profile.track)[0];
    $("profileTrack").textContent = "🎓 " + (track ? track.name : "Secondary") +
      (state.profile.track === "sec" && state.profile.major !== "Not applicable" ? " · " + state.profile.major : "");
    $("bookmarkBadge").textContent = state.bookmarks.length || "";
    $("statTotalDays").textContent = Object.keys(state.history).length;
    $("guestNotice").classList.toggle("hidden", !user.guest);
    document.querySelectorAll(".theme-opt").forEach(el => el.classList.toggle("active", el.dataset.t === document.body.getAttribute("data-theme")));
  }

  function renderSettings() {
    $("setTrack").value = state.profile.track;
    $("setMajor").innerHTML = MAJORS.map(m => `<option ${state.profile.major === m ? "selected" : ""}>${m}</option>`).join("");
    $("setExamDate").value = state.profile.examDate || "";
    $("setGoal").value = state.profile.dailyGoal;
    $("setName").value = user.name;
    $("soundSwitch").classList.toggle("on", state.profile.sound !== false);
    $("reminderSwitch").classList.toggle("on", state.profile.reminders !== false);
    $("majorGroup").classList.toggle("hidden", $("setTrack").value !== "sec");
  }

  window.onTrackChange = function () {
    $("majorGroup").classList.toggle("hidden", $("setTrack").value !== "sec");
  };

  window.toggleSetting = function (key, el) {
    state.profile[key] = !el.classList.contains("on");
    el.classList.toggle("on", state.profile[key]);
    save();
    if (key === "reminders" && state.profile.reminders) requestReminder();
  };

  window.saveSettings = function () {
    const name = $("setName").value.trim();
    if (name.length < 2) return toast("Enter the name you want shown.");
    Auth.updateProfile({ name });
    user.name = name;
    state.profile.track = $("setTrack").value;
    state.profile.major = $("setMajor").value;
    state.profile.examDate = $("setExamDate").value;
    state.profile.dailyGoal = Math.max(5, parseInt($("setGoal").value, 10) || 30);
    save();
    renderAll();
    toast("Settings saved");
    navigate("profile");
  };

  function requestReminder() {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") Notification.requestPermission();
  }

  window.exportProgress = function () {
    const payload = { app: "LETReady", version: 2, exportedAt: new Date().toISOString(), user: { name: user.name, email: user.email }, state };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "letready-progress-" + today() + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Progress file downloaded");
  };

  window.importProgress = function (input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed.state || parsed.app !== "LETReady") throw new Error("bad file");
        if (!confirm("Replace your current progress with this file?")) return;
        state = Object.assign(blankState(), parsed.state);
        save(); renderAll(); navigate("home");
        toast("Progress restored");
      } catch (e) {
        toast("That file is not a LETReady export.");
      }
      input.value = "";
    };
    reader.readAsText(file);
  };

  window.resetProgress = function () {
    if (!confirm("Erase all your answers, streaks and bookmarks? This cannot be undone.")) return;
    const theme = state.theme, profile = state.profile;
    state = blankState();
    state.theme = theme; state.profile = profile; state.onboarded = true;
    save(); renderAll(); navigate("home");
    toast("Progress cleared");
  };

  window.deleteAccount = function () {
    if (!confirm("Delete this account and everything stored with it?")) return;
    Auth.deleteAccount();
    location.reload();
  };

  window.installApp = function () {
    if (!deferredInstall) return toast("Use your browser menu and choose Add to home screen.");
    deferredInstall.prompt();
    deferredInstall.userChoice.then(() => { deferredInstall = null; $("installBanner").classList.remove("show"); });
  };

  window.dismissInstall = function () { $("installBanner").classList.remove("show"); };

  /* =======================================================
     GLOBAL RENDER
     ======================================================= */
  function renderAll() {
    if (!state) return;
    renderHome(); renderReview(); renderPractice(); renderProgress();
    renderMistakes(); renderBookmarks(); renderProfile();
  }
  window.renderAll = renderAll;

  /* =======================================================
     WIRING
     ======================================================= */
  document.addEventListener("keydown", e => {
    if ($("testScreen").classList.contains("show")) {
      if (e.key === "ArrowRight") nextQuestion();
      if (e.key === "ArrowLeft") previousQuestion();
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4) {
        const btns = document.querySelectorAll("#choices .choice");
        if (btns[n - 1] && !btns[n - 1].disabled) btns[n - 1].click();
      }
    }
  });

  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredInstall = e;
    $("installBanner").classList.add("show");
  });

  function netStatus() { $("offlineChip").classList.toggle("show", !navigator.onLine); }
  window.addEventListener("online", () => { netStatus(); toast("Back online"); });
  window.addEventListener("offline", netStatus);

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(Store.get("theme") || "dark");
    netStatus();

    /* build static selects */
    $("setMajor").innerHTML = MAJORS.map(m => `<option>${m}</option>`).join("");

    const existing = Auth.current();
    setTimeout(() => {
      $("splashScreen").classList.add("hide");
      if (existing) { user = existing; enterApp(); }
      else { $("authScreen").classList.add("show"); }
    }, 1500);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    }
  });

  $("practiceModal").addEventListener("click", function (e) { if (e.target === this) closePractice(); });
})();
