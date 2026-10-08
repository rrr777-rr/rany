// ================================================================
// 🚀 إخفاء شاشة الترحيب بعد 3 ثواني
// ================================================================
const splash = document.getElementById('splash');

setTimeout(function() {
    splash.classList.add('hide');
    setTimeout(function() {
        splash.style.display = 'none';
    }, 800);
}, 3000);

// ================================================================
// 1. DATA – هيكل الصفوف والمواد
// ================================================================
const GRADE_DATA = {
 '6-primary': window.DATA_6_PRIMARY,
 '1-middle': window.DATA_1_MIDDLE,
  '2-middle': window.DATA_2_MIDDLE,
  '3-middle': window.DATA_3_MIDDLE,
  '4-scientific': window.DATA_4_SCIENTIFIC,
  '4-literary': window.DATA_4_LITERARY,
  '5-scientific': window.DATA_5_SCIENTIFIC,
  '5-literary': window.DATA_5_LITERARY,
  '6-scientific': window.DATA_6_SCIENTIFIC,
  '6-literary': window.DATA_6_LITERARY,
};

// ================================================================
// 2. STATE
// ================================================================
const state = {
  battery: 25, maxBattery: 25, xp: 0, gems: 50,
  streak: 0, streakLastDate: null, streakFreeze: 2, purchasedFreeze: 0,
  shieldActive: false, shieldExpiry: null,
  isRecovering: false, previousStreak: 0, recoveryCount: 0,
  currentGrade: '6-primary', currentSubject: 'islamic',
  progress: {}, activityLog: {},
  currentChapterIndex: 0, currentQuestionIndex: 0,
  lessonAnswered: false, correctCount: 0, doublePoints: false,
  bonusHearts: 0, isSuperSubscribed: false,
  friendAdded: false, batteryDepleted: false,
  wrongQuestions: [], darkMode: false, scrollToIndex: undefined,
  perfectWeekCounter: 0, lastWeekCheck: null,
  lastFreeBatteryTime: null,
  lastBatteryRefillTime: null,
  userData: { name: 'اسم المستخدم', username: '', email: 'yourEmail@example.com', avatar: '👤', showEmail: true, accountType: 'public', friends: [] },
dailyQuests: null,
openedTreasures: [],
isTraining: false,
reviewQuestions: []
};

// ================================================================
// 3. HELPERS
// ================================================================
function getChapters() {
  const ch = GRADE_DATA[state.currentGrade]?.subjects[state.currentSubject]?.chapters || [];
  return ch.sort((a, b) => a.id - b.id);
}

function getProgress() {
  const key = `progress_${state.currentGrade}_${state.currentSubject}`;
  const saved = localStorage.getItem(key);
  const ch = getChapters();
  let p;

  if (saved) {
    try { p = JSON.parse(saved); } catch(e) { p = null; }
  }

  if (!p) {
    p = new Array(ch.length).fill(0);
    if (ch.length > 0) p[0] = 1;
    return p;
  }

  // ✅ إصلاح تلقائي - إذا الفصول زادت، نمدد المصفوفة
  if (p.length < ch.length) {
    while (p.length < ch.length) {
      const lastVal = p.length > 0 ? p[p.length - 1] : 0;
      p.push(lastVal === 2 ? 1 : 0);
    }
    localStorage.setItem(key, JSON.stringify(p));
  }

  return p;
}

function saveProgress(p) {
  localStorage.setItem(`progress_${state.currentGrade}_${state.currentSubject}`, JSON.stringify(p));
}

function saveAllData() {
  localStorage.setItem('rany_data', JSON.stringify({
    battery: state.battery, xp: state.xp, gems: state.gems,
    streak: state.streak, streakLastDate: state.streakLastDate,
    progress: state.progress, userData: state.userData,
    currentGrade: state.currentGrade, currentSubject: state.currentSubject,
    isSuperSubscribed: state.isSuperSubscribed,
    batteryDepleted: state.batteryDepleted,
    wrongQuestions: state.wrongQuestions, darkMode: state.darkMode,
    activityLog: state.activityLog, streakFreeze: state.streakFreeze,
    purchasedFreeze: state.purchasedFreeze,
    shieldActive: state.shieldActive, shieldExpiry: state.shieldExpiry,
    isRecovering: state.isRecovering, previousStreak: state.previousStreak,
    recoveryCount: state.recoveryCount,
    perfectWeekCounter: state.perfectWeekCounter,
    lastWeekCheck: state.lastWeekCheck,
    lastFreeBatteryTime: state.lastFreeBatteryTime,
    lastBatteryRefillTime: state.lastBatteryRefillTime,
    dailyQuests: state.dailyQuests,
    freezeLog: state.freezeLog,
    openedTreasures: state.openedTreasures,
    friendAdded: state.friendAdded
  }));
}

function loadAllData() {
  const saved = localStorage.getItem('rany_data');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      Object.assign(state, data);
      if (!state.progress[state.currentGrade]) state.progress[state.currentGrade] = {};
      if (!state.progress[state.currentGrade][state.currentSubject]) {
        const ch = getChapters();
        state.progress[state.currentGrade][state.currentSubject] = new Array(ch.length).fill(0);
        if (ch.length > 0) state.progress[state.currentGrade][state.currentSubject][0] = 1;
      }
      if (state.userData.username) {
        const usernameEl = document.getElementById('profileUsername');
        if (usernameEl) usernameEl.textContent = '@' + state.userData.username;
      }
      if (state.darkMode) {
    document.body.classList.add('dark-mode');
    const toggle = document.getElementById('toggleDark');
    if (toggle) toggle.classList.add('active');
}
} catch(e) { console.warn('⚠️ فشل تحميل البيانات:', e); }
}
}

// ================================================================
// 4. UI UPDATES
// ================================================================
function updateSubjectTabs() {
  const scroll = document.getElementById('subjectScroll');
  if (!scroll) return;
  const subjects = GRADE_DATA[state.currentGrade].subjects;
  scroll.innerHTML = '';
  Object.keys(subjects).forEach(key => {
    const sub = subjects[key];
    const btn = document.createElement('button');
    btn.className = 'sub-btn' + (key === state.currentSubject ? ' active' : '');
    btn.dataset.subject = key;
    btn.textContent = `${sub.icon || '📘'} ${sub.name}`;
    btn.addEventListener('click', function() {
      state.currentSubject = key;
      document.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderMap();
      saveAllData();
    });
    scroll.appendChild(btn);
  });
  const activeBtn = scroll.querySelector('.sub-btn.active');
  if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

function updateStatsUI() {
  document.getElementById('heartsDisplay').textContent = state.battery;
  document.getElementById('xpDisplay').textContent = state.xp;
  document.getElementById('gemDisplay').textContent = state.gems;
  document.getElementById('streakDisplay').textContent = state.streak;
  updateBatteryUI();
  updateProgressScreen();
  updateProfileScreen();
  updateFriendsScreen();
}

function updateBatteryUI() {
  const icon = document.getElementById('batteryIcon');
  if (!icon) return;
  if (state.isSuperSubscribed) {
    icon.textContent = '♾️';
    icon.classList.add('infinity');
    icon.classList.remove('empty');
    return;
  }
  icon.classList.remove('infinity');
  if (state.battery <= 0 && !state.isSuperSubscribed) {
    icon.textContent = '🔋';
    icon.classList.add('empty');
  } else {
    icon.textContent = '🔋';
    icon.classList.remove('empty');
  }
}

function updateProgressScreen() {
  const total = getChapters().length;
  const completed = getProgress().filter(v => v === 2).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  document.getElementById('statXp').textContent = state.xp;
  document.getElementById('statLessons').textContent = `${completed}/${total}`;
  document.getElementById('statStreak').textContent = state.streak;
  document.getElementById('statGems').textContent = state.gems;
  document.getElementById('progressPercent').textContent = pct + '%';
  document.getElementById('progressFullBar').style.width = pct + '%';
  document.getElementById('mistakesCount').textContent = state.wrongQuestions.length;

  if (typeof renderDailyQuests == 'function')
renderDailyQuests();
}

function updateProfileScreen() {
  const data = state.userData;
  const progress = getProgress();
  const completed = progress.filter(v => v === 2).length;
  const total = getChapters().length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const avatarEl = document.getElementById('profileAvatar');
if (avatarEl) {
    avatarEl.innerHTML = '';
    avatarEl.textContent = data.avatar || '👤';
}

  const nameEl = document.getElementById('profileName');
  if (nameEl) nameEl.textContent = data.name || 'اسم المستخدم';

  const emailEl = document.getElementById('profileEmail');
  if (emailEl) {
    emailEl.textContent = data.showEmail ? data.email : '••••••••';
  }

  const xpEl = document.getElementById('profileXp');
  if (xpEl) xpEl.textContent = state.xp;

  const friendsEl = document.getElementById('profileFriendsCount');
  if (friendsEl) friendsEl.textContent = data.friends ? data.friends.length : 0;

  const streakEl = document.getElementById('profileStreak');
  if (streakEl) streakEl.textContent = state.streak;

  const lessonsEl = document.getElementById('profileLessonsCount');
  if (lessonsEl) lessonsEl.textContent = completed;

  const usernameEl = document.getElementById('profileUsername');
  if (usernameEl) {
    usernameEl.textContent = data.username ? '@' + data.username : '🔒 لم يتم التعيين بعد';
  }

  const percentEl = document.getElementById('profileProgressPercent');
  const fillEl = document.getElementById('profileProgressFill');
  if (percentEl) percentEl.textContent = pct + '%';
  if (fillEl) fillEl.style.width = pct + '%';

  const toggle = document.getElementById('toggleEmail');
  if (toggle) {
    if (data.showEmail) toggle.classList.add('active');
    else toggle.classList.remove('active');
  }
}

function updateFriendsScreen() {
  const list = document.getElementById('friendsList');
  if (!list) return;
  list.innerHTML = '';
  if (!state.userData.friends || state.userData.friends.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:#888;padding:20px;">لا توجد أصدقاء بعد</p>';
    return;
  }
  state.userData.friends.forEach(name => {
    const div = document.createElement('div');
    div.className = 'friend-item';
    div.innerHTML = `<div class="friend-avatar">${name.charAt(0)}</div><span>@${name}</span><span>👋</span>`;
    list.appendChild(div);
  });
}

function updateLocationBar() {
  const el = document.getElementById('currentLocation');
  if (!el) return;
  const chapters = getChapters();
  const idx = state.currentChapterIndex;
  if (chapters.length === 0 || idx >= chapters.length) {
    el.textContent = '📖 لا توجد دروس';
    return;
  }
  const chapter = chapters[idx];
  const unitNum = Math.floor(idx / 6) + 1;
  const lessonNum = (idx % 6) + 1;
  el.textContent = `📖 الوحدة ${unitNum} · الدرس ${lessonNum} · ${chapter.name}`;
}

// ================================================================
// 5. EFFECTS
// ================================================================
function playCorrectSound() {
  try {
    const ctx = new(window.AudioContext || window.webkitAudioContext)();
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine'; o.frequency.value = f; g.gain.value = 0.2;
      o.start(ctx.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25);
      o.stop(ctx.currentTime + i * 0.12 + 0.25);
    });
  } catch(e) {}
}

function playWrongSound() {
  try {
    const ctx = new(window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sawtooth'; o.frequency.value = 200; g.gain.value = 0.12;
    o.start(); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.stop(ctx.currentTime + 0.4);
  } catch(e) {}
}

function launchConfetti() {
  const emojis = ['🎊', '🎉', '✨', '⭐', '📒'];
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = Math.random() * 100 + '%';
    p.style.fontSize = (Math.random() * 20 + 18) + 'px';
    p.style.animationDuration = (Math.random() * 1.5 + 1.5) + 's';
    p.style.animationDelay = (Math.random() * 0.6) + 's';
    const xOffset = (Math.random() > 0.5) ? (50 + Math.random() * 150) : -(50 + Math.random() * 150);
    const style = document.createElement('style');
    const uid = 'confetti-' + Date.now() + '-' + i;
    style.textContent = `@keyframes confetti-${uid}{0%{transform:translate(0,0) rotate(0deg) scale(0.4); opacity:1;}100%{transform:translate(${xOffset}px,-110vh) rotate(720deg) scale(1.3); opacity:0;}}`;
    document.head.appendChild(style);
    p.style.animation = `confetti-${uid} ${Math.random() * 1.5 + 1.5}s ease-out forwards`;
    container.appendChild(p);
  }
  setTimeout(() => { if (container.parentNode) container.remove(); }, 3500);
}

function showCheerMessage(text) {
  const bubble = document.createElement('div');
  bubble.className = 'cheer-bubble';
  bubble.textContent = text || 'عفية بالأسطورة!';
  document.body.appendChild(bubble);
  setTimeout(() => { if (bubble.parentNode) bubble.remove(); }, 2000);
}

