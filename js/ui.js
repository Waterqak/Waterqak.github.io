/* ============================================================
   UI.JS v4.0  —  All bugs fixed, BA animations, easter eggs
   ============================================================ */

/* ── CONSOLE ART for devs who open devtools ── */
(function () {
    const art = [
        '%c',
        '  ██╗    ██╗ █████╗ ████████╗███████╗██████╗',
        '  ██║    ██║██╔══██╗╚══██╔══╝██╔════╝██╔══██╗',
        '  ██║ █╗ ██║███████║   ██║   █████╗  ██████╔╝',
        '  ██║███╗██║██╔══██║   ██║   ██╔══╝  ██╔══██╗',
        '  ╚███╔███╔╝██║  ██║   ██║   ███████╗██║  ██║',
        '   ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝',
        '',
        '  👋 Hey! You opened devtools. Respect.',
        '  🐛 Bugs in this codebase: 0 (officially)',
        '  ☕ Powered by: Lua skills + Red Bull + zero sleep',
        '  🔥 Built by Water, age 15, somehow doing this',
        '',
        '  💡 Secret CLI commands: coffee  uwu  hack  sudo  vim',
        '     git blame  npm install  ls  cat readme.md  penis',
        '',
    ].join('\n');
    setTimeout(() => console.log(art, 'color:#1AA8FF;font-family:monospace;font-size:11px;'), 1200);
})();

/* ════════════════════════════════
   BOOT SEQUENCE
════════════════════════════════ */
function startExperience() {
    if (typeof audioCtx !== 'undefined' && audioCtx.state === 'suspended') audioCtx.resume();
    playClick(880, 0.3);
    const overlay = document.getElementById('start-overlay');
    overlay.style.animation = 'crtOff 0.5s forwards';
    setTimeout(() => {
        overlay.style.display = 'none';
        const bgm = document.getElementById('bgm');
        if (bgm && config.bgmUrl) {
            bgm.src = config.bgmUrl;
            bgm.volume = config.volume || 0.15;
            bgm.play().catch(() => {});
        }
    }, 480);
}

function runBootSequence() {
    const container = document.getElementById('boot-log-container');
    if (!container) return;
    const checks = [
        { label: 'BIOS_CHECK',                   cls: 'check', status: 'OK'   },
        { label: 'MEMORY_INTEGRITY',              cls: 'check', status: 'OK'   },
        { label: 'CHECKING_IF_SENSEI_AWAKE',      cls: 'info',  status: 'YES'  },
        { label: 'LOADING_COPE_RESERVES',         cls: 'warn',  status: 'FULL' },
        { label: 'COUNTING_BUGS_IN_CODEBASE',     cls: 'check', status: '0 ✓'  },
        { label: 'NETWORK_UPLINK',                cls: 'check', status: 'OK'   },
        { label: 'VIRUS_DETECTED',                cls: 'err',   status: '...'  },
        { label: 'just_kidding_lol',              cls: 'info',  status: 'haha' },
        { label: 'SCHALE_DB_MOUNT',               cls: 'check', status: 'OK'   },
    ];
    let i = 0;
    function next() {
        if (i < checks.length) {
            const { label, cls, status } = checks[i];
            const div = document.createElement('div');
            div.className = 'boot-status-line';
            div.innerHTML = `<span>${label}...</span><span class="${cls}">${status}</span>`;
            container.appendChild(div);
            playClick(800 + i * 55, 0.04);
            i++;
            setTimeout(next, i === 7 ? 650 : 230);
        } else {
            setTimeout(() => {
                const btn = document.getElementById('connect-btn');
                if (btn) { btn.classList.remove('opacity-0', 'translate-y-4'); }
            }, 350);
        }
    }
    setTimeout(next, 350);
}

