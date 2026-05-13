/* ============================================================
   UI.JS v5.0  —  Blue Archive Edition
   CHANGES FROM v4:
     ✓ Section-page navigation (SPA-style, no browser scroll)
     ✓ GPU-accelerated page transitions (transform+opacity only)
     ✓ 120fps: will-change injected/removed dynamically
     ✓ Section dot navigator
     ✓ Keyboard arrow-key navigation
     ✓ Touch/swipe support
     ✓ Scroll progress per active section
     ✓ filterProjects: fixed event reference bug
     ✓ initCounters: fires reliably when section becomes active
     ✓ initSkillBars: fires reliably on section enter
     ✓ All transition conflicts resolved
   ============================================================ */

/* ── CONSOLE ART ── */
(function () {
    const art = [
        '%c',
        '  \u2588\u2588\u2557    \u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557',
        '  \u2588\u2588\u2551    \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u255a\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255d\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255d\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557',
        '  \u2588\u2588\u2551 \u2588\u2557 \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d',
        '  \u2588\u2588\u2551\u2588\u2588\u2588\u2557\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2554\u2550\u2550\u255d  \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557',
        '  \u255a\u2588\u2588\u2588\u2554\u2588\u2588\u2588\u2554\u255d\u2588\u2588\u2551  \u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551',
        '   \u255a\u2550\u2550\u255d\u255a\u2550\u2550\u255d \u255a\u2550\u255d  \u255a\u2550\u255d   \u255a\u2550\u255d   \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u255d\u255a\u2550\u255d  \u255a\u2550\u255d',
        '',
        '  \ud83d\udc4b Hey devtools lurker. Respect.',
        '  \ud83d\udc1b Official bug count: 0  (this is a lie)',
        '  \u2615 Fuel: Red Bull + spite + sleep deprivation',
        '  \ud83d\udd25 Built by Water, age 15, somehow professional',
        '',
        '  \ud83d\udca1 CLI secrets: coffee  uwu  hack  sudo  neofetch',
        '     git blame  npm install  ls  cat readme.md  ping',
        '',
    ].join('\n');
    setTimeout(() => console.log(art, 'color:#1AA8FF;font-family:monospace;font-size:11px;'), 1200);
})();

/* ════════════════════════════════
   SECTION NAVIGATION SYSTEM
════════════════════════════════ */
const SECTION_IDS = ['about','file','skills','history','code','projects','calculator','reviews','contact'];
const SECTION_LABELS = ['Home','Personnel','Skills','History','Code Vault','Projects','Estimator','Reviews','Contact'];

let _activeSection = 0;
let _transitioning = false;
const TRANSITION_DUR = 580; // ms

/* Skills/counters init state per section */
const _sectionInited = {};

function navigateTo(id, instant) {
    const nextIdx = SECTION_IDS.indexOf(id);
    if (nextIdx === -1) return;
    if (nextIdx === _activeSection && !instant) return;
    if (_transitioning) return;

    const curEl  = document.querySelector('.section-page.active');
    const nextEl = document.getElementById('page-' + id);
    if (!nextEl) return;

    // Update nav + dots immediately
    updateNavLinks(id);
    updateSectionDots(nextIdx);
    updateSectionProgress(nextIdx);

    if (instant || !curEl || curEl === nextEl) {
        if (curEl && curEl !== nextEl) curEl.classList.remove('active');
        nextEl.classList.add('active');
        nextEl.scrollTop = 0;
        _activeSection = nextIdx;
        onSectionEnter(id);
        return;
    }

    _transitioning = true;
    const direction = nextIdx > _activeSection ? 1 : -1;
    const yOut  = direction * -40;
    const yIn   = direction *  55;

    // Prepare leaving page
    curEl.style.willChange  = 'transform, opacity';
    curEl.classList.add('page-leaving');

    // Prepare entering page — position off-screen
    nextEl.style.willChange  = 'transform, opacity';
    nextEl.style.transform   = `translate3d(0,${yIn}px,0)`;
    nextEl.style.opacity     = '0';
    nextEl.classList.add('active', 'page-entering');
    nextEl.scrollTop = 0;

    // Force reflow once
    void nextEl.offsetWidth;

    const ease = `${TRANSITION_DUR}ms cubic-bezier(0.4,0,0.2,1)`;
    curEl.style.transition  = `transform ${ease}, opacity ${ease}`;
    nextEl.style.transition = `transform ${ease}, opacity ${ease}`;

    requestAnimationFrame(() => {
        nextEl.style.transform = 'translate3d(0,0,0)';
        nextEl.style.opacity   = '1';
        curEl.style.transform  = `translate3d(0,${yOut}px,0)`;
        curEl.style.opacity    = '0';
    });

    setTimeout(() => {
        // Cleanup leaving
        curEl.classList.remove('active', 'page-leaving');
        curEl.style.cssText = '';

        // Cleanup entering
        nextEl.classList.remove('page-entering');
        nextEl.style.cssText = '';

        _activeSection  = nextIdx;
        _transitioning  = false;
        onSectionEnter(id);
    }, TRANSITION_DUR + 30);
}

function onSectionEnter(id) {
    if (_sectionInited[id]) return;
    _sectionInited[id] = true;

    // Trigger reveal animations for elements in this section
    const page = document.getElementById('page-' + id);
    if (!page) return;

    // Reveal staggered items
    const items = page.querySelectorAll('.reveal-item');
    items.forEach((el, i) => {
        setTimeout(() => { el.classList.add('revealed'); }, i * 70);
    });

    // Skill bars (skills section)
    if (id === 'skills') {
        setTimeout(initSkillBarsForPage, 100);
    }
    // Counters (about/hero section)
    if (id === 'about') {
        setTimeout(initCountersForPage, 300);
    }
}