// ================================================================
// 6. STREAK + CALENDAR
// ================================================================
function updateStreak() {
  const today = new Date().toDateString();
  if (state.streakLastDate === today) return;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  if (state.streakLastDate === yesterdayStr) {
    state.streak += 1;
    state.streakLastDate = today;
    checkPerfectWeek();
    saveAllData();
    updateStatsUI();
    return;
  }
  if (state.streakLastDate !== null) {
    if (state.shieldActive) {
      const now = new Date();
      const expiry = new Date(state.shieldExpiry);
      if (now <= expiry) {
        state.streakLastDate = today;
        saveAllData();
        return;
      } else {
        state.shieldActive = false;
        state.shieldExpiry = null;
        saveAllData();
      }
    }
    if (state.streakFreeze > 0) {
      state.streakFreeze -= 1;
      state.streakLastDate = today;
      showCheerMessage('❄️ تم استخدام تجميد! حماسك في أمان.');
      saveAllData();
      updateStatsUI();
      return;
    } else if (state.purchasedFreeze > 0) {
      state.purchasedFreeze -= 1;
      state.streakLastDate = today;
      showCheerMessage('❄️ تم استخدام تجميد مشترى! حماسك في أمان.');
      saveAllData();
      updateStatsUI();
      return;
    }
    if (state.streak > 0) {
      state.previousStreak = state.streak;
      state.isRecovering = true;
      state.recoveryCount = 0;
      state.streak = 0;
      state.streakLastDate = today;
      showCheerMessage('😢 انقطع حماسك! أكمل 5 دروس لاستعادته.');
      saveAllData();
      updateStatsUI();
      return;
    }
  }
  if (state.streakLastDate === null) {
    state.streak = 1;
    state.streakLastDate = today;
    saveAllData();
    updateStatsUI();
  }
}

function handleStreakAfterLesson() {
  const today = new Date().toDateString();
  logActivity();
  if (state.isRecovering) {
    state.recoveryCount += 1;
    showCheerMessage(`🔥 أنت في طريق العودة! أكملت ${state.recoveryCount} من 5 دروس.`);
    if (state.recoveryCount >= 5) {
      state.streak = state.previousStreak;
      state.isRecovering = false;
      state.recoveryCount = 0;
      state.streakLastDate = today;
      showCheerMessage(`🎉 مبروك! لقد استعدت حماسك (🔥 ${state.streak})!`);
    }
    saveAllData();
    updateStatsUI();
    return;
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (state.streakLastDate === yesterday.toDateString()) {
    state.streak += 1;
  } else if (state.streakLastDate !== today) {
    state.streak = 1;
  }
  state.streakLastDate = today;
  checkPerfectWeek();
  saveAllData();
  updateStatsUI();
}

function checkPerfectWeek() {
  const today = new Date();
  if (state.lastWeekCheck) {
    const lastCheck = new Date(state.lastWeekCheck);
    if ((today - lastCheck) > 86400000 * 2) {
      state.perfectWeekCounter = 0;
    }
  }
  if (state.streak >= 7 && state.perfectWeekCounter < 7) {
    state.perfectWeekCounter += 1;
    if (state.perfectWeekCounter === 7) {
      state.gems += 25;
      showCheerMessage('🏆 أسبوع مثالي! +25 جوهرة! 🎉');
      launchConfetti();
      setTimeout(launchConfetti, 500);
      state.perfectWeekCounter = 0;
      saveAllData();
      updateStatsUI();
    }
  }
  state.lastWeekCheck = today.toISOString();
}

function checkShieldExpiry() {
  if (state.shieldActive && state.shieldExpiry) {
    const now = new Date();
    const expiry = new Date(state.shieldExpiry);
    if (now > expiry) {
      state.shieldActive = false;
      state.shieldExpiry = null;
      saveAllData();
      showCheerMessage('⏳ انتهت صلاحية درع الحماية.');
    }
  }
}

function logActivity() {
  const today = new Date().toISOString().split('T')[0];
  if (!state.activityLog) state.activityLog = {};
  state.activityLog[today] = true;
  saveAllData();
}

function renderStreakCalendar(monthOffset = 0) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + monthOffset;
  let displayYear = year, displayMonth = month;
  if (month < 0) { displayYear = year - 1; displayMonth = 11; }
  if (month > 11) { displayYear = year + 1; displayMonth = 0; }
  const firstDay = new Date(displayYear, displayMonth, 1).getDay();
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];
  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  let html = `<div class="streak-calendar" style="background:white; border-radius:20px; padding:16px; margin:12px 0; box-shadow:0 4px 16px rgba(0,0,0,0.06); direction:ltr;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <button class="prevMonthBtn" style="background:none; border:none; font-size:24px; cursor:pointer; color:#99B7F5; padding:0 8px;">◀</button>
      <span style="font-weight:800; font-size:18px; color:#1e3c72;">${monthNames[displayMonth]} ${displayYear}</span>
      <button class="nextMonthBtn" style="background:none; border:none; font-size:24px; cursor:pointer; color:#99B7F5; padding:0 8px;">▶</button>
    </div>
    <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px; text-align:center; font-weight:700; color:#888; font-size:12px; margin-bottom:6px;">
      <span>ح</span><span>ن</span><span>ث</span><span>ر</span><span>خ</span><span>ج</span><span>س</span>
    </div>
    <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px; text-align:center;">`;

  for (let i = 0; i < firstDay; i++) {
    html += `<div style="padding:6px 0;"></div>`;
  }

  const log = state.activityLog || {};
  const freezeLog = state.freezeLog || {};

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(displayYear, displayMonth, day);
    const dateStr = dateObj.toISOString().split('T')[0];
    const isActive = log[dateStr] === true;
    const isFrozen = freezeLog[dateStr] === true;
    const isToday = dateStr === todayStr;

    let cls = 'day';
    let bgColor = 'transparent';
    let textColor = '#555';
    let fontWeight = '400';
    let border = 'none';

    if (isActive) {
      cls += ' active';
      bgColor = '#FCCA59';
      textColor = '#1e3c72';
      fontWeight = '800';
    }
    if (isFrozen) {
      cls += ' frozen';
      bgColor = '#99B7F5';
      textColor = '#1e3c72';
      fontWeight = '700';
    }
    if (isToday) {
      cls += ' today';
      border = '2px solid #286654';
    }

    html += `<div class="${cls}" style="padding:6px 0; border-radius:50%; background:${bgColor}; color:${textColor}; font-weight:${fontWeight}; font-size:13px; border:${border}; transition:0.2s;">${day}</div>`;
  }

  html += `</div>
    <div style="display:flex; justify-content:space-between; margin-top:12px; font-size:12px; color:#888; border-top:1px solid #eee; padding-top:10px;">
      <span>🔥 الحماسة: <strong style="color:#F5793B;">${state.streak}</strong> يوم</span>
      <span class="freeze-count">❄️ التجميدات: <strong style="color:#99B7F5;">${state.streakFreeze + state.purchasedFreeze}</strong></span>
      <span class="shield">🛡️ الدرع: <strong style="color:#286654;">${state.shieldActive ? 'مفعل ✅' : 'غير مفعل ❌'}</strong></span>
    </div>
  </div>`;
  return html;
}

function updateCalendar(offset) {
  const container = document.getElementById('streakCalendarContainer');
  if (!container) return;
  container.innerHTML = renderStreakCalendar(offset);
  container.querySelector('.prevMonthBtn')?.addEventListener('click', function() {
    if (typeof window.calendarOffset === 'undefined') window.calendarOffset = 0;
    window.calendarOffset -= 1;
    updateCalendar(window.calendarOffset);
  });
  container.querySelector('.nextMonthBtn')?.addEventListener('click', function() {
    if (typeof window.calendarOffset === 'undefined') window.calendarOffset = 0;
    window.calendarOffset += 1;
    updateCalendar(window.calendarOffset);
  });
}

function initStreakCalendar() {
  const progressScreen = document.getElementById('progressScreen');
  if (!progressScreen) return;
  if (document.getElementById('streakCalendarContainer')) return;
  const container = document.createElement('div');
  container.id = 'streakCalendarContainer';
  container.innerHTML = renderStreakCalendar(0);
  progressScreen.appendChild(container);
  setTimeout(() => {
    container.querySelector('.prevMonthBtn')?.addEventListener('click', function() {
      if (typeof window.calendarOffset === 'undefined') window.calendarOffset = 0;
      window.calendarOffset -= 1;
      updateCalendar(window.calendarOffset);
    });
    container.querySelector('.nextMonthBtn')?.addEventListener('click', function() {
      if (typeof window.calendarOffset === 'undefined') window.calendarOffset = 0;
      window.calendarOffset += 1;
      updateCalendar(window.calendarOffset);
    });
  }, 50);
}

// ================================================================
// 7. RENDER MAP
// ================================================================
function renderMap() {
  const container = document.getElementById('mapContainer');
  if (!container) return;
  const chapters = getChapters();
  const progress = getProgress();
  const gradeLabel = GRADE_DATA[state.currentGrade]?.label || '';
  const subjectName = GRADE_DATA[state.currentGrade]?.subjects[state.currentSubject]?.name || '';
  const subjectIcon = GRADE_DATA[state.currentGrade]?.subjects[state.currentSubject]?.icon || '📘';
  document.getElementById('chapterTitle').textContent = `📍 ${subjectName} - ${gradeLabel}`;
  document.getElementById('chapterSub').textContent = `${gradeLabel} · ${chapters.length} درساً`;
  const total = progress.length;
  const completed = progress.filter(v => v === 2).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  document.getElementById('unitProgressBar').style.width = pct + '%';
  document.getElementById('unitProgressText').textContent = pct + '%';
  if (chapters.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:40px 20px; color:#888;">📝 لا توجد دوائر بعد.</div>`;
    return;
  }
  const UNIT_SIZE = 6;
  const unitColors = ['#99B7F5', '#267F53', '#F5793B', '#F296BD', '#FCCA59'];
  const unitNames = ['الوحدة الأولى', 'الوحدة الثانية', 'الوحدة الثالثة', 'الوحدة الرابعة', 'الوحدة الخامسة'];
  let html = '';
  for (let u = 0; u < Math.ceil(chapters.length / UNIT_SIZE); u++) {
    const startIdx = u * UNIT_SIZE;
    const endIdx = Math.min(startIdx + UNIT_SIZE, chapters.length);
    const unitColor = unitColors[u % unitColors.length];
    html += `<div class="unit-divider" style="border-color:${unitColor}; margin:16px 0 12px 0; position:relative; text-align:center;">
      <span style="background:#f7f9fc; padding:0 16px; font-weight:800; font-size:16px; color:${unitColor}; display:inline-block; position:relative; z-index:1;">📚 ${unitNames[u % unitNames.length]}</span>
      <div style="border-top:3px solid ${unitColor}; margin-top:-10px;"></div>
    </div>`;
    for (let i = startIdx; i < endIdx; i++) {
      const chapter = chapters[i];
      const status = progress[i] || 0;
      if (i > startIdx && (i - startIdx) % 3 === 0) {
        html += `<div class="gift-box" data-unit="${u}" data-index="${i}" style="margin:8px 0; width:60px; height:60px; border-radius:16px; background:linear-gradient(145deg,#ffd700,#f0b800); display:flex; align-items:center; justify-content:center; font-size:32px; cursor:pointer; box-shadow:0 6px 20px rgba(255,215,0,0.5), inset 0 -3px 0 #b8860b; border:2px solid #ffed4a; position:relative; flex-shrink:0;"><span>🎁</span><span class="gift-label" style="position:absolute; bottom:-18px; font-size:11px; font-weight:700; color:#888; background:white; padding:2px 10px; border-radius:20px;">كنز</span></div><div class="connector-vertical done" style="height:10px;"></div>`;
      }
      const color = unitColor;
      let cls = 'lesson-circle';
      if (status === 0) cls += ' locked';
      else if (status === 1) cls += ' unlocked';
      else if (status === 2) cls += ' completed';
      const zig = (i % 2 === 0) ? 'zig-right' : 'zig-left';
      let styleColor = '';
      if (status === 1 || status === 2) { styleColor = `background:${color}; border-color:${color};`; }
      const displayIcon = chapter.icon || subjectIcon;
      html += `<div class="${cls} ${zig}" data-index="${i}" style="${styleColor}"><span class="circle-icon">${displayIcon}</span><span class="lesson-name">${chapter.name}</span></div>`;
      if (i < endIdx - 1) { html += `<div class="connector-vertical ${status === 2 ? 'done' : ''}"></div>`; }
    }
  }
  container.innerHTML = html;
  document.querySelectorAll('.gift-box').forEach(box => {
    box.addEventListener('click', function() {
      const unit = parseInt(this.dataset.unit);
      const index = parseInt(this.dataset.index);
      const startIdx = unit * UNIT_SIZE;
      let allDone = true;
      for (let j = index - 3; j < index; j++) {
        if (j >= 0 && progress[j] !== 2) { allDone = false; break; }
      }
    if (state.openedTreasures && state.openedTreasures.includes(index)) {
        showCheerMessage('🎁 تم فتح هذا الكنز مسبقاً!');
        return;
      }
      if (allDone) {
        state.openedTreasures.push(index);
        saveAllData();
        openTreasureBox();
      } else {
        showCheerMessage('🎁 أكمل الدروس الثلاثة أولاً!');
      }
    });
  });

  let changed = false;
  let newProg = [...progress];
  for (let i = 1; i < chapters.length; i++) {
    if (newProg[i] === 0 && newProg[i - 1] === 2) { newProg[i] = 1; changed = true; }
  }
  if (changed) { saveProgress(newProg); setTimeout(renderMap, 50); return; }
  document.querySelectorAll('.lesson-circle.unlocked, .lesson-circle.completed').forEach(el => {
    el.addEventListener('click', function() {
      const idx = parseInt(this.dataset.index);
      if (!isNaN(idx)) openChapter(idx);
    });
  });
  updateStatsUI();
  updateLocationBar();
}