/* ════════════════════════════════
   LOCAL STORAGE
════════════════════════════════ */
function initLocalSystem() {
    // Avatar
    const pfp = localStorage.getItem('schale_db_pfp');
    if (pfp) {
        const img = document.getElementById('avatar-img');
        const ph  = document.getElementById('avatar-placeholder');
        if (img && ph) { img.src = pfp; img.classList.remove('hidden'); ph.classList.add('hidden'); }
    }
    // Visit counter
    let visits = parseInt(localStorage.getItem('schale_db_visits') || '0') + 1;
    localStorage.setItem('schale_db_visits', visits);
    const total = (config.visitorBase || 14200) + Math.floor(Date.now() / 3_600_000) + visits;
    const el = document.getElementById('visitor-count');
    if (el) el.innerText = total.toLocaleString();
}

window.updateProfilePicture = function () {
    const url = prompt('Paste an image URL for your profile picture:');
    if (url && (url.startsWith('http') || url.startsWith('data:image'))) {
        playClick(1000, 0.1);
        localStorage.setItem('schale_db_pfp', url);
        const img = document.getElementById('avatar-img');
        const ph  = document.getElementById('avatar-placeholder');
        if (img && ph) { img.src = url; img.classList.remove('hidden'); ph.classList.add('hidden'); }
    }
};

/* ════════════════════════════════
   TYPEWRITER
════════════════════════════════ */
let _twTimer;
function typeWriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    clearTimeout(_twTimer);
    const isEN = (document.getElementById('lang-display')?.innerText || 'EN') === 'EN';
    const text = isEN ? 'Broken Code.' : 'โค้ดที่พังครับ';
    let i = 0;
    el.innerText = '';
    (function tick() {
        if (i < text.length) { el.innerHTML += text.charAt(i++); _twTimer = setTimeout(tick, 85); }
    })();
}

/* ════════════════════════════════
   TEXT SCRAMBLE
════════════════════════════════ */
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#ABCDEFabcdef0123456789';
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const old = this.el.innerText;
        const len = Math.max(old.length, newText.length);
        this.resolve = null;
        const p = new Promise(res => { this.resolve = res; });
        this.queue = [];
        for (let i = 0; i < len; i++) {
            this.queue.push({
                from:  old[i] || '',
                to:    newText[i] || '',
                start: Math.floor(Math.random() * 18),
                end:   Math.floor(Math.random() * 18) + 18,
                char:  '',
            });
        }
        cancelAnimationFrame(this._raf);
        this.frame = 0;
        this.update();
        return p;
    }
    update() {
        let out = '', done = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            const q = this.queue[i];
            if (this.frame >= q.end) {
                done++;
                out += q.to;
            } else if (this.frame >= q.start) {
                if (!q.char || Math.random() < 0.28) {
                    q.char = this.chars[Math.floor(Math.random() * this.chars.length)];
                }
                out += `<span style="color:var(--accent);opacity:.55">${q.char}</span>`;
            } else {
                out += q.from;
            }
        }
        this.el.innerHTML = out;
        if (done === this.queue.length) {
            if (this.resolve) this.resolve();
        } else {
            this._raf = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
}

function initScrambleHeadings() {
    const els = document.querySelectorAll('[data-scramble]');
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el   = entry.target;
            const text = el.getAttribute('data-scramble');
            if (!text) return;
            // Store original text content in attribute on first run
            new TextScramble(el).setText(text);
            obs.unobserve(el);
        });
    }, { threshold: 0.6 });
    els.forEach(e => obs.observe(e));
}

