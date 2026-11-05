/**
 * Doʻstlik va Muruvvat Portali — Asosiy JavaScript
 * 4 xil toʻliq interaktiv oʻyin, faktlar, hikoyalar, videoplayer va e-otkritka generatori
 */

// ==========================================================================
// 1. Ovozli Effektlar Sintezatori (Web Audio API - Fayllarsiz sof tovushlar)
// ==========================================================================
class SoundEffects {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  click() {
    this.playTone(480, 'sine', 0.08, 0.05);
  }

  flip() {
    this.playTone(600, 'triangle', 0.1, 0.06);
  }

  match() {
    if (!this.enabled) return;
    this.playTone(523.25, 'sine', 0.15, 0.08); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.08), 100); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.3, 0.08), 200); // G5
  }

  success() {
    if (!this.enabled) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.25, 0.08), idx * 120);
    });
  }

  wrong() {
    this.playTone(220, 'sawtooth', 0.2, 0.05);
  }

  catchItem() {
    this.playTone(800 + Math.random() * 200, 'sine', 0.1, 0.07);
  }

  hitHazard() {
    this.playTone(180, 'sawtooth', 0.25, 0.08);
  }
}

const sfx = new SoundEffects();

// ==========================================================================
// 2. Sayt Umumiy Funksiyalari (Mavzu, Menyular, Mehr hisoblagichi)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // A. Mavzu (Dark/Light mode) boshqaruvi
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const savedTheme = localStorage.getItem('dm_theme') || 'light';

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.textContent = '☀️';
  } else {
    document.body.classList.remove('dark-mode');
    themeIcon.textContent = '🌙';
  }

  themeToggleBtn.addEventListener('click', () => {
    sfx.click();
    const isDark = document.body.classList.toggle('dark-mode');
    themeIcon.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('dm_theme', isDark ? 'dark' : 'light');
  });

  // B. Ovoz effektlari tugmasi
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  soundToggleBtn.addEventListener('click', () => {
    sfx.enabled = !sfx.enabled;
    soundIcon.textContent = sfx.enabled ? '🔊' : '🔇';
    sfx.click();
  });

  // C. Mobil menyu
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.getElementById('mainNav');
  mobileMenuBtn.addEventListener('click', () => {
    const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    mobileMenuBtn.setAttribute('aria-expanded', !expanded);
    mainNav.classList.toggle('open');
  });

  // Menyu havolalarini bosganda menyuni yopish
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // D. Mehr hisoblagichi (Kindness Counter)
  const goodDeedsCountEl = document.getElementById('goodDeedsCount');
  const spreadLoveBtn = document.getElementById('spreadLoveBtn');
  let deedsCount = parseInt(localStorage.getItem('dm_deeds_count')) || 1480;
  goodDeedsCountEl.textContent = deedsCount.toLocaleString('uz-UZ');

  spreadLoveBtn.addEventListener('click', (e) => {
    deedsCount++;
    localStorage.setItem('dm_deeds_count', deedsCount);
    goodDeedsCountEl.textContent = deedsCount.toLocaleString('uz-UZ');
    sfx.success();

    // Floating heart animatsiyasi
    createFloatingHeart(e.clientX, e.clientY);
  });

  function createFloatingHeart(x, y) {
    const heart = document.createElement('div');
    heart.textContent = '💖';
    heart.style.position = 'fixed';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.fontSize = '2rem';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '9999';
    heart.style.transition = 'all 1s ease-out';
    document.body.appendChild(heart);

    setTimeout(() => {
      heart.style.transform = `translate(${Math.random() * 60 - 30}px, -120px) scale(1.5)`;
      heart.style.opacity = '0';
    }, 10);

    setTimeout(() => heart.remove(), 1000);
  }

  // ==========================================================================
  // 3. 4 XIL DOʻSTLIK VA MURUVVAT OʻYINLARI
  // ==========================================================================

  // Tablar almashinuvi
  const gameTabs = document.querySelectorAll('.game-tab-btn');
  const gamePanels = document.querySelectorAll('.game-panel');

  gameTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      sfx.click();
      const targetGame = tab.getAttribute('data-game');

      gameTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      gamePanels.forEach(p => p.classList.remove('active'));
      const activePanel = document.getElementById(`game-panel-${targetGame.replace('game', '')}`);
      if (activePanel) {
        activePanel.classList.add('active');
      }

      // Agar 4-o'yin ochilsa, canvasni moslash
      if (targetGame === 'game4' && arcadeGame) {
        arcadeGame.resizeCanvas();
      }
    });
  });

  // --------------------------------------------------------------------------
  // 1-OʻYIN: MURUVVATLI QARORLAR (Ssenariy va Axloqiy Tanlov)
  // --------------------------------------------------------------------------
  const scenarios = [
    {
      title: "Yangi kelgan tortinchoq sinfdosh",
      description: "Sinfingizga yangi oʻquvchi koʻchib keldi. U hechkimi tanimaydi, tanaffusda yolgʻiz, boshini quyi solib oʻtiribdi. Hamma oʻz davrasida xursand. Siz qanday yoʻl tutasiz?",
      options: [
        {
          text: "Yoniga borib samimiy salomlashaman, oʻzimni tanishtiraman va uni doʻstlarim davrasiga taklif qilaman.",
          points: 20,
          type: "best",
          feedback: "Ajoyib muruvvat! Siz begʻaraz mehr koʻrsatib, inson qalbini yoritdingiz. Bu chin doʻstlikning boshlanishidir."
        },
        {
          text: "Agar oʻzi kelib gaplashsa javob beraman, aks holda xalaqit bermayman.",
          points: 5,
          type: "neutral",
          feedback: "Betaraflik yomon emas, lekin tortinchoq inson birinchi qadamni tashlashga juda qiynaladi. Birinchi qadamni siz qoʻying!"
        },
        {
          text: "Eʼtibor bermayman, oʻz doʻstlarim bilan oʻyinimni davom ettiraman.",
          points: 0,
          type: "poor",
          feedback: "Beparvolik qalbni sovitadi. Muruvvat — boshqalarning yolgʻizligini seza bilishdan boshlanadi."
        }
      ]
    },
    {
      title: "Doʻstingizning magʻlubiyati",
      description: "Yaqin doʻstingiz muhim musobaqa yoki olimpiadada uzoq vaqt tayyorgarlik koʻrgan boʻlsa-da, gʻalaba qozona olmadi va chuqur tushkunlikda yigʻlamoqda. Siz nima qilasiz?",
      options: [
        {
          text: "Doʻstimni bagʻrimga bosaman: 'Sen bor kuchingni berding, bu faqat bir bosqich, men doim yoningdaman' deb dalda beraman.",
          points: 20,
          type: "best",
          feedback: "Haqiqiy doʻstlik! 'Doʻst kulfatda sinaladi'. Siz unga eng kerakli paytda mustahkam suyanchiq boʻldingiz."
        },
        {
          text: "'Xafa boʻlma, keyingi safar yutasan' deb qoʻyib, oʻz ishim bilan band boʻlaman.",
          points: 10,
          type: "neutral",
          feedback: "Soʻzlaringiz toʻgʻri, ammo ogʻir paytda inson shunchaki soʻzga emas, dildan kelgan iliq hamdardlikka muhtoj boʻladi."
        },
        {
          text: "Uning xatolarini sanab: 'Nega oʻshanda boshqacha qilmading?' deb tanqid qilaman.",
          points: 0,
          type: "poor",
          feedback: "Yaraga tuz sepmang! Inson tushkunlikda ekan, tanqid emas, muruvvat va mehrga muhtoj boʻladi."
        }
      ]
    },
    {
      title: "Keksa otaxon va ogʻir yuk",
      description: "Koʻchada qoʻlida ogʻir xaltalar bilan zoʻrgʻa qadam tashlayotgan keksa nuroniy otaxonni koʻrdingiz. Siz esa doʻstlaringiz bilan qiziq uchrashuvga biroz shoshib ketyapsiz.",
      options: [
        {
          text: "Darhol otaxonning oldiga yugurib borib, yuklarini uylarigacha koʻtarib olib borib qoʻyaman. Doʻstlarimga esa sababini tushuntiraman.",
          points: 20,
          type: "best",
          feedback: "Yuksak odob va muruvvat! Keksalar duosi — hayot yoʻlingizni yorituvchi nurdir. Doʻstlaringiz ham siz bilan faxrlanadi."
        },
        {
          text: "Faqat zinadan yoki yoʻldan oʻtishiga yordam berib, keyin oʻz yoʻlimda shoshib ketaman.",
          points: 10,
          type: "neutral",
          feedback: "Bu ham yaxshilik, ammo chinakam muruvvat ishingizni toʻliq va begʻaraz yakunlashda namoyon boʻladi."
        },
        {
          text: "Vaqtim kamligini oʻylab, boshqa biror kishi yordam berar deb oʻtib ketaman.",
          points: 0,
          type: "poor",
          feedback: "Yaxshilikni orqaga surmang. Siz koʻrsatmagan muruvvat — qoʻldan boy berilgan buyuk savobdir."
        }
      ]
    },
    {
      title: "Adashib aytilgan ogʻir soʻz",
      description: "Qadrdon doʻstingiz asabi tarang paytida sizga nooʻrin, ogʻir soʻz aytib qoʻydi. Sal oʻtgach, pushaymon boʻlib, uzr soʻrab oldingizga keldi.",
      options: [
        {
          text: "'Biz doʻstmiz, har kim xato qilishi mumkin. Men sendan xafa emasman' deb, uni chin koʻngildan kechiraman.",
          points: 20,
          type: "best",
          feedback: "Kechirimlilik — eng buyuk muruvvatdir! Qalbida gina saqlamagan insonning doʻstligi poʻlatdek mustahkam boʻladi."
        },
        {
          text: "Uzrini qabul qilaman, lekin bir necha kun u bilan gaplashmay qovogʻimni solib yuraman.",
          points: 5,
          type: "neutral",
          feedback: "Chala kechirish oradagi samimiyatga darz yetkazadi. Doʻstlikda qalbni toʻliq tozalash zarur."
        },
        {
          text: "Men ham unga alamimni oladigan soʻzlar aytib, aloqani butunlay uzaman.",
          points: 0,
          type: "poor",
          feedback: "Gʻazabga berilmang. Bir ogʻiz soʻz sabab koʻp yillik doʻstlik rishtasini uzish donolik emas."
        }
      ]
    },
    {
      title: "Imtihon oldidan doʻstga yordam",
      description: "Ertaga juda qiyin imtihon. Siz mavzularni yaxshi oʻzlashtirgansiz, ammo doʻstingiz baʼzi murakkab masalalarni umuman tushunmayapti va sizdan oʻrgatishingizni iltimos qildi. Nima qilasiz?",
      options: [
        {
          text: "Oʻz vaqtimdan ajratib, doʻstimga sabr bilan barcha qiyin mavzularni erinmay tushuntirib beraman.",
          points: 20,
          type: "best",
          feedback: "Bilm bilan boʻlishish va doʻstga koʻmaklashish — ilmdagi eng oliy muruvvatdir. Oʻrgatish orqali oʻzingiz ham yanada mustahkamlaysiz!"
        },
        {
          text: "Faqat bir-ikkita formulani koʻrsatib qoʻyaman, qolganini oʻzing oʻqi deyman.",
          points: 10,
          type: "neutral",
          feedback: "Yordam berdingiz, lekin chin doʻst doʻstining muvaffaqiyati uchun qoʻlidan kelgan barcha narsani ayamaydi."
        },
        {
          text: "'Oʻzim ham ulgurmayapman' deb bahona qilib, yordam berishdan bosh tortaman.",
          points: 0,
          type: "poor",
          feedback: "Baxillik doʻstlikni oʻldiradi. Ilm va mehr baham koʻrilgandagina koʻpayadi."
        }
      ]
    }
  ];

  let currentScenarioIndex = 0;
  let scenarioTotalScore = 0;

  const scenarioContainer = document.getElementById('scenarioContainer');
  const scenarioProgressEl = document.getElementById('scenarioProgress');
  const scenarioScoreEl = document.getElementById('scenarioScore');

  function renderScenario() {
    if (currentScenarioIndex >= scenarios.length) {
      showScenarioResults();
      return;
    }

    const cur = scenarios[currentScenarioIndex];
    scenarioProgressEl.textContent = `${currentScenarioIndex + 1} / ${scenarios.length}`;
    scenarioScoreEl.textContent = scenarioTotalScore;

    const letters = ['A', 'B', 'C'];
    const optionsHtml = cur.options.map((opt, i) => `
      <button type="button" class="scenario-option-btn" data-index="${i}">
        <span class="scenario-option-letter">${letters[i]}</span>
        <span class="scenario-option-text">${opt.text}</span>
      </button>
    `).join('');

    scenarioContainer.innerHTML = `
      <div class="scenario-box">
        <h4 class="scenario-title">🌟 ${cur.title}</h4>
        <p class="scenario-desc">${cur.description}</p>
      </div>
      <div class="scenario-options-grid">
        ${optionsHtml}
      </div>
      <div id="scenarioFeedbackContainer"></div>
    `;

    document.querySelectorAll('.scenario-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        selectScenarioOption(idx);
      });
    });
  }

  function selectScenarioOption(optionIndex) {
    const cur = scenarios[currentScenarioIndex];
    const chosen = cur.options[optionIndex];

    scenarioTotalScore += chosen.points;
    scenarioScoreEl.textContent = scenarioTotalScore;

    if (chosen.type === 'best') sfx.match();
    else if (chosen.type === 'neutral') sfx.click();
    else sfx.wrong();

    // Disable all options
    document.querySelectorAll('.scenario-option-btn').forEach(b => {
      b.disabled = true;
      b.style.opacity = '0.6';
    });

    const chosenBtn = document.querySelectorAll('.scenario-option-btn')[optionIndex];
    chosenBtn.style.opacity = '1';
    chosenBtn.style.borderColor = chosen.type === 'best' ? 'var(--primary)' : 'var(--accent)';

    const feedbackBox = document.getElementById('scenarioFeedbackContainer');
    feedbackBox.innerHTML = `
      <div class="scenario-feedback ${chosen.type === 'best' ? 'success' : 'neutral'}">
        <div class="scenario-feedback-icon">${chosen.type === 'best' ? '🌟' : '💡'}</div>
        <div class="scenario-feedback-content">
          <strong>${chosen.type === 'best' ? 'Aʼlo qaror! (+20 ball)' : chosen.points > 0 ? 'Fikrli javob (+5 ball)' : 'Eʼtibor talab (0 ball)'}</strong>
          <p>${chosen.feedback}</p>
          <button type="button" class="btn btn-primary btn-sm" id="scenarioNextBtn" style="margin-top:0.8rem;">
            ${currentScenarioIndex < scenarios.length - 1 ? 'Keyingi vaziyat ➔' : 'Natijani koʻrish 🏆'}
          </button>
        </div>
      </div>
    `;

    document.getElementById('scenarioNextBtn').addEventListener('click', () => {
      sfx.click();
      currentScenarioIndex++;
      renderScenario();
    });
  }

  function showScenarioResults() {
    let title = "";
    let desc = "";
    let emoji = "🏆";

    if (scenarioTotalScore >= 90) {
      emoji = "👑";
      title = "Haqiqiy Muruvvat Sohibi va Vafodor Doʻst!";
      desc = `Siz ${scenarioTotalScore} ball toʻpladingiz. Sizning qalbingiz mehr, saxovat va kechirimlilikka toʻla. Atrofingizdagilar sizdek inson bilan doʻst boʻlganidan cheksiz baxtlidir!`;
    } else if (scenarioTotalScore >= 60) {
      emoji = "🌟";
      title = "Samimiy va Mehribon Hamroh!";
      desc = `Siz ${scenarioTotalScore} ball toʻpladingiz. Sizda doʻstlik tuygʻusi yuksak, baʼzi vaziyatlarda biroz koʻproq dadillik va begʻaraz tashabbus koʻrsatsangiz, yanada mukammal boʻlasiz.`;
    } else {
      emoji = "🌱";
      title = "Ezgulik sari Izlanuvchi Qalb!";
      desc = `Siz ${scenarioTotalScore} ball toʻpladingiz. Hayotda oʻz manfaatingizdan koʻra oʻzgalar ogʻirini yengil qilishga intilsangiz, qalb xotirjamligi va chin doʻstlar topasiz.`;
    }

    openGameResultModal(emoji, title, `
      <p style="margin-bottom: 1.5rem; font-size:1.1rem;">${desc}</p>
      <button type="button" class="btn btn-outline" id="restartScenarioBtn">Qayta sinab koʻrish</button>
    `);

    document.getElementById('restartScenarioBtn')?.addEventListener('click', () => {
      closeGameResultModal();
      currentScenarioIndex = 0;
      scenarioTotalScore = 0;
      renderScenario();
    });
  }

  renderScenario();

  // --------------------------------------------------------------------------
  // 2-OʻYIN: MEHRIBONLIK XOTIRASI (Memory Card Match)
  // --------------------------------------------------------------------------
  const memoryCardsData = [
    { id: 1, name: "Doʻstlik", icon: "🤝", quote: "Chin doʻstlik — koʻngillar gavharidir." },
    { id: 2, name: "Muruvvat", icon: "🤲", quote: "Muruvvat — oʻzgani oʻzingdan afzal bilmoqdir." },
    { id: 3, name: "Hurmat", icon: "👵", quote: "Kattalarga ehtirom — insoniylik ziynatidir." },
    { id: 4, name: "Saxovat", icon: "🎁", quote: "Saxovatli qoʻl hech qachon quruq qolmaydi." },
    { id: 5, name: "Hamdardlik", icon: "🩹", quote: "Birovning dardiga sherik boʻlish — buyuk fazilat." },
    { id: 6, name: "Tabassum", icon: "😊", quote: "Tabassum — qalblarga mehr yetkazuvchi koʻprik." },
    { id: 7, name: "Kechirimlilik", icon: "🕊️", quote: "Kechira olish — kuchli va oliyjanob insonlar ishi." },
    { id: 8, name: "Vafo", icon: "🌻", quote: "Vafodorlik — vaqt va sinovlarga boʻysunmaydigan rishta." }
  ];

  let memoryDeck = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let memoryMoves = 0;
  let memoryTimerInterval = null;
  let memorySeconds = 0;
  let memoryGameActive = false;

  const memoryGrid = document.getElementById('memoryGrid');
  const memoryMovesEl = document.getElementById('memoryMoves');
  const memoryPairsEl = document.getElementById('memoryPairs');
  const memoryTimerEl = document.getElementById('memoryTimer');
  const memoryRestartBtn = document.getElementById('memoryRestartBtn');
  const memoryFactBanner = document.getElementById('memoryFactBanner');

  function initMemoryGame() {
    clearInterval(memoryTimerInterval);
    memorySeconds = 0;
    memoryMoves = 0;
    matchedPairs = 0;
    flippedCards = [];
    memoryGameActive = false;
    memoryMovesEl.textContent = '0';
    memoryPairsEl.textContent = '0 / 8';
    memoryTimerEl.textContent = '00:00';
    memoryFactBanner.textContent = '✨ Bir juft kartani ochib, ezgu xislatlarni kashf eting!';

    // Duplicate and shuffle
    memoryDeck = [...memoryCardsData, ...memoryCardsData]
      .sort(() => Math.random() - 0.5);

    memoryGrid.innerHTML = '';
    memoryDeck.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'memory-card-item';
      cardEl.setAttribute('role', 'button');
      cardEl.setAttribute('tabindex', '0');
      cardEl.setAttribute('aria-label', `Karta ${index + 1}`);
      cardEl.dataset.id = card.id;
      cardEl.dataset.index = index;

      cardEl.innerHTML = `
        <div class="card-face card-front"></div>
        <div class="card-face card-back">
          <span class="card-back-icon">${card.icon}</span>
          <span class="card-back-name">${card.name}</span>
        </div>
      `;

      cardEl.addEventListener('click', () => handleCardClick(cardEl, card));
      cardEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(cardEl, card);
        }
      });

      memoryGrid.appendChild(cardEl);
    });
  }

  function startMemoryTimer() {
    if (!memoryGameActive) {
      memoryGameActive = true;
      memoryTimerInterval = setInterval(() => {
        memorySeconds++;
        const mins = String(Math.floor(memorySeconds / 60)).padStart(2, '0');
        const secs = String(memorySeconds % 60).padStart(2, '0');
        memoryTimerEl.textContent = `${mins}:${secs}`;
      }, 1000);
    }
  }

  function handleCardClick(cardEl, card) {
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;
    if (flippedCards.length >= 2) return;

    startMemoryTimer();
    sfx.flip();
    cardEl.classList.add('flipped');
    flippedCards.push({ el: cardEl, data: card });

    if (flippedCards.length === 2) {
      memoryMoves++;
      memoryMovesEl.textContent = memoryMoves;

      const [c1, c2] = flippedCards;
      if (c1.data.id === c2.data.id) {
        // Matched!
        sfx.match();
        c1.el.classList.add('matched');
        c2.el.classList.add('matched');
        matchedPairs++;
        memoryPairsEl.textContent = `${matchedPairs} / 8`;
        memoryFactBanner.textContent = `💖 ${c1.data.name}: "${c1.data.quote}"`;

        flippedCards = [];

        if (matchedPairs === 8) {
          clearInterval(memoryTimerInterval);
          sfx.success();
          setTimeout(() => {
            openGameResultModal(
              '🎉',
              'Tabriklaymiz! Xotirangiz benuqson!',
              `<p style="font-size:1.15rem; margin-bottom:1rem;">
                Siz barcha 8 ta ezgulik juftligini <strong>${memoryMoves} ta harakat</strong>da va 
                <strong>${memoryTimerEl.textContent}</strong> vaqtda topdingiz!
              </p>
              <p style="color:var(--text-muted); font-style:italic;">
                "Doʻstlik va muruvvat doimo yodingizda boʻlsin!"
              </p>`
            );
          }, 500);
        }
      } else {
        // Not matched
        setTimeout(() => {
          c1.el.classList.remove('flipped');
          c2.el.classList.remove('flipped');
          flippedCards = [];
        }, 900);
      }
    }
  }

  memoryRestartBtn.addEventListener('click', () => {
    sfx.click();
    initMemoryGame();
  });
  initMemoryGame();

  // --------------------------------------------------------------------------
  // 3-OʻYIN: MAQOLLAR VA HIKMATLAR ZANJIRI (Word Scramble Puzzle)
  // --------------------------------------------------------------------------
  const proverbsList = [
    {
      fullText: "Doʻst kuldirib aytar, dushman kuydirib.",
      words: ["Doʻst", "kuldirib", "aytar,", "dushman", "kuydirib."],
      meaning: "Chinakam samimiy doʻst sizning kamchiligingizni yuzingizga mehr bilan, toʻgʻrilashingiz uchun aytadi. Dushman esa ortingizdan masxara qiladi."
    },
    {
      fullText: "Yaxshilik qil, daryoga tashla, baliq bilar, baliq bilmasa Xoliq bilar.",
      words: ["Yaxshilik", "qil,", "daryoga", "tashla,", "baliq", "bilar,", "baliq", "bilmasa", "Xoliq", "bilar."],
      meaning: "Muruvvat va yaxshilikni hech qachon minnat yoki maqtov kutmasdan, chin dildan qilish kerak. Ezgu amallar hech qachon zoye ketmaydi."
    },
    {
      fullText: "Yuz soʻming boʻlguncha, yuzta doʻsting boʻlsin.",
      words: ["Yuz", "soʻming", "boʻlguncha,", "yuzta", "doʻsting", "boʻlsin."],
      meaning: "Mol-dunyo oʻtkinchi, ammo sadoqatli doʻstlar insonning hayotdagi eng bebaho boyligidir."
    },
    {
      fullText: "Chin doʻst boshga kulfat tushganda sinaladi.",
      words: ["Chin", "doʻst", "boshga", "kulfat", "tushganda", "sinaladi."],
      meaning: "Quvonchli kunda hamma doʻst boʻlishi oson, ammo qiyinchilik va qaygʻu paytida yoningizda qolgan inson — haqiqiy doʻstdir."
    },
    {
      fullText: "Muruvvat — oʻzgani oʻzingdan afzal bilmoqdir.",
      words: ["Muruvvat", "—", "oʻzgani", "oʻzingdan", "afzal", "bilmoqdir."],
      meaning: "Yuksak odob va saxiylik boshqalar ehtiyojini oʻz nafsi va manfaatidan ustun qoʻya olishda namoyon boʻladi."
    },
    {
      fullText: "Daraxt ildizi bilan, inson doʻstlari bilan qudratli.",
      words: ["Daraxt", "ildizi", "bilan,", "inson", "doʻstlari", "bilan", "qudratli."],
      meaning: "Inson yolgʻizlikda zaifdir, sadoqatli doʻstlar va ahil jamoa bilan esa har qanday toʻsiqni yengib oʻtadi."
    }
  ];

  let currentProverbIdx = 0;
  let proverbScore = 0;
  let selectedWords = [];
  let availableWords = [];

  const targetWordsContainer = document.getElementById('targetWordsContainer');
  const sourceWordsContainer = document.getElementById('sourceWordsContainer');
  const proverbIndexEl = document.getElementById('proverbIndex');
  const proverbScoreEl = document.getElementById('proverbScore');
  const checkProverbBtn = document.getElementById('checkProverbBtn');
  const proverbHintBtn = document.getElementById('proverbHintBtn');
  const proverbResetCurrentBtn = document.getElementById('proverbResetCurrentBtn');
  const proverbExplanation = document.getElementById('proverbExplanation');
  const proverbTitle = document.getElementById('proverbTitle');
  const proverbMeaning = document.getElementById('proverbMeaning');
  const nextProverbBtn = document.getElementById('nextProverbBtn');

  function loadProverb(idx) {
    if (idx >= proverbsList.length) {
      openGameResultModal(
        '📜',
        'Barcha maqollar muvaffaqiyatli yigʻildi!',
        `<p style="font-size:1.1rem;">
          Siz xalqimizning doʻstlik va muruvvat haqidagi barcha durdona maqollarini toʻgʻri tikladingiz!
          Toʻplangan ball: <strong>${proverbScore}</strong>
        </p>`
      );
      return;
    }

    currentProverbIdx = idx;
    proverbIndexEl.textContent = `${idx + 1} / ${proverbsList.length}`;
    proverbExplanation.hidden = true;
    checkProverbBtn.disabled = false;

    const p = proverbsList[idx];
    selectedWords = [];
    availableWords = p.words.map((w, i) => ({ text: w, id: i }))
      .sort(() => Math.random() - 0.5);

    renderProverbWords();
  }

  function renderProverbWords() {
    // Target render
    if (selectedWords.length === 0) {
      targetWordsContainer.innerHTML = '<span class="placeholder-text">Quyidagi soʻzlarni tartib bilan bosing...</span>';
    } else {
      targetWordsContainer.innerHTML = '';
      selectedWords.forEach((wordObj, i) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'word-chip';
        chip.textContent = wordObj.text;
        chip.title = "Olib tashlash uchun bosing";
        chip.addEventListener('click', () => {
          sfx.click();
          selectedWords.splice(i, 1);
          availableWords.push(wordObj);
          renderProverbWords();
        });
        targetWordsContainer.appendChild(chip);
      });
    }

    // Source render
    sourceWordsContainer.innerHTML = '';
    availableWords.forEach((wordObj, i) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'word-chip';
      chip.textContent = wordObj.text;
      chip.addEventListener('click', () => {
        sfx.click();
        availableWords.splice(i, 1);
        selectedWords.push(wordObj);
        renderProverbWords();
      });
      sourceWordsContainer.appendChild(chip);
    });
  }

  checkProverbBtn.addEventListener('click', () => {
    const cur = proverbsList[currentProverbIdx];
    const userSentence = selectedWords.map(w => w.text).join(' ');

    if (userSentence === cur.fullText) {
      sfx.match();
      proverbScore += 25;
      proverbScoreEl.textContent = proverbScore;
      checkProverbBtn.disabled = true;

      proverbTitle.textContent = `✅ Toʻgʻri: "${cur.fullText}"`;
      proverbMeaning.textContent = `💡 Maʼnosi va ibrati: ${cur.meaning}`;
      proverbExplanation.hidden = false;
    } else {
      sfx.wrong();
      targetWordsContainer.style.outline = '2px solid var(--heart-red)';
      setTimeout(() => targetWordsContainer.style.outline = 'none', 600);
      alert("Maqol soʻzlari tartibida xatolik bor. Soʻzlarni qayta koʻrib chiqing yoki 'Maslahat olish' tugmasidan foydalaning.");
    }
  });

  proverbHintBtn.addEventListener('click', () => {
    sfx.click();
    const cur = proverbsList[currentProverbIdx];
    const nextNeededWord = cur.words[selectedWords.length];
    if (nextNeededWord) {
      alert(`💡 Maslahat: Keyingi toʻgʻri soʻz — "${nextNeededWord}"`);
    } else {
      alert("Siz barcha soʻzlarni joylashtirdingiz, 'Maqolni tekshirish' tugmasini bosing.");
    }
  });

  proverbResetCurrentBtn.addEventListener('click', () => {
    sfx.click();
    loadProverb(currentProverbIdx);
  });

  nextProverbBtn.addEventListener('click', () => {
    sfx.click();
    loadProverb(currentProverbIdx + 1);
  });

  loadProverb(0);

  // --------------------------------------------------------------------------
  // 4-OʻYIN: QALBLAR GAVHARI (Ezgulik Tutuvchi Arkada Oʻyini)
  // --------------------------------------------------------------------------
  class ArcadeCatcher {
    constructor() {
      this.canvas = document.getElementById('arcadeCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.scoreEl = document.getElementById('arcadeScore');
      this.livesEl = document.getElementById('arcadeLives');
      this.highScoreEl = document.getElementById('arcadeHighScore');
      this.startBtn = document.getElementById('arcadeStartBtn');

      this.score = 0;
      this.lives = 3;
      this.highScore = parseInt(localStorage.getItem('dm_arcade_high')) || 0;
      this.highScoreEl.textContent = this.highScore;

      this.running = false;
      this.items = [];
      this.lastSpawn = 0;
      this.spawnRate = 1100; // ms

      this.player = {
        x: this.canvas.width / 2 - 45,
        y: this.canvas.height - 45,
        width: 90,
        height: 25,
        speed: 7,
        movingLeft: false,
        movingRight: false
      };

      this.setupControls();
    }

    setupControls() {
      window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          this.player.movingLeft = true;
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          this.player.movingRight = true;
        }
      });

      window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          this.player.movingLeft = false;
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          this.player.movingRight = false;
        }
      });

      // Mouse / Touch on Canvas
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const mouseX = (e.clientX - rect.left) * scaleX;
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, mouseX - this.player.width / 2));
      });

      this.canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          const rect = this.canvas.getBoundingClientRect();
          const scaleX = this.canvas.width / rect.width;
          const touchX = (e.touches[0].clientX - rect.left) * scaleX;
          this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, touchX - this.player.width / 2));
        }
      }, { passive: true });

      // On-screen buttons
      const btnLeft = document.getElementById('btnMoveLeft');
      const btnRight = document.getElementById('btnMoveRight');

      const startLeft = () => this.player.movingLeft = true;
      const stopLeft = () => this.player.movingLeft = false;
      const startRight = () => this.player.movingRight = true;
      const stopRight = () => this.player.movingRight = false;

      btnLeft.addEventListener('mousedown', startLeft);
      btnLeft.addEventListener('mouseup', stopLeft);
      btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); startLeft(); });
      btnLeft.addEventListener('touchend', stopLeft);

      btnRight.addEventListener('mousedown', startRight);
      btnRight.addEventListener('mouseup', stopRight);
      btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); startRight(); });
      btnRight.addEventListener('touchend', stopRight);

      this.startBtn.addEventListener('click', () => {
        sfx.click();
        this.start();
      });

      this.drawIntro();
    }

    resizeCanvas() {
      // Keep canvas coordinates responsive
    }

    start() {
      this.score = 0;
      this.lives = 3;
      this.items = [];
      this.running = true;
      this.lastSpawn = performance.now();
      this.scoreEl.textContent = '0';
      this.updateLivesDisplay();
      this.startBtn.textContent = 'Qayta boshlash';
      requestAnimationFrame((t) => this.loop(t));
    }

    updateLivesDisplay() {
      this.livesEl.textContent = '❤️'.repeat(Math.max(0, this.lives));
    }

    spawnItem() {
      const types = [
        { emoji: '❤️', label: 'Mehr', points: 10, isGood: true, speed: 2.5 },
        { emoji: '🤝', label: 'Doʻstlik', points: 15, isGood: true, speed: 2.8 },
        { emoji: '✨', label: 'Muruvvat', points: 20, isGood: true, speed: 3.0 },
        { emoji: '🎁', label: 'Saxovat', points: 25, isGood: true, speed: 3.2 },
        { emoji: '⚡', label: 'Hasad', points: -15, isGood: false, speed: 3.5 },
        { emoji: '🌧️', label: 'Gʻiybat', points: -10, isGood: false, speed: 2.7 }
      ];

      const itemType = types[Math.floor(Math.random() * types.length)];
      this.items.push({
        x: Math.random() * (this.canvas.width - 50) + 25,
        y: -30,
        radius: 20,
        ...itemType
      });
    }

    loop(time) {
      if (!this.running) return;

      this.update(time);
      this.draw();

      if (this.running) {
        requestAnimationFrame((t) => this.loop(t));
      }
    }

    update(time) {
      // Harakat
      if (this.player.movingLeft) {
        this.player.x = Math.max(0, this.player.x - this.player.speed);
      }
      if (this.player.movingRight) {
        this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
      }

      // Spawning
      if (time - this.lastSpawn > this.spawnRate) {
        this.spawnItem();
        this.lastSpawn = time;
      }

      // Items falling and collision
      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        item.y += item.speed;

        // Savat bilan to'qnashuv
        const inX = item.x >= this.player.x - 10 && item.x <= this.player.x + this.player.width + 10;
        const inY = item.y + item.radius >= this.player.y && item.y - item.radius <= this.player.y + this.player.height;

        if (inX && inY) {
          if (item.isGood) {
            this.score += item.points;
            sfx.catchItem();
          } else {
            this.lives--;
            this.updateLivesDisplay();
            sfx.hitHazard();
            if (this.lives <= 0) {
              this.gameOver();
              return;
            }
          }
          this.scoreEl.textContent = this.score;
          this.items.splice(i, 1);
          continue;
        }

        // Pastga tushib ketgan ezgu narsalar
        if (item.y > this.canvas.height + 30) {
          this.items.splice(i, 1);
        }
      }
    }

    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Yulduzlar foni
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      for (let i = 0; i < 20; i++) {
        const sx = (i * 37) % this.canvas.width;
        const sy = (i * 23) % this.canvas.height;
        this.ctx.fillRect(sx, sy, 2, 2);
      }

      // Player Savati (Mehr Savati)
      this.ctx.save();
      // Glowing glow
      this.ctx.shadowColor = '#10b981';
      this.ctx.shadowBlur = 15;
      this.ctx.fillStyle = '#059669';
      this.ctx.beginPath();
      this.ctx.roundRect(this.player.x, this.player.y, this.player.width, this.player.height, 12);
      this.ctx.fill();

      // Savat bezaklari
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText("💖 Mehr Savati", this.player.x + this.player.width / 2, this.player.y + 17);
      this.ctx.restore();

      // Items
      for (const item of this.items) {
        this.ctx.save();
        this.ctx.font = '24px serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(item.emoji, item.x, item.y);

        this.ctx.font = '10px sans-serif';
        this.ctx.fillStyle = item.isGood ? '#a7f3d0' : '#fca5a5';
        this.ctx.fillText(item.label, item.x, item.y + 18);
        this.ctx.restore();
      }
    }

    drawIntro() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "#ffffff";
      this.ctx.textAlign = "center";
      this.ctx.font = "bold 22px sans-serif";
      this.ctx.fillText("Qalblar Gavhari: Ezgulik Savati", this.canvas.width / 2, this.canvas.height / 2 - 30);
      this.ctx.font = "15px sans-serif";
      this.ctx.fillStyle = "#94a3b8";
      this.ctx.fillText("Boshlash uchun 'Oʻyinni boshlash' tugmasini bosing", this.canvas.width / 2, this.canvas.height / 2 + 10);
      this.ctx.fillText("Boshqarish: ◀ Chapga / Oʻngga ▶ yoki Sichqoncha / Barmoq", this.canvas.width / 2, this.canvas.height / 2 + 35);
    }

    gameOver() {
      this.running = false;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('dm_arcade_high', this.highScore);
        this.highScoreEl.textContent = this.highScore;
      }

      openGameResultModal(
        '🏆',
        'Oʻyin yakunlandi!',
        `<p style="font-size:1.15rem; margin-bottom:1rem;">
          Siz ezgulik savatiga <strong>${this.score} ball</strong>lik fazilatlar yigʻdingiz!
        </p>
        <p style="color:var(--text-muted);">
          Eng yuqori rekord: <strong>${this.highScore} ball</strong>
        </p>`
      );
    }
  }

  const arcadeGame = new ArcadeCatcher();

  // ==========================================================================
  // 4. QIZIQARLI FAKTLAR BO'LIMI
  // ==========================================================================
  const factsData = [
    {
      category: "science",
      categoryName: "Ilmiy & Tibbiy",
      icon: "🔬",
      title: "Garvardning 85 yillik baxt tadqiqoti",
      body: "Garvard universiteti tomonidan oʻtkazilgan 85 yillik insoniyat tarixidagi eng uzoq davom etgan tadqiqot shuni koʻrsatdiki, insonni eng sogʻlom va uzoq umr koʻrishini taʼminlaydigan omil boylik emas, balki samimiy va mustahkam doʻstlik rishtalaridir!",
      source: "Garvard Adult Development Study"
    },
    {
      category: "psychology",
      categoryName: "Psixologiya",
      icon: "🧠",
      title: "\"Yordam beruvchining yuksakligi\" (Helper's High)",
      body: "Inson boshqalarga begʻaraz muruvvat va yaxshilik koʻrsatganda, uning miyasida endorfin, dopamin va oksitatsin gormonlari ajraladi. Bu stress darajasini 63% ga pasaytiradi va qalbda chuqur tinchlik tuygʻusini uygʻotadi.",
      source: "Psixologik tadqiqotlar"
    },
    {
      category: "nature",
      categoryName: "Tabiat & Hayvonot",
      icon: "🐢",
      title: "Mzee va Ouen: 130 yoshli toshbaqa va yetim begemot",
      body: "Keniyadagi tabiiy bogʻda sunamidan yetim qolgan kichik begemot Ouen 130 yoshli bahaybat Mzee laqabli toshbaqa bilan doʻstlashib olgan. Ular birga ovqatlangan, birga choʻmilgan va bu gʻaroyib doʻstlik butun dunyo olimlarini lol qoldirgan.",
      source: "Lafarge Eco Systems"
    },
    {
      category: "science",
      categoryName: "Biologiya",
      icon: "💓",
      title: "Yurak ritmlarining sinxronlashuvi",
      body: "Neyrobiologlar aniqlashicha, chin doʻstlar bir-birlari bilan samimiy suhbatlashganda yoki his-tuygʻularini baham koʻrganda, ularning nafas olish surʼati va yurak urish ritmi oʻzaro sinxronlashib, bir xil tezlikda ura boshlaydi.",
      source: "Kognitiv fanlar jurnali"
    },
    {
      category: "history",
      categoryName: "Tarixiy & Milliy",
      icon: "🇺🇿",
      title: "30-iyul: Oʻzbekistonda Xalqlar Doʻstligi Kuni",
      body: "Oʻzbekistonda 30-iyul rasman 'Xalqlar doʻstligi kuni' deb belgilangan. Yurtimizda 130 dan ortiq millat va elat vakillari ahil-inoq, bagʻrikenglik va yuksak muruvvat muhitida bir oiladek yashab kelmoqda.",
      source: "Oʻzbekiston Respublikasi Qonuni"
    },
    {
      category: "history",
      categoryName: "Milliy Qahramonlik",
      icon: "👨‍👩‍👧‍👦",
      title: "Shomahmudovlar oilasining buyuk muruvvati",
      body: "Ikkinchi jahon urushi davrida toshkentlik temirchi Shoahmad Shomahmudov va uning rafiqasi Bahri aya turli millatga mansub 14 nafar boshpanasiz yetim bolalarni oʻz bagʻriga olib, mehr bilan tarbiyalashgan. Bu voqea butun dunyoga oʻzbek xalqining yuksak muruvvatini namoyon etgan.",
      source: "Toshkent shahri tarixi"
    },
    {
      category: "nature",
      categoryName: "Botanika",
      icon: "🌲",
      title: "Daraxtlarning yerosti doʻstligi (Wood Wide Web)",
      body: "Oʻrmonshunos olimlarning taʼkidlashicha, daraxtlar ildizlari va zamburugʻlar tarmogʻi orqali oʻzaro bogʻlangan. Agar biror daraxt kasallansa yoki zaiflashsa, qoʻshni sogʻlom daraxtlar bu tarmoq orqali unga oziqa moddalari yuborib, yashab qolishiga yordam beradi!",
      source: "Nature ilmiy nashri"
    },
    {
      category: "psychology",
      categoryName: "Salomatlik",
      icon: "🕊️",
      title: "Kechirimlilik — yurak davosi",
      body: "Tibbiy tadqiqotlarga koʻra, doʻstini yoki yaqinini chin dildan kechira oladigan va qalbida adovat saqlamaydigan insonlarda qon bosimi barqarorlashadi, qon tomir kasalliklari va insult xavfi 40% ga kamayadi.",
      source: "Kardiologiya assotsiatsiyasi"
    }
  ];

  const factsGrid = document.getElementById('factsGrid');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const randomFactBtn = document.getElementById('randomFactBtn');

  function renderFacts(category = 'all') {
    factsGrid.innerHTML = '';
    const filtered = category === 'all' 
      ? factsData 
      : factsData.filter(f => f.category === category);

    filtered.forEach((fact) => {
      const card = document.createElement('div');
      card.className = 'fact-card';
      card.innerHTML = `
        <div>
          <div class="fact-header">
            <span class="fact-category-badge">${fact.categoryName}</span>
            <span class="fact-icon">${fact.icon}</span>
          </div>
          <h3 class="fact-title">${fact.title}</h3>
          <p class="fact-body">${fact.body}</p>
        </div>
        <div class="fact-footer">
          <span class="fact-source">📌 Manba: ${fact.source}</span>
          <div class="fact-actions">
            <button type="button" class="fact-action-btn speak-fact-btn" title="Ovozli eshitish" aria-label="${fact.title} faktini eshitish">
              🔊
            </button>
            <button type="button" class="fact-action-btn copy-fact-btn" title="Nusxalash" aria-label="Faktni nusxalash">
              📋
            </button>
          </div>
        </div>
      `;

      // Speech synthesis
      const speakBtn = card.querySelector('.speak-fact-btn');
      speakBtn.addEventListener('click', () => {
        speakText(`${fact.title}. ${fact.body}`);
      });

      // Copy
      const copyBtn = card.querySelector('.copy-fact-btn');
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(`${fact.title}\n\n${fact.body}\nManba: ${fact.source}`).then(() => {
          sfx.match();
          copyBtn.textContent = '✅';
          setTimeout(() => copyBtn.textContent = '📋', 1500);
        });
      });

      factsGrid.appendChild(card);
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      sfx.click();
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderFacts(tab.getAttribute('data-category'));
    });
  });

  randomFactBtn.addEventListener('click', () => {
    sfx.click();
    const rand = factsData[Math.floor(Math.random() * factsData.length)];
    openGameResultModal(
      rand.icon,
      rand.title,
      `<p style="font-size:1.1rem; line-height:1.75; margin-bottom:1rem;">${rand.body}</p>
       <span style="font-size:0.85rem; color:var(--text-light);">Manba: ${rand.source}</span>`
    );
  });

  renderFacts('all');

  // ==========================================================================
  // 5. IBRATLI HIKOYALAR BO'LIMI (To'liq matnli dialoglar)
  // ==========================================================================
  const storiesDatabase = {
    "1": {
      title: "Sahrodagi Ikki Doʻst",
      category: "Sharq Hikmati",
      body: `
        <p>Ikki doʻst jazirama sahro boʻylab uzoq yoʻlga chiqishdi. Bir necha kunlik safardan soʻng charchoq va suvsizlik tufayli oʻrtada qattiq bahs chiqdi va doʻstlardan biri jahli chiqib, ikkinchisining yuziga tarsaki tushirdi.</p>
        <p>Tarsaki yegan doʻst qattiq ogʻrindi, ammo hech narsa demadi. U sekin choʻk tushib, sahro qumiga shunday deb yozdi: <em>"Bugun mening eng yaqin doʻstim yuzimga tarsaki tushirdi"</em>.</p>
        <p>Ular yoʻlda davom etishdi va nihoyat goʻzal bir vohaga yetib kelishdi. U yerda muzdek koʻl bor edi. Tarsaki yegan doʻst suvga shoʻngʻidi, ammo toʻsatdan balchiqqa botib, choʻka boshladi. Buni koʻrgan ikkinchi doʻst oʻz hayotini xavf ostiga qoʻyib, darhol suvga otildi va uni qutqarib qoldi.</p>
        <p>Qutqarilgan doʻst oʻziga kelgach, qoʻliga oʻtkir pichoq olib, qirgʻoqdagi ulkan qattiq qoyatosh ustiga oʻyib shunday deb yozdi: <em>"Bugun mening eng yaqin doʻstim hayotimni saqlab qoldi"</em>.</p>
        <p>Buni hayron boʻlib kuzatgan doʻsti soʻradi: "Seni xafa qilganimda qumga yozgan eding, endi esa toshga oʻymoqdasan. Nega bunday qilding?"</p>
        <p>Doʻsti tabassum bilan javob berdi: "Birov bizni xafa qilsa, uni qumga yozishimiz kerak, toki kechirim shamollari uni osongina oʻchirib yuborsin. Ammo kimgadir muruvvat koʻrsatsak yoki bizga yaxshilik qilinsa, uni toshga oʻyib qoʻyishimiz lozim, toki hech qanday shamol yoki vaqt uni oʻchira olmasin!".</p>
      `,
      moral: "Hikmat: Xafagarchilik va ginalarni qum kabi unuting, muruvvat va doʻstlikni esa toshdek qalbingizga muhrlang!"
    },
    "2": {
      title: "Bir Burda Non va Qadimiy Muruvvat",
      category: "Tarixiy Muruvvat",
      body: `
        <p>Qishning qahraton ayozi hukm surgan kunlarning birida, qorni och, usti yupun bir bechora yoʻlovchi nonvoyxonaga kirdi. Uning choʻntagida faqat bir burda qotgan nonga arang yetadigan chaqa bor edi.</p>
        <p>U nonvoyga oʻsha chaqani uzatib, hech boʻlmaganda eng arzon qotgan nondan berishini oʻtindi. Yonida esa issiq, xushboʻy nonlarni toʻyib olib turgan badavlat savdogar bor edi. Savdogar yoʻlovchining titrayotgan qoʻllariga va mungli koʻzlariga boqib, jim qarab tura olmadi.</p>
        <p>Savdogar oʻzi sotib olgan yangi uzilgan issiq nonlar, sariyogʻ va asal solingan savatni butunlay bechora yoʻlovchiga taqdim etdi: "Birodarim, bu rizq sizniki, marhamat, oling va qorningizni toʻydiring", dedi.</p>
        <p>Yoʻlovchi koʻzlarida yosh bilan soʻradi: "Axir men sizga bularning evaziga hech narsa bera olmayman-ku?". Savdogar samimiy tabassum qilib: "Muruvvat — evaziga narsa kutmaslikdir. Bugun men sizga yordam berdim, ertaga siz boshqa bir muhtojga muruvvat qilasiz. Yaxshilik shu tariqa dunyoni isitadi", dedi.</p>
      `,
      moral: "Hikmat: Qalb saxovati — insonning eng ulugʻ boyligidir. Siz ulashgan bir burda mehr butun bir qalbni saqlab qolishi mumkin."
    },
    "3": {
      title: "Alisher Navoiy va Chin Doʻstlik",
      category: "Adabiy Meros",
      body: `
        <p>Buyuk mutafakkir Alisher Navoiy va Hirot hukmdori Husayn Boyqaro yoshlikdan qadrdon doʻst va maktabdosh boʻlishgan. Husayn Boyqaro taxtga oʻtirgach, Navoiyni oʻzining eng yaqin maslahatchisi va vaziri etib tayinladi.</p>
        <p>Navoiy oʻz mavqeidan shaxsiy boylik yoki hashamat uchun emas, balki xalqqa muruvvat koʻrsatish, olimlar, shoirlar, yetim-yesirlar va muhtojlarga yordam berish uchun foydalandi. U oʻz hisobidan koʻplab madrasalar, shifoxonalar, koʻpriklar va rabotlar qurdirdi.</p>
        <p>Bir kuni hasadgoʻylar Husayn Boyqaroga Navoiyni yomonlab, oralariga sovuqlik tushirishga urinishdi. Ammo Husayn Boyqaro shunday dedi: "Navoiy — mening taxtimdagi vazir emas, mening qalbimdagi eng sodiq doʻstimdir. Uning muruvvati va adolati mening butun saltanatimdan ham qimmatlidir".</p>
        <p>Navoiy oʻzining "Hayrat ul-abror" dostonida yozadi: <em>"Doʻst ulki, doʻstining gʻamiga sherik boʻlsa, shodligida esa undan koʻproq quvonsa..."</em></p>
      `,
      moral: "Hikmat: Chin doʻstlik manfaat ustiga emas, yuksak maʼnaviyat, oʻzaro ishonch va xalq gʻamida yonish ustiga quriladi."
    },
    "4": {
      title: "Boyazid Bistomiy va Chumolilar",
      category: "Mehr Saxovati",
      body: `
        <p>Mashhur orif va donishmand Boyazid Bistomiy bir safardan oʻz shahri Bistomga qaytib keldi. U yoʻlda bir shaharchadan xushboʻy ziravor va urugʻ sotib olgan edi.</p>
        <p>Uyiga kelib, xurjunini yechganda, urugʻlar orasida notanish bir necha chumoli yurganini koʻrib qoldi. Donishmand chuqur oʻyga toldi: "Bu bechora mitti jonivorlar oʻz vatanidan, oʻz uyasi va qarindoshlaridan ajralib, mening sababimdan bu yerga kelib qolibdi. Men ularga zulm qilib qoʻydim!".</p>
        <p>Boyazid Bistomiy charchaganiga qaramasdan, xurjunni qayta bogʻladi va bir necha kunlik yoʻl bosib, oʻsha shaharchaga qaytib bordi va chumolilarni aynan oʻzi olgan doʻkon yoniga, oʻz uyalariga eson-omon qoʻyib yubordi.</p>
        <p>Odamlar undan: "Shuncha yoʻl bir nechta chumoli uchun bosib kelinadimi?" deb hayron boʻlishganda, donishmand: "Muruvvat faqat odamlarga emas, Yaratganning har bir jonli mitti mavjudotiga nisbatan ham koʻrsatilmogʻi lozim", deb javob berdi.</p>
      `,
      moral: "Hikmat: Muruvvat chegarasizdir. Kichik jonzotlarga mehr koʻrsata olmagan qalb, insonlarga ham chinakam doʻst boʻla olmaydi."
    },
    "5": {
      title: "Shomahmudovlar Oylasi Jasorati",
      category: "Milliy Jasorat",
      body: `
        <p>1941-1945 yillardagi mashaqqatli urush yillarida Toshkentga front ortidan minglab ota-onasiz qolgan, och-nahor yetim bolalar evakuatsiya qilib keltirilardi.</p>
        <p>Toshkentlik oddiy temirchi Shoahmad Shomahmudov va uning rafiqasi Bahri Akromova temir yoʻl vokzaliga borib, turli millatga mansub — rus, belarus, yahudiy, tatar, moldovan, qozoq boʻlgan 14 nafar bolani navbatma-navbat oʻz qaramogʻiga oldilar.</p>
        <p>Ularning oʻzlari ham toʻkin-sochin yashamasdilar, ammo oʻzlarining bir burda nonini oʻsha bolalar bilan teng baham koʻrishdi. Ularga mehr berishdi, oʻqitishdi, kiyintirishdi va oʻz farzandlaridek mehr bilan ulgʻaytirishdi.</p>
        <p>Bu mislsiz bagʻrikenglik va muruvvat butun dunyo ahlini hayratga soldi. Keyinchalik Toshkent markazida ushbu buyuk oila sharafiga "Xalqlar doʻstligi" monumenti qad rostladi.</p>
      `,
      moral: "Hikmat: Muruvvat millat, irq va til tanlamaydi. Insoniylik va mehr barcha chegaralardan ustundir."
    },
    "6": {
      title: "Keksa Bogʻbon va Yongʻoq Niholi",
      category: "Avlodlar Sabogʻi",
      body: `
        <p>Toʻqson yoshga kirgan nuroniy bir chol oʻz bogʻida egilib, erinmasdan yongʻoq koʻchatini ekayotgan edi. Yoʻldan oʻtib ketayotgan bir yigit uning mashaqqat chekayotganini koʻrib toʻxtadi.</p>
        <p>Yigit kulimsirab: "Ey otaxon, nega bu qadar oʻzingizni urintirasiz? Yongʻoq daraxti meva berguncha kamida yigirma-oʻttiz yil oʻtadi. Axir siz uning mevasini koʻrmaysiz-ku!", dedi.</p>
        <p>Donishmand bogʻbon qaddini rostlab, yigitga mehr bilan boqdi va shunday javob berdi: "Oʻgʻlim, bizdan oldingilar koʻchat ekdi — mevasini biz yedik va ularga rahmat aytdik. Endi biz ekamiz, toki bizdan keyingi avlodlar yesin va doʻstlik bilan eslasin!".</p>
        <p>Yigit qariyaga chuqur taʼzim qildi va bu soʻzlar uning hayotidagi eng katta saboq boʻlib qoldi.</p>
      `,
      moral: "Hikmat: Haqiqiy muruvvat — oʻzingdan keyingilarga ham yaxshilik qoldira bilishdadir."
    }
  };

  const storyModal = document.getElementById('storyModal');
  const storyModalTitle = document.getElementById('storyModalTitle');
  const storyModalCategory = document.getElementById('storyModalCategory');
  const storyModalBody = document.getElementById('storyModalBody');
  const storyModalMoral = document.getElementById('storyModalMoral');
  const storySpeakBtn = document.getElementById('storySpeakBtn');

  let currentSpeakingStory = "";

  document.querySelectorAll('.read-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.click();
      const storyId = btn.getAttribute('data-story');
      const story = storiesDatabase[storyId];

      if (story) {
        storyModalTitle.textContent = story.title;
        storyModalCategory.textContent = story.category;
        storyModalBody.innerHTML = story.body;
        storyModalMoral.textContent = story.moral;
        currentSpeakingStory = `${story.title}. ${story.moral}`;

        storyModal.showModal();
      }
    });
  });

  storySpeakBtn.addEventListener('click', () => {
    if (currentSpeakingStory) {
      speakText(currentSpeakingStory);
    }
  });

  // ==========================================================================
  // 6. DO'STINGIZGA MURUVVAT MAKTUBI (E-Otkritka Generator)
  // ==========================================================================
  const friendNameInput = document.getElementById('friendName');
  const presetWishSelect = document.getElementById('presetWish');
  const customMessageInput = document.getElementById('customMessage');
  const senderNameInput = document.getElementById('senderName');
  const colorOptions = document.querySelectorAll('.color-option');

  const postcardPreview = document.getElementById('postcardPreview');
  const previewRecipient = document.getElementById('previewRecipient');
  const previewMessage = document.getElementById('previewMessage');
  const previewSender = document.getElementById('previewSender');
  const sendTelegramBtn = document.getElementById('sendTelegramBtn');
  const copyCardTextBtn = document.getElementById('copyCardTextBtn');
  const downloadCardBtn = document.getElementById('downloadCardBtn');
  const copyStatusMessage = document.getElementById('copyStatusMessage');

  // Rasm yuklash elementlari
  const cardPhotoInput = document.getElementById('cardPhotoInput');
  const photoDropZone = document.getElementById('photoDropZone');
  const userPhotoPreview = document.getElementById('userPhotoPreview');
  const userPhotoImg = document.getElementById('userPhotoImg');
  const photoFileName = document.getElementById('photoFileName');
  const removePhotoBtn = document.getElementById('removePhotoBtn');
  const postcardPhotoSpot = document.getElementById('postcardPhotoSpot');
  const cardSpotImg = document.getElementById('cardSpotImg');

  let uploadedUserPhotoBase64 = null;
  let uploadedUserPhotoObj = null;

  // Rasm tanlanganda ishlov berish
  function handlePhotoSelect(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert('Iltimos, rasm formatidagi fayl tanlang (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedUserPhotoBase64 = e.target.result;
      
      uploadedUserPhotoObj = new Image();
      uploadedUserPhotoObj.onload = () => {
        // Postcard prevyusiga chiqarish
        if (cardSpotImg && postcardPhotoSpot) {
          cardSpotImg.src = uploadedUserPhotoBase64;
          postcardPhotoSpot.hidden = false;
        }
      };
      uploadedUserPhotoObj.src = uploadedUserPhotoBase64;

      // Forma prevyusiga chiqarish
      if (userPhotoImg && userPhotoPreview && photoDropZone) {
        userPhotoImg.src = uploadedUserPhotoBase64;
        photoFileName.textContent = file.name;
        userPhotoPreview.hidden = false;
        photoDropZone.style.display = 'none';
      }

      sfx.match();
    };
    reader.readAsDataURL(file);
  }

  if (cardPhotoInput) {
    cardPhotoInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handlePhotoSelect(e.target.files[0]);
      }
    });
  }

  if (photoDropZone) {
    photoDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      photoDropZone.classList.add('dragover');
    });
    photoDropZone.addEventListener('dragleave', () => {
      photoDropZone.classList.remove('dragover');
    });
    photoDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      photoDropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handlePhotoSelect(e.dataTransfer.files[0]);
      }
    });
  }

  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', () => {
      sfx.click();
      uploadedUserPhotoBase64 = null;
      uploadedUserPhotoObj = null;
      if (cardPhotoInput) cardPhotoInput.value = '';
      if (userPhotoPreview) userPhotoPreview.hidden = true;
      if (photoDropZone) photoDropZone.style.display = 'flex';
      if (postcardPhotoSpot) postcardPhotoSpot.hidden = true;
      if (cardSpotImg) cardSpotImg.src = '';
    });
  }

  // Telegram bot sozlamalari
  const TG_TOKEN = '9089759537:AAFHoPgUyJFkjke1pkAkMheq9pQHHz5JgsU';
  const TG_CHAT_ID = '7290313985';

  // Canvas orqali otkritka rasmini chizish funksiyasi
  function renderPostcardToCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 550;
    const ctx = canvas.getContext('2d');

    const theme = postcardPreview.getAttribute('data-theme') || 'emerald';
    let grad = ctx.createLinearGradient(0, 0, 800, 550);

    if (theme === 'emerald') {
      grad.addColorStop(0, '#065f46');
      grad.addColorStop(0.6, '#059669');
      grad.addColorStop(1, '#10b981');
    } else if (theme === 'sunset') {
      grad.addColorStop(0, '#9a3412');
      grad.addColorStop(0.5, '#ea580c');
      grad.addColorStop(1, '#f59e0b');
    } else if (theme === 'violet') {
      grad.addColorStop(0, '#5b21b6');
      grad.addColorStop(0.5, '#7c3aed');
      grad.addColorStop(1, '#c026d3');
    } else {
      grad.addColorStop(0, '#075985');
      grad.addColorStop(0.5, '#0284c7');
      grad.addColorStop(1, '#0ea5e9');
    }

    // Fon
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 550);

    // Naqsh hoshiyasi
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 4;
    ctx.strokeRect(25, 25, 750, 500);

    // Kichik nishon
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.roundRect(50, 50, 240, 32, 16);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("DOʻSTLIK VA MURUVVAT MAKTUBI", 65, 71);

    // Qabul qiluvchi
    ctx.font = "bold 32px serif";
    ctx.fillText(previewRecipient.textContent, 50, 135);

    // Agar foydalanuvchi rasm yuklagan bo'lsa, uni doira shaklida chizamiz
    if (uploadedUserPhotoObj && uploadedUserPhotoObj.complete) {
      try {
        const px = 680, py = 120, pr = 48;
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(uploadedUserPhotoObj, px - pr, py - pr, pr * 2, pr * 2);
        ctx.restore();

        // Oq hoshiya
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } catch (err) {
        console.warn('Canvas photo draw error:', err);
      }
    }

    // Matn (so'zlarni qatorlarga ajratish)
    ctx.font = "italic 22px Georgia";
    const words = previewMessage.textContent.split(' ');
    let line = '';
    let y = 195;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 700 && n > 0) {
        ctx.fillText(line, 50, y);
        line = words[n] + ' ';
        y += 36;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 50, y);

    // Imzo
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillText("Ehtirom ila:", 50, 450);
    ctx.font = "bold 26px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(previewSender.textContent, 50, 485);

    // Muhr
    ctx.font = "40px sans-serif";
    ctx.fillText("🤝", 690, 480);

    return canvas;
  }

  // Telegram orqali maktub va rasm yuborish funksiyasi
  async function sendToTelegramBot() {
    const friend = friendNameInput.value.trim() || 'Qadrli Doʻstim';
    const message = customMessageInput.value.trim() || previewMessage.textContent.replace(/^"|"$/g, '');
    const sender = senderNameInput.value.trim() || 'Sodiq Doʻstingiz';
    const theme = postcardPreview.getAttribute('data-theme') || 'emerald';

    if (!sendTelegramBtn) return;
    sendTelegramBtn.disabled = true;
    const origHtml = sendTelegramBtn.innerHTML;
    sendTelegramBtn.innerHTML = '<span>⏳ Rasm va maktub yuborilmoqda...</span>';
    copyStatusMessage.textContent = 'Maktub va rasm Telegram botga joʻnatilmoqda...';
    copyStatusMessage.style.color = 'var(--primary)';

    const themeNames = {
      emerald: 'Zumrad Zangori (Mehr & Muruvvat)',
      sunset: 'Quyosh Nuri (Saxovat)',
      violet: 'Nilufar Nafisligi (Ezgulik)',
      sky: 'Moviy Tinchlik (Sadoqat)'
    };
    const now = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });

    const telegramCaption = 