// ================================================================
// 8. LESSON & QUESTIONS
// ================================================================
function openChapter(index) {
  const prog = getProgress();
  if (prog[index] === 0) return;
  state.isTraining = (prog[index] === 2);
  if (!state.isTraining && !state.isSuperSubscribed && state.battery <= 0) {
    showBatteryEmptyPopup();
    return;
  }
  state.currentChapterIndex = index;
  state.currentQuestionIndex = 0;
  state.lessonAnswered = false;
  state.correctCount = 0;
  showScreen('lessonScreen');
  renderLesson();
  updateLocationBar();
}

function showBatteryEmptyPopup() {
  const popup = document.getElementById('batteryPopup');
  if (popup) popup.style.display = 'flex';
}

function startMistakesReview() {
  if (state.wrongQuestions.length === 0) {
    if (typeof showCheerMessage === 'function') showCheerMessage('🎉 لا توجد أخطاء!');
    return;
  }
  state.isReviewing = true;
var seen = {};
state.reviewQuestions = state.wrongQuestions
state.wrongQuestions = state.wrongQuestions.filter(function(w) { return w && w.fullQuestion && w.fullQuestion.q; });
state.reviewQuestions = state.wrongQuestions.map(function(w) { return w.fullQuestion; });

  state.currentQuestionIndex = 0;
  state.lessonAnswered = false;
  state.correctCount = 0;
  showScreen('lessonScreen');
  renderLesson();
}

function finishReview() { const totalReviewed = state.reviewQuestions.length; const remaining = state.wrongQuestions.length; const fixed = totalReviewed - remaining;
state.isReviewing = false; state.reviewQuestions = []; state.currentQuestionIndex = 0;
saveAllData(); updateStatsUI();
document.getElementById('lessonContent').innerHTML = `<div style="text-align:center; padding:16px 0;">
 <div style="font-size:80px; margin-bottom:8px;">📋</div>
  <h2 style="font-size:22px; color:#1e3c72; margin-bottom:8px;">انتهت المراجعة!</h2>
   <div style="background:#e5f8d3; border-radius:16px; padding:12px 24px; display:inline-block; margin-bottom:12px;">
    <span style="color:#286654; font-weight:800; font-size:20px;">✅ ${fixed} صحيح</span> </div> 
    <p style="color:#555; font-size:15px; margin-bottom:16px;">باقي ${remaining} خطأ للمراجعة القادمة</p> 
    <button id="finishReviewBtn" style="width:100%; padding:14px; border:none; border-radius:16px; background:#286654; color:white;
     font-weight:800; font-size:18px; cursor:pointer; box-shadow:0 6px 0 #1a4a3a;">← العودة للخريطة</button> </div>`;
      document.getElementById('lessonProgressFill').style.width = '100%'; document.getElementById('finishReviewBtn').addEventListener('click', function() { backToMap(); }); }

function checkBatteryRefill() { if (state.isSuperSubscribed) return;
const now = Date.now(); const THIRTY_MIN = 30 * 60 * 1000;
if (state.battery >= state.maxBattery) { state.lastBatteryRefillTime = now; return; }
if (!state.lastBatteryRefillTime) { state.lastBatteryRefillTime = now; return; }
const elapsed = now - state.lastBatteryRefillTime; const refills = Math.floor(elapsed / THIRTY_MIN);
if (refills > 0) { const newBattery = Math.min(state.maxBattery, state.battery + refills); const gained = newBattery - state.battery; state.battery = newBattery; state.lastBatteryRefillTime = now; if (state.battery > 0) state.batteryDepleted = false;
if (gained > 0) {
  saveAllData();
  updateStatsUI();
  if (typeof showCheerMessage === 'function') {
    showCheerMessage('🔋 +' + gained + ' بطارية (تعافي تلقائي)');
  }
}
} }

function renderLesson() {
  let questions, total;
  
  if (state.isReviewing) {
    questions = state.reviewQuestions;
    total = questions.length;
  } else {
    const chapters = getChapters();
    const chapter = chapters[state.currentChapterIndex];
    if (!chapter) {
      backToMap();
      return;
    }
    questions = chapter.questions || [];
    total = questions.length;
  }
  
  if (total === 0) {
    if (state.isReviewing) {
      finishReview();
      return;
    }
    document.getElementById('lessonContent').innerHTML = '<p style="text-align:center;color:#888;padding:40px;">📭 لا توجد أسئلة في هذا الدرس.</p>';
    document.getElementById('lessonProgressFill').style.width = '100%';
    return;
  }
  
  if (state.currentQuestionIndex >= total) {
    if (state.isReviewing) {
      finishReview();
      return;
    }
    completeChapter();
    return;
  }
  
  document.getElementById('lessonProgressFill').style.width = ((state.currentQuestionIndex) / total * 100) + '%';
  
  const q = questions[state.currentQuestionIndex];
  
  if (q.type === 'match') {
    renderMatchQuestion(q, state.currentQuestionIndex, total);
  } else if (q.type === 'essay') {
    renderEssayQuestion(q, state.currentQuestionIndex, total);
  } else if (q.type === 'tf') {
    renderTFQuestion(q, state.currentQuestionIndex, total);
  } else {
    renderMCQQuestion(q, state.currentQuestionIndex, total);
  }
  
  updateStatsUI();
  updateLocationBar();
}

// ===== MCQ =====
function renderMCQQuestion(q, current, total) { const letters = ['أ', 'ب', 'ج', 'د'];
const indices = q.options.map((_, i) => i); for (let i = indices.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [indices[i], indices[j]] = [indices[j], indices[i]]; } const shuffledOptions = indices.map(i => q.options[i]); const shuffledCorrect = indices.indexOf(q.correct);
let html = `<div class="question-text">(${current+1}/${total}) ${q.q}</div><div class="options-grid">`; shuffledOptions.forEach((opt, idx) => { html += `<button class="option-btn" data-idx="${idx}"><span class="letter">${letters[idx]}</span>${opt}</button>`; }); html += `</div><button class="action-btn" id="nextBtn" disabled>التالي</button>`; document.getElementById('lessonContent').innerHTML = html;
document.querySelectorAll('.option-btn').forEach(btn => { btn.addEventListener('click', function() { if (state.lessonAnswered) return; const idx = parseInt(this.dataset.idx); handleMCQAnswer(idx, shuffledCorrect, q, shuffledOptions); }); }); document.getElementById('nextBtn').addEventListener('click', function() { if (state.lessonAnswered) { state.currentQuestionIndex++; state.lessonAnswered = false; renderLesson(); } }); }


function removeFromWrongQuestions(questionObj) {
  if (!state.isReviewing || !questionObj) return;
  var qText = questionObj.q;
  state.wrongQuestions = state.wrongQuestions.filter(function(w) {
    return w.question !== qText;
  });
  saveAllData();
}

function handleMCQAnswer(selected, correct, questionObj, shuffledOptions) {
  state.lessonAnswered = true;
  const btns = document.querySelectorAll('.option-btn');
  const isCorrect = (selected === correct);
  btns.forEach((btn, i) => {
    btn.classList.add('disabled');
    if (i === correct) btn.classList.add('correct');
    if (i === selected && !isCorrect) btn.classList.add('wrong');
  });
  const nextBtn = document.getElementById('nextBtn');
  if (isCorrect) {
    if (state.isReviewing && questionObj) removeFromWrongQuestions(questionObj);
    let earned = state.doublePoints ? 5 : 2;
    if (state.doublePoints) { state.doublePoints = false; showCheerMessage('⭐ انت أسطورة'); }
    state.xp += earned; state.correctCount++;
    if (typeof updateQuestProgress === 'function') {
      updateQuestProgress('xpToday', earned);
      updateQuestProgress('consecutiveCorrect', 1);
    }
    if (state.correctCount % 3 === 0) { state.doublePoints = true; showCheerMessage('⭐ انت أسطورة'); }
    playCorrectSound(); launchConfetti();
    nextBtn.textContent = 'ممتاز! ➜'; nextBtn.className = 'action-btn primary';
    showFeedback(true, 'ممتاز! 🎉');
  } else {
    if (!state.isSuperSubscribed) state.battery = Math.max(0, state.battery - 1);
    state.correctCount = 0; state.doublePoints = false;
    if (typeof updateQuestProgress === 'function') {
      updateQuestProgress('consecutiveCorrect', 0, 'reset');
    }
    playWrongSound();
    nextBtn.textContent = 'حاول مجدداً ➜'; nextBtn.className = 'action-btn secondary';
    if (questionObj) {
      const opts = shuffledOptions || questionObj.options;
      state.wrongQuestions.push({ 
        type: 'mcq', 
        question: questionObj.q, 
        correctAnswer: opts[correct], 
        userAnswer: opts[selected], 
        fullQuestion: questionObj 
      });
    }
    if (state.battery === 0 && !state.isSuperSubscribed) { state.batteryDepleted = true; showBatteryEmptyPopup(); }
    showFeedback(false, 'حاول مرة أخرى 💪');
  }
  nextBtn.disabled = false;
  saveAllData(); updateStatsUI();
}

// ===== TF =====
function renderTFQuestion(q, current, total) {
  let html = `<div class="question-text">(${current+1}/${total}) ${q.q}</div><div style="display:flex; gap:12px; justify-content:center; margin:16px 0;"><button class="action-btn primary" id="tfTrue" style="flex:1; max-width:120px;">✅ صح</button><button class="action-btn secondary" id="tfFalse" style="flex:1; max-width:120px;">❌ خطأ</button></div><button class="action-btn" id="nextTFBtn" disabled>التالي</button>`;
  document.getElementById('lessonContent').innerHTML = html;
  document.getElementById('tfTrue').addEventListener('click', function() { handleTFAnswer(true, q.answer, q); });
  document.getElementById('tfFalse').addEventListener('click', function() { handleTFAnswer(false, q.answer, q); });
  document.getElementById('nextTFBtn').addEventListener('click', function() {
    if (state.lessonAnswered) { state.currentQuestionIndex++; state.lessonAnswered = false; renderLesson(); }
  });
}

function handleTFAnswer(selected, correct, questionObj) {
  if (state.lessonAnswered) return;
  state.lessonAnswered = true;
  const isCorrect = (selected === correct);
  if (isCorrect) {
    if (state.isReviewing && questionObj) removeFromWrongQuestions(questionObj);
    let earned = state.doublePoints ? 5 : 2;
    if (state.doublePoints) { state.doublePoints = false; showCheerMessage('🔥 مضاعفة!'); }
    state.xp += earned; state.correctCount++;
    if (typeof updateQuestProgress === 'function') {
  updateQuestProgress('xpToday', earned);
  updateQuestProgress('consecutiveCorrect', 1);
}
    if (state.correctCount % 3 === 0) { state.doublePoints = true; showCheerMessage('⭐ مضاعفة للسؤال القادم!'); }
    playCorrectSound(); launchConfetti();
    showFeedback(true, 'ممتاز! 🎉');
  } else {
    if (!state.isSuperSubscribed) state.battery = Math.max(0, state.battery - 1);
    state.correctCount = 0; state.doublePoints = false;
    if (typeof updateQuestProgress === 'function') {
  updateQuestProgress('consecutiveCorrect', 0, 'reset');
}
    playWrongSound();
    state.wrongQuestions.push({ type: 'tf', question: questionObj.q, correctAnswer: correct ? 'صح' : 'خطأ',
       userAnswer: selected ? 'صح' : 'خطأ',
      fullQuestion: questionObj });
    if (state.battery === 0 && !state.isSuperSubscribed) { state.batteryDepleted = true; showBatteryEmptyPopup(); }
    showFeedback(false, 'حاول مرة أخرى 💪');
  }
  const nextBtn = document.getElementById('nextTFBtn');
  nextBtn.disabled = false;
  if (isCorrect) { nextBtn.textContent = 'ممتاز! ➜'; nextBtn.className = 'action-btn primary'; } else { nextBtn.textContent = 'حاول مجدداً ➜'; nextBtn.className = 'action-btn secondary'; }
  saveAllData(); updateStatsUI();
}

