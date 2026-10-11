/**
 * Neural Arcade 3-in-1 Suite:
 * 1. 🔮 Number Vault (Cryptic Oracle, 3-Digit Mastermind, Classic Radar)
 * 2. 🧠 Memory Matrix (Neural Grid Sequence Pattern Memory)
 * 3. ⚡ Math Reflex Blitz (30-second rapid mental arithmetic speed challenge)
 * Zero external libraries — Vanilla JS + Web Audio API + Canvas Confetti.
 */

// =========================================================================
// 1. GLOBAL AUDIO SYNTHESIZER & CONFETTI
// =========================================================================
let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioCtx = new AudioCtx();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSound(type, extra = {}) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (type === "click") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(640, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (type === "pad") {
    // Specific pitch for memory pad index (0-8)
    const padFreqs = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33];
    const freq = padFreqs[extra.index % padFreqs.length] || 440;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  } else if (type === "high") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.16);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  } else if (type === "low") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.16);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  } else if (type === "warn" || type === "wrong") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.setValueAtTime(160, now + 0.08);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  } else if (type === "correct") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.setValueAtTime(780, now + 0.08);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  } else if (type === "win") {
    const freqs = [440, 554.37, 659.25, 880, 1108.73];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.18, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.09 + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.32);
    });
  } else if (type === "lose") {
    const freqs = [380, 320, 260, 190];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.15, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.26);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.26);
    });
  }
}

// Confetti Particle Cannon
class ConfettiCannon {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.animationId = null;
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(count = 75) {
    const palette = ["#38bdf8", "#a855f7", "#34d399", "#fbbf24", "#f43f5e", "#818cf8"];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.canvas.width / 2 + (Math.random() - 0.5) * 80,
        y: this.canvas.height * 0.42,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 17,
        size: Math.random() * 8 + 4,
        color: palette[Math.floor(Math.random() * palette.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.36,
        friction: 0.98,
        opacity: 1,
      });
    }
    if (!this.animationId) this.render();
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.008;

      if (p.opacity <= 0 || p.y > this.canvas.height + 20) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(p.opacity, 0);
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.render());
    } else {
      this.animationId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

const confetti = new ConfettiCannon(document.getElementById("confettiCanvas"));

// =========================================================================
// 2. MASTER HUB NAVIGATION & FULLSCREEN
// =========================================================================
const hubTabs = document.querySelectorAll(".hub-tab");
const gameViews = {
  vault: document.getElementById("viewVault"),
  memory: document.getElementById("viewMemory"),
  math: document.getElementById("viewMath"),
};

let activeGame = "vault";

function switchGame(targetGame) {
  activeGame = targetGame;
  hubTabs.forEach((tab) => {
    const isTarget = tab.getAttribute("data-game") === targetGame;
    tab.classList.toggle("active", isTarget);
    tab.setAttribute("aria-selected", isTarget ? "true" : "false");
  });

  Object.entries(gameViews).forEach(([key, view]) => {
    view.classList.toggle("active", key === targetGame);
  });

  if (targetGame === "vault") {
    VaultGame.init();
  } else if (targetGame === "memory") {
    MemoryGame.init();
  } else if (targetGame === "math") {
    MathGame.init();
  }
}

hubTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    playSound("click");
    switchGame(tab.getAttribute("data-game"));
  });
});

// Fullscreen
const fullscreenBtn = document.getElementById("fullscreenBtn");
const fullscreenIcon = document.getElementById("fullscreenIcon");

function toggleFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
    else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  }
}

if (fullscreenBtn) {
  fullscreenBtn.addEventListener("click", () => {
    playSound("click");
    toggleFullscreen();
  });
}

function updateFullscreenIcon() {
  const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
  if (fullscreenIcon) fullscreenIcon.textContent = isFs ? "🗗" : "⛶";
}

document.addEventListener("fullscreenchange", updateFullscreenIcon);
document.addEventListener("webkitfullscreenchange", updateFullscreenIcon);

window.addEventListener("keydown", (e) => {
  if ((e.key === "f" || e.key === "F") && document.activeElement.tagName !== "INPUT") {
    toggleFullscreen();
  }
});

// Sound Toggle
const soundToggleBtn = document.getElementById("soundToggleBtn");
const soundIcon = document.getElementById("soundIcon");

soundToggleBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundIcon.textContent = soundEnabled ? "🔊" : "🔇";
  if (soundEnabled) {
    getAudioContext();
    playSound("click");
  }
});

// =========================================================================
// 3. GAME 1: NUMBER VAULT (CIPHER, RIDDLE & CODE)
// =========================================================================
const VaultGame = (() => {
  const CONFIG = {
    difficulties: {
      easy: { min: 1, max: 50, attempts: 10, label: "Novice (1–50)" },
      medium: { min: 1, max: 100, attempts: 10, label: "Detective (1–100)" },
      hard: { min: 1, max: 200, attempts: 7, label: "Mastermind (1–200)" },
    },
    codebreakerAttempts: 8,
  };

  const state = {
    mode: "riddle",
    difficulty: "medium",
    min: 1,
    max: 100,
    targetNumber: 0,
    targetCode: "000",
    maxAttempts: 10,
    attemptsLeft: 10,
    guesses: [],
    narrowMin: 1,
    narrowMax: 100,
    unlockedClues: [],
    candidateNumbers: [],
    gameOver: false,
  };

  const dom = {
    gameTitle: document.getElementById("gameTitle"),
    gameSub: document.getElementById("gameSub"),
    guessInput: document.getElementById("guessInput"),
    guessBtn: document.getElementById("guessBtn"),
    resetBtn: document.getElementById("resetBtn"),
    status: document.getElementById("status"),
    attemptsLeft: document.getElementById("attemptsLeft"),
    heartsContainer: document.getElementById("heartsContainer"),
    bestScoreText: document.getElementById("bestScoreText"),
    previousGuesses: document.getElementById("previousGuesses"),
    guessCountText: document.getElementById("guessCountText"),
    historyTitle: document.getElementById("historyTitle"),
    modeButtons: document.querySelectorAll(".mode-btn"),
    diffButtons: document.querySelectorAll(".diff-btn"),
    difficultyBar: document.getElementById("difficultyBar"),
    riddlePanel: document.getElementById("riddlePanel"),
    cluesGrid: document.getElementById("cluesGrid"),
    candidateCount: document.getElementById("candidateCount"),
    radarDesc: document.getElementById("radarDesc"),
    rangeTracker: document.getElementById("rangeTracker"),
    narrowMin: document.getElementById("narrowMin"),
    narrowMax: document.getElementById("narrowMax"),
    rangeBarFill: document.getElementById("rangeBarFill"),
  };

  function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  }

  function getDigitSum(n) {
    return String(n)
      .split("")
      .reduce((acc, digit) => acc + Number(digit), 0);
  }

  function countDivisors(n) {
    let count = 0;
    for (let i = 1; i <= n; i++) if (n % i === 0) count++;
    return count;
  }

  function generateClues(target, min, max) {
    const clues = [];

    // Clue 1: Digit Sum
    const dSum = getDigitSum(target);
    clues.push({
      icon: "🔢",
      label: "Digit Sum",
      text: `Sum of digits equals ${dSum}`,
      predicate: (n) => getDigitSum(n) === dSum,
    });

    // Clue 2: Parity & Divisibility
    let divClueText = "";
    let divPred = null;

    if (target % 5 === 0) {
      divClueText = "Divisible by 5";
      divPred = (n) => n % 5 === 0;
    } else if (target % 4 === 0) {
      divClueText = "Multiple of 4";
      divPred = (n) => n % 4 === 0;
    } else if (target % 3 === 0) {
      divClueText = "Multiple of 3";
      divPred = (n) => n % 3 === 0;
    } else {
      const isEven = target % 2 === 0;
      const remainder = target % 3;
      divClueText = `${isEven ? "Even" : "Odd"}, leaves rem ${remainder} (mod 3)`;
      divPred = (n) => (n % 2 === 0) === isEven && n % 3 === remainder;
    }

    clues.push({
      icon: "⚡",
      label: "Multiples & Parity",
      text: divClueText,
      predicate: divPred,
    });

    // Clue 3: Prime / Factors
    let natureText = "";
    let naturePred = null;

    if (isPrime(target)) {
      natureText = "A Prime number";
      naturePred = (n) => isPrime(n);
    } else {
      const sqrt = Math.sqrt(target);
      if (Number.isInteger(sqrt)) {
        natureText = `A Perfect Square (${sqrt}²)`;
        naturePred = (n) => Number.isInteger(Math.sqrt(n));
      } else {
        const divisors = countDivisors(target);
        natureText = `Has ${divisors} total divisors`;
        naturePred = (n) => countDivisors(n) === divisors;
      }
    }

    clues.push({
      icon: "🔬",
      label: "Mathematical Nature",
      text: natureText,
      predicate: naturePred,
    });

    // Clue 4: Digits Anatomy
    let relText = "";
    let relPred = null;

    if (target < 10) {
      relText = "Single digit enigma (0–9)";
      relPred = (n) => n < 10;
    } else {
      const tens = Math.floor((target % 100) / 10);
      const units = target % 10;
      if (tens === units) {
        relText = "Twin digits (tens = units)";
        relPred = (n) => Math.floor((n % 100) / 10) === n % 10;
      } else if (tens > units) {
        const diff = tens - units;
        relText = `Tens digit > Units digit by ${diff}`;
        relPred = (n) => Math.floor((n % 100) / 10) - (n % 10) === diff;
      } else {
        const diff = units - tens;
        relText = `Units digit > Tens digit by ${diff}`;
        relPred = (n) => n % 10 - Math.floor((n % 100) / 10) === diff;
      }
    }

    clues.push({
      icon: "📐",
      label: "Digit Anatomy",
      text: relText,
      predicate: relPred,
    });

    const candidates = [];
    for (let num = min; num <= max; num++) {
      if (clues.every((c) => c.predicate(num))) candidates.push(num);
    }

    return { clues, candidates };
  }

  function evaluateCode(guessStr, secretStr) {
    let bulls = 0;
    let cows = 0;
    const secretArr = secretStr.split("");
    const guessArr = guessStr.split("");
    const secretUsed = [false, false, false];
    const guessUsed = [false, false, false];

    for (let i = 0; i < 3; i++) {
      if (guessArr[i] === secretArr[i]) {
        bulls++;
        secretUsed[i] = true;
        guessUsed[i] = true;
      }
    }

    for (let i = 0; i < 3; i++) {
      if (!guessUsed[i]) {
        for (let j = 0; j < 3; j++) {
          if (!secretUsed[j] && guessArr[i] === secretArr[j]) {
            cows++;
            secretUsed[j] = true;
            break;
          }
        }
      }
    }

    return { bulls, cows };
  }

  function generateSecretCode() {
    const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const selected = [];
    while (selected.length < 3) {
      const idx = Math.floor(Math.random() * digits.length);
      selected.push(digits.splice(idx, 1)[0]);
    }
    return selected.join("");
  }

  function getStorageKey() {
    return state.mode === "codebreaker"
      ? `mindVault_best_codebreaker`
      : `mindVault_best_${state.mode}_${state.difficulty}`;
  }

  function getBestScore() {
    try {
      const score = localStorage.getItem(getStorageKey());
      return score ? parseInt(score, 10) : null;
    } catch (e) {
      return null;
    }
  }

  function saveBestScore(attemptsUsed) {
    try {
      const current = getBestScore();
      if (!current || attemptsUsed < current) {
        localStorage.setItem(getStorageKey(), attemptsUsed);
      }
    } catch (e) {}
  }

  function updateBestScoreDisplay() {
    const best = getBestScore();
    dom.bestScoreText.textContent = best ? `${best} tries` : "—";
  }

  function setStatus(msg, type = "info", icon = "🔮") {
    dom.status.className = `status ${type}`;
    dom.status.innerHTML = `<span class="status-icon">${icon}</span><span class="status-text">${msg}</span>`;
  }

  function renderHearts() {
    dom.heartsContainer.innerHTML = "";
    for (let i = 0; i < state.maxAttempts; i++) {
      const heart = document.createElement("span");
      heart.className = i < state.attemptsLeft ? "heart" : "heart lost";
      heart.textContent = i < state.attemptsLeft ? "❤️" : "🖤";
      dom.heartsContainer.appendChild(heart);
    }
  }

  function updateRangeBar() {
    dom.narrowMin.textContent = state.narrowMin;
    dom.narrowMax.textContent = state.narrowMax;
    const totalRange = state.max - state.min;
    const currentSpan = state.narrowMax - state.narrowMin;
    const percentage = Math.max(4, Math.round((currentSpan / totalRange) * 100));
    const leftPercent = ((state.narrowMin - state.min) / totalRange) * 100;
    dom.rangeBarFill.style.width = `${percentage}%`;
    dom.rangeBarFill.style.marginLeft = `${leftPercent}%`;
  }

  function renderRiddleClues() {
    dom.cluesGrid.innerHTML = "";
    state.unlockedClues.forEach((clue) => {
      const card = document.createElement("div");
      card.className = "clue-card";
      card.innerHTML = `
        <span class="clue-icon">${clue.icon}</span>
        <div class="clue-content">
          <span class="clue-label">${clue.label}</span>
          <span class="clue-text">${clue.text}</span>
        </div>
      `;
      dom.cluesGrid.appendChild(card);
    });

    const count = state.candidateNumbers.length;
    dom.candidateCount.textContent = `${count} matching`;
    dom.radarDesc.textContent =
      count === 1
        ? "🎯 Mind Blowing: Exactly 1 number in this realm fits all 4 clues!"
        : `Intrigue: Only ${count} numbers satisfy every clue!`;
  }

  function init() {
    state.gameOver = false;
    state.guesses = [];
    dom.guessInput.value = "";
    dom.guessInput.disabled = false;
    dom.guessBtn.disabled = false;
    dom.guessBtn.innerHTML = `<span>Deduce</span><span class="btn-glow"></span>`;
    dom.previousGuesses.innerHTML = `<span class="empty-history">No attempts yet</span>`;
    dom.guessCountText.textContent = "0 made";
    updateBestScoreDisplay();

    if (state.mode === "riddle") {
      dom.gameTitle.textContent = "The Cryptic Oracle";
      dom.gameSub.textContent = "Analyze the mathematical clues. Only a few numbers match all four!";
      dom.difficultyBar.style.display = "flex";
      dom.riddlePanel.style.display = "block";
      dom.rangeTracker.style.display = "block";
      dom.historyTitle.textContent = "Deduction History:";

      const cfg = CONFIG.difficulties[state.difficulty];
      state.min = cfg.min;
      state.max = cfg.max;
      state.maxAttempts = cfg.attempts;
      state.attemptsLeft = cfg.attempts;
      state.narrowMin = state.min;
      state.narrowMax = state.max;
      state.targetNumber = Math.floor(Math.random() * (state.max - state.min + 1)) + state.min;

      const generated = generateClues(state.targetNumber, state.min, state.max);
      state.unlockedClues = generated.clues;
      state.candidateNumbers = generated.candidates;

      dom.guessInput.type = "number";
      dom.guessInput.min = state.min;
      dom.guessInput.max = state.max;
      dom.guessInput.placeholder = `Enter number ${state.min}–${state.max}...`;

      renderRiddleClues();
      updateRangeBar();
      renderHearts();
      dom.attemptsLeft.textContent = state.attemptsLeft;
      setStatus(`Oracle active! ${state.candidateNumbers.length} numbers fit all clues. Deduce it!`, "info", "🔮");
    } else if (state.mode === "codebreaker") {
      dom.gameTitle.textContent = "Vault Codebreaker 3000";
      dom.gameSub.textContent = "Crack the 3-digit secret passcode. 🟢 Exact position, 🟡 Misplaced digit.";
      dom.difficultyBar.style.display = "none";
      dom.riddlePanel.style.display = "none";
      dom.rangeTracker.style.display = "none";
      dom.historyTitle.textContent = "Vault Hack Log:";

      state.maxAttempts = CONFIG.codebreakerAttempts;
      state.attemptsLeft = CONFIG.codebreakerAttempts;
      state.targetCode = generateSecretCode();

      dom.guessInput.type = "text";
      dom.guessInput.removeAttribute("min");
      dom.guessInput.removeAttribute("max");
      dom.guessInput.placeholder = "Enter 3 unique digits (e.g. 742)...";
      dom.guessInput.maxLength = 3;

      renderHearts();
      dom.attemptsLeft.textContent = state.attemptsLeft;
      setStatus("Vault is LOCKED. Enter 3 unique digits to deduce the combination!", "info", "🔐");
    } else {
      dom.gameTitle.textContent = "Classic Number Radar";
      dom.gameSub.textContent = "High speed higher/lower arcade with dynamic range contraction.";
      dom.difficultyBar.style.display = "flex";
      dom.riddlePanel.style.display = "none";
      dom.rangeTracker.style.display = "block";
      dom.historyTitle.textContent = "Guess History:";

      const cfg = CONFIG.difficulties[state.difficulty];
      state.min = cfg.min;
      state.max = cfg.max;
      state.maxAttempts = cfg.attempts;
      state.attemptsLeft = cfg.attempts;
      state.narrowMin = state.min;
      state.narrowMax = state.max;
      state.targetNumber = Math.floor(Math.random() * (state.max - state.min + 1)) + state.min;

      dom.guessInput.type = "number";
      dom.guessInput.min = state.min;
      dom.guessInput.max = state.max;
      dom.guessInput.placeholder = `Enter number ${state.min}–${state.max}...`;

      updateRangeBar();
      renderHearts();
      dom.attemptsLeft.textContent = state.attemptsLeft;
      setStatus(`Target locked between ${state.min} and ${state.max}. Make your first guess!`, "info", "🎯");
    }

    setTimeout(() => dom.guessInput.focus(), 60);
  }

  function handleGuess() {
    if (state.gameOver) {
      init();
      return;
    }

    const raw = dom.guessInput.value.trim();

    if (state.mode === "codebreaker") {
      if (raw.length !== 3 || !/^\d{3}$/.test(raw)) {
        playSound("warn");
        setStatus("Input must be exactly 3 numeric digits (e.g. 482)!", "error", "⚠️");
        dom.guessInput.focus();
        return;
      }
      if (new Set(raw.split("")).size !== 3) {
        playSound("warn");
        setStatus("All 3 digits must be distinct/unique! No duplicate digits.", "warn", "⚠️");
        dom.guessInput.focus();
        return;
      }
      if (state.guesses.includes(raw)) {
        playSound("warn");
        setStatus(`Code ${raw} was already tested! No life lost.`, "warn", "🔁");
        dom.guessInput.select();
        return;
      }

      state.guesses.push(raw);
      state.attemptsLeft--;
      dom.attemptsLeft.textContent = state.attemptsLeft;
      renderHearts();
      dom.guessInput.value = "";
      dom.guessInput.focus();

      const result = evaluateCode(raw, state.targetCode);
      if (state.guesses.length === 1) dom.previousGuesses.innerHTML = "";
      const row = document.createElement("div");
      row.className = "codebreaker-row";
      row.innerHTML = `<span class="code-digits">${raw}</span><div class="code-pins"><span class="pin-pill bull">🟢 ${result.bulls} Exact</span><span class="pin-pill cow">🟡 ${result.cows} Misplaced</span></div>`;
      dom.previousGuesses.prepend(row);
      dom.guessCountText.textContent = `${state.guesses.length} made`;

      if (result.bulls === 3) {
        state.gameOver = true;
        playSound("win");
        confetti.burst(95);
        const attemptsUsed = state.maxAttempts - state.attemptsLeft;
        saveBestScore(attemptsUsed);
        updateBestScoreDisplay();
        setStatus(`🎉 VAULT CRACKED! Code ${state.targetCode} decoded in ${attemptsUsed} tries!`, "success", "🏆");
        dom.guessBtn.innerHTML = `<span>Play Again</span>`;
        return;
      }

      if (state.attemptsLeft <= 0) {
        state.gameOver = true;
        playSound("lose");
        setStatus(`💥 LOCKDOWN! Out of lives. Passcode was [${state.targetCode}].`, "error", "💀");
        dom.guessInput.disabled = true;
        dom.guessBtn.innerHTML = `<span>Play Again</span>`;
        return;
      }

      playSound("click");
      setStatus(`Tested ${raw}: 🟢 ${result.bulls} Exact, 🟡 ${result.cows} Misplaced.`, "info", "🔍");
      return;
    }

    const guess = Number(raw);
    if (raw === "" || isNaN(guess)) {
      playSound("warn");
      setStatus("Please enter a valid numeric deduction!", "error", "⚠️");
      dom.guessInput.focus();
      return;
    }

    if (guess < state.min || guess > state.max) {
      playSound("warn");
      setStatus(`Deduction must be between ${state.min} and ${state.max}!`, "warn", "⚠️");
      dom.guessInput.focus();
      return;
    }

    if (state.guesses.includes(guess)) {
      playSound("warn");
      setStatus(`You already tested ${guess}! Try another number.`, "warn", "🔁");
      dom.guessInput.select();
      return;
    }

    state.guesses.push(guess);
    state.attemptsLeft--;
    dom.attemptsLeft.textContent = state.attemptsLeft;
    renderHearts();
    dom.guessInput.value = "";
    dom.guessInput.focus();

    if (guess === state.targetNumber) {
      state.gameOver = true;
      playSound("win");
      confetti.burst(90);
      const attemptsUsed = state.maxAttempts - state.attemptsLeft;
      saveBestScore(attemptsUsed);
      updateBestScoreDisplay();

      if (state.guesses.length === 1) dom.previousGuesses.innerHTML = "";
      const chip = document.createElement("span");
      chip.className = "guess-chip exact";
      chip.innerHTML = `<span>${guess}</span> <span>⭐ Correct</span>`;
      dom.previousGuesses.prepend(chip);

      dom.narrowMin.textContent = guess;
      dom.narrowMax.textContent = guess;
      dom.rangeBarFill.style.width = "100%";
      dom.rangeBarFill.style.marginLeft = "0";

      setStatus(`🎉 EUREKA! Secret Number ${guess} deduced in ${attemptsUsed} attempts!`, "success", "🏆");
      dom.guessBtn.innerHTML = `<span>Play Again</span>`;
      return;
    }

    let direction = "";
    let resultType = "";
    if (guess > state.targetNumber) {
      resultType = "high";
      direction = "Too HIGH 📈";
      playSound("high");
      if (guess < state.narrowMax) state.narrowMax = guess - 1;
    } else {
      resultType = "low";
      direction = "Too LOW 📉";
      playSound("low");
      if (guess > state.narrowMin) state.narrowMin = guess + 1;
    }

    if (state.guesses.length === 1) dom.previousGuesses.innerHTML = "";
    const chip = document.createElement("span");
    chip.className = `guess-chip ${resultType}`;
    chip.innerHTML = `<span>${guess}</span> <span>${direction}</span>`;
    dom.previousGuesses.prepend(chip);
    dom.guessCountText.textContent = `${state.guesses.length} made`;

    updateRangeBar();

    if (state.attemptsLeft <= 0) {
      state.gameOver = true;
      playSound("lose");
      setStatus(`💀 Oracle Vanished! Out of neural lives. The secret was ${state.targetNumber}.`, "error", "💥");
      dom.guessInput.disabled = true;
      dom.guessBtn.innerHTML = `<span>Play Again</span>`;
      return;
    }

    const diff = Math.abs(guess - state.targetNumber);
    let hint = "Freezing Cold! 🧊";
    let icon = "🧊";
    if (diff <= 2) { hint = "Scorching Hot! 🔥"; icon = "🔥"; }
    else if (diff <= 6) { hint = "Very Warm! ♨️"; icon = "♨️"; }
    else if (diff <= 14) { hint = "Warm! 🌤️"; icon = "🌤️"; }
    else if (diff <= 30) { hint = "Chilly... ❄️"; icon = "❄️"; }

    setStatus(`${direction} — ${hint}`, "info", icon);
  }

  // Bind Events
  dom.guessBtn.addEventListener("click", () => {
    playSound("click");
    handleGuess();
  });

  dom.resetBtn.addEventListener("click", () => {
    playSound("click");
    init();
  });

  dom.guessInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleGuess();
    } else if (e.key === "Escape") {
      init();
    }
  });

  dom.modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      playSound("click");
      dom.modeButtons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      state.mode = btn.getAttribute("data-mode");
      init();
    });
  });

  dom.diffButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      playSound("click");
      dom.diffButtons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      state.difficulty = btn.getAttribute("data-difficulty");
      init();
    });
  });

  return { init };
})();