`💌 <b>YANGI MURUVVAT MAKTUBI!</b>
━━━━━━━━━━━━━━━━━━━━━━
👤 <b>Kimga:</b> ${friend}
💬 <b>Maktub matni:</b>
<i>"${message}"</i>

✍️ <b>Yuboruvchi:</b> ${sender}
🎨 <b>Mavzusi:</b> ${themeNames[theme] || theme}
⏰ <b>Vaqti:</b> ${now}
━━━━━━━━━━━━━━━━━━━━━━
🌐 <i>"Doʻstlik va Muruvvat" veb-portalidan yuborildi</i>`;

    // 1. Otkritka rasmini avtomatik yaratish
    const cardCanvas = renderPostcardToCanvas();
    const cardImageBase64 = cardCanvas.toDataURL('image/png');

    let success = false;

    // 2. Birinchi bo'lib lokal server orqali yuborish
    try {
      const resp = await fetch('/api/send-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friendName: friend,
          message: message,
          senderName: sender,
          theme: theme,
          imageBase64: cardImageBase64,
          userPhotoBase64: uploadedUserPhotoBase64
        })
      });
      const data = await resp.json();
      if (data.ok) success = true;
    } catch (e) {
      console.warn('Backend orqali ulanib boʻlmadi, toʻgʻridan-toʻgʻri Telegram API chaqirilmoqda...', e);
    }

    // 3. Agar backend server bo'lmasa, to'g'ridan-to'g'ri brauzer orqali Telegram API ga FormData yordamida yuborish
    if (!success) {
      try {
        await new Promise((resolve) => {
          cardCanvas.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append('chat_id', TG_CHAT_ID);
            formData.append('photo', blob, 'muruvvat-maktubi.png');
            formData.append('caption', telegramCaption);
            formData.append('parse_mode', 'HTML');

            const tgResp = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendPhoto`, {
              method: 'POST',
              body: formData
            });
            const tgData = await tgResp.json();
            if (tgData.ok) success = true;

            // Agar qo'shimcha rasm ham yuklangan bo'lsa
            if (uploadedUserPhotoBase64) {
              try {
                // Base64 to blob
                const fetchRes = await fetch(uploadedUserPhotoBase64);
                const userBlob = await fetchRes.blob();
                const userFd = new FormData();
                userFd.append('chat_id', TG_CHAT_ID);
                userFd.append('photo', userBlob, 'dostlik-rasmi.jpg');
                userFd.append('caption', `📸 <b>Doʻstlik xotirasi:</b> ${friend} va ${sender} surati`);
                userFd.append('parse_mode', 'HTML');
                await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendPhoto`, {
                  method: 'POST',
                  body: userFd
                });
              } catch (uErr) {
                console.warn('User photo direct upload error:', uErr);
              }
            }

            resolve();
          }, 'image/png');
        });
      } catch (e) {
        console.error('Telegram API toʻgʻridan-toʻgʻri xatosi:', e);
      }
    }

    sendTelegramBtn.disabled = false;
    sendTelegramBtn.innerHTML = origHtml;

    if (success) {
      sfx.success();
      copyStatusMessage.textContent = '🎉 Maktub va rasm Telegram botga (@maktubdost_bot) muvaffaqiyatli yetkazildi!';
      copyStatusMessage.style.color = 'var(--primary)';

      openGameResultModal(
        '💌',
        'Maktub va Rasm Telegramga yuborildi!',
        `<p style="font-size:1.15rem; margin-bottom:1rem;">
          Sizning <strong>"${friend}"</strong> nomiga yozgan maktubingiz va tayyorlangan <strong>otkritka rasmi</strong> 
          Telegram botingizga (<code>@maktubdost_bot</code>) foto shaklida yetkazildi!
        </p>
        <p style="color:var(--text-muted); font-size:0.95rem;">
          Endi Telegram botingizda maktubni va rasmni toʻliq koʻrishingiz mumkin!
        </p>`
      );
    } else {
      sfx.wrong();
      copyStatusMessage.textContent = '❌ Xatolik yuz berdi. Internet aloqangizni tekshirib, qayta urinib koʻring.';
      copyStatusMessage.style.color = 'var(--heart-red)';
    }
  }

  if (sendTelegramBtn) {
    sendTelegramBtn.addEventListener('click', sendToTelegramBot);
  }

  // Rasm sifatida yuklab olish tugmasi
  downloadCardBtn.addEventListener('click', () => {
    sfx.success();
    const canvas = renderPostcardToCanvas();
    const link = document.createElement('a');
    link.download = `dostlik-maktubi-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  // Input listeners
  friendNameInput.addEventListener('input', () => {
    previewRecipient.textContent = friendNameInput.value.trim() 
      ? `Qadrli ${friendNameInput.value.trim()}!` 
      : 'Qadrli Doʻstim!';
  });

  senderNameInput.addEventListener('input', () => {
    previewSender.textContent = senderNameInput.value.trim() 
      ? senderNameInput.value.trim() 
      : 'Sodiq Doʻsting';
  });

  presetWishSelect.addEventListener('change', () => {
    if (presetWishSelect.value !== 'custom') {
      const selectedOption = presetWishSelect.options[presetWishSelect.selectedIndex];
      customMessageInput.value = selectedOption.text.replace(/^"|"$/g, '');
      previewMessage.textContent = selectedOption.text;
    }
  });

  customMessageInput.addEventListener('input', () => {
    previewMessage.textContent = `"${customMessageInput.value.trim() || 'Doʻstlik va muruvvatingiz uchun tashakkur!'}"`;
  });

  colorOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      sfx.click();
      colorOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      const theme = opt.getAttribute('data-theme');
      postcardPreview.setAttribute('data-theme', theme);
    });
  });

  // Nusxalash
  copyCardTextBtn.addEventListener('click', () => {
    const textToCopy = `${previewRecipient.textContent}\n\n${previewMessage.textContent}\n\nEhtirom ila: ${previewSender.textContent}\n("Doʻstlik va Muruvvat" maskanidan samimiyat bilan)`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      sfx.match();
      copyStatusMessage.textContent = "✅ Maktub matni nusxalandi! Endi Telegram yoki messenjerda ulashishingiz mumkin.";
      setTimeout(() => copyStatusMessage.textContent = "", 3000);
    });
  });

  // ==========================================================================
  // 7. KUNLIK MURUVVAT CHAQIRIG'I (Daily Kindness Mission)
  // ==========================================================================
  const dailyTasks = [
    {
      action: "Bir kishiga kutilmagan samimiy tabassum va yaxshi soʻz ayting!",
      reason: "Tabassum — eng arzon va eng qimmatli muruvvatdir. U boshqalarning kunini yoritadi va oʻzingizda quvonch uygʻotadi."
    },
    {
      action: "Uzoq vaqtdan beri gaplashmagan qadrdon doʻstingizga qoʻngʻiroq qiling yoki iliq xabar yozing!",
      reason: "Doʻstlik rishtalari eʼtibor va samimiyat bilan mustahkamlanadi."
    },
    {
      action: "Koʻchadagi qushlarga don yoki uysiz jonivorlarga suv va ovqat bering!",
      reason: "Tabiatdagi barcha jonzotlarga mehr koʻrsatish — oliyjanoblikning eng yuksak koʻrinishidir."
    },
    {
      action: "Ota-onangiz yoki ustozingizning qoʻlidan oʻpib, 'Borligingiz uchun rahmat' deng!",
      reason: "Yaqinlarning qadriga yetish va minnatdorlik bildirish — qalbni yorugʻlikka toʻldiradi."
    },
    {
      action: "Bugun bitta kishining xatosini kechiring va dilingizdagi ginani butunlay unuting!",
      reason: "Kechirimlilik — kuchli insonlar fazilati boʻlib, u yurakni barcha ogʻirliklardan xalos etadi."
    }
  ];

  const dailyKindnessBtn = document.getElementById('dailyKindnessBtn');
  const dailyKindnessModal = document.getElementById('dailyKindnessModal');
  const taskActionText = document.getElementById('taskActionText');
  const taskReasonText = document.getElementById('taskReasonText');
  const markTaskDoneBtn = document.getElementById('markTaskDoneBtn');

  dailyKindnessBtn.addEventListener('click', () => {
    sfx.click();
    const dayIndex = new Date().getDay() % dailyTasks.length;
    const task = dailyTasks[dayIndex];
    taskActionText.textContent = task.action;
    taskReasonText.textContent = task.reason;
    dailyKindnessModal.showModal();
  });

  markTaskDoneBtn.addEventListener('click', () => {
    sfx.success();
    dailyKindnessModal.close();
    deedsCount += 10;
    localStorage.setItem('dm_deeds_count', deedsCount);
    goodDeedsCountEl.textContent = deedsCount.toLocaleString('uz-UZ');

    openGameResultModal(
      '🌟',
      'Muruvvatingiz qabul boʻlsin!',
      `<p style="font-size:1.15rem;">
        Siz bugungi ezgu amalingiz bilan dunyoni ozgina boʻlsa-da goʻzalroq va iliqroq qildingiz!
        Umumiy hisobga <strong>+10 ezgulik bali</strong> qoʻshildi.
      </p>`
    );
  });

  // ==========================================================================
  // 8. O'YIN NATIJALARI MODALI YORDAMCHILARI
  // ==========================================================================
  const gameResultModal = document.getElementById('gameResultModal');
  const gameResultEmoji = document.getElementById('gameResultEmoji');
  const gameResultTitle = document.getElementById('gameResultTitle');
  const gameResultBody = document.getElementById('gameResultBody');

  function openGameResultModal(emoji, title, bodyHtml) {
    gameResultEmoji.textContent = emoji;
    gameResultTitle.textContent = title;
    gameResultBody.innerHTML = bodyHtml;
    gameResultModal.showModal();
  }

  function closeGameResultModal() {
    gameResultModal.close();
  }

  // ==========================================================================
  // 9. NATIVE SPEECH SYNTHESIS (Matnni ovozli o'qish)
  // ==========================================================================
  function speakText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Kechirasiz, brauzeringiz ovozli oʻqishni qoʻllab-quvvatlamaydi.");
    }
  }

  // Modern Web Guidance: modal click outside fallback for older browsers
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    const outside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => { pressedOutside = outside(e, dialog); });
      dialog.addEventListener('pointerup', (e) => { if (pressedOutside && outside(e, dialog)) dialog.close(); });
    }
  }
});