function updateNavLinks(id) {
    document.querySelectorAll('.nav-link').forEach(l => {
        const href = l.getAttribute('data-section') || l.getAttribute('href')?.replace('#','');
        l.classList.toggle('active', href === id);
    });
}

function updateSectionDots(idx) {
    document.querySelectorAll('.nav-dot').forEach((d, i) => {
        d.classList.toggle('active', i === idx);
    });
}

function updateSectionProgress(idx) {
    const pct = SECTION_IDS.length > 1
        ? Math.round((idx / (SECTION_IDS.length - 1)) * 100)
        : 0;
    const bar = document.getElementById('section-progress-bar');
    if (bar) bar.style.width = pct + '%';
}

/* Scroll progress within active section */
function initScrollProgress() {
    const container = document.getElementById('sections-container');
    if (!container) return;
    container.addEventListener('scroll', () => {}, { passive: true });

    // Attach scroll listener to each section page
    SECTION_IDS.forEach(id => {
        const page = document.getElementById('page-' + id);
        if (!page) return;
        page.addEventListener('scroll', () => {
            if (_activeSection !== SECTION_IDS.indexOf(id)) return;
            const ratio = page.scrollTop / (page.scrollHeight - page.clientHeight || 1);
            const bar   = document.getElementById('scroll-progress');
            if (bar) bar.style.width = (ratio * 100) + '%';
        }, { passive: true });
    });
}

/* ════════════════════════════════
   DOT NAVIGATOR (right side)
════════════════════════════════ */
function initSectionDots() {
    const container = document.createElement('div');
    container.id = 'section-nav-dots';
    SECTION_IDS.forEach((id, i) => {
        const dot = document.createElement('div');
        dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
        dot.title     = SECTION_LABELS[i];
        dot.innerHTML = `<span class="nav-dot-label">${SECTION_LABELS[i]}</span>`;
        dot.addEventListener('click', () => { playClick(600, 0.05); navigateTo(id); });
        container.appendChild(dot);
    });
    document.body.appendChild(container);

    // Section progress bar
    const bar = document.createElement('div');
    bar.id = 'section-progress-bar';
    bar.style.width = '0%';
    document.body.appendChild(bar);
}

/* ════════════════════════════════
   KEYBOARD NAVIGATION
════════════════════════════════ */
function initKeyboardNav() {
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            const next = Math.min(_activeSection + 1, SECTION_IDS.length - 1);
            navigateTo(SECTION_IDS[next]);
        }
        if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            const prev = Math.max(_activeSection - 1, 0);
            navigateTo(SECTION_IDS[prev]);
        }
    });
}

/* ════════════════════════════════
   TOUCH / SWIPE
════════════════════════════════ */
function initSwipeNav() {
    let startY = 0, startTime = 0;
    const container = document.getElementById('sections-container');
    if (!container) return;

    container.addEventListener('touchstart', e => {
        startY    = e.touches[0].clientY;
        startTime = Date.now();
    }, { passive: true });

    container.addEventListener('touchend', e => {
        const dy  = startY - e.changedTouches[0].clientY;
        const dt  = Date.now() - startTime;
        // Only trigger if quick swipe AND not a small scroll
        if (Math.abs(dy) < 60 || dt > 400) return;

        // Check if active section is scrolled — only navigate if at top/bottom
        const page = document.querySelector('.section-page.active');
        if (!page) return;
        const atTop    = page.scrollTop < 10;
        const atBottom = page.scrollHeight - page.scrollTop - page.clientHeight < 10;

        if (dy > 0 && atBottom) {
            navigateTo(SECTION_IDS[Math.min(_activeSection + 1, SECTION_IDS.length - 1)]);
        } else if (dy < 0 && atTop) {
            navigateTo(SECTION_IDS[Math.max(_activeSection - 1, 0)]);
        }
    }, { passive: true });
}

/* ════════════════════════════════
   WHEEL NAVIGATION
   Only fires when section is at edge
════════════════════════════════ */
function initWheelNav() {
    let _wheelCd = false;
    document.addEventListener('wheel', e => {
        if (_transitioning || _wheelCd) return;
        const page = document.querySelector('.section-page.active');
        if (!page) return;
        const atTop    = page.scrollTop < 2;
        const atBottom = page.scrollHeight - page.scrollTop - page.clientHeight < 2;

        if (e.deltaY > 40 && atBottom) {
            e.preventDefault();
            _wheelCd = true;
            setTimeout(() => { _wheelCd = false; }, 900);
            navigateTo(SECTION_IDS[Math.min(_activeSection + 1, SECTION_IDS.length - 1)]);
        } else if (e.deltaY < -40 && atTop) {
            e.preventDefault();
            _wheelCd = true;
            setTimeout(() => { _wheelCd = false; }, 900);
            navigateTo(SECTION_IDS[Math.max(_activeSection - 1, 0)]);
        }
    }, { passive: false });
}