// ===== MATCH =====
let matchState = { selectedSide: null, selectedIndex: null, matchedPairs: [] };
function renderMatchQuestion(q, current, total) {
  const pairs = q.pairs || [{ left: 'مثال 1', right: 'تعريف 1' }, { left: 'مثال 2', right: 'تعريف 2' }, { left: 'مثال 3', right: 'تعريف 3' }, { left: 'مثال 4', right: 'تعريف 4' }];
  matchState = { selectedSide: null, selectedIndex: null, matchedPairs: pairs.map(() => false) };
  const rightOrder = pairs.map((_, i) => i).sort(() => Math.random() - 0.5);
  let html = `<div class="question-text">(${current+1}/${total}) 🧩 ${q.q || 'طابق المفاهيم مع التعاريف'}</div><div class="match-container"><div class="match-column"><div class="match-header">⬅️ المفاهيم</div>`;
  pairs.forEach((p, i) => { html += `<div class="match-item ${matchState.matchedPairs[i] ? 'matched' : ''}" data-side="left" data-pair="${i}">${p.left}</div>`; });
  html += `</div><div class="match-column"><div class="match-header">التعاريف ➡️</div>`;
  rightOrder.forEach(origIdx => { html += `<div class="match-item ${matchState.matchedPairs[origIdx] ? 'matched' : ''}" data-side="right" data-pair="${origIdx}">${pairs[origIdx].right}</div>`; });
  html += `</div></div><div id="matchStatus">اختر عنصراً من أي عمود</div><button class="action-btn" id="nextMatchBtn" disabled>التالي</button>`;
  document.getElementById('lessonContent').innerHTML = html;
  document.querySelectorAll('.match-item:not(.matched)').forEach(el => {
    el.addEventListener('click', function() {
      if (state.lessonAnswered) return;
      const side = this.dataset.side;
      const pairIdx = parseInt(this.dataset.pair);
      if (matchState.matchedPairs[pairIdx]) return;
      if (matchState.selectedSide === null) {
        document.querySelectorAll('.match-item').forEach(el => el.classList.remove('selected-left', 'selected-right'));
        matchState.selectedSide = side; matchState.selectedIndex = pairIdx;
        this.classList.add(side === 'left' ? 'selected-left' : 'selected-right');
        document.getElementById('matchStatus').textContent = 'اختر المقابل من الجانب الآخر';
        return;
      }
      const firstSide = matchState.selectedSide;
      const firstPair = matchState.selectedIndex;
      const firstEl = document.querySelector(`.match-item[data-side="${firstSide}"][data-pair="${firstPair}"]`);
      if (firstSide === side && firstPair === pairIdx) {
        matchState.selectedSide = null; matchState.selectedIndex = null;
        document.querySelectorAll('.match-item').forEach(el => el.classList.remove('selected-left', 'selected-right'));
        document.getElementById('matchStatus').textContent = 'اختر عنصراً من أي عمود';
        return;
      }
      const isMatch = (firstPair === pairIdx);
      if (isMatch) {
        matchState.matchedPairs[pairIdx] = true;
        firstEl.classList.remove('selected-left', 'selected-right'); firstEl.classList.add('matched');
        this.classList.remove('selected-left', 'selected-right'); this.classList.add('matched');
        matchState.selectedSide = null; matchState.selectedIndex = null;
        document.getElementById('matchStatus').textContent = '✅ تطابق صحيح!';
        playCorrectSound(); launchConfetti();
        if (matchState.matchedPairs.every(v => v === true)) {
          state.lessonAnswered = true; state.xp += 2;
          state.correctCount++;
          if (state.isReviewing) removeFromWrongQuestions(q);
          document.getElementById('matchStatus').textContent = '🎉 تم إكمال جميع التطابقات!';
          document.getElementById('nextMatchBtn').disabled = false;
          document.getElementById('nextMatchBtn').textContent = 'ممتاز! ➜';
          document.getElementById('nextMatchBtn').className = 'action-btn primary';
          saveAllData(); updateStatsUI();
        }
      } else {
        firstEl.classList.add('wrong-match'); this.classList.add('wrong-match');
        playWrongSound();
        if (!state.isSuperSubscribed) state.battery = Math.max(0, state.battery - 1);
        state.wrongQuestions.push({ type: 'match', question: q.q || 'مطابقة', correctAnswer: pairs[firstPair].right, 
          userAnswer: pairs[pairIdx].right,
        fullQuestion: q});
        updateBatteryUI();
        document.getElementById('matchStatus').textContent = '❌ تطابق خاطئ!';
        setTimeout(() => {
          firstEl.classList.remove('wrong-match'); this.classList.remove('wrong-match');
          document.querySelectorAll('.match-item').forEach(el => el.classList.remove('selected-left', 'selected-right'));
          matchState.selectedSide = null; matchState.selectedIndex = null;
          document.getElementById('matchStatus').textContent = 'اختر عنصراً من أي عمود';
          if (state.battery === 0 && !state.isSuperSubscribed) { state.batteryDepleted = true; showBatteryEmptyPopup(); }
          updateStatsUI();
        }, 700);
        saveAllData(); updateStatsUI();
      }
    });
  });
  document.getElementById('nextMatchBtn').addEventListener('click', function() {
    if (state.lessonAnswered) { state.currentQuestionIndex++; state.lessonAnswered = false; renderLesson(); }
  });
}

// ===== ESSAY =====
function renderEssayQuestion(q, current, total) {
  let html = `<div class="question-text">(${current+1}/${total}) ${q.q}</div><textarea id="essayInput" placeholder="اكتب إجابتك..."></textarea><button class="action-btn" id="submitEssayBtn">تحقق</button><div class="essay-feedback" id="essayFeedback"></div><button class="action-btn" id="nextEssayBtn" disabled>التالي</button>`;
  document.getElementById('lessonContent').innerHTML = html;
  document.getElementById('submitEssayBtn').addEventListener('click', function() {
    if (state.lessonAnswered) return;
    const input = document.getElementById('essayInput').value.trim();
    if (input.length < 3) { alert('اكتب إجابة أطول.'); return; }
    const model = q.modelAnswer || 'الإجابة النموذجية';
    const sim = getSimilarity(input, model);
    const correct = sim > 0.4;
    const feedback = document.getElementById('essayFeedback');
    feedback.classList.add('show');
    state.lessonAnswered = true;
    if (correct) {
      if (state.isReviewing) removeFromWrongQuestions(q);
      let earned = state.doublePoints ? 5 : 2;
      if (state.doublePoints) { state.doublePoints = false; showCheerMessage('🔥 مضاعفة!'); }
      state.xp += earned;
      state.correctCount++;
      playCorrectSound(); launchConfetti();
      feedback.className = 'essay-feedback show correct';
      feedback.innerHTML = `✅ ممتاز!<div class="model-answer">${model}</div>`;
      document.getElementById('nextEssayBtn').textContent = 'ممتاز! ➜';
      document.getElementById('nextEssayBtn').className = 'action-btn primary';
    } else {
      if (!state.isSuperSubscribed) state.battery = Math.max(0, state.battery - 1);
      playWrongSound();
      state.wrongQuestions.push({ type: 'essay', question: q.q, correctAnswer: model, userAnswer: input });
      feedback.className = 'essay-feedback show wrong';
      feedback.innerHTML = `❌ حاول مرة أخرى!<div class="model-answer">${model}</div>`;
      document.getElementById('nextEssayBtn').textContent = 'حاول مجدداً ➜';
      document.getElementById('nextEssayBtn').className = 'action-btn secondary';
      if (state.battery === 0 && !state.isSuperSubscribed) { state.batteryDepleted = true; showBatteryEmptyPopup(); }
    }
    document.getElementById('submitEssayBtn').disabled = true;
    document.getElementById('nextEssayBtn').disabled = false;
    saveAllData(); updateStatsUI();
  });
  document.getElementById('nextEssayBtn').addEventListener('click', function() {
    if (state.lessonAnswered) { state.currentQuestionIndex++; state.lessonAnswered = false; renderLesson(); }
  });
}

