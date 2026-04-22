import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STORAGE_KEY = "edgelift-dashboard-v4";
const LEGACY_STORAGE_KEY = "edgelift-dashboard-v3";
const OLDER_STORAGE_KEY = "edgelift-dashboard-v2";
const OLDEST_STORAGE_KEY = "edgelift-workouts-v1";

const workoutForm = document.getElementById("workoutForm");
const macroForm = document.getElementById("macroForm");
const goalForm = document.getElementById("goalForm");
const hydrationForm = document.getElementById("hydrationForm");
const recoveryForm = document.getElementById("recoveryForm");
const exerciseInput = document.getElementById("exerciseInput");
const weightInput = document.getElementById("weightInput");
const repsInput = document.getElementById("repsInput");
const notesInput = document.getElementById("notesInput");
const mealInput = document.getElementById("mealInput");
const proteinInput = document.getElementById("proteinInput");
const carbsInput = document.getElementById("carbsInput");
const fatsInput = document.getElementById("fatsInput");
const caloriesInput = document.getElementById("caloriesInput");
const goalCaloriesInput = document.getElementById("goalCaloriesInput");
const goalProteinInput = document.getElementById("goalProteinInput");
const goalCarbsInput = document.getElementById("goalCarbsInput");
const goalFatsInput = document.getElementById("goalFatsInput");
const hydrationInput = document.getElementById("hydrationInput");
const hydrationGoalInput = document.getElementById("hydrationGoalInput");
const sleepInput = document.getElementById("sleepInput");
const stepsInput = document.getElementById("stepsInput");
const energyInput = document.getElementById("energyInput");
const sorenessInput = document.getElementById("sorenessInput");
const mobilityInput = document.getElementById("mobilityInput");
const stretchInput = document.getElementById("stretchInput");
const supplementsInput = document.getElementById("supplementsInput");
const templateSelect = document.getElementById("templateSelect");
const applyTemplateButton = document.getElementById("applyTemplateButton");
const exerciseSearch = document.getElementById("exerciseSearch");
const exerciseFilter = document.getElementById("exerciseFilter");
const nextSetCard = document.getElementById("nextSetCard");
const startRestTimerButton = document.getElementById("startRestTimer");
const restTimerDisplay = document.getElementById("restTimerDisplay");
const exportDataButton = document.getElementById("exportDataButton");
const importDataInput = document.getElementById("importDataInput");
const modeBulkButton = document.getElementById("modeBulkButton");
const modeCutButton = document.getElementById("modeCutButton");
const modeMaintainButton = document.getElementById("modeMaintainButton");
const splitModeLabel = document.getElementById("splitModeLabel");
const exerciseList = document.getElementById("exerciseList");
const mealList = document.getElementById("mealList");
const macroBars = document.getElementById("macroBars");
const psychoList = document.getElementById("psychoList");
const prChart = document.getElementById("prChart");
const prChartLabel = document.getElementById("prChartLabel");
const exerciseTrend = document.getElementById("exerciseTrend");
const exerciseTrendLabel = document.getElementById("exerciseTrendLabel");
const clearButton = document.getElementById("clearButton");
const sessionCount = document.getElementById("sessionCount");
const exerciseCount = document.getElementById("exerciseCount");
const topWeight = document.getElementById("topWeight");
const latestLift = document.getElementById("latestLift");
const mostTrained = document.getElementById("mostTrained");
const highlightCard = document.getElementById("highlightCard");
const psychoHeadline = document.getElementById("psychoHeadline");
const psychoSubhead = document.getElementById("psychoSubhead");
const threatLevel = document.getElementById("threatLevel");
const prTarget = document.getElementById("prTarget");
const prAdvice = document.getElementById("prAdvice");
const heavyFocus = document.getElementById("heavyFocus");
const heavyAdvice = document.getElementById("heavyAdvice");
const psychoRank = document.getElementById("psychoRank");
const psychoRankDetail = document.getElementById("psychoRankDetail");
const bossFightName = document.getElementById("bossFightName");
const bossFightDetail = document.getElementById("bossFightDetail");
const bountyBoard = document.getElementById("bountyBoard");
const bountyBoardLabel = document.getElementById("bountyBoardLabel");
const calorieTotal = document.getElementById("calorieTotal");
const proteinTotal = document.getElementById("proteinTotal");
const carbsTotal = document.getElementById("carbsTotal");
const fatsTotal = document.getElementById("fatsTotal");
const hydrationTotal = document.getElementById("hydrationTotal");
const calorieGoalStatus = document.getElementById("calorieGoalStatus");
const proteinGoalStatus = document.getElementById("proteinGoalStatus");
const carbsGoalStatus = document.getElementById("carbsGoalStatus");
const fatsGoalStatus = document.getElementById("fatsGoalStatus");
const hydrationStatus = document.getElementById("hydrationStatus");
const nutritionHistory = document.getElementById("nutritionHistory");
const nutritionHistoryLabel = document.getElementById("nutritionHistoryLabel");
const exerciseTemplate = document.getElementById("exerciseTemplate");
const operatorRank = document.getElementById("operatorRank");
const rankProgress = document.getElementById("rankProgress");
const recoveryStatus = document.getElementById("recoveryStatus");
const recoverySummary = document.getElementById("recoverySummary");
const streakCount = document.getElementById("streakCount");
const streakSummary = document.getElementById("streakSummary");
const missionBoard = document.getElementById("missionBoard");
const missionSummary = document.getElementById("missionSummary");
const weeklyBoard = document.getElementById("weeklyBoard");

let state = loadState();
let restTimerId = null;
let restTimerRemaining = 90;
let suppressRemoteSave = false;
let syncTimeoutId = null;

const supabaseUrl = window.EDGELIFT_SUPABASE_URL || "";
const supabaseAnonKey = window.EDGELIFT_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
let currentSession = null;
let currentUser = null;

function defaultGoals() {
  return { calories: 2600, protein: 180, carbs: 260, fats: 75 };
}

function defaultRecovery() {
  return {
    sleepHours: 0,
    steps: 0,
    energy: 0,
    soreness: 0,
    mobilityDone: false,
    stretchDone: false,
    supplementsDone: false,
    updatedAt: ""
  };
}

function defaultTemplates() {
  return [
    { id: "template-push", name: "Push Day", exercise: "Bench Press", weight: 185, reps: 8, notes: "Top set before accessories" },
    { id: "template-pull", name: "Pull Day", exercise: "Barbell Row", weight: 155, reps: 10, notes: "Drive elbows back hard" },
    { id: "template-legs", name: "Leg Day", exercise: "Back Squat", weight: 225, reps: 5, notes: "Brace hard and own the hole" },
    { id: "template-upper", name: "Upper Power", exercise: "Overhead Press", weight: 115, reps: 6, notes: "Explosive first rep" }
  ];
}

function defaultProgression() {
  return {
    bonusXp: 0,
    daily: { key: "", claimed: {} },
    weekly: { key: "", claimed: {} }
  };
}