/* ════════════════════════════════
   BOOT SEQUENCE
════════════════════════════════ */
function startExperience() {
    if (typeof audioCtx !== 'undefined' && audioCtx.state === 'suspended') audioCtx.resume();
    playClick(880, 0.3);
    const overlay = document.getElementById('start-overlay');
    if (!overlay) return;
    overlay.style.animation = 'crtOff 0.5s forwards';
    setTimeout(() => {
        overlay.style.display = 'none';
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.7s ease';
        requestAnimationFrame(() => { document.body.style.opacity = '1'; });

        const bgm = document.getElementById('bgm');
        if (bgm && config && config.bgmUrl) {
            bgm.src    = config.bgmUrl;
            bgm.volume = config.volume || 0.15;
            bgm.play().catch(() => {});
        }

        // Trigger hero section enter animations
        setTimeout(() => onSectionEnter('about'), 400);
    }, 480);
}

function runBootSequence() {
    const container = document.getElementById('boot-log-container');
    if (!container) return;
    const checks = [
        { label: 'BIOS_CHECK',               cls: 'check', status: 'OK'   },
        { label: 'MEMORY_INTEGRITY',          cls: 'check', status: 'OK'   },
        { label: 'CHECKING_IF_SENSEI_AWAKE',  cls: 'info',  status: 'YES'  },
        { label: 'LOADING_COPE_RESERVES',     cls: 'warn',  status: 'FULL' },
        { label: 'COUNTING_BUGS_IN_CODEBASE', cls: 'check', status: '0 ✓'  },
        { label: 'NETWORK_UPLINK',            cls: 'check', status: 'OK'   },
        { label: 'VIRUS_DETECTED',            cls: 'err',   status: '...'  },
        { label: 'just_kidding_lol',          cls: 'info',  status: 'haha' },
        { label: 'SCHALE_DB_MOUNT',           cls: 'check', status: 'OK'   },
    ];
    let i = 0;
    function next() {
        if (i < checks.length) {
            const ch  = checks[i];
            const div = document.createElement('div');
            div.className = 'boot-status-line';
            div.innerHTML = `<span>${ch.label}...</span><span class="${ch.cls}">${ch.status}</span>`;
            container.appendChild(div);
            playClick(800 + i * 55, 0.04);
            i++;
            setTimeout(next, i === 7 ? 650 : 230);
        } else {
            setTimeout(() => {
                const btn = document.getElementById('connect-btn');
                if (btn) btn.classList.remove('opacity-0', 'translate-y-4');
            }, 350);
        }
    }
    setTimeout(next, 350);
}

/* ════════════════════════════════
   LOCAL STORAGE / AVATAR
════════════════════════════════ */
function _applyPfp(url) {
    const img = document.getElementById('avatar-img');
    const ph  = document.getElementById('avatar-placeholder');
    if (!img || !ph) return;
    img.src = url;
    img.classList.remove('hidden');
    ph.classList.add('hidden');
    img.onerror = () => {
        img.classList.add('hidden');
        ph.classList.remove('hidden');
        localStorage.removeItem('schale_db_pfp');
    };
}

// Stub — events.js overrides with real counter
function initLocalSystem() {
    const pfp = localStorage.getItem('schale_db_pfp');
    if (pfp) _applyPfp(pfp);
    const el = document.getElementById('visitor-count');
    if (el) el.innerText = '...';
}

window.updateProfilePicture = function () {
    const correctPin = (config && config.profilePin) ? String(config.profilePin) : 'schale';
    const pin = prompt('Admin PIN required to update profile photo:');
    if (pin === null) return;
    if (pin.trim() !== correctPin) {
        showToast('Access denied — wrong PIN.', 'var(--alert)');
        playClick(220, 0.4);
        return;
    }
    const url = prompt('PIN accepted!\n\nPaste your profile picture URL:');
    if (!url) return;
    if (!url.startsWith('http') && !url.startsWith('data:image')) {
        showToast('Invalid URL — must start with http or data:image', 'var(--gold)');
        return;
    }
    playClick(1000, 0.1);
    localStorage.setItem('schale_db_pfp', url);
    _applyPfp(url);
    showToast('Profile picture updated!', 'var(--green)');
};

window.adminResetPfp = function () {
    localStorage.removeItem('schale_db_pfp');
    const img = document.getElementById('avatar-img');
    const ph  = document.getElementById('avatar-placeholder');
    if (img) { img.src = ''; img.classList.add('hidden'); }
    if (ph)  ph.classList.remove('hidden');
};

/* ════════════════════════════════
   TYPEWRITER
════════════════════════════════ */
let _twTimer;
function typeWriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    clearTimeout(_twTimer);
    const langEl = document.getElementById('lang-display');
    const isEN   = (langEl ? langEl.innerText : 'EN') === 'EN';
    const text   = isEN ? 'Broken Code.' : 'โค้ดที่พังครับ';
    let i = 0;
    el.innerText = '';
    function tick() {
        if (i < text.length) {
            el.innerHTML += text.charAt(i++);
            _twTimer = setTimeout(tick, 85);
        }
    }
    tick();
}

