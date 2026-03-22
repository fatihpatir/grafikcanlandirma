const app = {
  activeExam: null,
  score: 0,
  timer: null,
  timeLeft: 0,
  progress: JSON.parse(localStorage.getItem('grafik_progress')) || {},
  
  init() {
    this.renderHome();
  },

  renderHome() {
    const grid = document.getElementById('exam-grid');
    grid.innerHTML = '';
    const allCards = window.EXAM_DATA.flatMap(e => e.flashcards);
    const fact = allCards[Math.floor(Math.random()*allCards.length)];
    grid.innerHTML = `<div class="q-card" style="grid-column: 1 / -1; margin-bottom: 2.5rem; border-color: var(--accent);"><div class="q-num">🎞️ MOTION TIP</div><p class="q-text" style="font-family:'Orbitron'">${fact.front}</p><p class="a-text">${fact.back}</p></div>`;
    
    window.EXAM_DATA.forEach(exam => {
      const isDone = this.progress[exam.id]?.study;
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-icon">${this.getIcon(exam.id)}</div>
        <h3 class="card-title">${exam.title}</h3>
        <p class="card-desc">After Effects & Photoshop Eğitim Birimi.</p>
        ${isDone ? '<span style="color:var(--accent); font-family:\'Orbitron\'; font-size:0.7rem; margin-top:12px;">RENDER FINISHED ✅</span>' : ''}
      `;
      card.onclick = () => this.showSelection(exam);
      grid.appendChild(card);
    });
  },

  getIcon(id) {
    const icons = { '1-1': '🖌️', '1-2': '💠', '2-1': '💨', '2-2': '🎥' };
    return icons[id] || '🎬';
  },

  showView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0,0);
  },

  showHome() { this.activeExam = null; this.showView('view-home'); this.renderHome(); },

  showSelection(exam) {
    this.activeExam = exam;
    document.getElementById('selected-title').innerText = exam.title;
    this.showView('view-selection');
    this.renderBadges();
  },

  startSummary() {
    const c = document.getElementById('content-container');
    c.innerHTML = `
      <div class="game-container" style="text-align:left;">
        <h2 style="text-align:center; margin-bottom:2.5rem; color:var(--primary); font-family:'Orbitron'">📖 ${this.activeExam.title} ÖZETİ</h2>
        <div class="q-card" style="line-height:1.8; font-size:1.1rem; border-left:6px solid var(--accent); background:#000;">
          ${this.activeExam.summary}
        </div>
        <div style="text-align:center; margin-top:2.5rem;">
          <button class="btn" onclick="app.startStudy()">📚 PROJE DOSYALARINI AÇ</button>
        </div>
      </div>
    `;
    this.showView('view-content');
  },

  startOpenEnded() {
    const c = document.getElementById('content-container');
    c.innerHTML = `<h2 style="font-family:'Orbitron'; margin-bottom:2.5rem; color:var(--accent); text-align:center;">${this.activeExam.title} / Açık Uçlu Hazırlık</h2>${this.activeExam.openEnded.map((q, i) => `<div class="q-card" style="margin-bottom:2rem;"><div class="q-num">SORU ${i+1}</div><p class="q-text" style="font-weight:bold; font-size:1.1rem; margin-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">${q.q}</p><p class="a-text" style="color:var(--accent); line-height:1.6; font-size:1.05rem;"><strong style="color:#fff;">Cevap:</strong> ${q.a}</p></div>`).join('')}`;
    this.saveProgress('openEnded');
    this.showView('view-content');
  },

  startStudy() {
    const c = document.getElementById('content-container');
    c.innerHTML = `<h2 style="font-family:'Orbitron'; margin-bottom:2.5rem;">${this.activeExam.title} / Arşiv</h2>${this.activeExam.questions.map((q, i) => `<div class="q-card"><div class="q-num">SOURCE ${i+1}</div><p class="q-text">${q.q}</p><p class="a-text">${q.a}</p></div>`).join('')}`;
    this.saveProgress('study');
    this.showView('view-content');
  },

  startFlashcards() {
    const c = document.getElementById('content-container');
    c.innerHTML = `<div class="fc-grid">${this.activeExam.flashcards.map(f => `<div class="fc-card" onclick="this.classList.toggle('flipped')"><div class="fc-inner"><div class="fc-front">${f.front}</div><div class="fc-back">${f.back}</div></div></div>`).join('')}</div>`;
    this.saveProgress('flash');
    this.showView('view-content');
  },

  startGame(type) {
    this.score = 0;
    this.showView('view-content');
    if(type === 'tf') this.playTF();
    else if(type === 'word') this.playWord();
    else if(type === 'time') this.playTime();
    else if(type === 'test') this.playTest();
  },

  playTF() {
    const q = this.activeExam.questions[Math.floor(Math.random()*this.activeExam.questions.length)];
    const isCorrect = Math.random() > 0.5;
    const ans = isCorrect ? q.a : this.activeExam.questions[Math.floor(Math.random()*this.activeExam.questions.length)].a;
    const c = document.getElementById('content-container');
    c.innerHTML = `<div class="game-container"><h3>Frame Check</h3><div class="q-card" style="margin-top:2rem;"><p class="q-text">${q.q}</p><p class="a-text" style="color:var(--accent); font-weight:700;">Bilgi: ${ans}</p></div><div style="display:flex; gap:1.5rem; justify-content:center; margin-top:2.5rem;"><button class="btn" onclick="app.checkTF(true, ${ans === q.a})">TRUE</button><button class="btn btn-secondary" onclick="app.checkTF(false, ${ans === q.a})">FALSE</button></div></div>`;
  },

  checkTF(p, c) { if(p === c) { this.score++; this.playTF(); } else this.endGame('Bad Render!', `Puan: ${this.score}`); },

  playWord() {
    const q = this.activeExam.questions[Math.floor(Math.random()*this.activeExam.questions.length)];
    const word = q.a.toUpperCase().replace(/[., ()]/g,'');
    let hidden = word.split('').map(c => '_').join('');
    const c = document.getElementById('content-container');
    c.innerHTML = `<div class="game-container"><h3>Kısayol Tahmini</h3><p style="margin-bottom:2rem; font-size:1.1rem; opacity:0.8;">${q.q}</p><div class="word-display" id="word-box">${hidden}</div><div class="keyboard">${"ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split('').map(l => `<button class="key" onclick="app.guess('${l}','${word}',this)">${l}</button>`).join('')}</div></div>`;
  },

  guess(l, w, b) {
    b.classList.add('used');
    const box = document.getElementById('word-box');
    let curr = box.innerText.split('');
    w.split('').forEach((c, i) => { if(c === l) { curr[i] = l; } });
    box.innerText = curr.join('');
    if(!curr.includes('_')) { this.saveProgress('game'); this.endGame('Smooth Animation!', `Terim: ${w}`); this.triggerConfetti(); }
  },

  playTime() {
    this.timeLeft = 60;
    this.timer = setInterval(() => {
      this.timeLeft--;
      document.getElementById('game-status').innerText = `⏱️ ${this.timeLeft}s | 💎 ${this.score}`;
      if(this.timeLeft <= 0) { clearInterval(this.timer); this.endGame('Timeline End!', `Final Skor: ${this.score}`); }
    }, 1000);
    this.nextTimeQ();
  },

  nextTimeQ() {
    const q = this.activeExam.questions[Math.floor(Math.random()*this.activeExam.questions.length)];
    const opts = [q.a, ...this.activeExam.questions.filter(x => x.a !== q.a).map(x => x.a).sort(() => 0.5-Math.random()).slice(0,2)].sort(() => 0.5-Math.random());
    const c = document.getElementById('content-container');
    c.innerHTML = `<div class="game-container"><div class="q-card"><p class="q-text">${q.q}</p></div><div style="display:grid; gap:12px; margin-top:1.5rem;">${opts.map(o => `<button class="btn btn-secondary" onclick="app.checkTimeQ('${o}','${q.a}')">${o}</button>`).join('')}</div></div>`;
  },

  checkTimeQ(p, c) { if(p === c) this.score++; this.nextTimeQ(); },

  endGame(t, m) {
    clearInterval(this.timer);
    document.getElementById('game-status').innerText = '';
    const b = document.getElementById('result-body');
    b.innerHTML = `<h2 style="color:var(--accent); font-family:'Orbitron'; margin-bottom:1.5rem;">${t}</h2><p style="font-size:1.8rem; margin-bottom:2.5rem; font-weight:700;">${m}</p><button class="btn" onclick="app.closeModal()">OK</button>`;
    document.getElementById('modal-result').classList.add('active');
  },

  closeModal() { document.getElementById('modal-result').classList.remove('active'); this.showSelection(this.activeExam); },

  saveProgress(type) {
    if(!this.progress[this.activeExam.id]) this.progress[this.activeExam.id] = {};
    this.progress[this.activeExam.id][type] = true;
    localStorage.setItem('grafik_progress', JSON.stringify(this.progress));
    this.showToast('Project Achievement Unlocked! 💎');
  },

  renderBadges() {
    const c = document.getElementById('badges');
    const types = ['openEnded', 'study', 'flash', 'game'];
    const icons = { openEnded: '🧠', study: '📚', flash: '🎴', game: '🎮' };
    c.innerHTML = types.map(t => `<span class="badge ${this.progress[this.activeExam.id]?.[t] ? 'earned' : ''}" style="padding:10px 18px; border-radius:10px; border:1px solid var(--glass-border); margin-right:8px; display:inline-block; font-size:1.1rem; filter: grayscale(${this.progress[this.activeExam.id]?.[t] ? 0 : 1}); opacity: ${this.progress[this.activeExam.id]?.[t] ? 1 : 0.3}"> ${icons[t]}</span>`).join('');
  },

  printNotes() {
    const a = document.getElementById('print-area');
    let html = `<div style="text-align:center"><h1 style="font-family:sans-serif">${this.activeExam.title} - Grafik Canlandırma Notları</h1><p>Editör: Fatih PATIR</p></div><hr>`;
    html += `<h2 style="margin-top:30px;">Açık Uçlu Sınav Soruları</h2>`;
    html += this.activeExam.openEnded.map(q => `<div style="margin-bottom:20px; padding:15px; border-bottom:1px solid #ddd"><strong>🧠 ${q.q}</strong><br><br>💎 ${q.a}</div>`).join('');
    html += `<h2 style="margin-top:30px;">Diğer Çalışma Soruları</h2>`;
    html += this.activeExam.questions.map(q => `<div style="margin-bottom:20px; padding:15px; border-bottom:1px solid #ddd"><strong>📽️ ${q.q}</strong><br><br>💎 ${q.a}</div>`).join('');
    a.innerHTML = html;
    window.print();
  },

  showToast(m) {
    const t = document.getElementById('achievement-toast');
    t.innerText = m; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  },

  triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const parts = [];
    for(let i=0; i<150; i++) parts.push({ x: Math.random()*canvas.width, y: -20, r: Math.random()*5+2, d: Math.random()*canvas.width, color: `hsl(${Math.random()*360},90%,60%)` });
    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      parts.forEach(p => { ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill(); p.y += 5; });
      if(parts.some(p => p.y < canvas.height)) requestAnimationFrame(draw);
    }
    draw();
  },

  toggleTheme() {
    document.body.style.filter = document.body.style.filter === 'invert(1)' ? 'none' : 'invert(1)';
  },

  search(val) {
    const cards = document.querySelectorAll('#exam-grid .card');
    cards.forEach(c => {
      const txt = c.innerText.toLowerCase();
      c.style.display = txt.includes(val.toLowerCase()) ? 'flex' : 'none';
    });
  }
};

window.onload = () => app.init();
