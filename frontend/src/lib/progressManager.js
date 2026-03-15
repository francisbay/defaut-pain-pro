const STORAGE_KEY = 'apprenti_boulanger_progress';

const DEFAULT_PROGRESS = {
  score: 0,
  level: 1,
  badges: [],
  streak: 0,
  bestStreak: 0,
  stats: {
    totalAnswered: 0,
    correctAnswers: 0,
    trainingCompleted: 0,
    diagnosticsCompleted: 0,
    quizCompleted: 0,
    quizBestScore: 0,
  },
  activityCompletions: {},
  spacedRepetition: {},
  history: [],
};

const BADGE_LEVELS = [
  { id: 'apprenti', name: 'Apprenti', minScore: 0, icon: 'wheat' },
  { id: 'mitron', name: 'Mitron', minScore: 50, icon: 'chef-hat' },
  { id: 'boulanger', name: 'Boulanger', minScore: 150, icon: 'award' },
  { id: 'maitre', name: 'Maître Boulanger', minScore: 300, icon: 'crown' },
];

const LEVEL_THRESHOLDS = [0, 25, 60, 100, 150, 210, 280, 360, 450, 550];

export function getProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PROGRESS, ...parsed, stats: { ...DEFAULT_PROGRESS.stats, ...parsed.stats } };
    }
  } catch (e) {
    console.error('Error reading progress:', e);
  }
  return { ...DEFAULT_PROGRESS };
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving progress:', e);
  }
}

export function addScore(points, type) {
  const progress = getProgress();
  progress.score += points;

  if (points > 0) {
    progress.streak += 1;
    if (progress.streak > progress.bestStreak) {
      progress.bestStreak = progress.streak;
    }
  } else {
    progress.streak = 0;
  }

  progress.stats.totalAnswered += 1;
  if (points > 0) progress.stats.correctAnswers += 1;

  if (type === 'training') progress.stats.trainingCompleted += 1;
  if (type === 'diagnostic') progress.stats.diagnosticsCompleted += 1;
  if (type === 'quiz') progress.stats.quizCompleted += 1;

  progress.level = getLevel(progress.score);
  progress.badges = getEarnedBadges(progress.score);

  saveProgress(progress);
  return progress;
}

export function updateQuizBestScore(score) {
  const progress = getProgress();
  if (score > progress.stats.quizBestScore) {
    progress.stats.quizBestScore = score;
    saveProgress(progress);
  }
  return progress;
}

export function getLevel(score) {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (score >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return level;
}

export function getLevelProgress(score) {
  const level = getLevel(score);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || currentThreshold + 100;
  const progress = ((score - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

export function getEarnedBadges(score) {
  return BADGE_LEVELS.filter(b => score >= b.minScore).map(b => b.id);
}

export function getCurrentBadge(score) {
  const earned = BADGE_LEVELS.filter(b => score >= b.minScore);
  return earned[earned.length - 1] || BADGE_LEVELS[0];
}

export function getNextBadge(score) {
  const next = BADGE_LEVELS.find(b => score < b.minScore);
  return next || null;
}

export function getAllBadges() {
  return BADGE_LEVELS;
}

export function updateSpacedRepetition(defectId, correct) {
  const progress = getProgress();
  const sr = progress.spacedRepetition[defectId] || {
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReview: new Date().toISOString(),
  };

  if (correct) {
    sr.repetitions += 1;
    if (sr.repetitions === 1) sr.interval = 1;
    else if (sr.repetitions === 2) sr.interval = 3;
    else sr.interval = Math.round(sr.interval * sr.easeFactor);
    sr.easeFactor = Math.max(1.3, sr.easeFactor + 0.1);
  } else {
    sr.repetitions = 0;
    sr.interval = 1;
    sr.easeFactor = Math.max(1.3, sr.easeFactor - 0.2);
  }

  const next = new Date();
  next.setDate(next.getDate() + sr.interval);
  sr.nextReview = next.toISOString();

  progress.spacedRepetition[defectId] = sr;
  saveProgress(progress);
  return progress;
}

export function getDefectsToReview(allDefectIds) {
  const progress = getProgress();
  const now = new Date();
  const toReview = [];
  const notStarted = [];

  allDefectIds.forEach(id => {
    const sr = progress.spacedRepetition[id];
    if (!sr) {
      notStarted.push(id);
    } else if (new Date(sr.nextReview) <= now) {
      toReview.push(id);
    }
  });

  return [...toReview, ...notStarted];
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_PROGRESS;
}

export function markActivityCompleted(level, activityType) {
  const progress = getProgress();
  if (!progress.activityCompletions) progress.activityCompletions = {};
  const key = `${level}-${activityType}`;
  progress.activityCompletions[key] = (progress.activityCompletions[key] || 0) + 1;
  saveProgress(progress);
  return progress;
}

export function getActivityCompletions(level, activityType) {
  const progress = getProgress();
  if (!progress.activityCompletions) return 0;
  return progress.activityCompletions[`${level}-${activityType}`] || 0;
}

export function getLevelCompletions(level) {
  const progress = getProgress();
  if (!progress.activityCompletions) return {};
  const result = {};
  Object.entries(progress.activityCompletions).forEach(([key, count]) => {
    if (key.startsWith(`${level}-`)) {
      const type = key.replace(`${level}-`, "");
      result[type] = count;
    }
  });
  return result;
}