/* ════════════════════════════════
   TEXT SCRAMBLE
════════════════════════════════ */
const TextScramble = (function () {
    function TS(el) {
        this.el    = el;
        this.chars = '!<>-_\\/[]{}=+*^?#ABCDEFabcdef0123456789';
        this.update = this.update.bind(this);
    }
    TS.prototype.setText = function (newText) {
        const old = this.el.innerText;
        this.queue = [];
        for (let i = 0; i < Math.max(old.length, newText.length); i++) {
            this.queue.push({
                from:  old[i]     || '',
                to:    newText[i] || '',
                start: Math.floor(Math.random() * 18),
                end:   Math.floor(Math.random() * 18) + 18,
                char:  '',
            });
        }
        cancelAnimationFrame(this._raf);
        this.frame = 0;
        return new Promise(r => { this._res = r; this.update(); });
    };
    TS.prototype.update = function () {
        let out = '', done = 0;
        for (let i = 0; i < this.queue.length; i++) {
            const q = this.queue[i];
            if (this.frame >= q.end)        { done++; out += q.to; }
            else if (this.frame >= q.start) {
                if (!q.char || Math.random() < 0.28)
                    q.char = this.chars[Math.floor(Math.random() * this.chars.length)];
                out += `<span style="color:var(--accent);opacity:.55">${q.char}</span>`;
            } else { out += q.from; }
        }
        this.el.innerHTML = out;
        if (done === this.queue.length) { if (this._res) this._res(); }
        else { this._raf = requestAnimationFrame(this.update); this.frame++; }
    };
    return TS;
})();

function initScrambleHeadings() {
    // Use IntersectionObserver on the parent section page
    const els = document.querySelectorAll('[data-scramble]');
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const text = e.target.getAttribute('data-scramble');
            if (text) new TextScramble(e.target).setText(text);
            obs.unobserve(e.target);
        });
    }, { threshold: 0.6 });
    els.forEach(e => obs.observe(e));
}

/* ════════════════════════════════
   CURSOR TRAIL — starts off-screen
════════════════════════════════ */
function initCursorTrail() {
    if (window.matchMedia('(pointer:coarse)').matches) return;
    const N = 12;
    const dots = [];
    let mx = -500, my = -500;

    for (let i = 0; i < N; i++) {
        const d = document.createElement('div');
        d.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;border-radius:50%;contain:strict;';
        document.body.appendChild(d);
        dots.push({ el: d, x: -500, y: -500 });
    }

    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

    (function loop() {
        dots.forEach((dot, i) => {
            const prev = i === 0 ? { x: mx, y: my } : dots[i - 1];
            dot.x += (prev.x - dot.x) * 0.42;
            dot.y += (prev.y - dot.y) * 0.42;
            const sz = Math.max(1.5, 5.5 - i * 0.35);
            const al = Math.max(0, 0.45 - i * 0.035);
            dot.el.style.cssText =
                'position:fixed;pointer-events:none;z-index:9999;border-radius:50%;contain:strict;' +
                `width:${sz}px;height:${sz}px;` +
                `background:rgba(26,168,255,${al});` +
                `transform:translate3d(${dot.x - sz/2}px,${dot.y - sz/2}px,0);`;
        });
        requestAnimationFrame(loop);
    })();
}

/* ════════════════════════════════
   MAGNETIC BUTTONS
════════════════════════════════ */
function initMagneticButtons() {
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
        btn.addEventListener('mouseenter', () => { btn.style.transition = 'transform 0.1s'; });
        btn.addEventListener('mousemove', e => {
            const r  = btn.getBoundingClientRect();
            const dx = (e.clientX - r.left - r.width  / 2) * 0.26;
            const dy = (e.clientY - r.top  - r.height / 2) * 0.26;
            btn.style.transform = `translate3d(${dx}px,${dy}px,0)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transition = 'transform 0.45s cubic-bezier(0.175,0.885,0.32,1.275)';
            btn.style.transform  = 'translate3d(0,0,0)';
        });
    });
}

/* ════════════════════════════════
   CARD TILT — JS owns transform
════════════════════════════════ */
function initCardTilt() {
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mouseenter', () => { card.style.transition = 'transform 0.12s'; });
        card.addEventListener('mousemove', e => {
            const r  = card.getBoundingClientRect();
            const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
            const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
            card.style.transform = `perspective(800px) rotateX(${dy * -7}deg) rotateY(${dx * 7}deg) translate3d(0,0,8px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s cubic-bezier(0.175,0.885,0.32,1.275)';
            card.style.transform  = 'perspective(800px) rotateX(0) rotateY(0) translate3d(0,0,0)';
        });
    });
}

/* ════════════════════════════════
   RIPPLE
════════════════════════════════ */
function addRipple(e) {
    const btn  = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const span = document.createElement('span');
    span.style.cssText =
        'position:absolute;border-radius:50%;pointer-events:none;' +
        'animation:ripple-anim 0.6s linear;' +
        `left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px;` +
        'width:80px;height:80px;margin:-40px 0 0 -40px;' +
        'background:rgba(255,255,255,.18);z-index:100;' +
        'transform:scale(0) translate3d(0,0,0);';
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(span);
    setTimeout(() => span.remove(), 650);
}
function initRippleButtons() {
    document.querySelectorAll('[data-ripple]').forEach(b => { b.addEventListener('click', addRipple); });
}

/* ════════════════════════════════
   TOOLTIP
════════════════════════════════ */
function initTooltips() {
    let tip = document.getElementById('global-tooltip');
    if (!tip) {
        tip = document.createElement('div');
        tip.id = 'global-tooltip';
        document.body.appendChild(tip);
    }
    document.querySelectorAll('[data-tip]').forEach(el => {
        el.addEventListener('mouseenter', () => {
            tip.innerText = el.getAttribute('data-tip');
            tip.classList.add('visible');
        });
        el.addEventListener('mousemove', e => {
            tip.style.left = (e.clientX + 14) + 'px';
            tip.style.top  = (e.clientY - 8)  + 'px';
        });
        el.addEventListener('mouseleave', () => { tip.classList.remove('visible'); });
    });
}