// =========================================================================
// 4. GAME 2: MEMORY MATRIX (SEQUENCE PATTERN HACK)
// =========================================================================
const MemoryGame = (() => {
  const dom = {
    pads: document.querySelectorAll(".matrix-pad"),
    level: document.getElementById("memoryLevel"),
    best: document.getElementById("memoryBest"),
    status: document.getElementById("memoryStatus"),
    startBtn: document.getElementById("memoryStartBtn"),
  };

  let sequence = [];
  let userStep = 0;
  let level = 1;
  let isPlayingSequence = false;
  let isListening = false;

  function getBestLevel() {
    try {
      const b = localStorage.getItem("memoryMatrix_bestLevel");
      return b ? parseInt(b, 10) : 1;
    } catch (e) {
      return 1;
    }
  }

  function saveBestLevel(lvl) {
    try {
      const current = getBestLevel();
      if (lvl > current) {
        localStorage.setItem("memoryMatrix_bestLevel", lvl);
      }
    } catch (e) {}
  }

  function updateBestDisplay() {
    dom.best.textContent = `Level ${getBestLevel()}`;
  }

  function setStatus(text, type = "info", icon = "🧠") {
    dom.status.className = `status ${type}`;
    dom.status.innerHTML = `<span class="status-icon">${icon}</span><span class="status-text">${text}</span>`;
  }

  function flashPad(index, duration = 300) {
    return new Promise((resolve) => {
      const pad = dom.pads[index];
      if (!pad) return resolve();
      pad.classList.add("lit");
      playSound("pad", { index });

      setTimeout(() => {
        pad.classList.remove("lit");
        setTimeout(resolve, 120);
      }, duration);
    });
  }

  async function playSequence() {
    isPlayingSequence = true;
    isListening = false;
    dom.startBtn.disabled = true;
    setStatus(`Level ${level}: Memorize the neural pattern...`, "warn", "👀");

    await new Promise((r) => setTimeout(r, 600));

    for (let i = 0; i < sequence.length; i++) {
      const speed = Math.max(180, 420 - level * 20);
      await flashPad(sequence[i], speed);
    }

    isPlayingSequence = false;
    isListening = true;
    userStep = 0;
    setStatus(`Your Turn! Reproduce the sequence of ${sequence.length} steps.`, "info", "⚡");
  }

  function nextLevel() {
    level++;
    dom.level.textContent = level;
    saveBestLevel(level);
    updateBestDisplay();
    sequence.push(Math.floor(Math.random() * 9));
    playSequence();
  }

  function startNewGame() {
    level = 1;
    dom.level.textContent = level;
    sequence = [Math.floor(Math.random() * 9), Math.floor(Math.random() * 9)];
    updateBestDisplay();
    playSequence();
  }

  async function handlePadClick(index) {
    if (!isListening || isPlayingSequence) return;

    // Flash user pad
    flashPad(index, 180);

    if (index === sequence[userStep]) {
      userStep++;
      if (userStep === sequence.length) {
        isListening = false;
        playSound("correct");
        setStatus(`Perfect! Level ${level} cleared! Next wave incoming...`, "success", "✨");
        await new Promise((r) => setTimeout(r, 800));
        nextLevel();
      }
    } else {
      // Mistake!
      isListening = false;
      playSound("wrong");
      dom.startBtn.disabled = false;
      dom.startBtn.innerHTML = `<span>Try Again</span><span class="btn-glow"></span>`;
      setStatus(`Pattern Mismatch! You reached Level ${level}.`, "error", "💥");
    }
  }

  dom.pads.forEach((pad) => {
    pad.addEventListener("click", () => {
      const index = parseInt(pad.getAttribute("data-pad"), 10);
      handlePadClick(index);
    });
  });

  dom.startBtn.addEventListener("click", () => {
    playSound("click");
    startNewGame();
  });

  function init() {
    level = 1;
    dom.level.textContent = "1";
    isListening = false;
    isPlayingSequence = false;
    dom.startBtn.disabled = false;
    dom.startBtn.innerHTML = `<span>Start Sequence</span><span class="btn-glow"></span>`;
    updateBestDisplay();
    setStatus("Press 'Start Sequence' to begin the pattern test!", "info", "🧠");
  }

  return { init };
})();