function getSimilarity(str1, str2) {
  // تنظيف: نشيل التشكيل والرموز والأرقام
  const clean = (s) => s
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')  // نشيل التشكيل
    .replace(/[.,!?؟،؛:;()\[\]{}"'`\-_]/g, ' ')
    .replace(/[٠-٩0-9]/g, ' ')              // نشيل الأرقام
    .replace(/\s+/g, ' ')
    .trim();

  const s1 = clean(str1);
  const s2 = clean(str2);

  if (!s1.length || !s2.length) return 0;

  // تقسيم لكلمات (نتجاهل الكلمات القصيرة مثل: في، من، على)
  const stopWords = ['في', 'من', 'على', 'الى', 'إلى', 'عن', 'مع', 'هو', 'هي', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'أن', 'ان', 'لا', 'ما', 'كل', 'او', 'أو', 'ثم', 'قد'];
  const words1 = s1.split(' ').filter(w => w.length > 2 && !stopWords.includes(w));
  const words2 = s2.split(' ').filter(w => w.length > 2 && !stopWords.includes(w));

  if (words1.length === 0 || words2.length === 0) return 0;

  // نحسب الكلمات المطابقة
  let matched = 0;
  for (const w1 of words1) {
    if (words2.some(w2 => w2.includes(w1) || w1.includes(w2))) {
      matched++;
    }
  }

  // النسبة = الكلمات المطابقة ÷ كلمات إجابة الطالب
  return matched / words1.length;
}

// ================================================================
// 9. FEEDBACK
// ================================================================
function showFeedback(isCorrect, message) {
  let bubble = document.getElementById('feedbackBubble');
  if (!bubble) {
    bubble = document.createElement('div');
    bubble.id = 'feedbackBubble';
    bubble.style.cssText = `display:none; position:fixed; top:20%; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.8); color:white; padding:12px 24px; border-radius:50px; font-size:18px; font-weight:700; z-index:9999; pointer-events:none; transition: all 0.3s ease;`;
    bubble.innerHTML = `<span id="feedbackIcon">✅</span> <span id="feedbackText">ممتاز!</span>`;
    document.body.appendChild(bubble);
  }
  const icon = document.getElementById('feedbackIcon');
  const text = document.getElementById('feedbackText');
  if (isCorrect) {
    icon.textContent = '🎉'; text.textContent = message || 'ممتاز!';
    bubble.style.background = 'rgba(38, 127, 83, 0.9)';
  } else {
    icon.textContent = '😅'; text.textContent = message || 'حاول مرة أخرى';
    bubble.style.background = 'rgba(200, 50, 50, 0.9)';
  }
  bubble.style.display = 'block';
  clearTimeout(bubble._timer);
  bubble._timer = setTimeout(() => { bubble.style.display = 'none'; }, 1500);
}

// ================================================================
// 10. COMPLETE CHAPTER + TREASURE BOX
// ================================================================
function completeChapter() { 
if (state.isTraining) { 
const chapter = getChapters()[state.currentChapterIndex];
const totalQuestions = chapter ? (chapter.questions || []).length : 1; 
const correctAnswers = state.correctCount || 0;
const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0; 
const trainingXP = correctAnswers;
state.xp += trainingXP;
state.isTraining = false;
saveAllData();
updateStatsUI();
playCorrectSound();
launchConfetti();

document.getElementById('lessonContent').innerHTML = `
  <div style="text-align:center; padding:16px 0;">
    <div style="font-size:80px; margin-bottom:8px;">🎯</div>
    <h2 style="font-size:22px; color:#1e3c72; margin-bottom:8px;">أحسنت! تدريب رائع</h2>
    <div style="background:#e5f8d3; border-radius:16px; padding:12px 24px; display:inline-block; margin-bottom:12px;">
      <span style="color:#286654; font-weight:800; font-size:20px;">+${trainingXP} ⭐</span>
    </div>
    <p style="color:#555; font-size:15px; margin-bottom:16px;">تقييمك: ${percentage}%</p>
    <p style="color:#888; font-size:13px; margin-bottom:16px;">💡 وضع التدريب لا يستهلك بطارية</p>
    <button id="finishTrainingBtn" style="width:100%; padding:14px; border:none; border-radius:16px; background:#286654; color:white; font-weight:800; font-size:18px; cursor:pointer; box-shadow:0 6px 0 #1a4a3a;">← العودة للخريطة</button>
  </div>
`;
document.getElementById('lessonProgressFill').style.width = '100%';
document.getElementById('finishTrainingBtn').addEventListener('click', function() {
  state.isTraining = false;
  backToMap();
});
return;
}
  const p = getProgress();
  p[state.currentChapterIndex] = 2;
  saveProgress(p);
  const chapter = getChapters()[state.currentChapterIndex];
  const totalQuestions = chapter ? (chapter.questions||[]).length : 1;
  const correctAnswers = state.correctCount || 0;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  if (typeof updateQuestProgress === 'function') {
  updateQuestProgress('lessonsToday', 1);
  updateQuestProgress('xpToday', 5);
  if (percentage === 100) {
    updateQuestProgress('perfectLessonsToday', 1);
  }
}
  let emoji = '🦉', grade = 'رائع!', message = 'أنت نجم! 🌟', bgColor = '#e5f8d3', textColor = '#2a7a00';
  if (percentage === 100) { emoji = '🏆'; grade = 'ممتاز! بلا أخطاء'; message = 'أنت عبقري! 🧠'; }
  else if (percentage >= 80) { emoji = '⭐'; grade = 'جيد جداً!'; message = 'تقترب من الإتقان! 💪'; }
  else if (percentage >= 60) { emoji = '📖'; grade = 'جيد!'; message = 'استمر في التدريب! 🌱'; }
  else { emoji = '💪'; grade = 'حاول مرة أخرى!'; message = 'الممارسة تصنع الإتقان! 🚀'; bgColor = '#fff3e0'; textColor = '#e65100'; }
  state.xp += 5; state.gems += 3;
  playCorrectSound(); launchConfetti(); setTimeout(launchConfetti, 500);
  showCheerMessage(`🏆 أكملت الدرس! +3 💎`);
  state.scrollToIndex = state.currentChapterIndex;
  const nextIdx = state.currentChapterIndex + 1;
  const chapters = getChapters();
  if (nextIdx < chapters.length && p[nextIdx] === 0) { p[nextIdx] = 1; saveProgress(p); }
  if (!state.isSuperSubscribed) {
    state.battery = Math.max(0, state.battery - 8);
    if (state.battery === 0 && !state.isSuperSubscribed) { state.batteryDepleted = true; showBatteryEmptyPopup(); }
  }
  handleStreakAfterLesson();
  saveAllData(); updateStatsUI();
  document.getElementById('lessonContent').innerHTML = `
    <div id="lessonComplete" style="text-align:center; padding:16px 0;">
      <div style="font-size:80px; margin-bottom:4px;">${emoji}</div>
      <div style="background:${bgColor}; border-radius:16px; padding:6px 20px; display:inline-block; margin-bottom:8px;">
        <span style="color:${textColor}; font-weight:800; font-size:18px;">✅ ${grade}</span>
      </div>
      <p style="color:#555; font-size:15px; font-weight:600; margin-bottom:12px;">${message}</p>
      <div style="display:flex; justify-content:space-around; background:#f7f9fc; border-radius:16px; padding:12px; margin-bottom:12px;">
        <div><div style="font-size:11px; color:#888;">النقاط</div><div style="font-size:24px; font-weight:900; color:#1e3c72;">${state.xp}</div></div>
        <div><div style="font-size:11px; color:#888;">التقييم</div><div style="font-size:24px; font-weight:900; color:#F5793B;">${percentage}%</div></div>
        <div><div style="font-size:11px; color:#888;">🔥 الحماسة</div><div style="font-size:24px; font-weight:900; color:#FCCA59;">${state.streak}</div></div>
      </div>
      <button id="finishLessonBtn" style="width:100%; padding:14px; border:none; border-radius:16px; background:#286654; color:white; font-weight:800; font-size:18px; cursor:pointer; box-shadow:0 6px 0 #1a4a3a; transition:0.15s;">🚀 رجوع للخريطة</button>
      <button id="adGemsBtn" style="width:100%; margin-top:8px; padding:12px; border:2px solid #FCCA59; background:#fff8e0; border-radius:16px; font-weight:700; cursor:pointer; color:#1e3c72;">🎬 شاهد إعلان (+5 💎)</button>
      <button id="reviewMistakesBtn" style="width:100%; margin-top:6px; padding:12px; border:2px solid #F296BD; background:#fff0f5; border-radius:16px; font-weight:700; cursor:pointer; color:#d62987;">📋 مراجعة الأخطاء (${state.wrongQuestions.length})</button>
    </div>
  `;
  document.getElementById('lessonProgressFill').style.width = '100%';
  document.getElementById('finishLessonBtn').addEventListener('click', function() {
    backToMap();
    setTimeout(() => {
      const target = document.querySelector(`.lesson-circle[data-index="${state.scrollToIndex}"]`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      state.scrollToIndex = undefined;
    }, 200);
  });
  document.getElementById('adGemsBtn').addEventListener('click', function() { showAdPopup(); });
  document.getElementById('reviewMistakesBtn').addEventListener('click', function() {
    if (state.wrongQuestions.length === 0) { alert('🎉 لا توجد أخطاء! أنت متميز!'); return; }
    let msg = '📋 أخطاؤك السابقة:\n\n';
    state.wrongQuestions.forEach((item, i) => {
      msg += `${i+1}. ${item.type === 'mcq' ? 'اختياري' : item.type === 'match' ? 'مطابقة' : item.type === 'tf' ? 'صح/خطأ' : 'مقالي'}\n`;
      msg += `   س: ${item.question}\n`;
      msg += `   ✅ الإجابة الصحيحة: ${item.correctAnswer}\n`;
      if (item.userAnswer) msg += `   ❌ إجابتك: ${item.userAnswer}\n`;
      msg += '\n';
    });
    alert(msg);
  });
}

function openTreasureBox() {
  const rewards = [{ type: 'gems', amount: 3, icon: '💎', message: '3 جواهر!' }, { type: 'battery', amount: 2, icon: '🔋', message: '2 بطارية!' }, { type: 'freeze', amount: 1, icon: '❄️', message: 'تجميد مجاني!' }];
  const reward = rewards[Math.floor(Math.random() * rewards.length)];
  if (reward.type === 'gems') { state.gems += reward.amount; }
  else if (reward.type === 'battery') { state.battery = Math.min(state.maxBattery, state.battery + reward.amount); }
  else if (reward.type === 'freeze') { state.streakFreeze += reward.amount; }
  saveAllData(); updateStatsUI();
  const popup = document.createElement('div');
  popup.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:999999; padding:20px;`;
  popup.innerHTML = `<div style="background:white; border-radius:32px; padding:30px 24px; max-width:380px; width:100%; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.3); position:relative; overflow:hidden;">
    <div style="position:absolute; top:-20px; left:-20px; right:-20px; bottom:-20px; background:radial-gradient(circle, rgba(252,202,89,0.3), transparent 70%); border-radius:50%; animation:pulseGlow 1.5s ease-in-out infinite; pointer-events:none;"></div>
    <div style="font-size:64px; margin-bottom:8px; position:relative; z-index:1;">🎁</div>
    <h2 style="font-size:24px; font-weight:800; color:#1e3c72; margin-bottom:4px; position:relative; z-index:1;">صندوق الكنز!</h2>
    <p style="font-size:16px; color:#555; margin-bottom:16px; position:relative; z-index:1;">🎉 مكافأتك:</p>
    <div style="font-size:48px; font-weight:900; color:#FCCA59; position:relative; z-index:1;">${reward.icon} ${reward.message}</div>
    <button id="closeTreasureBtn" style="width:100%; margin-top:16px; padding:12px; border:none; border-radius:16px; background:#286654; color:white; font-weight:800; font-size:18px; cursor:pointer; box-shadow:0 4px 0 #1a4a3a; position:relative; z-index:1; transition:0.15s;">🚀 رائع! تابع التعلم</button>
  </div>`;
  document.body.appendChild(popup);
  launchConfetti(); setTimeout(launchConfetti, 300);
  const style = document.createElement('style');
  style.textContent = `@keyframes pulseGlow { 0%, 100% { transform:scale(1); opacity:0.6; } 50% { transform:scale(1.1); opacity:1; } }`;
  document.head.appendChild(style);
  popup.querySelector('#closeTreasureBtn').addEventListener('click', function() { popup.remove(); });
  popup.addEventListener('click', function(e) { if (e.target === popup) popup.remove(); });
}

// ================================================================
// 11. ADVERTISEMENT
// ================================================================
let adCountdown = 5, adInterval = null;
function showAdPopup() {
  const popup = document.getElementById('adPopup');
  if (!popup) return;
  popup.style.display = 'flex';
  adCountdown = 5;
  const timerDisplay = document.getElementById('adTimerDisplay');
  const rewardBtn = document.getElementById('adRewardBtn');
  timerDisplay.textContent = adCountdown;
  rewardBtn.style.opacity = '0.5'; rewardBtn.style.pointerEvents = 'none';
  rewardBtn.textContent = '⏳ انتظر...';
  if (adInterval) clearInterval(adInterval);
  adInterval = setInterval(() => {
    adCountdown -= 1; timerDisplay.textContent = adCountdown;
    if (adCountdown <= 0) {
      clearInterval(adInterval); adInterval = null;
      timerDisplay.textContent = '🎉';
      rewardBtn.style.opacity = '1'; rewardBtn.style.pointerEvents = 'auto';
      rewardBtn.textContent = '🎁 احصل على مكافأتك!';
    }
  }, 1000);
}

function closeAdPopup(getReward = false) {
  const popup = document.getElementById('adPopup');
  if (!popup) return;
  popup.style.display = 'none';
  if (adInterval) { clearInterval(adInterval); adInterval = null; }
  if (getReward) {
    state.gems += 5;
    state.battery = Math.min(state.maxBattery, state.battery + 2);
    saveAllData(); updateStatsUI();
    showCheerMessage('🎉 +5 جواهر و +2 بطارية!');
  }
}

// ================================================================
// 12. SHOP
// ================================================================
function buyFreeze() {
  if (state.gems < 1000) { alert('💎 ليس لديك جواهر كافية! تحتاج 1000 💎'); return; }
  state.gems -= 1000; state.purchasedFreeze += 5;
  saveAllData(); updateStatsUI();
  showCheerMessage('❄️ تم شراء 5 تجميدات! حماسك في أمان.');
}

function buyShield() {
  if (state.gems < 3000) { alert('💎 ليس لديك جواهر كافية! تحتاج 3000 💎'); return; }
  state.gems -= 3000; state.shieldActive = true;
  const expiry = new Date(); expiry.setDate(expiry.getDate() + 7);
  state.shieldExpiry = expiry.toISOString();
  saveAllData(); updateStatsUI();
  showCheerMessage('🛡️ تم تفعيل درع الحماية لمدة 7 أيام!');
}

// ================================================================
// 13. NAVIGATION
// ================================================================
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
  document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === screenId);
  });
}

function backToMap() { showScreen('mapScreen'); renderMap(); }

// ================================================================
// 14. DOMContentLoaded
// ================================================================
document.addEventListener('DOMContentLoaded', function() {
  // قائمة الصفوف
  const gradeSelector = document.getElementById('gradeSelector');
  if (gradeSelector) {
    gradeSelector.addEventListener('click', function(e) {
      e.stopPropagation();
      document.getElementById('gradeDropdown').classList.toggle('open');
      document.getElementById('gradeArrow').classList.toggle('open');
    });
  }
  document.querySelectorAll('.grade-dropdown .grade-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const grade = this.dataset.grade;
      state.currentGrade = grade;
      document.getElementById('appTitle').textContent = this.textContent;
      document.querySelectorAll('.grade-dropdown .grade-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      document.getElementById('gradeDropdown').classList.remove('open');
      document.getElementById('gradeArrow').classList.remove('open');
      updateSubjectTabs(); renderMap(); saveAllData();
    });
  });

  // البطارية
  const closeBattery = document.getElementById('closeBatteryPopup');
  if (closeBattery) closeBattery.addEventListener('click', function() { document.getElementById('batteryPopup').style.display = 'none'; });
  const batteryAdBtn = document.getElementById('batteryAdBtn');
  if (batteryAdBtn) batteryAdBtn.addEventListener('click', function() { showAdPopup(); });
  //زر مراجعة الاخطاء في صفحة التقدم
  const reviewProgressBtn = document.getElementById('reviewMistakesProgressBtn');
  if (reviewProgressBtn) {reviewProgressBtn.addEventListener('click', function() {if(typeof startMistakesReview === 'function') {startMistakesReview();
  }
});
}
  const batteryFreeBtn = document.getElementById('batteryFreeBtn');
   if (batteryFreeBtn) { batteryFreeBtn.addEventListener('click', function()
     { const now = Date.now(); const SIX_HOURS = 6 * 60 * 60 * 1000;
       if (state.lastFreeBatteryTime && (now - state.lastFreeBatteryTime) < SIX_HOURS) 
        { const remaining = SIX_HOURS - (now - state.lastFreeBatteryTime);
           const hours = Math.floor(remaining / (60 * 60 * 1000));
            const mins = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
             alert('البطارية المجانية متاحة كل 6 ساعات.\n\nمتبقي: ' + hours + ' ساعة و ' + mins + ' دقيقة');
              return; } state.battery = Math.min(state.maxBattery, state.battery + 5);
               state.lastFreeBatteryTime = now; if (state.battery > 0) state.batteryDepleted = false;
                document.getElementById('batteryPopup').style.display = 'none'; saveAllData();
                 updateStatsUI(); showCheerMessage('🎁 +5 بطاريات مجاناً!'); }); }
  
  const batteryIcon = document.getElementById('batteryIcon');
  if (batteryIcon) batteryIcon.addEventListener('click', function() { document.getElementById('batteryPopup').style.display = 'flex'; });

  // الجواهر
  const closeGems = document.getElementById('closeGemsPopup');
  if (closeGems) closeGems.addEventListener('click', function() { document.getElementById('gemsPopup').style.display = 'none'; });
  document.querySelectorAll('.giftShopBtn').forEach(btn => {
    btn.addEventListener('click', function() {
      const gift = this.dataset.gift;
      if (gift === 'morning' || gift === 'night') { state.gems += 10; showCheerMessage('🎁 +10 جواهر!'); }
      else if (gift === 'ad') { showAdPopup(); }
      else if (gift === 'free') { state.gems += 5; showCheerMessage('🎁 +5 جواهر مجانية!'); }
      saveAllData(); updateStatsUI();
      const countEl = document.getElementById('gemsPopupCount');
      if (countEl) countEl.textContent = state.gems;
    });
  });
  const closeStreak = document.getElementById('closeStreakPopup');
  if (closeStreak) closeStreak.addEventListener('click', function() { document.getElementById('streakPopup').style.display = 'none'; });
// ================================================================
// 🚀 تأكدي من وجود هذا الكود في ملف script.js (في نهاية DOMContentLoaded)
// ================================================================

// ✅ استدعاء تهيئة التقويم الشهري
initStreakCalendar();

// ✅ إذا ما زال لا يظهر، جربي إضافة هذا الكود في نهاية الملف
setTimeout(() => {
    initStreakCalendar();
}, 500);
  // الاشتراكات (مع رسالة قريباً)
  const PRICING = {
    monthly: { price: 25000, gems: 100 }, yearly: { price: 250000, gems: 500 },
    family: { price: 400000, gems: 1000 }, gems_small: { price: 10000, gems: 100 },
    gems_medium: { price: 25000, gems: 300 }, gems_large: { price: 50000, gems: 700 }
  };
  
  const subNavBtn = document.getElementById('subscriptionNavBtn');
  if (subNavBtn) subNavBtn.addEventListener('click', function() { showScreen('subscriptionScreen'); });
  
  const backFromSubscriptionBtn = document.getElementById('backFromSubscriptionBtn');
  if (backFromSubscriptionBtn) backFromSubscriptionBtn.addEventListener('click', function() { showScreen('mapScreen'); });
  
  document.querySelectorAll('.sub-buy-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      alert('🛠️ طرق الدفع (ماستر كارد وزين كاش) ستكون متاحة قريباً!');
    });
  });
  
  document.querySelectorAll('.gems-buy-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      alert('🛠️ شراء الجواهر (ماستر كارد وزين كاش) سيكون متاحاً قريباً!');
    });
  });

  // المتجر
  const buyFreezeBtn = document.getElementById('buyFreezeBtn');
  if (buyFreezeBtn) buyFreezeBtn.addEventListener('click', buyFreeze);
  const buyShieldBtn = document.getElementById('buyShieldBtn');
  if (buyShieldBtn) buyShieldBtn.addEventListener('click', buyShield);

  // الإعلان
  const adRewardBtn = document.getElementById('adRewardBtn');
  if (adRewardBtn) {
    adRewardBtn.addEventListener('click', function() {
      if (this.style.pointerEvents === 'none') return;
      closeAdPopup(true);
    });
  }
  const adSkipBtn = document.getElementById('adSkipBtn');
  if (adSkipBtn) {
    adSkipBtn.addEventListener('click', function() {
      if (confirm('⚠️ تخطي يعني خسارة المكافأة. متأكد؟')) { closeAdPopup(false); }
    });
  }

  // اسم المستخدم والأصدقاء
  const setUsernameBtn = document.getElementById('setUsernameBtn');
if (setUsernameBtn) {
    setUsernameBtn.addEventListener('click', function() {
        const newUsername = prompt('أدخل اسم المستخدم (يوزر نيم) - 4 أحرف على الأقل، بالإنكليزي بدون مسافات:');
        if (!newUsername) return;
        
        let username = newUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        
        if (username.length < 4) {
            alert('⚠️ اليوزر نيم يجب أن يكون 4 أحرف على الأقل (بالإنكليزي)');
            return;
        }
        
        if (username.length > 20) {
            alert('⚠️ اليوزر نيم طويل جداً (الحد الأقصى 20 حرف)');
            return;
        }
        
        const allUsers = JSON.parse(localStorage.getItem('all_usernames') || '[]');
        if (allUsers.includes(username) && username !== state.userData.username) {
            alert('⚠️ هذا اليوزر نيم مستخدم بالفعل. جرب غيره.');
            return;
        }
        
        if (!state.userData.username) state.gems += 5;
        
        // حذف اليوزر القديم من القائمة (لو موجود)
        if (state.userData.username) {
            const idx = allUsers.indexOf(state.userData.username);
            if (idx > -1) allUsers.splice(idx, 1);
        }
        
        state.userData.username = username;
        allUsers.push(username);
        localStorage.setItem('all_usernames', JSON.stringify(allUsers));
        
        const usernameEl = document.getElementById('profileUsername');
        if (usernameEl) usernameEl.textContent = '@' + username;
        
        saveAllData();
        updateStatsUI();
        showCheerMessage('✅ تم تعيين اسم المستخدم: @' + username);
    });
}
  const addFriendBtn = document.getElementById('addFriendBtn');
  if (addFriendBtn) {
    addFriendBtn.addEventListener('click', function() {
      const username = prompt('أدخل يوزر نيم الصديق:');
      if (!username || username.trim() === '') return;
      const trimmed = username.trim();
      const allUsers = JSON.parse(localStorage.getItem('all_usernames') || '[]');
      if (!allUsers.includes(trimmed)) { alert('❌ لا يوجد مستخدم بهذا اليوزر نيم.'); return; }
      if (trimmed === state.userData.username) { alert('⚠️ لا يمكنك إضافة نفسك.'); return; }
      if (state.userData.friends.includes(trimmed)) { alert('✅ هذا الصديق مضاف بالفعل.'); return; }
      const wasEmpty = state.userData.friends.length === 0;
      state.userData.friends.push(trimmed);
      if (!state.friendAdded && wasEmpty) {
  state.gems += 50;
  state.friendAdded = true;
  showCheerMessage('🎉 +50 جوهرة! مكافأة أول صديق!');
}
      saveAllData(); updateFriendsScreen(); showCheerMessage('👋 تم إضافة ' + trimmed);
    });
  }
  const friendSearchBtn = document.getElementById('friendSearchBtn');
  if (friendSearchBtn) {
    friendSearchBtn.addEventListener('click', function() {
      const input = document.getElementById('friendSearchInput');
      const result = document.getElementById('friendSearchResult');
      if (!input || !result) return;
      const val = input.value.trim();
      if (!val) { result.style.display = 'block'; result.innerHTML = '⚠️ أدخل يوزر نيم للبحث.'; return; }
      const allUsers = JSON.parse(localStorage.getItem('all_usernames') || '[]');
      if (!allUsers.includes(val)) { result.style.display = 'block'; result.innerHTML = '❌ لم يتم العثور على مستخدم.'; return; }
      if (val === state.userData.username) { result.style.display = 'block'; result.innerHTML = '⚠️ هذا حسابك الشخصي!'; return; }
      // ✅ التحقق من نوع الحساب
if (state.userData.accountType === 'private') {
    result.style.display = 'block';
    result.innerHTML = '🔒 حسابك خاص — لا يمكن للآخرين إيجادك';
    return;
}
      if (state.userData.friends.includes(val)) { result.style.display = 'block'; result.innerHTML = '✅ هذا الصديق مضاف بالفعل!'; return; }
      result.style.display = 'block';
      result.innerHTML = `👤 <strong>${val}</strong><button id="addFriendFromSearch" style="margin-right:10px; padding:4px 12px; border:none; border-radius:12px; background:#286654; color:white; font-weight:700; cursor:pointer;">➕ إضافة</button>`;
      document.getElementById('addFriendFromSearch').addEventListener('click', function() {
        const wasEmpty = state.userData.friends.length === 0;
        state.userData.friends.push(val);
        if (!state.friendAdded && wasEmpty) {
  state.gems += 50;
  state.friendAdded = true;
  showCheerMessage('🎉 +50 جوهرة! مكافأة أول صديق!');
        }
        saveAllData(); updateFriendsScreen();
        result.style.display = 'none';
        if (input) input.value = '';
        showCheerMessage('👋 تم إضافة ' + val);
      });
    });
  }

  // الإعدادات
  const toggleEmail = document.getElementById('toggleEmail');
  if (toggleEmail) {
    toggleEmail.addEventListener('click', function() {
      state.userData.showEmail = !state.userData.showEmail;
      saveAllData(); updateProfileScreen();
    });
  }
const toggleDark = document.getElementById('toggleDark');
if (toggleDark) {
  toggleDark.addEventListener('click', function() {
    this.classList.toggle('active');
    state.darkMode = this.classList.contains('active');
    if (state.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    saveAllData();
  });
}
  // أزرار التقدم
  const claimGiftBtn = document.getElementById('claimGiftBtn');
  if (claimGiftBtn) {
    claimGiftBtn.addEventListener('click', function() {
      state.battery = Math.min(state.maxBattery, state.battery + 2);
      if (state.battery > 0) state.batteryDepleted = false;
      saveAllData(); updateStatsUI(); showCheerMessage('🔋 +2 بطارية!');
    });
  }
  const subscribeBtn = document.getElementById('subscribeBtn');
  if (subscribeBtn) {
    subscribeBtn.addEventListener('click', function() {
      state.isSuperSubscribed = !state.isSuperSubscribed;
      if (state.isSuperSubscribed) {
        const chapters = getChapters();
        const progress = getProgress();
        for (let i = 0; i < chapters.length; i++) { if (progress[i] === 0) progress[i] = 1; }
        saveProgress(progress);
        updateBatteryUI();
        showCheerMessage('👑 اشتراك سوبر مفعل! طاقة لا نهائية وكل الدروس مفتوحة! ♾️');
        this.textContent = '👑 اشتراك سوبر (مفعل)';
        this.style.background = '#ffd700';
      } else {
        state.isSuperSubscribed = false;
        updateBatteryUI();
        showCheerMessage('تم إلغاء الاشتراك');
        this.textContent = '👑 اشتراك سوبر (طاقة لا نهائية)';
        this.style.background = '#fff8e0';
      }
      saveAllData(); updateStatsUI(); renderMap();
    });
  }
  const refillBtn = document.getElementById('refillBtn');
  if (refillBtn) {
    refillBtn.addEventListener('click', function() {
      if (state.gems >= 300) {
        state.gems -= 300; state.battery = state.maxBattery; state.batteryDepleted = false;
        saveAllData(); updateStatsUI(); showCheerMessage('⚡ تم شحن البطارية بالكامل!');
      } else { alert('💎 ليس لديك جواهر كافية! تحتاج 300 💎'); }
    });
  }

  // الأزرار السفلية
  document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', function() {
      const target = this.dataset.target;
      if (document.getElementById('lessonScreen').classList.contains('active') && target !== 'mapScreen') {
        if (!confirm('أنت في منتصف الدرس، هل تريد الخروج؟')) return;
        backToMap();
        setTimeout(() => { document.querySelector(`.bottom-nav .nav-item[data-target="${target}"]`).click(); }, 100);
        return;
      }
      showScreen(target);
      if (target === 'mapScreen') renderMap();
      if (target === 'progressScreen') updateProgressScreen();
      if (target === 'friendsScreen') updateFriendsScreen();
      if (target === 'profileScreen') updateProfileScreen();
    });
  });
  const backBtn = document.getElementById('backToMapBtn');
  if (backBtn) backBtn.addEventListener('click', backToMap);

  // التهيئة النهائية
  loadAllData();
  updateStreak();
  updateSubjectTabs();
  renderMap();
  initStreakCalendar();
  checkShieldExpiry();
  updateBatteryUI();
  checkBatteryRefill();
  setInterval(checkBatteryRefill, 60000);
  // ✅ تصدير دوال المهام اليومية للمدى العام
  window.updateQuestProgress = updateQuestProgress;
  window.initDailyQuests = initDailyQuests;
  window.renderDailyQuests = renderDailyQuests;
  window.getTodayKey = getTodayKey;
  window.claimQuest = claimQuest;

// ================================
// 🛠️ نسخة نهائية مُصحَّحة للتقويم...
// ================================
// ================================================================
// 🛠️ نسخة نهائية مُصحَّحة للتقويم (2026/09/10)
// ================================================================

// دالة مساعدة للحصول على التاريخ المحلي بصيغة YYYY-MM-DD
function getLocalDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// دالة عرض التقويم (مع دعم لا نهائي للسنوات)
function renderStreakCalendar3(monthOffset = 0) {
    const now = new Date();
    const todayStr = getLocalDateString(now); // ✅ استخدام التاريخ المحلي
    
    // ✅ حساب السنة والشهر بشكل رياضي (يدعم أي عدد من الشهور)
    const totalMonths = now.getFullYear() * 12 + now.getMonth() + monthOffset;
    const displayYear = Math.floor(totalMonths / 12);
    const displayMonth = ((totalMonths % 12) + 12) % 12;
    
    const firstDay = new Date(displayYear, displayMonth, 1).getDay();
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    let html = `<div class="streak-calendar" style="background:white; border-radius:20px; padding:16px; margin:12px 0; box-shadow:0 4px 16px rgba(0,0,0,0.06); direction:ltr;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <button class="prevMonthBtn" style="background:none; border:none; font-size:24px; cursor:pointer; color:#99B7F5; padding:0 8px;">◀</button>
            <span style="font-weight:800; font-size:18px; color:#1e3c72;">${monthNames[displayMonth]} ${displayYear}</span>
            <button class="nextMonthBtn" style="background:none; border:none; font-size:24px; cursor:pointer; color:#99B7F5; padding:0 8px;">▶</button>
        </div>
        <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px; text-align:center; font-weight:700; color:#888; font-size:12px; margin-bottom:6px;">
            <span>ح</span><span>ن</span><span>ث</span><span>ر</span><span>خ</span><span>ج</span><span>س</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px; text-align:center;">`;
    
    for (let i = 0; i < firstDay; i++) {
        html += `<div style="padding:6px 0;"></div>`;
    }
    
    const log = state.activityLog || {};
    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(displayYear, displayMonth, day);
        const dateStr = getLocalDateString(dateObj); // ✅ تاريخ محلي
        const isActive = log[dateStr] === true;
        const isToday = dateStr === todayStr; // ✅ مقارنة صحيحة
        const bgColor = isActive ? '#FCCA59' : (isToday ? '#99B7F5' : 'transparent');
        const textColor = isActive ? '#1e3c72' : (isToday ? 'white' : '#555');
        const border = isToday ? '2px solid #286654' : 'none';
        html += `<div style="padding:6px 0; border-radius:50%; background:${bgColor}; color:${textColor}; font-weight:${isActive ? '800' : '400'}; font-size:13px; border:${border}; transition:0.2s;">${day}</div>`;
    }
    
    html += `</div>
        <div style="display:flex; justify-content:space-between; margin-top:12px; font-size:12px; color:#888; border-top:1px solid #eee; padding-top:10px;">
            <span>🔥 الحماسة: <strong style="color:#F5793B;">${state.streak}</strong> يوم</span>
            <span>❄️ التجميدات: <strong style="color:#99B7F5;">${state.streakFreeze + state.purchasedFreeze}</strong></span>
            <span>🛡️ الدرع: <strong style="color:#286654;">${state.shieldActive ? 'مفعل ✅' : 'غير مفعل ❌'}</strong></span>
        </div>
    </div>`;
    return html;
}

// دالة ربط الأزرار
function fixCalendarButtons3() {
    const container = document.getElementById('streakCalendarContainer');
    if (!container) return;
    
    const prevBtn = container.querySelector('.prevMonthBtn');
    const nextBtn = container.querySelector('.nextMonthBtn');
    
    if (prevBtn) {
        const newPrev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrev, prevBtn);
        newPrev.addEventListener('click', function(e) {
            e.stopPropagation();
            if (typeof window.calendarOffset3 === 'undefined') window.calendarOffset3 = 0;
            window.calendarOffset3 -= 1;
            updateCalendar3(window.calendarOffset3);
        });
    }
    
    if (nextBtn) {
        const newNext = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNext, nextBtn);
        newNext.addEventListener('click', function(e) {
            e.stopPropagation();
            if (typeof window.calendarOffset3 === 'undefined') window.calendarOffset3 = 0;
            window.calendarOffset3 += 1;
            updateCalendar3(window.calendarOffset3);
        });
    }
}