/* ════════════════════════════════
   UPTIME COUNTER
════════════════════════════════ */
function initUptimeCounter() {
    const el = document.getElementById('uptime-counter');
    if (!el) return;
    const start = Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 48);
    function tick() {
        const d = Date.now() - start;
        const h = Math.floor(d / 3600000);
        const m = Math.floor((d % 3600000) / 60000);
        const s = Math.floor((d % 60000) / 1000);
        el.innerText = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    }
    tick();
    setInterval(tick, 1000);
}

/* ════════════════════════════════
   TOAST NOTIFICATIONS — stackable
════════════════════════════════ */
let _toastCount = 0;
const _toastMax   = 3;
const _TOAST_BASE = 88; // px from bottom (clears music pill)

function showToast(msg, color) {
    if (_toastCount >= _toastMax) return;
    _toastCount++;
    const t   = document.createElement('div');
    const col = color || 'var(--accent)';
    const off = (_toastCount - 1) * 80;
    t.style.cssText =
        `position:fixed;bottom:${_TOAST_BASE + off}px;right:24px;z-index:9998;` +
        'background:rgba(5,9,26,.98);' +
        `border:1px solid rgba(255,255,255,.07);border-left:3px solid ${col};` +
        'color:var(--text);font-size:11px;font-family:\'JetBrains Mono\',monospace;' +
        'padding:12px 18px;border-radius:10px;' +
        'box-shadow:0 10px 35px rgba(0,0,0,.7);' +
        'transform:translate3d(20px,0,0) scale(.97);opacity:0;' +
        'transition:transform 0.42s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.42s ease;' +
        'max-width:310px;line-height:1.5;pointer-events:none;backdrop-filter:blur(12px);';
    t.innerHTML =
        `<div style="font-size:8px;letter-spacing:.14em;color:${col};margin-bottom:4px;opacity:.8;">SCHALE.DB</div>` +
        `<div>${msg}</div>`;
    document.body.appendChild(t);
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            t.style.transform = 'translate3d(0,0,0) scale(1)';
            t.style.opacity   = '1';
        });
    });
    setTimeout(() => {
        t.style.transform = 'translate3d(20px,0,0) scale(.97)';
        t.style.opacity   = '0';
        setTimeout(() => {
            t.remove();
            _toastCount = Math.max(0, _toastCount - 1);
        }, 440);
    }, 4500);
}

const showFunnyToast = showToast;

const TOASTS = [
    'Fixed a memory leak. Probably.',
    'Optimized loop by 0.003ms. Huge win.',
    'Bug squashed. It had a family.',
    'Coffee consumed. Productivity +20%',
    'Dependency updated. Nothing broke. Wow.',
    'Null check added. Just in case.',
    'DataStore saved. Pinky promise.',
    'Anti-exploit updated. Take that, exploiters.',
    'TODO written. Will never fix.',
    'Deployed to prod. No tests. YOLO.',
    'Server TPS: 60. Briefly.',
    'Still coding at 2am. Impressive.',
    'Local test passed. Prod is another story.',
    "Sensei, you've been on this page a while.",
];

function startRandomToasts() {
    setTimeout(() => {
        showToast(TOASTS[Math.floor(Math.random() * TOASTS.length)]);
        setInterval(() => {
            if (Math.random() > 0.45) showToast(TOASTS[Math.floor(Math.random() * TOASTS.length)]);
        }, 28000);
    }, 5000);
}

/* ════════════════════════════════
   PARTICLES
════════════════════════════════ */
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const mouse = { x: -9999, y: -9999 };
    let pts = [];

    const COLORS = [
        'rgba(26,168,255,',
        'rgba(92,207,255,',
        'rgba(168,85,247,',
        'rgba(26,168,255,',
        'rgba(26,168,255,',
    ];

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    function spawn() {
        const n = Math.min(55, Math.floor(window.innerWidth / 22));
        pts = [];
        for (let i = 0; i < n; i++) pts.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            s: Math.random() * 1.6 + 0.4,
            c: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
    }
    resize(); spawn();
    window.addEventListener('mousemove', e => { mouse.x = e.x; mouse.y = e.y; }, { passive: true });
    window.addEventListener('resize',    () => { resize(); spawn(); });

    (function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i];
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height)  p.vy *= -1;

            const dx = mouse.x - p.x, dy = mouse.y - p.y;
            const md = Math.sqrt(dx * dx + dy * dy);
            if (md < 90 && md > 0) { p.x -= (dx / md) * 1.4; p.y -= (dy / md) * 1.4; }

            ctx.globalAlpha = 0.5;
            ctx.fillStyle   = p.c + '0.9)';
            ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();

            for (let j = i + 1; j < pts.length; j++) {
                const q = pts[j];
                const ddx = p.x - q.x, ddy = p.y - q.y;
                const d   = Math.sqrt(ddx * ddx + ddy * ddy);
                if (d < 120) {
                    ctx.globalAlpha = (1 - d / 120) * 0.09;
                    ctx.strokeStyle = 'rgba(26,168,255,1)';
                    ctx.lineWidth   = 0.6;
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    })();
}

/* ════════════════════════════════
   SKILL BARS — fires on section enter
════════════════════════════════ */
function initSkillBarsForPage() {
    const page = document.getElementById('page-skills');
    if (!page) return;
    page.querySelectorAll('.skill-bar-fill').forEach((bar, idx) => {
        const delay = (idx % 4) * 90;
        setTimeout(() => {
            bar.style.width = bar.getAttribute('data-width') || '0%';
            bar.classList.add('animated');
        }, delay);
    });
}