/* ════════════════════════════════
   CURSOR TRAIL  —  fixed: no 0,0 flash
════════════════════════════════ */
function initCursorTrail() {
    if (window.matchMedia('(pointer:coarse)').matches) return;
    const N    = 12;
    const dots = [];
    // init positions to far off-screen so they don't flash at 0,0
    let mx = -500, my = -500;
    for (let i = 0; i < N; i++) {
        const d = document.createElement('div');
        d.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;border-radius:50%;';
        document.body.appendChild(d);
        dots.push({ el: d, x: -500, y: -500 });
    }
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function loop() {
        dots.forEach((dot, i) => {
            const prev = i === 0 ? { x: mx, y: my } : dots[i - 1];
            dot.x += (prev.x - dot.x) * 0.42;
            dot.y += (prev.y - dot.y) * 0.42;
            const size  = Math.max(1.5, 5.5 - i * 0.35);
            const alpha = Math.max(0, 0.45 - i * 0.035);
            dot.el.style.cssText = `position:fixed;pointer-events:none;z-index:9999;border-radius:50%;
                width:${size}px;height:${size}px;
                background:rgba(26,168,255,${alpha});
                left:${dot.x - size / 2}px;top:${dot.y - size / 2}px;
                box-shadow:0 0 ${size * 2}px rgba(26,168,255,${alpha * 0.5});`;
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
            btn.style.transform = `translate(${dx}px,${dy}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transition = 'transform 0.45s cubic-bezier(0.175,0.885,0.32,1.275)';
            btn.style.transform  = 'translate(0,0)';
        });
    });
}

/* ════════════════════════════════
   CARD TILT  —  owns the transform
════════════════════════════════ */
function initCardTilt() {
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mouseenter', () => { card.style.transition = 'transform 0.1s'; });
        card.addEventListener('mousemove', e => {
            const r  = card.getBoundingClientRect();
            const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
            const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
            card.style.transform = `perspective(800px) rotateX(${dy * -7}deg) rotateY(${dx * 7}deg) translateZ(8px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s cubic-bezier(0.175,0.885,0.32,1.275)';
            card.style.transform  = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
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
    span.style.cssText = `
        position:absolute;border-radius:50%;transform:scale(0);
        animation:ripple-anim 0.6s linear;pointer-events:none;
        left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px;
        width:80px;height:80px;margin:-40px 0 0 -40px;
        background:rgba(255,255,255,0.18);z-index:100;`;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(span);
    setTimeout(() => span.remove(), 650);
}
function initRippleButtons() {
    document.querySelectorAll('[data-ripple]').forEach(btn => btn.addEventListener('click', addRipple));
}

/* ════════════════════════════════
   TOOLTIP
════════════════════════════════ */
function initTooltips() {
    const tip = document.createElement('div');
    tip.id = 'global-tooltip';
    document.body.appendChild(tip);
    document.querySelectorAll('[data-tip]').forEach(el => {
        el.addEventListener('mouseenter', () => {
            tip.innerText = el.getAttribute('data-tip');
            tip.style.opacity = '1';
        });
        el.addEventListener('mousemove', e => {
            tip.style.left = `${e.clientX + 14}px`;
            tip.style.top  = `${e.clientY - 8}px`;
        });
        el.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
    });
}

/* ════════════════════════════════
   LIVE UPTIME COUNTER
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
        el.innerText = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    tick();
    setInterval(tick, 1000);
}

/* ════════════════════════════════
   TOAST NOTIFICATIONS
════════════════════════════════ */
const TOASTS = [
    '✓ Fixed a memory leak. Probably.',
    '⚡ Optimized loop by 0.003ms. Huge win.',
    '🐛 Bug squashed. It had a family.',
    '☕ Coffee consumed. Productivity +20%',
    '📦 Dependency updated. Nothing broke. Wow.',
    '🎯 Null check added. Just in case.',
    '💾 DataStore saved. Pinky promise.',
    '🔐 Anti-exploit updated. Take that, exploiters.',
    '🤔 TODO written. Will never fix.',
    '🚀 Deployed to prod. No tests. YOLO.',
    '📊 Server TPS: 60. Briefly.',
    '🌙 It\'s 2am. Why are you still here.',
];
let _toastCd = false;

function showToast(msg, color) {
    if (_toastCd) return;
    _toastCd = true;
    setTimeout(() => { _toastCd = false; }, 7000);
    const t = document.createElement('div');
    const c = color || 'var(--accent)';
    t.style.cssText = `
        position:fixed;bottom:24px;right:24px;z-index:9998;
        background:rgba(5,9,26,.97);border:1px solid var(--accent-border);
        border-left:3px solid ${c};
        color:var(--text);font-size:11px;font-family:'JetBrains Mono',monospace;
        padding:12px 18px;border-radius:10px;
        box-shadow:0 8px 32px rgba(0,0,0,.65);
        transform:translateY(16px) scale(.95);opacity:0;
        transition:all 0.38s cubic-bezier(0.175,0.885,0.32,1.275);
        max-width:290px;line-height:1.5;pointer-events:none;`;
    t.innerHTML = `<div style="font-size:9px;letter-spacing:.12em;color:${c};margin-bottom:3px;">SCHALE.DB</div>${msg}`;
    document.body.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => {
        t.style.transform = 'translateY(0) scale(1)';
        t.style.opacity   = '1';
    }));
    setTimeout(() => {
        t.style.transform = 'translateY(16px) scale(.95)';
        t.style.opacity   = '0';
        setTimeout(() => t.remove(), 420);
    }, 4200);
}

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
    let particles = [];

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    function spawn() {
        const n = Math.min(55, Math.floor(window.innerWidth / 22));
        particles = Array.from({ length: n }, () => ({
            x:  Math.random() * canvas.width,
            y:  Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.22,
            vy: (Math.random() - 0.5) * 0.22,
            s:  Math.random() * 1.5 + 0.5,
        }));
    }
    resize(); spawn();

    window.addEventListener('mousemove', e => { mouse.x = e.x; mouse.y = e.y; }, { passive: true });
    window.addEventListener('resize', () => { resize(); spawn(); });

    (function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height)  p.vy *= -1;
            const dx = mouse.x - p.x, dy = mouse.y - p.y;
            const md = Math.sqrt(dx * dx + dy * dy);
            if (md < 100) { p.x -= (dx / md) * 1.6; p.y -= (dy / md) * 1.6; }

            ctx.globalAlpha = 0.55;
            ctx.fillStyle = 'rgba(26,168,255,.9)';
            ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const dx2 = p.x - q.x, dy2 = p.y - q.y;
                const d = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                if (d < 115) {
                    ctx.globalAlpha = (1 - d / 115) * 0.1;
                    ctx.strokeStyle = 'rgba(26,168,255,1)';
                    ctx.lineWidth   = 0.6;
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
                }
            }
        });
        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    })();
}