// دالة تحديث التقويم
function updateCalendar3(offset) {
    const container = document.getElementById('streakCalendarContainer');
    if (!container) return;
    container.innerHTML = renderStreakCalendar3(offset);
    fixCalendarButtons3();
}

// دالة تهيئة التقويم
function initCalendar3() {
    const container = document.getElementById('streakCalendarContainer');
    if (!container) {
        console.warn('⚠️ حاوية التقويم غير موجودة');
        return;
    }
    window.calendarOffset3 = 0;
    container.innerHTML = renderStreakCalendar3(0);
    fixCalendarButtons3();
    console.log('✅ تم تهيئة التقويم (نسخة 3 - نهائية)');
}

// تشغيل التقويم
setTimeout(function() {
    initCalendar3();
}, 500);
  // ================================================================
// 🎨 اختيار الشخصية (إيموجي)
// ================================================================

var AVATAR_PRESETS = ['😎', '🙂‍↔️', '🤓', '🫡', '👩🏻‍🎓', '🧑🏻‍🎓', '👩🏻‍🔬', '🧑🏻‍🔬', '🦸🏻‍♂️', '🦹🏻', '🦸🏻‍♀️', '🦹🏻‍♀️', '🦊', '🦁', '🦦', '🦢', '⭐', '🪐', '🌙', '☀️', '📒', '🧸', '⚡', '🥷🏻'];