/* Legacy alias (called from DOMContentLoaded in original) */
function initSkillBars() { /* no-op: handled by onSectionEnter */ }

/* ════════════════════════════════
   COUNTERS — fires on section enter
════════════════════════════════ */
function animateCounter(el, target, dur, suffix) {
    const start = performance.now();
    (function step(ts) {
        const p      = Math.min((ts - start) / dur, 1);
        const eased  = 1 - Math.pow(1 - p, 3);
        el.innerText = Math.floor(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
    })(start);
}

function initCountersForPage() {
    const page = document.getElementById('page-about');
    if (!page) return;
    page.querySelectorAll('[data-counter]').forEach(el => {
        animateCounter(el,
            parseInt(el.getAttribute('data-counter')),
            1600,
            el.getAttribute('data-suffix') || '');
    });
}

/* Legacy alias */
function initCounters() { /* no-op: handled by onSectionEnter */ }

/* ════════════════════════════════
   ACTIVE NAV — based on navigateTo calls
════════════════════════════════ */
function initActiveNav() {
    // nav is driven by navigateTo(), not IntersectionObserver
    // already handled in updateNavLinks()
}

/* ════════════════════════════════
   CARD SPOTLIGHT
════════════════════════════════ */
function initCardSpotlight() {
    document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', (e.clientX - r.left) + 'px');
            card.style.setProperty('--mouse-y', (e.clientY - r.top)  + 'px');
        });
    });
}

/* ════════════════════════════════
   NAV SCROLL STYLE (scrolled within active section)
════════════════════════════════ */
function initNavScroll() {
    const nav = document.querySelector('.nav-bar');
    if (!nav) return;
    // Listen to the active section page's scroll
    SECTION_IDS.forEach(id => {
        const page = document.getElementById('page-' + id);
        if (!page) return;
        page.addEventListener('scroll', () => {
            if (_activeSection !== SECTION_IDS.indexOf(id)) return;
            nav.classList.toggle('scrolled', page.scrollTop > 40);
        }, { passive: true });
    });
}

/* ════════════════════════════════
   MOBILE MENU
════════════════════════════════ */
function toggleMobileMenu() {
    const m = document.getElementById('mobile-menu');
    if (m) m.classList.toggle('open');
}

/* ════════════════════════════════
   DISCORD COPY
════════════════════════════════ */
function copyDiscord() {
    const handle = (config && config.discordHandle) ? config.discordHandle : 'hokpy';
    navigator.clipboard.writeText(handle).then(() => {
        const el = document.getElementById('contact-discord-text');
        if (!el) return;
        const orig = el.innerText;
        el.innerText = 'COPIED! check clipboard';
        showToast("Discord copied! Don't be a stranger.");
        setTimeout(() => { el.innerText = orig; }, 2200);
    });
}

/* ════════════════════════════════
   SYSTEM OVERRIDE
════════════════════════════════ */
let _override = false;
function toggleSystemOverride(force) {
    if (force !== undefined) _override = !force;
    _override = !_override;
    const root  = document.documentElement;
    const st    = document.getElementById('system-status-text');
    const sd    = document.getElementById('status-dot');
    const sp    = document.getElementById('status-ping');
    const badge = document.querySelector('.hero-badge');

    if (_override) {
        root.style.setProperty('--accent',        '#FF4455');
        root.style.setProperty('--accent-bright', '#FF6677');
        root.style.setProperty('--accent-dim',    'rgba(255,68,85,.1)');
        root.style.setProperty('--accent-glow',   'rgba(255,68,85,.38)');
        root.style.setProperty('--accent-border', 'rgba(255,68,85,.22)');
        document.body.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both';
        setTimeout(() => { document.body.style.animation = ''; }, 520);
        if (st) st.innerText = 'SYSTEM CRITICAL';
        if (sd) { sd.classList.remove('bg-green-500'); sd.classList.add('bg-red-500'); }
        if (sp) { sp.classList.remove('bg-green-500'); sp.classList.add('bg-red-500'); }
        if (badge) badge.classList.add('critical');
        playClick(150, 0.5);
        showToast('SYSTEM CRITICAL — sensei please help', '#FF4455');
    } else {
        root.style.setProperty('--accent',        '#1AA8FF');
        root.style.setProperty('--accent-bright', '#5CCFFF');
        root.style.setProperty('--accent-dim',    'rgba(26,168,255,.1)');
        root.style.setProperty('--accent-glow',   'rgba(26,168,255,.38)');
        root.style.setProperty('--accent-border', 'rgba(26,168,255,.22)');
        if (st) st.innerText = 'System Online';
        if (sd) { sd.classList.remove('bg-red-500'); sd.classList.add('bg-green-500'); }
        if (sp) { sp.classList.remove('bg-red-500'); sp.classList.add('bg-green-500'); }
        if (badge) badge.classList.remove('critical');
        playClick(1200, 0.3);
    }
}

/* ════════════════════════════════
   KONAMI CODE
════════════════════════════════ */
let _ki = 0;
document.addEventListener('keydown', e => {
    if (!config || !config.konamiCode) return;
    const kc = config.konamiCode;
    if (e.key.toLowerCase() === kc[_ki].toLowerCase()) {
        _ki++;
        if (_ki === kc.length) {
            toggleSystemOverride(true);
            _ki = 0;
            const out = document.getElementById('cli-output');
            if (out) out.innerHTML += '<div style="color:var(--alert);font-weight:700;margin-bottom:4px;">&gt;&gt; KONAMI CODE DETECTED. CHAOS MODE ACTIVE.</div>';
        }
    } else { _ki = 0; }
});