/* ════════════════════════════════
   ACTIVE NAV
════════════════════════════════ */
function initActiveNav() {
    const sections = document.querySelectorAll('section[id], header[id], footer[id]');
    const links    = document.querySelectorAll('.nav-link[href^="#"]');
    new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            links.forEach(l => l.classList.toggle('active', l.getAttribute('href').slice(1) === id));
        });
    }, { rootMargin: '-35% 0px -60% 0px' }).observe
    ? (function(){ const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const id = e.target.id;
            links.forEach(l => l.classList.toggle('active', l.getAttribute('href').slice(1) === id));
        });
    }, { rootMargin: '-35% 0px -60% 0px' }); sections.forEach(s => obs.observe(s)); })()
    : null;
}

/* ════════════════════════════════
   SKILL BARS
════════════════════════════════ */
function initSkillBars() {
    const bars = document.querySelectorAll('.skill-bar-fill');
    if (!bars.length) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const bar = entry.target;
            setTimeout(() => {
                bar.style.width = bar.getAttribute('data-width');
                bar.classList.add('animated');
            }, 160);
            obs.unobserve(bar);
        });
    }, { threshold: 0.2 });
    bars.forEach(b => obs.observe(b));
}

/* ════════════════════════════════
   COUNTERS
════════════════════════════════ */
function animateCounter(el, target, dur, suffix) {
    let start = null;
    (function step(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        el.innerText = Math.floor((1 - Math.pow(1 - p, 3)) * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
    })(performance.now());
}
function initCounters() {
    const els = document.querySelectorAll('[data-counter]');
    if (!els.length) return;
    new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            animateCounter(el, parseInt(el.getAttribute('data-counter')), 1600, el.getAttribute('data-suffix') || '');
        });
    }, { threshold: 0.5 }).observe
    ? (function(){ const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target;
            animateCounter(el, parseInt(el.getAttribute('data-counter')), 1600, el.getAttribute('data-suffix') || '');
            obs.unobserve(el);
        });
    }, { threshold: 0.5 }); els.forEach(el => obs.observe(el)); })()
    : null;
}