function openAvatarPicker() {
  var modal = document.getElementById('avatarPickerModal');
  var avatarGrid = document.getElementById('avatarGrid');
  if (!modal || !avatarGrid) return;
  
  avatarGrid.innerHTML = '';
  for (var i = 0; i < AVATAR_PRESETS.length; i++) {
    var btn = document.createElement('button');
    btn.textContent = AVATAR_PRESETS[i];
    btn.style.cssText = 'font-size:30px; padding:8px; border:2px solid #ddd; border-radius:12px; background:white; cursor:pointer;';
    btn.setAttribute('data-emoji', AVATAR_PRESETS[i]);
    btn.onclick = function() {
      state.userData.avatar = this.getAttribute('data-emoji');
      saveAllData();
      updateProfileScreen();
      modal.style.display = 'none';
      if (typeof showCheerMessage === 'function') showCheerMessage('تم اختيار الشخصية');
    };
    avatarGrid.appendChild(btn);
  }
  
  modal.style.display = 'flex';
}

setTimeout(function() {
  var avatarBtn = document.getElementById('changeAvatarBtn');
  if (avatarBtn) {
    avatarBtn.onclick = function() { openAvatarPicker(); };
  }
  var closeBtn = document.getElementById('closeAvatarPicker');
  if (closeBtn) {
    closeBtn.onclick = function() {
      document.getElementById('avatarPickerModal').style.display = 'none';
    };
  }
}, 1500);
  setTimeout(function() {
  var editBtn = document.getElementById('editDisplayNameBtn');
  if (editBtn) {
    editBtn.onclick = function() {
      var current = state.userData.name || 'مستخدم';
      var newName = prompt('أدخل اسمك الجديد (حرفان على الأقل):', current);
      if (!newName) return;
      newName = newName.trim();
      if (newName.length < 2) {
        alert('⚠️ الاسم يجب أن يكون حرفين على الأقل');
        return;
      }
      state.userData.name = newName;
      saveAllData();
      updateProfileScreen();
      if (typeof showCheerMessage === 'function') showCheerMessage('تم تعديل الاسم');
    };
  }
}, 1500);
  // ================================================================
// 🔐 نوع الحساب (عام / خاص)
// ================================================================

function updateAccountTypeUI() {
    var publicBtn = document.getElementById('accountPublicBtn');
    var privateBtn = document.getElementById('accountPrivateBtn');
    var hint = document.getElementById('accountTypeHint');
    if (!publicBtn || !privateBtn) return;
    
    var isPrivate = state.userData.accountType === 'private';
    
    if (isPrivate) {
        privateBtn.style.background = '#286654';
        privateBtn.style.color = 'white';
        privateBtn.style.borderColor = '#286654';
        publicBtn.style.background = 'white';
        publicBtn.style.color = '#555';
        publicBtn.style.borderColor = '#ddd';
        if (hint) hint.textContent = '🔒 حسابك خاص — لن يظهر في نتائج البحث';
    } else {
        publicBtn.style.background = '#286654';
        publicBtn.style.color = 'white';
        publicBtn.style.borderColor = '#286654';
        privateBtn.style.background = 'white';
        privateBtn.style.color = '#555';
        privateBtn.style.borderColor = '#ddd';
        if (hint) hint.textContent = '🌍 حسابك عام — يمكن للأصدقاء إيجادك';
    }
}

setTimeout(function() {
    var publicBtn = document.getElementById('accountPublicBtn');
    var privateBtn = document.getElementById('accountPrivateBtn');
    
    if (publicBtn) {
        publicBtn.onclick = function() {
            state.userData.accountType = 'public';
            saveAllData();
            updateAccountTypeUI();
            if (typeof showCheerMessage === 'function') showCheerMessage('🌍 حسابك أصبح عام');
        };
    }
    
    if (privateBtn) {
        privateBtn.onclick = function() {
            state.userData.accountType = 'private';
            saveAllData();
            updateAccountTypeUI();
            if (typeof showCheerMessage === 'function') showCheerMessage('🔒 حسابك أصبح خاص');
        };
    }
    
    updateAccountTypeUI();
}, 1500);
// ================================================================
// 🎯 المهام اليومية (ثابتة + متغيرة)
// ================================================================

// المهام الثابتة (تظهر كل يوم)
var FIXED_QUESTS = [
    { id: 'q_login', icon: '🔥', title: 'سجّل دخولك اليوم', target: 1, reward: 3, field: 'loginToday' }
];

// قائمة المهام المتغيرة (نختار منها 2 عشوائياً كل يوم)
var QUEST_POOL = [
    { id: 'q_lessons3', icon: '📚', title: 'أكمل 3 دروس', target: 3, reward: 10, field: 'lessonsToday' },
    { id: 'q_lessons5', icon: '📖', title: 'أكمل 5 دروس', target: 5, reward: 20, field: 'lessonsToday' },
    { id: 'q_xp20', icon: '⭐', title: 'اكسب 20 نقطة', target: 20, reward: 5, field: 'xpToday' },
    { id: 'q_xp50', icon: '🌟', title: 'اكسب 50 نقطة', target: 50, reward: 15, field: 'xpToday' },
    { id: 'q_perfect2', icon: '🏆', title: 'حقق درسين بشكل مثالي', target: 2, reward: 20, field: 'perfectLessonsToday' },
    { id: 'q_consec5', icon: '🔥', title: '5 إجابات متتالية بدون أخطاء', target: 5, reward: 15, field: 'consecutiveCorrect' },
    { id: 'q_consec10', icon: '⚡', title: '10 إجابات متتالية بدون أخطاء', target: 10, reward: 25, field: 'consecutiveCorrect' }
];

var DAILY_QUESTS = []; // يتم تعبئتها كل يوم

function getTodayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// اختيار المهام المتغيرة بناءً على التاريخ (يعطي نفس النتيجة لكل الطلاب في نفس اليوم)
function pickDailyQuests() {
    var today = getTodayKey();
    
    // إنشاء seed من التاريخ
    var seed = 0;
    for (var i = 0; i < today.length; i++) {
        seed = ((seed << 5) - seed) + today.charCodeAt(i);
        seed = seed & seed;
    }
    
    // خلط عشوائي بقائمة المهام
    var pool = QUEST_POOL.slice();
    var random = function() {
        seed = (seed * 9301 + 49297) % 233280;
        return Math.abs(seed / 233280);
    };
    
    for (var k = pool.length - 1; k > 0; k--) {
        var j = Math.floor(random() * (k + 1));
        var temp = pool[k];
        pool[k] = pool[j];
        pool[j] = temp;
    }
    
    // المهام اليومية = الثابتة + أول مهمتين من القائمة
    DAILY_QUESTS = FIXED_QUESTS.concat(pool.slice(0, 2));
    return DAILY_QUESTS;
}

function initDailyQuests() {
    var today = getTodayKey();
    if (!state.dailyQuests || state.dailyQuests.date !== today) {
        state.dailyQuests = {
            date: today,
            lessonsToday: 0,
            xpToday: 0,
            loginToday: 1,
            perfectLessonsToday: 0,
            consecutiveCorrect: 0,
            claimed: []
        };
        pickDailyQuests();
        saveAllData();
    } else {
        // نتأكد أن المهام محددة
        pickDailyQuests();
    }
}

function updateQuestProgress(field, amount, mode) {
    initDailyQuests();
    if (mode === 'reset') {
        state.dailyQuests[field] = 0;
    } else {
        if (!state.dailyQuests[field]) state.dailyQuests[field] = 0;
        state.dailyQuests[field] += amount;
    }
    saveAllData();
    renderDailyQuests();
}

function renderDailyQuests() {
    initDailyQuests();
    var list = document.getElementById('dailyQuestsList');
    var timer = document.getElementById('questsTimer');
    if (!list) return;
    
    list.innerHTML = '';
    
    DAILY_QUESTS.forEach(function(quest) {
        var current = state.dailyQuests[quest.field] || 0;
        var isCompleted = current >= quest.target;
        var isClaimed = state.dailyQuests.claimed.indexOf(quest.id) > -1;
        var pct = Math.min(100, Math.round((current / quest.target) * 100));
        
        var item = document.createElement('div');
        item.style.cssText = 'background:white; border-radius:10px; padding:8px 10px; display:flex; align-items:center; gap:8px;';
        
        var icon = document.createElement('div');
        icon.textContent = quest.icon;
        icon.style.cssText = 'font-size:22px;';
        
        var info = document.createElement('div');
        info.style.cssText = 'flex:1;';
        
        var title = document.createElement('div');
        title.textContent = quest.title;
        title.style.cssText = 'font-size:12px; font-weight:700; color:#1e3c72; margin-bottom:3px;';
        
        var bar = document.createElement('div');
        bar.style.cssText = 'background:#eee; height:5px; border-radius:10px; overflow:hidden;';
        var fill = document.createElement('div');
        fill.style.cssText = 'height:100%; width:' + pct + '%; background:#286654; border-radius:10px; transition:0.3s;';
        bar.appendChild(fill);
        
        var progress = document.createElement('div');
        progress.textContent = current + ' / ' + quest.target;
        progress.style.cssText = 'font-size:10px; color:#888; margin-top:2px;';
        
        info.appendChild(title);
        info.appendChild(bar);
        info.appendChild(progress);
        
        var btn = document.createElement('button');
        if (isClaimed) {
            btn.textContent = '✅ تم';
            btn.style.cssText = 'background:#e0e0e0; color:#888; border:none; border-radius:8px; padding:6px 12px; font-weight:700; font-size:11px; cursor:default;';
        } else if (isCompleted) {
            btn.textContent = '+' + quest.reward + ' 💎';
            btn.style.cssText = 'background:#FCCA59; color:#1e3c72; border:none; border-radius:8px; padding:6px 12px; font-weight:700; font-size:11px; cursor:pointer;';
            btn.onclick = (function(q) {
                return function() { claimQuest(q); };
            })(quest);
        } else {
            btn.textContent = '+' + quest.reward + ' 💎';
            btn.style.cssText = 'background:#eee; color:#aaa; border:none; border-radius:8px; padding:6px 12px; font-weight:700; font-size:11px; cursor:not-allowed;';
            btn.disabled = true;
        }
        
        item.appendChild(icon);
        item.appendChild(info);
        item.appendChild(btn);
        list.appendChild(item);
    });
    
    if (timer) {
        var now = new Date();
        var midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        var diff = midnight - now;
        var hours = Math.floor(diff / 3600000);
        var mins = Math.floor((diff % 3600000) / 60000);
        timer.textContent = 'تجديد بعد ' + hours + 'س ' + mins + 'د';
    }
}