/* ════════════════════════════════
   SECTION REVEALS — called by onSectionEnter
════════════════════════════════ */
function initSectionReveals() {
    // Mark all reveal items with base styles
    document.querySelectorAll('.reveal-item').forEach(el => {
        el.style.opacity   = '0';
        el.style.transform = 'translate3d(0,20px,0)';
        el.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(0.0,0.0,0.2,1)';
    });
}

/* ════════════════════════════════
   LOGO EASTER EGG
════════════════════════════════ */
function initLogoEasterEgg() {
    const logo = document.querySelector('[data-logo-egg]');
    if (!logo) return;
    let n = 0, t;
    logo.addEventListener('click', () => {
        n++; clearTimeout(t);
        t = setTimeout(() => { n = 0; }, 2200);
        if (n >= 7) {
            n = 0;
            showToast('Logo clicked 7x — Achievement: "No Life"');
            playClick(440, 0.5);
            let i = 0;
            const cols = ['#FF4455','#FFB83A','#2EE89A','#1AA8FF','#a855f7','#FF6FAE'];
            const iv = setInterval(() => {
                document.documentElement.style.setProperty('--accent', cols[i++ % cols.length]);
                if (i > 14) {
                    clearInterval(iv);
                    document.documentElement.style.setProperty('--accent',        '#1AA8FF');
                    document.documentElement.style.setProperty('--accent-bright', '#5CCFFF');
                    document.documentElement.style.setProperty('--accent-dim',    'rgba(26,168,255,.1)');
                    document.documentElement.style.setProperty('--accent-glow',   'rgba(26,168,255,.38)');
                    document.documentElement.style.setProperty('--accent-border', 'rgba(26,168,255,.22)');
                }
            }, 100);
        }
    });
}