/* ════════════════════════════════
   NAV SCROLL
════════════════════════════════ */
function initNavScroll() {
    const nav = document.querySelector('.nav-bar');
    if (!nav) return;
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
}

/* ════════════════════════════════
   MOBILE MENU
════════════════════════════════ */
function toggleMobileMenu() {
    document.getElementById('mobile-menu')?.classList.toggle('open');
}

/* ════════════════════════════════
   DISCORD COPY
════════════════════════════════ */
function copyDiscord() {
    navigator.clipboard.writeText(config.discordHandle || 'hokpy').then(() => {
        const el = document.getElementById('contact-discord-text');
        if (!el) return;
        const orig = el.innerText;
        el.innerText = 'COPIED! ✓';
        showToast('📋 Discord copied! Don\'t be a stranger.');
        setTimeout(() => { el.innerText = orig; }, 2200);
    });
}

/* ════════════════════════════════
   SYSTEM OVERRIDE
   BUG FIX: now uses correct new blue + updates accent-border too
════════════════════════════════ */
let _override = false;
function toggleSystemOverride(force) {
    if (force !== undefined) { _override = !force; }
    _override = !_override;

    const root = document.documentElement;
    const st   = document.getElementById('system-status-text');
    const sd   = document.getElementById('status-dot');
    const sp   = document.getElementById('status-ping');
    const badge = document.querySelector('.hero-badge');

    if (_override) {
        root.style.setProperty('--accent',        '#FF4455');
        root.style.setProperty('--accent-bright', '#FF6677');
        root.style.setProperty('--accent-dim',    'rgba(255,68,85,.1)');
        root.style.setProperty('--accent-glow',   'rgba(255,68,85,.38)');
        root.style.setProperty('--accent-border', 'rgba(255,68,85,.22)');
        document.body.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both';
        setTimeout(() => { document.body.style.animation = ''; }, 500);
        if (st) st.innerText = 'SYSTEM CRITICAL';
        if (sd) { sd.classList.remove('bg-green-500'); sd.classList.add('bg-red-500'); }
        if (sp) { sp.classList.remove('bg-green-500'); sp.classList.add('bg-red-500'); }
        badge?.classList.add('critical');
        playClick(150, 0.5);
        showToast('🚨 SYSTEM CRITICAL — sensei please help', '#FF4455');
    } else {
        root.style.setProperty('--accent',        '#1AA8FF');
        root.style.setProperty('--accent-bright', '#5CCFFF');
        root.style.setProperty('--accent-dim',    'rgba(26,168,255,.1)');
        root.style.setProperty('--accent-glow',   'rgba(26,168,255,.38)');
        root.style.setProperty('--accent-border', 'rgba(26,168,255,.22)');
        if (st) st.innerText = 'System Online';
        if (sd) { sd.classList.remove('bg-red-500'); sd.classList.add('bg-green-500'); }
        if (sp) { sp.classList.remove('bg-red-500'); sp.classList.add('bg-green-500'); }
        badge?.classList.remove('critical');
        playClick(1200, 0.3);
    }
}

/* ════════════════════════════════
   KONAMI CODE
════════════════════════════════ */
let _ki = 0;
document.addEventListener('keydown', e => {
    if (!config?.konamiCode) return;
    if (e.key.toLowerCase() === config.konamiCode[_ki].toLowerCase()) {
        _ki++;
        if (_ki === config.konamiCode.length) {
            toggleSystemOverride(true);
            _ki = 0;
            const out = document.getElementById('cli-output');
            if (out) out.innerHTML += `<div style="color:var(--alert);font-weight:700;margin-bottom:4px;">>> KONAMI CODE DETECTED. CHAOS MODE ACTIVE.</div>`;
        }
    } else { _ki = 0; }
});