// =========================================================================
// 5. GAME 3: MATH REFLEX BLITZ (SPEED EQUATION CHALLENGE)
// =========================================================================
const MathGame = (() => {
  const dom = {
    timer: document.getElementById("mathTimer"),
    score: document.getElementById("mathScore"),
    combo: document.getElementById("mathCombo"),
    equation: document.getElementById("mathEquation"),
    choiceButtons: document.querySelectorAll(".choice-btn"),
    startBtn: document.getElementById("mathStartBtn"),
    timerCard: document.querySelector(".timer-card"),
  };

  let timeLeft = 30;
  let timerInterval = null;
  let score = 0;
  let combo = 1;
  let currentAnswer = 0;
  let isRunning = false;

  function generateEquation() {
    const ops = ["+", "-", "×"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, ans;

    if (op === "+") {
      a = Math.floor(Math.random() * 45) + 6;
      b = Math.floor(Math.random() * 45) + 6;
      ans = a + b;
    } else if (op === "-") {
      a = Math.floor(Math.random() * 55) + 20;
      b = Math.floor(Math.random() * a) + 5;
      ans = a - b;
    } else {
      a = Math.floor(Math.random() * 12) + 3;
      b = Math.floor(Math.random() * 11) + 2;
      ans = a * b;
    }

    currentAnswer = ans;
    dom.equation.textContent = `${a} ${op} ${b} = ?`;

    // Distractor answers
    const choices = new Set([ans]);
    while (choices.size < 4) {
      const offset = (Math.floor(Math.random() * 9) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const fake = ans + offset;
      if (fake >= 0) choices.add(fake);
    }

    const shuffled = Array.from(choices).sort(() => Math.random() - 0.5);
    dom.choiceButtons.forEach((btn, idx) => {
      btn.textContent = shuffled[idx];
      btn.setAttribute("data-value", shuffled[idx]);
      btn.className = "choice-btn";
      btn.disabled = false;
    });
  }

  function handleChoice(val, button) {
    if (!isRunning) return;

    if (val === currentAnswer) {
      playSound("correct");
      score += 100 * combo;
      combo++;
      timeLeft = Math.min(60, timeLeft + 1); // +1s bonus
      dom.score.textContent = score;
      dom.combo.textContent = `x${combo}`;
      button.classList.add("correct");
      setTimeout(generateEquation, 120);
    } else {
      playSound("wrong");
      combo = 1;
      dom.combo.textContent = "x1";
      button.classList.add("wrong");
      setTimeout(generateEquation, 180);
    }
  }

  function endGame() {
    isRunning = false;
    clearInterval(timerInterval);
    dom.timer.textContent = "0s";
    dom.equation.textContent = "Time Up!";
    dom.choiceButtons.forEach((b) => (b.disabled = true));
    dom.startBtn.disabled = false;
    dom.startBtn.innerHTML = `<span>Play Again</span><span class="btn-glow"></span>`;
    dom.timerCard.classList.remove("danger");

    try {
      const best = parseInt(localStorage.getItem("mathBlitz_best") || "0", 10);
      if (score > best) {
        localStorage.setItem("mathBlitz_best", score);
        confetti.burst(80);
      }
    } catch (e) {}

    if (score >= 1000) playSound("win");
    else playSound("lose");
  }

  function startGame() {
    isRunning = true;
    score = 0;
    combo = 1;
    timeLeft = 30;
    dom.score.textContent = "0";
    dom.combo.textContent = "x1";
    dom.timer.textContent = "30s";
    dom.startBtn.disabled = true;

    generateEquation();

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      dom.timer.textContent = `${timeLeft}s`;
      if (timeLeft <= 5) {
        dom.timerCard.classList.add("danger");
      }
      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);
  }

  dom.choiceButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = parseInt(btn.getAttribute("data-value"), 10);
      handleChoice(val, btn);
    });
  });

  dom.startBtn.addEventListener("click", () => {
    playSound("click");
    startGame();
  });

  function init() {
    isRunning = false;
    clearInterval(timerInterval);
    timeLeft = 30;
    score = 0;
    combo = 1;
    dom.timer.textContent = "30s";
    dom.score.textContent = "0";
    dom.combo.textContent = "x1";
    dom.equation.textContent = "Ready?";
    dom.choiceButtons.forEach((b) => {
      b.textContent = "—";
      b.disabled = true;
    });
    dom.startBtn.disabled = false;
    dom.startBtn.innerHTML = `<span>Start Math Blitz (30s)</span><span class="btn-glow"></span>`;
  }

  return { init };
})();

// =========================================================================
// 6. INITIALIZATION
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  switchGame("vault");
});

if (document.readyState === "complete" || document.readyState === "interactive") {
  switchGame("vault");
}