function makeId(prefix = "entry") {
  if (globalThis.crypto?.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeNumber(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeWorkout(workout) {
  return {
    id: workout.id || makeId("workout"),
    exercise: titleCase(workout.exercise || workout.name || "Unknown Lift"),
    weight: safeNumber(workout.weight),
    reps: safeNumber(workout.reps, 1),
    notes: String(workout.notes || "").trim(),
    createdAt: workout.createdAt || new Date().toISOString()
  };
}

function normalizeMeal(meal) {
  return {
    id: meal.id || makeId("meal"),
    name: titleCase(meal.name || meal.meal || "Meal"),
    protein: safeNumber(meal.protein),
    carbs: safeNumber(meal.carbs),
    fats: safeNumber(meal.fats),
    calories: safeNumber(meal.calories),
    createdAt: meal.createdAt || new Date().toISOString()
  };
}

function normalizeHydrationLog(log) {
  return {
    id: log.id || makeId("water"),
    amount: safeNumber(log.amount),
    createdAt: log.createdAt || new Date().toISOString()
  };
}

function normalizeTemplate(template) {
  return {
    id: template.id || makeId("template"),
    name: String(template.name || "Template").trim(),
    exercise: titleCase(template.exercise || "Bench Press"),
    weight: safeNumber(template.weight),
    reps: safeNumber(template.reps, 1),
    notes: String(template.notes || "").trim()
  };
}

function normalizeState(source = {}) {
  const progression = source.progression || defaultProgression();
  return {
    workouts: Array.isArray(source.workouts) ? source.workouts.map(normalizeWorkout) : [],
    meals: Array.isArray(source.meals) ? source.meals.map(normalizeMeal) : [],
    goals: {
      calories: safeNumber(source.goals?.calories, defaultGoals().calories),
      protein: safeNumber(source.goals?.protein, defaultGoals().protein),
      carbs: safeNumber(source.goals?.carbs, defaultGoals().carbs),
      fats: safeNumber(source.goals?.fats, defaultGoals().fats)
    },
    hydrationLogs: Array.isArray(source.hydrationLogs) ? source.hydrationLogs.map(normalizeHydrationLog) : [],
    hydrationGoal: safeNumber(source.hydrationGoal, 120),
    splitMode: ["bulk", "cut", "maintain"].includes(source.splitMode) ? source.splitMode : "maintain",
    recovery: {
      sleepHours: safeNumber(source.recovery?.sleepHours),
      steps: safeNumber(source.recovery?.steps),
      energy: safeNumber(source.recovery?.energy),
      soreness: safeNumber(source.recovery?.soreness),
      mobilityDone: Boolean(source.recovery?.mobilityDone),
      stretchDone: Boolean(source.recovery?.stretchDone),
      supplementsDone: Boolean(source.recovery?.supplementsDone),
      updatedAt: source.recovery?.updatedAt || ""
    },
    progression: {
      bonusXp: safeNumber(progression.bonusXp),
      daily: {
        key: progression.daily?.key || "",
        claimed: progression.daily?.claimed && typeof progression.daily.claimed === "object" ? progression.daily.claimed : {}
      },
      weekly: {
        key: progression.weekly?.key || "",
        claimed: progression.weekly?.claimed && typeof progression.weekly.claimed === "object" ? progression.weekly.claimed : {}
      }
    },
    templates: Array.isArray(source.templates) && source.templates.length
      ? source.templates.map(normalizeTemplate)
      : defaultTemplates()
  };
}

function loadState() {
  const keys = [STORAGE_KEY, LEGACY_STORAGE_KEY, OLDER_STORAGE_KEY];
  for (const key of keys) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return normalizeState(JSON.parse(saved));
      }
    } catch {}
  }

  try {
    const older = localStorage.getItem(OLDEST_STORAGE_KEY);
    const workouts = older ? JSON.parse(older) : [];
    return normalizeState({ workouts });
  } catch {}

  return normalizeState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  queueRemoteSave();
}

function topbarElement() {
  return document.querySelector(".topbar");
}

function authPanelMarkup() {
  const mode = supabase ? "cloud" : "local";
  const identity = currentUser?.email || (mode === "cloud" ? "Cloud offline" : "Local mode");
  const actionButton = currentUser
    ? '<button type="button" class="ghost-btn" id="authSignOutButton">Sign Out</button>'
    : supabase
      ? '<button type="submit" class="primary-btn">Enter Cloud</button>'
      : "";
  const formFields = currentUser || !supabase
    ? `<p class="auth-copy">${currentUser ? "Synced to Supabase. Your tracker will persist across devices." : "Fill in supabase-config.js to enable account sync and cloud saves."}</p>`
    : `<label><span>Email</span><input id="authEmailInput" type="email" placeholder="runner@nightcity.dev" required></label><label><span>Password</span><input id="authPasswordInput" type="password" placeholder="Minimum 6 characters" required minlength="6"></label><div class="auth-actions"><button type="button" class="ghost-btn" id="authCreateButton">Create Account</button>${actionButton}<button type="button" class="ghost-btn" id="authResetButton">Reset Password</button></div>`;
  return `<aside class="auth-shell panel"><div class="auth-heading"><p class="eyebrow">${mode === "cloud" ? "Cloud Sync" : "Offline Mode"}</p><strong>${identity}</strong></div><form id="authForm" class="auth-form">${formFields}</form><p id="authStatus" class="auth-status">${supabase ? (currentUser ? "Cloud sync active." : "Sign in or create an account to persist your tracker.") : "Using local storage only."}</p></aside>`;
}

function injectAuthShell() {
  const topbar = topbarElement();
  if (!topbar) {
    return;
  }
  let existing = document.getElementById("authShell");
  if (!existing) {
    existing = document.createElement("div");
    existing.id = "authShell";
    topbar.appendChild(existing);
  }
  existing.innerHTML = authPanelMarkup();
  bindAuthUi();
}

function setAuthStatus(message, isError = false) {
  const node = document.getElementById("authStatus");
  if (!node) {
    return;
  }
  node.textContent = message;
  node.classList.toggle("error", isError);
}

function bindAuthUi() {
  const form = document.getElementById("authForm");
  const createButton = document.getElementById("authCreateButton");
  const resetButton = document.getElementById("authResetButton");
  const signOutButton = document.getElementById("authSignOutButton");
  if (form && supabase && !currentUser) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("authEmailInput")?.value.trim();
      const password = document.getElementById("authPasswordInput")?.value;
      if (!email || !password) {
        setAuthStatus("Email and password are required.", true);
        return;
      }
      setAuthStatus("Signing in...");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthStatus(error.message, true);
      }
    });
  }
  if (createButton && supabase) {
    createButton.addEventListener("click", async () => {
      const email = document.getElementById("authEmailInput")?.value.trim();
      const password = document.getElementById("authPasswordInput")?.value;
      if (!email || !password) {
        setAuthStatus("Email and password are required.", true);
        return;
      }
      setAuthStatus("Creating account...");
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.href }
      });
      setAuthStatus(error ? error.message : "Account created. Check your email if confirmations are enabled.", Boolean(error));
    });
  }
  if (resetButton && supabase) {
    resetButton.addEventListener("click", async () => {
      const email = document.getElementById("authEmailInput")?.value.trim();
      if (!email) {
        setAuthStatus("Enter your email first, then request a reset.", true);
        return;
      }
      setAuthStatus("Sending password reset...");
      const redirectTo = new URL("reset-password.html", window.location.href).toString();
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      setAuthStatus(error ? error.message : "Password reset email sent. Check your inbox.", Boolean(error));
    });
  }
  if (signOutButton && supabase) {
    signOutButton.addEventListener("click", async () => {
      await supabase.auth.signOut();
    });
  }
}