/* ════════════════════════════════
   CLI TERMINAL
════════════════════════════════ */
function initCLI() {
    const inp = document.getElementById('cli-input');
    const out = document.getElementById('cli-output');
    if (!inp || !out) return;

    const BLUE   = 'color:var(--accent)';
    const GOLD   = 'color:#FFB83A';
    const PINK   = 'color:#FF6FAE';
    const GREEN  = 'color:#2EE89A';
    const RED    = 'color:var(--alert)';
    const GREY   = 'color:#4E6490';
    const MUTED  = 'color:#283450';

    const cmds = {
        help: () => [
            `<span style="${BLUE}">Available commands:</span>`,
            `  <span style="${GOLD}">about</span>    · navigate to personnel file`,
            `  <span style="${GOLD}">skills</span>   · view system specs`,
            `  <span style="${GOLD}">projects</span> · view mission reports`,
            `  <span style="${GOLD}">reviews</span>  · view field reports`,
            `  <span style="${GOLD}">date</span>     · current timestamp`,
            `  <span style="${GOLD}">whoami</span>   · identify current user`,
            `  <span style="${GOLD}">status</span>   · system status`,
            `  <span style="${GOLD}">hire</span>     · contact section`,
            `  <span style="${GOLD}">coffee</span>   · critical command`,
            `  <span style="${GOLD}">uwu</span>      · ..don't`,
            `  <span style="${GOLD}">sudo</span>     · try it`,
            `  <span style="${GOLD}">clear</span>    · clear terminal`,
            `  <span style="${MUTED}">(and some secrets)</span>`,
        ].join('<br>'),

        about:    () => { setTimeout(() => location.href = '#file', 200);     return `<span style="${GREY}">Navigating to personnel file...</span>`; },
        skills:   () => { setTimeout(() => location.href = '#skills', 200);   return `<span style="${GREY}">Loading system specs...</span>`; },
        projects: () => { setTimeout(() => location.href = '#projects', 200); return `<span style="${GREY}">Accessing mission reports...</span>`; },
        reviews:  () => { setTimeout(() => location.href = '#reviews', 200);  return `<span style="${GREY}">Loading field reports...</span>`; },
        hire:     () => { setTimeout(() => location.href = '#contact', 200);  return `<span style="${PINK}">Opening MomoTalk... sensei is waiting.</span>`; },
        date:     () => `<span style="${GREY}">[${new Date().toLocaleString()}]</span>`,
        whoami:   () => `<span style="${GREY}">Guest · Access: Level 1 · Node: Kivotos-Alpha · IP: 127.0.0.1 (nice try)</span>`,
        status:   () => _override
            ? `<span style="${RED}">⚠ SYSTEM CRITICAL — Override active. Sensei, please.</span>`
            : `<span style="${GREEN}">✓ SYSTEM NOMINAL — All nodes green. Backend behaving. For now.</span>`,
        coffee: () => [
            `<span style="${GOLD}">☕ Brewing...</span>`,
            `<span style="${GREY}">Caffeine level: 9000mg</span>`,
            `<span style="${GREY}">Productivity boost: marginal</span>`,
            `<span style="${GREY}">Bugs fixed post-coffee: also 0</span>`,
        ].join('<br>'),
        uwu: () => [
            `<span style="${PINK}">UwU what's this?? a stwange tewminal??</span>`,
            `<span style="${PINK}">*nuzzles ur datacentew* OwO</span>`,
            `<span style="${MUTED}">[ this was a mistake. i am sorry. ]</span>`,
        ].join('<br>'),
        sudo: () => [
            `<span style="${RED}">sudo: access denied.</span>`,
            `<span style="${GREY}">Incident logged. (it wasn't)</span>`,
            `<span style="${GREY}">5/10 for effort, though.</span>`,
        ].join('<br>'),
        hack: () => [
            `<span style="${GREEN}">INITIATING HACK SEQUENCE...</span>`,
            `<span style="${GREY}">Bypassing mainframe... ████████░░</span>`,
            `<span style="${RED}">ERROR: This is a portfolio site. Nothing to hack.</span>`,
            `<span style="${GREY}">Respectfully: nice try, Mr Robot.</span>`,
        ].join('<br>'),
        clear: () => { out.innerHTML = ''; return null; },

        // Secret commands
        ls:             () => `<span style="${GREY}">about/  skills/  projects/  reviews/  contact/  secret_bugs/  TODO_never_fix/</span>`,
        'cat readme.md':() => `<span style="${GREY}">README: "portfolio built at 2am. please hire."</span>`,
        cat:            () => `<span style="${GREY}">cat: specify a file. try: cat readme.md</span>`,
        'cd ..':        () => `<span style="${GREY}">you cannot leave. this is your home now.</span>`,
        exit:           () => `<span style="${GREY}">lol no</span>`,
        vim:            () => `<span style="${GREY}">I know how to exit vim. I just choose not to.</span>`,
        'git blame':    () => `<span style="${GREY}">git blame: Water (100% of commits, 100% of bugs)</span>`,
        'npm install':  () => `<span style="${GREY}">added 2,847 packages. 3 vulnerabilities. node_modules: 850MB. enjoy.</span>`,
        rm:             () => `<span style="${RED}">the site lives. you cannot delete it from here.</span>`,
        penis:          () => `<span style="${GREY}">bruh</span>`,
        'ping':         () => `<span style="${GREEN}">PONG — 1ms (because it's localhost, obviously)</span>`,
        'whoops':       () => `<span style="${GOLD}">we've all been there</span>`,
    };

    const SASSY = [
        (c) => `Command not found: "${c}". Did you mean "help"? Probably not.`,
        (c) => `"${c}" — never heard of it. Try "help" like a normal person.`,
        (c) => `bash: ${c}: command not found. skill issue detected.`,
        (c) => `[${c}]: not a command. have you tried turning it off and on again?`,
    ];

    inp.addEventListener('keypress', function (e) {
        if (e.key !== 'Enter') return;
        const raw = this.value.trim();
        const cmd = raw.toLowerCase();
        if (!cmd) return;
        playClick(1200, 0.05);
        out.innerHTML += `<div style="margin-bottom:2px;"><span style="${BLUE}">visitor@schale:~$</span> <span style="color:#8a9ec0">${raw}</span></div>`;
        const handler = cmds[cmd];
        if (handler !== undefined) {
            const res = typeof handler === 'function' ? handler() : handler;
            if (res) out.innerHTML += `<div style="margin-bottom:6px;">${res}</div>`;
        } else {
            const fn = SASSY[Math.floor(Math.random() * SASSY.length)];
            out.innerHTML += `<div style="${RED};margin-bottom:6px;">${fn(cmd)}</div>`;
        }
        this.value = '';
        out.scrollTop = out.scrollHeight;
    });
}