/* ════════════════════════════════
   CLI TERMINAL
════════════════════════════════ */
function initCLI() {
    const inp = document.getElementById('cli-input');
    const out = document.getElementById('cli-output');
    if (!inp || !out) return;

    const B = 'color:var(--accent)', G = 'color:#FFB83A', P = 'color:#FF6FAE';
    const E = 'color:#2EE89A',       R = 'color:var(--alert)';
    const S = 'color:#4E6490',       M = 'color:#283450';

    const nav = (id, msg) => {
        setTimeout(() => navigateTo(id), 200);
        return `<span style="${S}">${msg}</span>`;
    };

    const cmds = {
        help: () => [
            `<span style="${B}">Commands:</span>`,
            `  <span style="${G}">about</span>    navigation`,
            `  <span style="${G}">skills</span>   system specs`,
            `  <span style="${G}">projects</span> mission reports`,
            `  <span style="${G}">reviews</span>  field reports`,
            `  <span style="${G}">hire</span>     contact`,
            `  <span style="${G}">date</span>     timestamp`,
            `  <span style="${G}">whoami</span>   identify`,
            `  <span style="${G}">status</span>   system status`,
            `  <span style="${G}">neofetch</span> sysinfo`,
            `  <span style="${G}">coffee</span>   critical cmd`,
            `  <span style="${G}">uwu</span>      please dont`,
            `  <span style="${G}">sudo</span>     nice try`,
            `  <span style="${G}">clear</span>    clear terminal`,
            `  <span style="${M}">(secrets hidden in the dark)</span>`,
        ].join('<br>'),
        about:    () => nav('about',    'Navigating to home...'),
        skills:   () => nav('skills',   'Loading system specs...'),
        projects: () => nav('projects', 'Accessing mission reports...'),
        reviews:  () => nav('reviews',  'Loading field reports...'),
        hire:     () => nav('contact',  'Opening MomoTalk...'),
        date:     () => `<span style="${S}">[${new Date().toLocaleString()}]</span>`,
        whoami:   () => `<span style="${S}">Guest &middot; Level 1 &middot; Node: Kivotos-Alpha &middot; IP: 127.0.0.1</span>`,
        status:   () => _override
            ? `<span style="${R}">CRITICAL &mdash; Override active.</span>`
            : `<span style="${E}">✓ NOMINAL &mdash; All nodes green. For now.</span>`,
        neofetch: () => [
            `<span style="${B}">  WATER</span>@<span style="${B}">kivotos</span>`,
            '  OS: KivotOS x64 &middot; Host: SCHALE.DB v5.0',
            '  Shell: bash (certified bad decisions)',
            '  CPU: Galaxy brain (2 cores, 0 free)',
            '  RAM: 16GB (14.9GB used by Chrome)',
            '  Uptime: way too long',
            '  Coffee: CRITICAL LOW',
            '  Bugs: 0 (official count)',
            `  <span style="color:#FF4455;">&#x25CF;</span><span style="color:#FFB83A;">&#x25CF;</span><span style="color:#2EE89A;">&#x25CF;</span><span style="color:#1AA8FF;">&#x25CF;</span><span style="color:#a855f7;">&#x25CF;</span><span style="color:#FF6FAE;">&#x25CF;</span>`,
        ].join('<br>'),
        coffee: () => [
            `<span style="${G}">Brewing...</span>`,
            `<span style="${S}">Caffeine: 9000mg. Productivity boost: marginal.</span>`,
            `<span style="${S}">Bugs fixed post-coffee: still 0.</span>`,
        ].join('<br>'),
        uwu: () => [
            `<span style="${P}">UwU what's this?? a stwange tewminal??</span>`,
            `<span style="${P}">*nuzzles ur datacentew* OwO</span>`,
            `<span style="${M}">[ this was a mistake. deeply sorry. ]</span>`,
        ].join('<br>'),
        sudo:           () => [`<span style="${R}">sudo: Permission denied.</span>`, `<span style="${S}">Incident reported. (it wasn't) 5/10 for effort.</span>`].join('<br>'),
        hack:           () => [`<span style="${E}">INITIATING HACK SEQUENCE...</span>`, `<span style="${S}">Bypassing mainframe... ████████░░</span>`, `<span style="${R}">ERROR: This is a portfolio. Nothing to hack.</span>`, `<span style="${S}">Respectfully: nice try, Mr Robot.</span>`].join('<br>'),
        clear:          () => { out.innerHTML = ''; return null; },
        ls:             () => `<span style="${S}">about/&nbsp; skills/&nbsp; projects/&nbsp; reviews/&nbsp; contact/&nbsp; secret_bugs/&nbsp; TODO_never_fix/</span>`,
        'cat readme.md':() => `<span style="${S}">README: "portfolio built at 2am. please hire."</span>`,
        cat:            () => `<span style="${S}">cat: specify file. try: cat readme.md</span>`,
        'ls -la':       () => `<span style="${S}">drwx------ sensei sensei 4096 Jan 1 2025 .<br>-rw-r--r-- sensei sensei 1337 Jan 1 2025 secrets.txt<br>-rw-r--r-- sensei sensei  666 Jan 1 2025 bugs_i_caused.log<br>-rwxr-xr-x sensei sensei  404 Jan 1 2025 TODO (empty)</span>`,
        'cd ..':        () => `<span style="${S}">you cannot leave. this is your home now.</span>`,
        exit:           () => `<span style="${S}">lol no</span>`,
        vim:            () => `<span style="${S}">I know how to exit vim. I choose not to.</span>`,
        'git blame':    () => `<span style="${S}">git blame: Water (100% of commits, 100% of bugs)</span>`,
        'git commit':   () => `<span style="${S}">git commit -m "fixed a thing, broke 3 others"</span>`,
        'git push':     () => `<span style="${R}">remote: Permission denied (this isn't your repo)</span>`,
        'npm install':  () => `<span style="${S}">added 2,847 packages. 3 vulnerabilities. node_modules: 850MB.</span>`,
        rm:             () => `<span style="${R}">the site lives. you cannot delete it from here.</span>`,
        penis:          () => `<span style="${S}">bruh</span>`,
        ping:           () => `<span style="${E}">PONG &mdash; 1ms (it's localhost obviously)</span>`,
        whoops:         () => `<span style="${G}">we've all been there</span>`,
        uname:          () => `<span style="${S}">KivotOS 5.15.0-schale x86_64 GNU/Luau</span>`,
        pwd:            () => `<span style="${S}">/home/sensei/schale.db/portfolio</span>`,
        'touch grass':  () => `<span style="${E}">✓ Grass touched. Achievement unlocked. Rare event.</span>`,
        'reviews clear':() => {
            const pin = prompt('Admin PIN required:');
            if (!pin || pin !== ((config && config.adminPin) || 'water2025')) return `<span style="${R}">Access denied.</span>`;
            if (typeof adminClearUserReviews === 'function') adminClearUserReviews();
            return `<span style="${E}">✓ User reviews cleared. Seed reviews preserved.</span>`;
        },
        'pfp reset':    () => {
            const pin = prompt('Admin PIN required:');
            if (!pin || pin !== ((config && config.adminPin) || 'water2025')) return `<span style="${R}">Access denied.</span>`;
            if (typeof adminResetPfp === 'function') adminResetPfp();
            return `<span style="${E}">✓ Profile picture reset.</span>`;
        },
    };

    const allCmdKeys = Object.keys(cmds);
    const SASSY = [
        c => `Command not found: "${c}". Try "help". Probably.`,
        c => `"${c}" &mdash; never heard of it. Type "help".`,
        c => `bash: ${c}: command not found. skill issue detected.`,
        c => `[${c}]: unknown. Have you tried turning it off and on again?`,
    ];

    inp.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const partial = this.value.toLowerCase().trim();
            if (!partial) return;
            const match = allCmdKeys.find(k => k.startsWith(partial));
            if (match) this.value = match;
        }
    });

    inp.addEventListener('keypress', function (e) {
        if (e.key !== 'Enter') return;
        const raw = this.value.trim();
        const cmd = raw.toLowerCase();
        if (!cmd) return;
        playClick(1200, 0.05);
        out.innerHTML += `<div style="margin-bottom:2px;"><span style="${B}">visitor@schale:~$</span> <span style="color:#8a9ec0">${raw}</span></div>`;
        const handler = cmds[cmd];
        if (handler !== undefined) {
            const res = typeof handler === 'function' ? handler() : handler;
            if (res) out.innerHTML += `<div style="margin-bottom:6px;">${res}</div>`;
        } else {
            const fn = SASSY[Math.floor(Math.random() * SASSY.length)];
            out.innerHTML += `<div style="${R};margin-bottom:6px;">${fn(cmd)}</div>`;
        }
        this.value = '';
        out.scrollTop = out.scrollHeight;
    });
}