async function loadRemoteState() {
  if (!supabase || !currentUser) {
    return;
  }
  const { data, error } = await supabase
    .from("user_app_state")
    .select("state")
    .eq("user_id", currentUser.id)
    .maybeSingle();
  if (error) {
    setAuthStatus(error.message, true);
    return;
  }
  if (data?.state) {
    suppressRemoteSave = true;
    state = normalizeState(data.state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    suppressRemoteSave = false;
    renderDashboard();
    setAuthStatus("Cloud state loaded.");
    return;
  }
  await persistRemoteState();
  setAuthStatus("Local state uploaded to cloud.");
}

async function persistRemoteState() {
  if (!supabase || !currentUser || suppressRemoteSave) {
    return;
  }
  const { error } = await supabase
    .from("user_app_state")
    .upsert({ user_id: currentUser.id, state }, { onConflict: "user_id" });
  if (error) {
    setAuthStatus(error.message, true);
    return;
  }
  setAuthStatus("Cloud sync active.");
}

function queueRemoteSave() {
  if (!supabase || !currentUser || suppressRemoteSave) {
    return;
  }
  if (syncTimeoutId) {
    clearTimeout(syncTimeoutId);
  }
  syncTimeoutId = setTimeout(() => {
    persistRemoteState();
  }, 300);
}

function formatWeight(value) {
  return `${Number(value).toFixed(value % 1 === 0 ? 0 : 1)} lb`;
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function titleCase(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function dateKey(value = new Date()) {
  const date = new Date(value);
  return date.toLocaleDateString("en-CA");
}

function weekKey(value = new Date()) {
  const date = new Date(value);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + diff);
  return date.toLocaleDateString("en-CA");
}

function isToday(isoString) {
  return dateKey(isoString) === dateKey();
}

function groupedExercises() {
  return state.workouts.reduce((acc, workout) => {
    if (!acc[workout.exercise]) {
      acc[workout.exercise] = [];
    }
    acc[workout.exercise].push(workout);
    return acc;
  }, {});
}

function estimateOneRepMax(weight, reps) {
  return reps === 1 ? weight : weight * (1 + reps / 30);
}

function setText(node, value) {
  if (node) {
    node.textContent = value;
  }
}

function setHtml(node, value) {
  if (node) {
    node.innerHTML = value;
  }
}

function todayHydration() {
  return state.hydrationLogs
    .filter((entry) => isToday(entry.createdAt))
    .reduce((sum, entry) => sum + entry.amount, 0);
}

function todayMacros() {
  return state.meals
    .filter((meal) => isToday(meal.createdAt))
    .reduce((totals, meal) => {
      totals.calories += meal.calories;
      totals.protein += meal.protein;
      totals.carbs += meal.carbs;
      totals.fats += meal.fats;
      return totals;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
}

function weeklySessionCount() {
  const currentWeek = weekKey();
  return state.workouts.filter((workout) => weekKey(workout.createdAt) === currentWeek).length;
}

function activityStreak() {
  const keys = new Set([
    ...state.workouts.map((entry) => dateKey(entry.createdAt)),
    ...state.meals.map((entry) => dateKey(entry.createdAt)),
    ...state.hydrationLogs.map((entry) => dateKey(entry.createdAt))
  ]);
  if (!keys.size) {
    return 0;
  }

  let streak = 0;
  const cursor = new Date();
  while (keys.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function recoveryMetrics() {
  const recovery = state.recovery || defaultRecovery();
  const hydrationPct = state.hydrationGoal > 0 ? Math.min(100, Math.round((todayHydration() / state.hydrationGoal) * 100)) : 0;
  const checklist = [recovery.mobilityDone, recovery.stretchDone, recovery.supplementsDone].filter(Boolean).length;
  const sleepScore = Math.min(100, Math.round((recovery.sleepHours / 8) * 100));
  const energyScore = recovery.energy > 0 ? recovery.energy * 10 : 0;
  const sorenessScore = recovery.soreness > 0 ? Math.max(0, 100 - recovery.soreness * 10) : 0;
  const stepScore = Math.min(100, Math.round((recovery.steps / 8000) * 100));
  const score = Math.round((sleepScore + energyScore + sorenessScore + stepScore + hydrationPct + checklist * 33) / 6);

  let status = "Offline";
  if (score >= 85) status = "Chrome Stable";
  else if (score >= 65) status = "Combat Ready";
  else if (score >= 45) status = "Needs Cooldown";
  else if (score > 0) status = "Overclocked";

  return { score, status, hydrationPct, checklist };
}

function ensureQuestCycles() {
  const today = dateKey();
  const currentWeek = weekKey();
  if (state.progression.daily.key !== today) {
    state.progression.daily = { key: today, claimed: {} };
  }
  if (state.progression.weekly.key !== currentWeek) {
    state.progression.weekly = { key: currentWeek, claimed: {} };
  }
}

function xpScore() {
  const recovery = recoveryMetrics();
  return (
    state.workouts.length * 20 +
    state.meals.length * 8 +
    activityStreak() * 12 +
    recovery.checklist * 15 +
    Math.round(recovery.score / 5) +
    state.progression.bonusXp
  );
}

function operatorRankData() {
  const xp = xpScore();
  const tiers = [
    { name: "Rookie", min: 0, next: 300 },
    { name: "Street Runner", min: 300, next: 700 },
    { name: "Crew Driver", min: 700, next: 1300 },
    { name: "Night City Legend", min: 1300, next: 2200 },
    { name: "Chrome Phantom", min: 2200, next: null }
  ];
  const current = [...tiers].reverse().find((tier) => xp >= tier.min) || tiers[0];
  const next = tiers.find((tier) => tier.min === current.next) || null;
  return {
    xp,
    name: current.name,
    progressText: next
      ? `${Math.max(0, next.min - xp)} rep until ${next.name}`
      : "Max rank reached. Keep farming contracts."
  };
}

function calculateStats() {
  const groups = groupedExercises();
  const exercises = Object.keys(groups);
  const heaviest = state.workouts.reduce((max, workout) => Math.max(max, workout.weight), 0);
  const latest = state.workouts[0];

  let mostFrequent = "Waiting...";
  if (exercises.length > 0) {
    mostFrequent = exercises
      .map((exercise) => ({ exercise, count: groups[exercise].length }))
      .sort((a, b) => b.count - a.count)[0].exercise;
  }

  setText(sessionCount, state.workouts.length);
  setText(exerciseCount, exercises.length);
  setText(topWeight, formatWeight(heaviest));
  setText(latestLift, latest ? `${latest.exercise} | ${formatWeight(latest.weight)} x ${latest.reps}` : "Waiting...");
  setText(mostTrained, mostFrequent);

  if (!highlightCard) {
    return;
  }

  if (!latest) {
    setHtml(highlightCard, "<p>No data yet. Log your first set to bring the board online.</p>");
    return;
  }

  const totalVolume = state.workouts.reduce((sum, workout) => sum + workout.weight * workout.reps, 0);
  const todaySessions = state.workouts.filter((entry) => isToday(entry.createdAt)).length;
  setHtml(
    highlightCard,
    `<h3>${latest.exercise}</h3><p>Last logged ${formatWeight(latest.weight)} for ${latest.reps} reps.</p><p>Total volume pushed: ${Math.round(totalVolume).toLocaleString()} lb | Today: ${todaySessions} logged set${todaySessions === 1 ? "" : "s"}.</p>`
  );
}

function heavyLiftProfiles() {
  return Object.entries(groupedExercises())
    .map(([exercise, entries]) => {
      const bestWeight = entries.reduce((max, entry) => Math.max(max, entry.weight), 0);
      const bestSet = entries.reduce((best, entry) => {
        return estimateOneRepMax(entry.weight, entry.reps) > estimateOneRepMax(best.weight, best.reps) ? entry : best;
      }, entries[0]);
      const prGoal = Math.ceil((bestWeight + 5) * 2) / 2;
      const oneRepMax = Math.round(estimateOneRepMax(bestSet.weight, bestSet.reps));
      return {
        exercise,
        entries,
        bestWeight,
        bestSet,
        prGoal,
        oneRepMax,
        intensityScore: oneRepMax + entries.length * 2
      };
    })
    .sort((a, b) => b.intensityScore - a.intensityScore);
}

function nextSetSuggestion(exerciseName) {
  const targetExercise = titleCase(exerciseName || exerciseInput?.value || "");
  if (!targetExercise) {
    return null;
  }
  const entries = state.workouts.filter((workout) => workout.exercise === targetExercise);
  if (!entries.length) {
    return { exercise: targetExercise, weight: "", reps: "", copy: "New lift detected. Start at a strong clean working weight and log the first benchmark set." };
  }

  const latest = [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  const weightJump = latest.reps >= 8 ? 5 : latest.reps >= 5 ? 2.5 : 0;
  const suggestedWeight = latest.weight + weightJump;
  const suggestedReps = weightJump > 0 ? Math.max(5, latest.reps - 1) : latest.reps + 1;
  return {
    exercise: targetExercise,
    weight: suggestedWeight,
    reps: suggestedReps,
    copy: weightJump > 0
      ? `Progression looks clean. Push ${formatWeight(suggestedWeight)} for ${suggestedReps} reps on the next working set.`
      : `Keep the load at ${formatWeight(latest.weight)} and beat the last rep count with ${suggestedReps} reps.`
  };
}

function todayWorkoutCount() {
  return state.workouts.filter((entry) => isToday(entry.createdAt)).length;
}

function hydrationHitDaysThisWeek() {
  const grouped = state.hydrationLogs.reduce((acc, entry) => {
    if (weekKey(entry.createdAt) !== weekKey()) {
      return acc;
    }
    const key = dateKey(entry.createdAt);
    acc[key] = (acc[key] || 0) + entry.amount;
    return acc;
  }, {});
  return Object.values(grouped).filter((amount) => amount >= state.hydrationGoal).length;
}

function weeklyMealCount() {
  return state.meals.filter((entry) => weekKey(entry.createdAt) === weekKey()).length;
}

function weeklyVolume() {
  return state.workouts
    .filter((entry) => weekKey(entry.createdAt) === weekKey())
    .reduce((sum, entry) => sum + entry.weight * entry.reps, 0);
}

function hasProgressionToday() {
  const todays = state.workouts.filter((entry) => isToday(entry.createdAt));
  return todays.some((entry) => {
    const previous = state.workouts
      .filter((candidate) => candidate.exercise === entry.exercise && new Date(candidate.createdAt) < new Date(entry.createdAt))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    if (!previous) {
      return false;
    }
    return entry.weight > previous.weight || (entry.weight === previous.weight && entry.reps > previous.reps);
  });
}

function questProgress(quest) {
  return Math.min(100, Math.round((quest.current / quest.target) * 100));
}

function isQuestComplete(quest) {
  return quest.current >= quest.target;
}

function generateDailyQuests() {
  const today = todayMacros();
  const recovery = recoveryMetrics();
  const claimed = state.progression.daily.claimed;
  return [
    {
      id: "daily-session",
      label: "Session Contract",
      title: "Log 1 workout session",
      copy: "Get at least one tracked set into the archive today.",
      reward: 40,
      current: todayWorkoutCount(),
      target: 1,
      claimed: Boolean(claimed["daily-session"])
    },
    {
      id: "daily-protein",
      label: "Protein Feed",
      title: "Hit your protein goal",
      copy: "Close your intake target to support the next lift cycle.",
      reward: 30,
      current: today.protein,
      target: state.goals.protein || 1,
      claimed: Boolean(claimed["daily-protein"])
    },
    {
      id: "daily-hydration",
      label: "Hydration Loop",
      title: "Hit your hydration goal",
      copy: "Keep the cooling system topped up before the chrome starts sparking.",
      reward: 25,
      current: todayHydration(),
      target: state.hydrationGoal || 1,
      claimed: Boolean(claimed["daily-hydration"])
    },
    {
      id: "daily-recovery",
      label: "Recovery Sync",
      title: "Complete recovery checklist",
      copy: "Mobility, stretch, and supplements are easy wins for the board.",
      reward: 35,
      current: recovery.checklist,
      target: 3,
      claimed: Boolean(claimed["daily-recovery"])
    },
    {
      id: "daily-progression",
      label: "Progression Ping",
      title: "Beat your last logged set",
      copy: "Match a previous lift and add either weight or reps today.",
      reward: 45,
      current: hasProgressionToday() ? 1 : 0,
      target: 1,
      claimed: Boolean(claimed["daily-progression"])
    }
  ];
}

function generateWeeklyContracts() {
  const profiles = heavyLiftProfiles();
  const nearPr = profiles[0];
  const claimed = state.progression.weekly.claimed;
  return [
    {
      id: "weekly-sessions",
      label: "Weekly Volume",
      title: "Complete 4 workout sessions",
      copy: "Stay active across the week to keep district heat climbing.",
      reward: 120,
      current: weeklySessionCount(),
      target: 4,
      claimed: Boolean(claimed["weekly-sessions"])
    },
    {
      id: "weekly-meals",
      label: "Fuel Coverage",
      title: "Log 10 meals this week",
      copy: "Build a stable nutrition trail instead of eating off memory.",
      reward: 90,
      current: weeklyMealCount(),
      target: 10,
      claimed: Boolean(claimed["weekly-meals"])
    },
    {
      id: "weekly-hydration",
      label: "Cooling System",
      title: "Hit hydration goal on 4 days",
      copy: "Make hydration a pattern, not a panic button.",
      reward: 80,
      current: hydrationHitDaysThisWeek(),
      target: 4,
      claimed: Boolean(claimed["weekly-hydration"])
    },
    {
      id: "weekly-boss",
      label: "Boss Fight",
      title: nearPr ? `Push ${nearPr.exercise} to ${formatWeight(nearPr.prGoal)}` : "Unlock a boss fight",
      copy: nearPr ? "Close the gap to your next tracked PR and collect a bigger rep payout." : "Log enough heavy work to queue up a weekly boss contract.",
      reward: 150,
      current: nearPr ? nearPr.bestWeight : 0,
      target: nearPr ? nearPr.prGoal : 1,
      claimed: Boolean(claimed["weekly-boss"])
    },
    {
      id: "weekly-capacity",
      label: "Capacity Run",
      title: "Accumulate 12000 lb weekly volume",
      copy: "Build enough weekly work to make the PR attempts matter.",
      reward: 110,
      current: Math.round(weeklyVolume()),
      target: 12000,
      claimed: Boolean(claimed["weekly-capacity"])
    }
  ];
}

function renderQuestBoard(container, quests, type) {
  if (!container) {
    return;
  }
  container.innerHTML = "";
  quests.forEach((quest, index) => {
    const complete = isQuestComplete(quest);
    const card = document.createElement("article");
    card.className = `mission-card${index === 0 ? " accent" : ""}${complete ? " complete" : ""}${quest.claimed ? " claimed" : ""}`;
    const buttonLabel = quest.claimed ? "Claimed" : complete ? `Claim +${quest.reward} XP` : "In Progress";
    card.innerHTML = `<span class="stat-label">${quest.label}</span><strong>${quest.title}</strong><div class="mission-progress"><span style="width:${questProgress(quest)}%"></span></div><p>${quest.copy}</p><div class="quest-meta"><span>${quest.current} / ${quest.target}</span><span>Reward +${quest.reward} XP</span></div><div class="quest-actions"><span class="quest-pill">${quest.claimed ? "Closed" : complete ? "Complete" : "Active"}</span><button type="button" class="${complete && !quest.claimed ? "primary-btn" : "ghost-btn"}" data-quest-id="${quest.id}" data-quest-type="${type}" ${!complete || quest.claimed ? "disabled" : ""}>${buttonLabel}</button></div>`;
    container.appendChild(card);
  });
}

function renderMissionBoard() {
  const dailyQuests = generateDailyQuests();
  const weeklyContracts = generateWeeklyContracts();
  renderQuestBoard(missionBoard, dailyQuests, "daily");
  renderQuestBoard(weeklyBoard, weeklyContracts, "weekly");

  if (missionSummary) {
    const claimedToday = dailyQuests.filter((quest) => quest.claimed).length;
    const claimableToday = dailyQuests.filter((quest) => isQuestComplete(quest) && !quest.claimed).length;
    const claimedWeek = weeklyContracts.filter((quest) => quest.claimed).length;
    missionSummary.innerHTML = `<article class="system-card accent"><span class="stat-label">Daily Status</span><strong>${claimedToday}/${dailyQuests.length} claimed</strong><p>${claimableToday ? `${claimableToday} quest${claimableToday === 1 ? "" : "s"} ready to claim.` : "No unclaimed daily rewards right now."}</p></article><article class="system-card"><span class="stat-label">Weekly Status</span><strong>${claimedWeek}/${weeklyContracts.length} claimed</strong><p>Week of ${state.progression.weekly.key || weekKey()} is live.</p></article><article class="system-card"><span class="stat-label">Bonus Rep</span><strong>${state.progression.bonusXp} XP</strong><p>Quest rewards now feed directly into your rank climb.</p></article>`;
  }
}

function claimQuest(type, id) {
  const quests = type === "weekly" ? generateWeeklyContracts() : generateDailyQuests();
  const quest = quests.find((entry) => entry.id === id);
  if (!quest || !isQuestComplete(quest) || quest.claimed) {
    return;
  }
  state.progression[type].claimed[id] = true;
  state.progression.bonusXp += quest.reward;
  saveState();
  renderDashboard();
}

function renderOverviewSystems() {
  const rank = operatorRankData();
  const recovery = recoveryMetrics();
  const streak = activityStreak();
  setText(operatorRank, rank.name);
  setText(rankProgress, rank.progressText);
  setText(recoveryStatus, recovery.status);
  setText(recoverySummary, `Recovery score ${recovery.score}/100 with hydration at ${recovery.hydrationPct}% of goal.`);
  setText(streakCount, `${streak} day${streak === 1 ? "" : "s"}`);
  setText(streakSummary, streak ? "District activity is live. Keep the loop going tomorrow." : "Log food, water, or training today to ignite a streak.");
  renderMissionBoard();
}

function renderPrChart(profiles) {
  if (!prChart) {
    return;
  }

  prChart.innerHTML = "";
  if (profiles.length === 0) {
    setText(prChartLabel, "Your strongest sets will chart here once you have enough data.");
    prChart.innerHTML = '<div class="empty-state">Add a few heavy sets to generate a PR progression trace.</div>';
    return;
  }

  const rankedSets = [...state.workouts]
    .sort((a, b) => estimateOneRepMax(b.weight, b.reps) - estimateOneRepMax(a.weight, a.reps))
    .slice(0, 6);
  const max1RM = rankedSets.reduce((max, set) => Math.max(max, estimateOneRepMax(set.weight, set.reps)), 1);
  setText(prChartLabel, `Top ${rankedSets.length} heavy sets ranked by estimated 1RM.`);

  rankedSets.slice().reverse().forEach((set) => {
    const est = Math.round(estimateOneRepMax(set.weight, set.reps));
    const height = Math.max(18, Math.round((est / max1RM) * 150));
    const column = document.createElement("article");
    column.className = "chart-column";
    column.innerHTML = `<span>${set.exercise}</span><div class="chart-bar" style="height:${height}px"></div><strong>${est} lb est.</strong><span>${formatWeight(set.weight)} x ${set.reps}</span>`;
    prChart.appendChild(column);
  });
}

function renderExerciseTrend(profiles) {
  if (!exerciseTrend) {
    return;
  }

  exerciseTrend.innerHTML = "";
  if (profiles.length === 0) {
    setText(exerciseTrendLabel, "Pick up more workout history to unlock an exercise-specific trend line.");
    exerciseTrend.innerHTML = '<div class="empty-state">Log repeat sessions for the same lift to build a visible trend.</div>';
    return;
  }

  const trendSource = [...profiles].sort((a, b) => b.entries.length - a.entries.length)[0];
  const points = [...trendSource.entries].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(-6);
  const maxWeight = points.reduce((max, entry) => Math.max(max, entry.weight), 1);
  setText(exerciseTrendLabel, `${trendSource.exercise} progression across your latest ${points.length} logged set${points.length === 1 ? "" : "s"}.`);

  points.forEach((entry) => {
    const height = Math.max(18, Math.round((entry.weight / maxWeight) * 150));
    const point = document.createElement("article");
    point.className = "trend-point";
    point.innerHTML = `<span>${new Date(entry.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span><div class="trend-line" style="height:${height}px"></div><strong>${formatWeight(entry.weight)}</strong><span>${entry.reps} reps</span>`;
    exerciseTrend.appendChild(point);
  });
}

function renderBountyBoard(profiles) {
  if (!bountyBoard) {
    return;
  }

  bountyBoard.innerHTML = "";
  if (!profiles.length) {
    setText(bountyBoardLabel, "Contracts for PRs, consistency, and recovery discipline.");
    bountyBoard.innerHTML = '<div class="empty-state">Heavy contracts will populate after your first tracked sessions.</div>';
    return;
  }

  const recovery = recoveryMetrics();
  const streak = activityStreak();
  const bounties = [
    {
      title: `${profiles[0].exercise} Boss Fight`,
      copy: `Queue ${formatWeight(profiles[0].prGoal)} to chase the next PR checkpoint.`,
      meta: `${formatWeight(profiles[0].bestWeight)} current best`
    },
    {
      title: "District Heat",
      copy: `Current streak is ${streak} day${streak === 1 ? "" : "s"}. Push to 7 for legend status.`,
      meta: `${weeklySessionCount()} sessions logged this week`
    },
    {
      title: "Recovery Discipline",
      copy: `Recovery status is ${recovery.status}. Keep sleep and hydration high before max-out days.`,
      meta: `Recovery score ${recovery.score}/100`
    }
  ];

  bounties.forEach((bounty) => {
    const card = document.createElement("article");
    card.className = "bounty-card";
    card.innerHTML = `<span class="milestone-label">${bounty.meta}</span><strong>${bounty.title}</strong><p>${bounty.copy}</p>`;
    bountyBoard.appendChild(card);
  });
}

function renderCyberPsycho() {
  const profiles = heavyLiftProfiles();
  if (psychoList) {
    psychoList.innerHTML = "";
  }
  renderPrChart(profiles);
  renderExerciseTrend(profiles);
  renderBountyBoard(profiles);

  const rank = operatorRankData();
  setText(psychoRank, rank.name);
  setText(psychoRankDetail, rank.progressText);

  if (!psychoHeadline && !heavyFocus) {
    return;
  }

  if (profiles.length === 0) {
    setText(psychoHeadline, "No max-out target yet");
    setText(psychoSubhead, "Log heavy sessions to light up PR targets and max-effort recommendations.");
    setText(threatLevel, "Dormant");
    setText(prTarget, "Waiting...");
    setText(prAdvice, "Your next personal record target will show up here.");
    setText(heavyFocus, "Waiting...");
    setText(heavyAdvice, "Build a few tracked lifts and this module will recommend where to attack.");
    setText(bossFightName, "Waiting...");
    setText(bossFightDetail, "Your next milestone session will queue up here.");
    if (psychoList) {
      psychoList.innerHTML = '<div class="empty-state">Heavy-day targets will appear here once you have enough lift history to hunt PRs.</div>';
    }
    return;
  }

  const apex = profiles[0];
  const nearPr = [...profiles].sort((a, b) => (a.prGoal - a.bestWeight) - (b.prGoal - b.bestWeight))[0];
  const recovery = recoveryMetrics();
  const status = recovery.score < 45 ? "Unstable" : apex.bestWeight >= 315 || apex.oneRepMax >= 365 ? "Critical" : apex.bestWeight >= 225 ? "High" : "Ramping";

  setText(psychoHeadline, `${apex.exercise} is your next rage channel`);
  setText(psychoSubhead, `Estimated 1RM ${apex.oneRepMax} lb based on your heaviest tracked set.`);
  setText(threatLevel, status);
  setText(prTarget, `${nearPr.exercise} -> ${formatWeight(nearPr.prGoal)}`);
  setText(prAdvice, `You are ${formatWeight(nearPr.prGoal - nearPr.bestWeight)} away from the next recorded weight PR.`);
  setText(heavyFocus, `${apex.exercise} | ${formatWeight(apex.bestSet.weight)} x ${apex.bestSet.reps}`);
  setText(heavyAdvice, `Prime heavy day around ${Math.round(apex.oneRepMax * 0.9)} to ${Math.round(apex.oneRepMax * 0.97)} lb for singles or doubles.`);
  setText(bossFightName, `${nearPr.exercise} PR Raid`);
  setText(bossFightDetail, `Mission path: warm up clean, then attack ${formatWeight(nearPr.prGoal)} once recovery status is ${recovery.status}.`);

  if (!psychoList || !exerciseTemplate) {
    return;
  }

  profiles.slice(0, 3).forEach((profile) => {
    const fragment = exerciseTemplate.content.cloneNode(true);
    fragment.querySelector(".exercise-name").textContent = profile.exercise;
    fragment.querySelector(".exercise-meta").textContent = `Est. 1RM ${profile.oneRepMax} lb | ${profile.entries.length} tracked sets`;
    fragment.querySelector(".exercise-pr").textContent = `Next PR ${formatWeight(profile.prGoal)}`;
    const setList = fragment.querySelector(".set-list");

    [
      `Best weight | ${formatWeight(profile.bestWeight)}`,
      `Heavy set | ${formatWeight(profile.bestSet.weight)} x ${profile.bestSet.reps}`,
      `Attack zone | ${Math.round(profile.oneRepMax * 0.92)}-${Math.round(profile.oneRepMax * 0.97)} lb`
    ].forEach((line) => {
      const [title, body] = line.split(" | ");
      const chip = document.createElement("div");
      chip.className = "set-chip";
      chip.innerHTML = `<strong>${title}</strong><span>${body}</span>`;
      setList.appendChild(chip);
    });

    psychoList.appendChild(fragment);
  });
}

function populateTemplateSelect() {
  if (!templateSelect) {
    return;
  }
  const current = templateSelect.value;
  templateSelect.innerHTML = '<option value="">Choose a workout template</option>';
  state.templates.forEach((template) => {
    const option = document.createElement("option");
    option.value = template.id;
    option.textContent = `${template.name} | ${template.exercise}`;
    templateSelect.appendChild(option);
  });
  templateSelect.value = current;
}

function populateExerciseFilter() {
  if (!exerciseFilter) {
    return;
  }
  const current = exerciseFilter.value;
  exerciseFilter.innerHTML = '<option value="">All exercises</option>';
  Object.keys(groupedExercises())
    .sort((a, b) => a.localeCompare(b))
    .forEach((exercise) => {
      const option = document.createElement("option");
      option.value = exercise;
      option.textContent = exercise;
      exerciseFilter.appendChild(option);
    });
  if ([...exerciseFilter.options].some((option) => option.value === current)) {
    exerciseFilter.value = current;
  }
}

function renderNextSetCard() {
  if (!nextSetCard) {
    return;
  }
  const suggestion = nextSetSuggestion();
  if (!suggestion) {
    nextSetCard.innerHTML = '<span class="milestone-label">Progression engine</span><strong>Pick or type an exercise</strong><p>The tracker will suggest the next weight or rep target from your recent history.</p>';
    return;
  }
  nextSetCard.innerHTML = `<span class="milestone-label">Progression engine</span><strong>${suggestion.exercise}</strong><p>${suggestion.copy}</p>${suggestion.weight ? `<p>Suggested target: ${formatWeight(suggestion.weight)} x ${suggestion.reps}</p>` : ""}`;
}

function filteredWorkoutGroups() {
  const search = exerciseSearch?.value.trim().toLowerCase() || "";
  const filter = exerciseFilter?.value || "";
  const groups = groupedExercises();

  return Object.entries(groups)
    .filter(([exerciseName, entries]) => {
      const matchesFilter = !filter || exerciseName === filter;
      const matchesSearch = !search || exerciseName.toLowerCase().includes(search) || entries.some((entry) => entry.notes.toLowerCase().includes(search));
      return matchesFilter && matchesSearch;
    })
    .sort(([, entriesA], [, entriesB]) => {
      const latestA = entriesA.reduce((latest, entry) => latest > entry.createdAt ? latest : entry.createdAt, "");
      const latestB = entriesB.reduce((latest, entry) => latest > entry.createdAt ? latest : entry.createdAt, "");
      return new Date(latestB) - new Date(latestA);
    });
}

function renderWorkouts() {
  calculateStats();
  populateTemplateSelect();
  populateExerciseFilter();
  renderNextSetCard();

  if (!exerciseList || !exerciseTemplate) {
    return;
  }

  const groups = filteredWorkoutGroups();
  exerciseList.innerHTML = "";
  if (state.workouts.length === 0) {
    exerciseList.innerHTML = '<div class="empty-state">No lifts logged yet. Add a set to start building your gym archive.</div>';
    return;
  }
  if (!groups.length) {
    exerciseList.innerHTML = '<div class="empty-state">No logs match the active search or filter.</div>';
    return;
  }

  groups.forEach(([exerciseName, entries]) => {
    const fragment = exerciseTemplate.content.cloneNode(true);
    const bestWeight = entries.reduce((max, entry) => Math.max(max, entry.weight), 0);
    const latest = [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    const est1RM = Math.round(entries.reduce((max, entry) => Math.max(max, estimateOneRepMax(entry.weight, entry.reps)), 0));
    fragment.querySelector(".exercise-name").textContent = exerciseName;
    fragment.querySelector(".exercise-meta").textContent = `${entries.length} logged set${entries.length === 1 ? "" : "s"} | Latest ${formatDate(latest.createdAt)} | Est. 1RM ${est1RM} lb`;
    fragment.querySelector(".exercise-pr").textContent = `PR ${formatWeight(bestWeight)}`;
    const setList = fragment.querySelector(".set-list");

    entries
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((entry) => {
        const chip = document.createElement("div");
        chip.className = "set-chip";
        chip.innerHTML = `<strong>${formatWeight(entry.weight)} x ${entry.reps}</strong><span>${formatDate(entry.createdAt)}${entry.notes ? ` | ${entry.notes}` : ""}</span><button type="button" class="delete-btn" data-workout-id="${entry.id}">Delete</button>`;
        setList.appendChild(chip);
      });

    exerciseList.appendChild(fragment);
  });
}

function macroTotals() {
  return state.meals.reduce((totals, meal) => {
    totals.calories += meal.calories;
    totals.protein += meal.protein;
    totals.carbs += meal.carbs;
    totals.fats += meal.fats;
    return totals;
  }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
}

function goalText(current, goal, suffix = "") {
  if (!goal) return "No goal set";
  const delta = goal - current;
  if (delta > 0) return `${delta}${suffix} left to target`;
  if (delta === 0) return "Goal hit exactly";
  return `${Math.abs(delta)}${suffix} over target`;
}

function fillGoalInputs() {
  if (goalCaloriesInput) goalCaloriesInput.value = state.goals.calories || "";
  if (goalProteinInput) goalProteinInput.value = state.goals.protein || "";
  if (goalCarbsInput) goalCarbsInput.value = state.goals.carbs || "";
  if (goalFatsInput) goalFatsInput.value = state.goals.fats || "";
  if (hydrationGoalInput) hydrationGoalInput.value = state.hydrationGoal || "";
}

function fillRecoveryInputs() {
  if (!recoveryForm) {
    return;
  }
  const recovery = state.recovery;
  if (sleepInput) sleepInput.value = recovery.sleepHours || "";
  if (stepsInput) stepsInput.value = recovery.steps || "";
  if (energyInput) energyInput.value = recovery.energy || "";
  if (sorenessInput) sorenessInput.value = recovery.soreness || "";
  if (mobilityInput) mobilityInput.checked = recovery.mobilityDone;
  if (stretchInput) stretchInput.checked = recovery.stretchDone;
  if (supplementsInput) supplementsInput.checked = recovery.supplementsDone;
}

function renderNutritionHistory() {
  if (!nutritionHistory) {
    return;
  }

  nutritionHistory.innerHTML = "";
  if (state.meals.length === 0 && !state.hydrationLogs.length) {
    setText(nutritionHistoryLabel, "Your day-by-day intake totals will appear here once meals are logged.");
    nutritionHistory.innerHTML = '<div class="empty-state">Daily summaries will stack here as soon as you log meals or hydration.</div>';
    return;
  }

  const groupedDays = {};
  state.meals.forEach((meal) => {
    const key = dateKey(meal.createdAt);
    if (!groupedDays[key]) {
      groupedDays[key] = { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0, meals: 0 };
    }
    groupedDays[key].calories += meal.calories;
    groupedDays[key].protein += meal.protein;
    groupedDays[key].carbs += meal.carbs;
    groupedDays[key].fats += meal.fats;
    groupedDays[key].meals += 1;
  });
  state.hydrationLogs.forEach((entry) => {
    const key = dateKey(entry.createdAt);
    if (!groupedDays[key]) {
      groupedDays[key] = { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0, meals: 0 };
    }
    groupedDays[key].water += entry.amount;
  });

  const days = Object.entries(groupedDays).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  setText(nutritionHistoryLabel, `Showing ${days.length} tracked nutrition day${days.length === 1 ? "" : "s"}.`);

  days.forEach(([day, totals]) => {
    const card = document.createElement("article");
    card.className = "history-day";
    card.innerHTML = `<div class="history-day-head"><div><h3>${new Date(day).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</h3><p>${totals.meals} meal log${totals.meals === 1 ? "" : "s"} | ${totals.water} oz water</p></div><strong>${totals.calories} cal</strong></div><p>P ${totals.protein}g | C ${totals.carbs}g | F ${totals.fats}g</p>`;
    nutritionHistory.appendChild(card);
  });
}

function renderNutrition() {
  const totals = macroTotals();
  const today = todayMacros();
  const waterToday = todayHydration();
  const macroSum = totals.protein + totals.carbs + totals.fats;
  const modeName = state.splitMode.charAt(0).toUpperCase() + state.splitMode.slice(1);

  setText(calorieTotal, totals.calories.toLocaleString());
  setText(proteinTotal, `${totals.protein}g`);
  setText(carbsTotal, `${totals.carbs}g`);
  setText(fatsTotal, `${totals.fats}g`);
  setText(hydrationTotal, `${waterToday} oz`);
  setText(calorieGoalStatus, goalText(today.calories, state.goals.calories));
  setText(proteinGoalStatus, goalText(today.protein, state.goals.protein, "g"));
  setText(carbsGoalStatus, goalText(today.carbs, state.goals.carbs, "g"));
  setText(fatsGoalStatus, goalText(today.fats, state.goals.fats, "g"));
  setText(hydrationStatus, state.hydrationGoal ? goalText(waterToday, state.hydrationGoal, " oz") : "No hydration goal set");
  setText(splitModeLabel, `Current mode: ${modeName}`);
  if (modeBulkButton) modeBulkButton.classList.toggle("active-chip", state.splitMode === "bulk");
  if (modeCutButton) modeCutButton.classList.toggle("active-chip", state.splitMode === "cut");
  if (modeMaintainButton) modeMaintainButton.classList.toggle("active-chip", state.splitMode === "maintain");

  if (macroBars) {
    macroBars.innerHTML = "";
    [
      { label: "Protein", value: today.protein, goal: state.goals.protein, className: "" },
      { label: "Carbs", value: today.carbs, goal: state.goals.carbs, className: "carbs" },
      { label: "Fats", value: today.fats, goal: state.goals.fats, className: "fats" },
      { label: "Hydration", value: waterToday, goal: state.hydrationGoal, className: "" }
    ].forEach((bar) => {
      const denominator = bar.goal > 0 ? bar.goal : macroSum || 1;
      const percent = Math.min(100, Math.round((bar.value / denominator) * 100));
      const unit = bar.label === "Hydration" ? "oz" : "g";
      const wrapper = document.createElement("article");
      wrapper.className = "macro-card macro-bar";
      wrapper.innerHTML = `<span class="milestone-label">${bar.label}</span><strong>${bar.value}${unit}</strong><div class="bar-track"><div class="bar-fill ${bar.className}" style="width:${percent}%"></div></div><p>${bar.goal > 0 ? `${percent}% of ${bar.goal}${unit} goal` : `${percent}% of tracked total`}</p>`;
      macroBars.appendChild(wrapper);
    });
  }

  if (mealList) {
    mealList.innerHTML = "";
    if (state.meals.length === 0) {
      mealList.innerHTML = '<div class="empty-state">No meals logged yet. Add your fuel stack to track calories and macros.</div>';
    } else {
      state.meals.forEach((meal) => {
        const card = document.createElement("article");
        card.className = "meal-card";
        card.innerHTML = `<div class="meal-card-head"><div><h3>${meal.name}</h3><p>${formatDate(meal.createdAt)}</p></div><button type="button" class="delete-btn" data-meal-id="${meal.id}">Delete</button></div><strong>${meal.calories} cal | P ${meal.protein}g | C ${meal.carbs}g | F ${meal.fats}g</strong>`;
        mealList.appendChild(card);
      });
    }
  }

  renderNutritionHistory();
  fillRecoveryInputs();
}

function renderDashboard() {
  ensureQuestCycles();
  injectAuthShell();
  fillGoalInputs();
  calculateStats();
  renderOverviewSystems();
  renderWorkouts();
  renderCyberPsycho();
  renderNutrition();
}

async function initSupabase() {
  injectAuthShell();
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("service-worker.js");
    } catch {}
  }
  if (!supabase) {
    return;
  }
  const {
    data: { session }
  } = await supabase.auth.getSession();
  currentSession = session;
  currentUser = session?.user || null;
  injectAuthShell();
  if (currentUser) {
    await loadRemoteState();
  }

  supabase.auth.onAuthStateChange(async (_event, sessionData) => {
    currentSession = sessionData;
    currentUser = sessionData?.user || null;
    injectAuthShell();
    if (currentUser) {
      await loadRemoteState();
    } else {
      setAuthStatus(supabase ? "Signed out. Using local cache until you sign in again." : "Using local storage only.");
    }
  });
}

function applyTemplate() {
  if (!templateSelect || !templateSelect.value) {
    return;
  }
  const template = state.templates.find((entry) => entry.id === templateSelect.value);
  if (!template) {
    return;
  }
  exerciseInput.value = template.exercise;
  weightInput.value = template.weight || "";
  repsInput.value = template.reps || "";
  notesInput.value = template.notes || "";
  renderNextSetCard();
}

function updateRestTimer() {
  if (!restTimerDisplay) {
    return;
  }
  if (restTimerRemaining <= 0) {
    restTimerDisplay.textContent = "Rest complete";
    clearInterval(restTimerId);
    restTimerId = null;
    return;
  }
  restTimerDisplay.textContent = `${restTimerRemaining}s remaining`;
  restTimerRemaining -= 1;
}

function startRestTimer(duration = 90) {
  restTimerRemaining = duration;
  if (restTimerId) {
    clearInterval(restTimerId);
  }
  updateRestTimer();
  restTimerId = setInterval(updateRestTimer, 1000);
}

function applyModePreset(mode) {
  const presets = {
    bulk: { calories: 3100, protein: 210, carbs: 360, fats: 85, hydrationGoal: 140 },
    cut: { calories: 2200, protein: 200, carbs: 180, fats: 65, hydrationGoal: 130 },
    maintain: { calories: 2600, protein: 180, carbs: 260, fats: 75, hydrationGoal: 120 }
  };
  const preset = presets[mode];
  state.splitMode = mode;
  state.goals = {
    calories: preset.calories,
    protein: preset.protein,
    carbs: preset.carbs,
    fats: preset.fats
  };
  state.hydrationGoal = preset.hydrationGoal;
  saveState();
  renderDashboard();
}

function importBackup(file) {
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = normalizeState(JSON.parse(String(reader.result)));
      saveState();
      renderDashboard();
      alert("Backup restored.");
    } catch {
      alert("Import failed. Use a valid EdgeLift backup JSON file.");
    }
  };
  reader.readAsText(file);
}

function exportBackup() {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `edgelift-backup-${dateKey()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

if (workoutForm) {
  workoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const exercise = titleCase(exerciseInput.value);
    const weight = Number(weightInput.value);
    const reps = Number(repsInput.value);
    const notes = notesInput.value.trim();
    if (!exercise || Number.isNaN(weight) || Number.isNaN(reps)) return;
    state.workouts.unshift({ id: makeId("workout"), exercise, weight, reps, notes, createdAt: new Date().toISOString() });
    saveState();
    renderDashboard();
    workoutForm.reset();
    exerciseInput.focus();
  });
}

if (macroForm) {
  macroForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const meal = titleCase(mealInput.value);
    const protein = Number(proteinInput.value);
    const carbs = Number(carbsInput.value);
    const fats = Number(fatsInput.value);
    const calories = Number(caloriesInput.value);
    if (!meal || [protein, carbs, fats, calories].some(Number.isNaN)) return;
    state.meals.unshift({ id: makeId("meal"), name: meal, protein, carbs, fats, calories, createdAt: new Date().toISOString() });
    saveState();
    renderDashboard();
    macroForm.reset();
    mealInput.focus();
  });
}

if (goalForm) {
  goalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.goals = {
      calories: Number(goalCaloriesInput.value) || 0,
      protein: Number(goalProteinInput.value) || 0,
      carbs: Number(goalCarbsInput.value) || 0,
      fats: Number(goalFatsInput.value) || 0
    };
    saveState();
    renderDashboard();
  });
}

if (hydrationForm) {
  hydrationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const amount = Number(hydrationInput.value);
    const goal = Number(hydrationGoalInput.value);
    if (!Number.isNaN(goal) && goal > 0) {
      state.hydrationGoal = goal;
    }
    if (!Number.isNaN(amount) && amount > 0) {
      state.hydrationLogs.unshift({ id: makeId("water"), amount, createdAt: new Date().toISOString() });
    }
    saveState();
    renderDashboard();
    hydrationForm.reset();
    if (hydrationGoalInput) hydrationGoalInput.value = state.hydrationGoal;
  });
}

if (recoveryForm) {
  recoveryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.recovery = {
      sleepHours: Number(sleepInput.value) || 0,
      steps: Number(stepsInput.value) || 0,
      energy: Number(energyInput.value) || 0,
      soreness: Number(sorenessInput.value) || 0,
      mobilityDone: Boolean(mobilityInput.checked),
      stretchDone: Boolean(stretchInput.checked),
      supplementsDone: Boolean(supplementsInput.checked),
      updatedAt: new Date().toISOString()
    };
    saveState();
    renderDashboard();
  });
}

if (mealList) {
  mealList.addEventListener("click", (event) => {
    const target = event.target.closest("[data-meal-id]");
    if (!target) return;
    state.meals = state.meals.filter((meal) => meal.id !== target.dataset.mealId);
    saveState();
    renderDashboard();
  });
}

if (exerciseList) {
  exerciseList.addEventListener("click", (event) => {
    const target = event.target.closest("[data-workout-id]");
    if (!target) return;
    state.workouts = state.workouts.filter((workout) => workout.id !== target.dataset.workoutId);
    saveState();
    renderDashboard();
  });
}

if (clearButton) {
  clearButton.addEventListener("click", () => {
    state = normalizeState({ templates: state.templates });
    saveState();
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem(OLDER_STORAGE_KEY);
    localStorage.removeItem(OLDEST_STORAGE_KEY);
    renderDashboard();
  });
}

if (templateSelect) {
  templateSelect.addEventListener("change", () => {
    const template = state.templates.find((entry) => entry.id === templateSelect.value);
    if (template) {
      exerciseInput.value = template.exercise;
      renderNextSetCard();
    }
  });
}

if (applyTemplateButton) {
  applyTemplateButton.addEventListener("click", applyTemplate);
}

if (exerciseInput) {
  exerciseInput.addEventListener("input", renderNextSetCard);
}

if (weightInput) {
  weightInput.addEventListener("input", renderNextSetCard);
}

if (repsInput) {
  repsInput.addEventListener("input", renderNextSetCard);
}

if (exerciseSearch) {
  exerciseSearch.addEventListener("input", renderWorkouts);
}

if (exerciseFilter) {
  exerciseFilter.addEventListener("change", renderWorkouts);
}

if (startRestTimerButton) {
  startRestTimerButton.addEventListener("click", () => startRestTimer(90));
}

if (exportDataButton) {
  exportDataButton.addEventListener("click", exportBackup);
}

if (importDataInput) {
  importDataInput.addEventListener("change", (event) => importBackup(event.target.files?.[0]));
}

if (modeBulkButton) {
  modeBulkButton.addEventListener("click", () => applyModePreset("bulk"));
}

if (modeCutButton) {
  modeCutButton.addEventListener("click", () => applyModePreset("cut"));
}

if (modeMaintainButton) {
  modeMaintainButton.addEventListener("click", () => applyModePreset("maintain"));
}

if (missionBoard) {
  missionBoard.addEventListener("click", (event) => {
    const target = event.target.closest("[data-quest-id]");
    if (!target) return;
    claimQuest(target.dataset.questType, target.dataset.questId);
  });
}

if (weeklyBoard) {
  weeklyBoard.addEventListener("click", (event) => {
    const target = event.target.closest("[data-quest-id]");
    if (!target) return;
    claimQuest(target.dataset.questType, target.dataset.questId);
  });
}

renderDashboard();
await initSupabase();