/* ════════════════════════════════
   CARD SPOTLIGHT
════════════════════════════════ */
function initCardSpotlight() {
    document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
        });
    });
}

/* ════════════════════════════════
   LOGO EASTER EGG  (7 clicks)
   BUG FIX: resets to new blue #1AA8FF
════════════════════════════════ */
function initLogoEasterEgg() {
    const logo = document.querySelector('[data-logo-egg]');
    if (!logo) return;
    let n = 0, t;
    logo.addEventListener('click', () => {
        n++;
        clearTimeout(t);
        t = setTimeout(() => { n = 0; }, 2200);
        if (n >= 7) {
            n = 0;
            showToast('🎉 Logo clicked 7 times. Achievement: "No Life"');
            playClick(440, 0.5);
            let i = 0;
            const cols = ['#FF4455','#FFB83A','#2EE89A','#1AA8FF','#a855f7','#FF6FAE'];
            const iv = setInterval(() => {
                document.documentElement.style.setProperty('--accent', cols[i % cols.length]);
                i++;
                if (i > 14) {
                    clearInterval(iv);
                    // BUG FIX: reset to correct new blue
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
   SCRAMBLE HEADINGS  —  hooked to data-scramble
════════════════════════════════ */
function initScrambleAll() {
    initScrambleHeadings(); // same function, cleaner call name
}