function claimQuest(quest) {
    initDailyQuests();
    if (state.dailyQuests.claimed.indexOf(quest.id) > -1) return;
    state.dailyQuests.claimed.push(quest.id);
    state.gems += quest.reward;
    saveAllData();
    updateStatsUI();
    renderDailyQuests();
    if (typeof showCheerMessage === 'function') showCheerMessage('🎉 +' + quest.reward + ' جوهرة!');
    if (typeof launchConfetti === 'function') launchConfetti();
}

// تشغيل المهام
setTimeout(function() {
    initDailyQuests();
    renderDailyQuests();
    setInterval(function() {
        var timer = document.getElementById('questsTimer');
        if (timer) {
            var now = new Date();
            var midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            var diff = midnight - now;
            var hours = Math.floor(diff / 3600000);
            var mins = Math.floor((diff % 3600000) / 60000);
            timer.textContent = 'تجديد بعد ' + hours + 'س ' + mins + 'د';
        }
    }, 60000);
}, 1500);
  // ================================================================
// 🎖️ نظام الأوسمة
// ================================================================

var BADGES = [
  { id: 'first_lesson', icon: '🌱', name: 'البداية', desc: 'أول درس', check: function() { return countCompletedLessons() >= 1; } },
  { id: 'persistent', icon: '📚', name: 'المثابر', desc: '5 دروس', check: function() { return countCompletedLessons() >= 5; } },
  { id: 'diligent', icon: '🎯', name: 'المجتهد', desc: '10 دروس', check: function() { return countCompletedLessons() >= 10; } },
  { id: 'achiever', icon: '🏅', name: 'المنجز', desc: '25 درس', check: function() { return countCompletedLessons() >= 25; } },
  { id: 'expert', icon: '🏆', name: 'الخبير', desc: '50 درس', check: function() { return countCompletedLessons() >= 50; } },
  { id: 'legend', icon: '👑', name: 'الأسطورة', desc: '100 درس', check: function() { return countCompletedLessons() >= 100; } },
  { id: 'spark', icon: '🔥', name: 'الشرارة', desc: '3 أيام', check: function() { return state.streak >= 3; } },
  { id: 'flame', icon: '🌋', name: 'اللهب', desc: '7 أيام', check: function() { return state.streak >= 7; } },
  { id: 'volcano', icon: '💥', name: 'البركان', desc: '30 يوم', check: function() { return state.streak >= 30; } },
  { id: 'eternal', icon: '⚡', name: 'النار الأبدية', desc: '100 يوم', check: function() { return state.streak >= 100; } },
  { id: 'gems100', icon: '💎', name: 'جامع الجواهر', desc: '100 جوهرة', check: function() { return state.gems >= 100; } },
  { id: 'gems500', icon: '💰', name: 'كنز صغير', desc: '500 جوهرة', check: function() { return state.gems >= 500; } },
  { id: 'gems1000', icon: '👑', name: 'كنز كبير', desc: '1000 جوهرة', check: function() { return state.gems >= 1000; } },
  { id: 'xp100', icon: '⭐', name: 'نجم صاعد', desc: '100 نقطة', check: function() { return state.xp >= 100; } },
  { id: 'xp500', icon: '🌟', name: 'نجم لامع', desc: '500 نقطة', check: function() { return state.xp >= 500; } },
  { id: 'xp1000', icon: '✨', name: 'نجم ساطع', desc: '1000 نقطة', check: function() { return state.xp >= 1000; } },
  { id: 'unit1', icon: '1️⃣', name: 'الوحدة الأولى', desc: 'إكمال الوحدة 1', check: function() { return isUnitCompleted(0); } },
  { id: 'unit2', icon: '2️⃣', name: 'الوحدة الثانية', desc: 'إكمال الوحدة 2', check: function() { return isUnitCompleted(1); } },
  { id: 'master', icon: '🏆', name: 'خاتم المنهج', desc: 'كل الدروس', check: function() { return countCompletedLessons() >= getChapters().length; } },
  { id: 'friend1', icon: '🤝', name: 'الصديق الجديد', desc: 'أول صديق', check: function() { return state.userData.friends && state.userData.friends.length >= 1; } },
  { id: 'friend5', icon: '👥', name: 'الاجتماعي', desc: '5 أصدقاء', check: function() { return state.userData.friends && state.userData.friends.length >= 5; } },
  { id: 'friend10', icon: '💖', name: 'محبوب', desc: '10 أصدقاء', check: function() { return state.userData.friends && state.userData.friends.length >= 10; } }
];

var badgesExpanded = false;

function countCompletedLessons() {
  var count = 0;
  for (var grade in state.progress) {
    for (var subject in state.progress[grade]) {
      state.progress[grade][subject].forEach(function(v) { if (v === 2) count++; });
    }
  }
  if (count === 0) {
    var p = getProgress();
    count = p.filter(function(v) { return v === 2; }).length;
  }
  return count;
}

function isUnitCompleted(unitIndex) {
  var progress = getProgress();
  var UNIT_SIZE = 6;
  var startIdx = unitIndex * UNIT_SIZE;
  var endIdx = Math.min(startIdx + UNIT_SIZE, progress.length);
  if (startIdx >= progress.length) return false;
  for (var i = startIdx; i < endIdx; i++) {
    if (progress[i] !== 2) return false;
  }
  return endIdx > startIdx;
}

function renderBadges() {
  var grid = document.getElementById('badgesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  var badgesToShow = badgesExpanded ? BADGES : BADGES.slice(0, 6);
  
  badgesToShow.forEach(function(badge) {
    var unlocked = false;
    try { unlocked = badge.check(); } catch(e) { unlocked = false; }
    
    var item = document.createElement('div');
    item.style.cssText = 'display:flex; flex-direction:column; align-items:center; padding:10px 6px; border-radius:14px; text-align:center; transition:0.2s; ' + 
      (unlocked 
        ? 'background:linear-gradient(135deg, #fff8e0, #ffe8b0); border:2px solid #FCCA59;'
        : 'background:#f0f0f0; border:2px solid #ddd; opacity:0.5;');
    
    var icon = document.createElement('div');
    icon.textContent = unlocked ? badge.icon : '🔒';
    icon.style.cssText = 'font-size:28px; margin-bottom:4px;';
    
    var name = document.createElement('div');
    name.textContent = badge.name;
    name.style.cssText = 'font-size:11px; font-weight:700; color:' + (unlocked ? '#1e3c72' : '#888') + '; margin-bottom:2px;';
    
    var desc = document.createElement('div');
    desc.textContent = badge.desc;
    desc.style.cssText = 'font-size:9px; color:#999;';
    
    item.appendChild(icon);
    item.appendChild(name);
    item.appendChild(desc);
    item.title = (unlocked ? '' : '🔒 ') + badge.name + ' - ' + badge.desc;
    grid.appendChild(item);
  });
  
  var btnContainer = document.getElementById('badgesToggleContainer');
  if (!btnContainer) {
    btnContainer = document.createElement('div');
    btnContainer.id = 'badgesToggleContainer';
    btnContainer.style.cssText = 'text-align:center; margin-top:12px;';
    grid.parentNode.appendChild(btnContainer);
  }
  
  btnContainer.innerHTML = '';
  var toggleBtn = document.createElement('button');
  toggleBtn.textContent = badgesExpanded ? '🔽 عرض أقل' : '🔼 عرض المزيد (' + BADGES.length + ')';
  toggleBtn.style.cssText = 'padding:8px 20px; border:2px solid #286654; border-radius:20px; background:white; color:#286654; font-weight:700; cursor:pointer; font-size:13px;';
  toggleBtn.addEventListener('click', function() {
    badgesExpanded = !badgesExpanded;
    renderBadges();
  });
  btnContainer.appendChild(toggleBtn);
}

// تشغيل الأوسمة عند فتح الملف الشخصي
setTimeout(function() {
  var originalUpdateProfile = window.updateProfileScreen;
  if (typeof originalUpdateProfile === 'function') {
    window.updateProfileScreen = function() {
      originalUpdateProfile();
      renderBadges();
    };
  }
  renderBadges();
}, 1500);
  // ================================================================
// 🎉 احتفال عند فتح وسام جديد
// ================================================================

// تتبع الأوسمة المفتوحة
function getUnlockedBadges() {
    var saved = localStorage.getItem('unlocked_badges');
    if (saved) {
        try { return JSON.parse(saved); } catch(e) { return []; }
    }
    return [];
}

function saveUnlockedBadges(list) {
    localStorage.setItem('unlocked_badges', JSON.stringify(list));
}

function checkNewBadges() {
    var unlocked = getUnlockedBadges();
    var newBadges = [];
    
    BADGES.forEach(function(badge) {
        var isUnlocked = false;
        try { isUnlocked = badge.check(); } catch(e) { isUnlocked = false; }
        
        if (isUnlocked && unlocked.indexOf(badge.id) === -1) {
            unlocked.push(badge.id);
            newBadges.push(badge);
        }
    });
    
    saveUnlockedBadges(unlocked);
    return newBadges;
}

function showBadgeUnlockPopup(badge) {
    var popup = document.createElement('div');
    popup.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999999; display:flex; align-items:center; justify-content:center; padding:20px; animation: fadeIn 0.3s ease;';
    
    popup.innerHTML = `
        <div style="background:linear-gradient(135deg, #fff8e0, #ffe8b0); border-radius:32px; padding:30px 24px; max-width:400px; width:100%; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.5); position:relative; overflow:hidden; animation: bubblePop 0.5s cubic-bezier(0.34,1.56,0.64,1);">
            <div style="position:absolute; top:-50px; left:-50px; right:-50px; bottom:-50px; background:radial-gradient(circle, rgba(252,202,89,0.4), transparent 70%); animation: pulseGlow 2s ease-in-out infinite; pointer-events:none;"></div>
            
            <div style="font-size:16px; font-weight:800; color:#d4a93f; letter-spacing:2px; margin-bottom:8px; position:relative; z-index:1;">🎉 إنجاز جديد! 🎉</div>
            
            <div style="font-size:100px; margin:10px 0; position:relative; z-index:1; animation: pulseGlow 1.5s ease-in-out infinite;">${badge.icon}</div>
            
            <h2 style="font-size:28px; font-weight:900; color:#1e3c72; margin-bottom:6px; position:relative; z-index:1;">${badge.name}</h2>
            <p style="font-size:16px; color:#666; margin-bottom:20px; position:relative; z-index:1;">${badge.desc}</p>
            
            <div style="background:rgba(255,255,255,0.7); border-radius:16px; padding:12px; margin-bottom:20px; position:relative; z-index:1;">
                <div style="font-size:14px; color:#888;">مكافأة الوسام</div>
                <div style="font-size:24px; font-weight:900; color:#FCCA59;">+10 💎</div>
            </div>
            
            <button id="closeBadgeBtn" style="width:100%; padding:14px; border:none; border-radius:16px; background:#286654; color:white; font-weight:800; font-size:18px; cursor:pointer; box-shadow:0 6px 0 #1a4a3a; position:relative; z-index:1;">🎯 رائع! تابع التعلم</button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // جوائز: 10 جواهر لكل وسام
    state.gems += 10;
    saveAllData();
    updateStatsUI();
    
    // احتفال
    if (typeof launchConfetti === 'function') {
        launchConfetti();
        setTimeout(launchConfetti, 500);
        setTimeout(launchConfetti, 1000);
    }
    
    if (typeof playCorrectSound === 'function') {
        playCorrectSound();
    }
    
    popup.querySelector('#closeBadgeBtn').addEventListener('click', function() {
        popup.remove();
    });
}

// ✅ استدعاء الفحص بعد كل درس
window.showBadgeUnlockPopup = showBadgeUnlockPopup;
window.checkNewBadges = checkNewBadges;

  console.log('🚀 RANY Edu - تم تحميل جميع التعديلات بنجاح!');
});