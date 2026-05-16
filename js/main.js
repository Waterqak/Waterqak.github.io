const _loop = (() => {
    const fns = new Map();
    let id = null;
    function tick() { fns.forEach(fn => fn()); id = requestAnimationFrame(tick); }
    return {
        add(k, fn) { fns.set(k, fn); if (!id) id = requestAnimationFrame(tick); },
        del(k)     { fns.delete(k); },
    };
})();

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let muted = false;

function playClick(freq = 600, dur = 0.08) {
    if (muted) return;
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.025, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.start(); osc.stop(audioCtx.currentTime + dur);
}

function toggleMute() {
    muted = !muted;
    const bgm  = document.getElementById('bgm');
    const icon = document.getElementById('mute-icon');
    bgm[muted ? 'pause' : 'play']();
    icon.setAttribute('data-lucide', muted ? 'volume-x' : 'volume-2');
    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
}

let _active = 0;
let _busy   = false;
const _inited = {};

const EASE_EXIT  = 'transform 400ms cubic-bezier(0.4,0,1,1), opacity 300ms ease, filter 400ms ease';
const EASE_ENTER = 'clip-path 680ms cubic-bezier(0.22,1,0.36,1), opacity 500ms ease, filter 500ms ease';
const NAV_DUR    = 720;

function navigateTo(id, instant) {
    const ids  = SITE.sections.map(s => s.id);
    const next = ids.indexOf(id);
    if (next === -1 || (next === _active && !instant) || _busy) return;

    const curEl  = document.querySelector('.page.active');
    const nextEl = document.getElementById('pg-' + id);
    if (!nextEl) return;

    _updateNav(id);
    _updateDots(next);
    _updateSectionBar(next);

    if (instant || !curEl || curEl === nextEl) {
        curEl?.classList.remove('active');
        nextEl.classList.add('active');
        nextEl.scrollTop = 0;
        _active = next;
        _onEnter(id);
        return;
    }

    _busy = true;

    curEl.style.willChange = 'transform, opacity, filter';
    requestAnimationFrame(() => {
        curEl.style.transition = EASE_EXIT;
        curEl.style.transform  = 'scale(0.91)';
        curEl.style.opacity    = '0';
        curEl.style.filter     = 'blur(14px)';
    });

    nextEl.style.cssText = `clip-path:circle(0% at 50% 50%);opacity:0;filter:blur(6px);will-change:clip-path,opacity,filter;`;
    nextEl.classList.add('active');
    nextEl.scrollTop = 0;

    setTimeout(() => {
        nextEl.style.transition = EASE_ENTER;
        nextEl.style.clipPath   = 'circle(150% at 50% 50%)';
        nextEl.style.opacity    = '1';
        nextEl.style.filter     = 'blur(0px)';
    }, 60);

    setTimeout(() => {
        curEl.classList.remove('active');
        curEl.style.cssText  = '';
        nextEl.style.cssText = '';
        _active = next;
        _busy   = false;
        _onEnter(id);
    }, NAV_DUR);
}

function _onEnter(id) {
    if (_inited[id]) return;
    _inited[id] = true;
    const page = document.getElementById('pg-' + id);
    if (!page) return;
    page.querySelectorAll('.reveal').forEach((el, i) => {
        setTimeout(() => el.classList.add('done'), i * 65);
    });
    if (id === 'skills')  setTimeout(_animBars, 120);
    if (id === 'home')    setTimeout(_animCounters, 350);
    if (id === 'reviews') renderReviews();
}

function _updateNav(id) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.section === id));
}
function _updateDots(idx) {
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
}
function _updateSectionBar(idx) {
    const pct = Math.round((idx / (SITE.sections.length - 1)) * 100);
    const bar = document.getElementById('section-bar');
    if (bar) bar.style.width = pct + '%';
}

function injectPageNumbers() {
    SITE.sections.forEach((s, i) => {
        const pg = document.getElementById('pg-' + s.id);
        if (!pg) return;
        const el = document.createElement('div');
        el.className = 'page-num';
        el.textContent = String(i + 1).padStart(2, '0');
        pg.appendChild(el);
    });
}

function initDots() {
    const wrap = document.getElementById('nav-dots');
    if (!wrap) return;
    SITE.sections.forEach((s, i) => {
        const d = document.createElement('div');
        d.className = 'dot' + (i === 0 ? ' active' : '');
        d.innerHTML = `<span class="dot-label">${s.label}</span>`;
        d.addEventListener('click', () => { playClick(600, 0.05); navigateTo(s.id); });
        wrap.appendChild(d);
    });
}

function initKeyboardNav() {
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const ids = SITE.sections.map(s => s.id);
        if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); navigateTo(ids[Math.min(_active+1,ids.length-1)]); }
        if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); navigateTo(ids[Math.max(_active-1,0)]); }
    });
}

function initWheelNav() {
    let cd = false; // Cooldown timer

    document.addEventListener('wheel', e => {
        if (_busy || cd) return;

        // Ignore zooming (Ctrl + Scroll)
        if (e.ctrlKey) return;

        const pg = document.querySelector('.page.active');
        if (!pg) return;

        // --- 1. Handle Inner Scrollable Elements (Code Vault, Cards, etc.) ---
        const innerEl = e.target.closest('iframe, .card, #proj-grid, .code-win, pre, .code-body');
        if (innerEl) {
            const atInnerTop = innerEl.scrollTop <= 0;
            // Math.ceil helps prevent fractional pixel rounding errors
            const atInnerBottom = Math.ceil(innerEl.scrollTop + innerEl.clientHeight) >= innerEl.scrollHeight - 1;

            // If they are scrolling down but haven't hit the bottom of the code box, let them scroll normally.
            if (e.deltaY > 0 && !atInnerBottom) return; 
            // If they are scrolling up but haven't hit the top of the code box, let them scroll normally.
            if (e.deltaY < 0 && !atInnerTop) return;    
        }

        // --- 2. Handle Main Page Navigation ---
        // Check if the main page itself is at the top or bottom
        const atBot = Math.ceil(pg.scrollTop + pg.clientHeight) >= pg.scrollHeight - 2;
        const atTop = pg.scrollTop <= 2;

        const ids = SITE.sections.map(s => s.id);

        if (e.deltaY > 40 && atBot) {
            e.preventDefault(); // Stop native scroll bouncing
            cd = true; 
            setTimeout(() => { cd = false; }, 800); // 800ms cooldown so it doesn't double-skip
            navigateTo(ids[Math.min(_active + 1, ids.length - 1)]);
        }
        else if (e.deltaY < -40 && atTop) {
            e.preventDefault();
            cd = true; 
            setTimeout(() => { cd = false; }, 800);
            navigateTo(ids[Math.max(_active - 1, 0)]);
        }

    }, { passive: false });
}

function initSwipeNav() {
    let sy = 0, st = 0;
    const ids = SITE.sections.map(s => s.id);
    const app = document.getElementById('app');
    if (!app) return;
    app.addEventListener('touchstart', e => { sy = e.touches[0].clientY; st = Date.now(); }, { passive: true });
    app.addEventListener('touchend', e => {
        const dy = sy - e.changedTouches[0].clientY;
        const dt = Date.now() - st;
        if (Math.abs(dy) < 60 || dt > 400) return;
        const pg    = document.querySelector('.page.active');
        const atBot = pg.scrollHeight - pg.scrollTop - pg.clientHeight < 10;
        const atTop = pg.scrollTop < 10;
        if (dy > 0 && atBot) navigateTo(ids[Math.min(_active+1, ids.length-1)]);
        if (dy < 0 && atTop) navigateTo(ids[Math.max(_active-1, 0)]);
    }, { passive: true });
}

function initScrollProgress() {
    SITE.sections.forEach(s => {
        const pg = document.getElementById('pg-' + s.id);
        if (!pg) return;
        pg.addEventListener('scroll', () => {
            if (_active !== SITE.sections.indexOf(s)) return;
            const r   = pg.scrollTop / (pg.scrollHeight - pg.clientHeight || 1);
            const bar = document.getElementById('scroll-bar');
            if (bar) bar.style.width = (r * 100) + '%';
            document.querySelector('nav')?.classList.toggle('scrolled', pg.scrollTop > 40);
        }, { passive: true });
    });
}

function runBoot() {
    const cont = document.getElementById('boot-log');
    if (!cont) return;
    const lines = [
        { txt: 'BIOS_CHECK',               cls: 'ok',   val: 'OK'   },
        { txt: 'MEMORY_INTEGRITY',         cls: 'ok',   val: 'OK'   },
        { txt: 'CHECKING_IF_SENSEI_AWAKE', cls: 'info', val: 'YES'  },
        { txt: 'COUNTING_BUGS',            cls: 'ok',   val: '0 ✓'  },
        { txt: 'LOADING_COPE_RESERVES',    cls: 'warn', val: 'FULL' },
        { txt: 'NETWORK_UPLINK',           cls: 'ok',   val: 'OK'   },
        { txt: 'VIRUS_DETECTED',           cls: 'err',  val: '...'  },
        { txt: 'just_kidding_lol',         cls: 'info', val: 'haha' },
        { txt: 'SCHALE_DB_MOUNT',          cls: 'ok',   val: 'OK'   },
    ];
    let i = 0;
    function next() {
        if (i >= lines.length) {
            setTimeout(() => {
                const b = document.getElementById('boot-btn');
                if (b) { b.style.opacity = '1'; b.style.transform = 'none'; }
            }, 350);
            return;
        }
        const l = lines[i];
        const d = document.createElement('div');
        d.className = 'boot-line';
        d.innerHTML = `<span>${l.txt}...</span><span class="${l.cls}">${l.val}</span>`;
        cont.appendChild(d);
        playClick(800 + i * 50, 0.04);
        i++;
        setTimeout(next, i === 7 ? 600 : 220);
    }
    setTimeout(next, 400);
}

function startExperience() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playClick(880, 0.25);
    const boot = document.getElementById('boot');
    if (!boot) return;
    boot.style.animation = 'crtOff 0.5s forwards';
    setTimeout(() => {
        boot.style.display = 'none';
        document.body.style.opacity    = '0';
        document.body.style.transition = 'opacity 0.6s ease';
        requestAnimationFrame(() => { document.body.style.opacity = '1'; });
        const bgm = document.getElementById('bgm');
        if (bgm && SITE.bgm) { bgm.src = SITE.bgm; bgm.volume = SITE.volume || 0.15; bgm.play().catch(() => {}); }
        setTimeout(() => _onEnter('home'), 400);
    }, 470);
}

function initParticles() {
    const cv = document.getElementById('particles-canvas');
    if (!cv) return;
    const ctx = cv.getContext('2d', { alpha: true });

    const N        = 35;
    const px       = new Float32Array(N);
    const py       = new Float32Array(N);
    const pvx      = new Float32Array(N);
    const pvy      = new Float32Array(N);
    const pz       = new Float32Array(N);
    const TAU      = Math.PI * 2;
    const CDIST    = 110;
    const CDIST_SQ = CDIST * CDIST;
    const RDIST_SQ = 8100;

    let W = 0, H = 0, _mx = -9999, _my = -9999;

    function spawn() {
        W = cv.width  = innerWidth;
        H = cv.height = innerHeight;
        for (let i = 0; i < N; i++) {
            px[i]  = Math.random() * W;
            py[i]  = Math.random() * H;
            pvx[i] = (Math.random() - 0.5) * 0.2;
            pvy[i] = (Math.random() - 0.5) * 0.2;
            pz[i]  = Math.random() * 1.5 + 0.4;
        }
    }
    spawn();

    window.addEventListener('mousemove', e => { _mx = e.clientX; _my = e.clientY; }, { passive: true });
    let resizeT;
    window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(spawn, 150); }, { passive: true });

    ctx.strokeStyle = 'rgba(26,168,255,1)';
    ctx.lineWidth   = 0.5;

    _loop.add('particles', () => {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(26,168,255,0.9)';

        for (let i = 0; i < N; i++) {
            px[i] += pvx[i]; py[i] += pvy[i];
            if (px[i] < 0 || px[i] > W) pvx[i] *= -1;
            if (py[i] < 0 || py[i] > H) pvy[i] *= -1;
            const dx = _mx - px[i], dy = _my - py[i];
            const dsq = dx * dx + dy * dy;
            if (dsq < RDIST_SQ && dsq > 0) {
                const d = Math.sqrt(dsq);
                px[i] -= dx / d * 1.2;
                py[i] -= dy / d * 1.2;
            }
            ctx.globalAlpha = 0.45;
            ctx.beginPath(); ctx.arc(px[i], py[i], pz[i], 0, TAU); ctx.fill();
        }

        for (let i = 0; i < N - 1; i++) {
            for (let j = i + 1; j < N; j++) {
                const dx = px[i]-px[j], dy = py[i]-py[j];
                const dsq = dx*dx + dy*dy;
                if (dsq < CDIST_SQ) {
                    ctx.globalAlpha = (1 - Math.sqrt(dsq) / CDIST) * 0.07;
                    ctx.beginPath(); ctx.moveTo(px[i], py[i]); ctx.lineTo(px[j], py[j]); ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;
    });
}

function _animBars() {
    document.querySelectorAll('.bar-fill').forEach((b, i) => {
        setTimeout(() => { b.style.width = b.dataset.w || '0%'; b.classList.add('done'); }, (i % 4) * 80);
    });
}

function _animCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
        const to = parseInt(el.dataset.count);
        const sf = el.dataset.suffix || '';
        const t0 = performance.now();
        (function step(ts) {
            const p = Math.min((ts - t0) / 1500, 1);
            el.innerText = Math.floor((1 - Math.pow(1 - p, 3)) * to) + sf;
            if (p < 1) requestAnimationFrame(step);
        })(t0);
    });
}

let _twTimer;
function typeWriter(lang) {
    const el = document.getElementById('typewriter');
    if (!el) return;
    clearTimeout(_twTimer);
    const text = lang === 'TH' ? 'โค้ดที่พังครับ' : 'Broken Code.';
    let i = 0; el.textContent = '';
    (function t() { if (i < text.length) { el.textContent += text[i++]; _twTimer = setTimeout(t, 90); } })();
}

let _lang = 'EN';
const TRANS = {
    EN: { hero_prefix:'Sensei, I fix', hero_desc:'Specialized Roblox Systems Engineer. Backend stability, data integrity, complex mechanics.', status:'System Online', calc_title:'RESOURCE ESTIMATOR', contact_sub:'Sensei, you have a new message.' },
    TH: { hero_prefix:'เซ็นเซย์ครับ ผมซ่อม', hero_desc:'วิศวกรระบบ Roblox เชี่ยวชาญด้าน Backend เสถียรภาพของข้อมูล และระบบเกมซับซ้อน', status:'สถานะ: ออนไลน์', calc_title:'ประเมินงบประมาณ', contact_sub:'เซ็นเซย์ มีข้อความใหม่ครับ' },
};

function toggleLanguage() {
    _lang = _lang === 'EN' ? 'TH' : 'EN';
    document.querySelectorAll('[data-lang]').forEach(el => {
        const val = TRANS[_lang][el.dataset.lang];
        if (val) el.textContent = val;
    });
    ['#lang-d','#lang-dm'].forEach(s => { const el = document.querySelector(s); if (el) el.textContent = _lang; });
    typeWriter(_lang);
    unlockAch('linguist');
    playClick(800, 0.06);
}

function _applyPfp(url) {
    const img = document.getElementById('avatar-img');
    const ph  = document.getElementById('avatar-ph');
    if (!img || !ph) return;
    img.src = url;
    img.classList.remove('hidden');
    ph.classList.add('hidden');
    img.onerror = () => { img.classList.add('hidden'); ph.classList.remove('hidden'); localStorage.removeItem('schale_pfp'); };
}

window.updatePfp = function() {
    const pin = prompt('Admin PIN required to update avatar:');
    if (pin === null) return;
    if (pin.trim() !== SITE.profilePin) { showToast('Access denied.', 'var(--red)'); playClick(220, 0.4); return; }
    const url = prompt('PIN accepted!\nPaste your profile picture URL:');
    if (!url) return;
    if (!url.startsWith('http') && !url.startsWith('data:image')) { showToast('Invalid URL.', 'var(--gold)'); return; }
    localStorage.setItem('schale_pfp', url);
    _applyPfp(url);
    showToast('Profile picture updated!', 'var(--green)');
    playClick(1000, 0.1);
};

window.resetPfp = function() {
    localStorage.removeItem('schale_pfp');
    const img = document.getElementById('avatar-img');
    const ph  = document.getElementById('avatar-ph');
    if (img) { img.src = ''; img.classList.add('hidden'); }
    if (ph)  ph.classList.remove('hidden');
};

function copyDiscord() {
    navigator.clipboard.writeText(SITE.discord).then(() => {
        const el = document.getElementById('discord-text');
        if (el) { const o = el.textContent; el.textContent = 'COPIED!'; setTimeout(() => { el.textContent = o; }, 2000); }
        showToast("Discord copied! Don't be a stranger.");
    });
}

let _override = false;
function toggleOverride() {
    _override = !_override;
    const root  = document.documentElement;
    const st    = document.getElementById('status-txt');
    const dot   = document.getElementById('status-dot');
    const ping  = document.getElementById('status-ping');
    const badge = document.querySelector('.hero-badge');

    if (_override) {
        root.style.setProperty('--accent',  '#FF4455');
        root.style.setProperty('--accent2', '#FF6677');
        root.style.setProperty('--glow',    'rgba(255,68,85,0.28)');
        document.body.style.animation = 'shake 0.45s ease both';
        setTimeout(() => { document.body.style.animation = ''; }, 460);
        if (st)   st.textContent = 'SYSTEM CRITICAL';
        if (dot)  dot.classList.replace('bg-green-500','bg-red-500');
        if (ping) ping.classList.replace('bg-green-500','bg-red-500');
        if (badge) badge.classList.add('critical');
        playClick(140, 0.5);
        showToast('SYSTEM CRITICAL — sensei please help', 'var(--red)');
        unlockAch('chaos_agent');
    } else {
        root.style.setProperty('--accent',  '#1AA8FF');
        root.style.setProperty('--accent2', '#5CCFFF');
        root.style.setProperty('--glow',    'rgba(26,168,255,0.28)');
        if (st)    st.textContent = 'System Online';
        if (dot)   dot.classList.replace('bg-red-500','bg-green-500');
        if (ping)  ping.classList.replace('bg-red-500','bg-green-500');
        if (badge) badge.classList.remove('critical');
        playClick(1200, 0.25);
    }
}

function initUptime() {
    const el = document.getElementById('uptime');
    if (!el) return;
    const start = Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 48);
    const tick = () => {
        const d = Date.now() - start;
        const h = Math.floor(d / 3600000);
        const m = Math.floor((d % 3600000) / 60000);
        const s = Math.floor((d % 60000) / 1000);
        el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    };
    tick(); setInterval(tick, 1000);
}

function initVisitorCounter() {
    const el  = document.getElementById('visitor-count');
    const pfp = localStorage.getItem('schale_pfp');
    if (pfp) _applyPfp(pfp);

    const cached = localStorage.getItem('schale_count');
    if (cached && el) el.textContent = parseInt(cached).toLocaleString();

    const key = 'schale_hit_' + new Date().toISOString().slice(0, 10);
    const hit = sessionStorage.getItem(key);
    const url = hit
        ? 'https://api.counterapi.dev/v1/waterqaks-team/schale-visits'
        : 'https://api.counterapi.dev/v1/waterqaks-team/schale-visits/up';

    fetch(url)
        .then(r => r.json())
        .then(d => {
            if (d?.value) {
                if (el) el.textContent = parseInt(d.value).toLocaleString();
                localStorage.setItem('schale_count', d.value);
                if (!hit) sessionStorage.setItem(key, '1');
            }
        })
        .catch(() => { if (!cached && el) el.textContent = '--'; });
}

let _toastN = 0;
function showToast(msg, color) {
    if (_toastN >= 3) return;
    _toastN++;
    const t = document.createElement('div');
    const c = color || 'var(--accent)';
    t.style.cssText = `position:fixed;bottom:${84 + (_toastN-1)*76}px;right:22px;z-index:9998;background:rgba(5,9,26,0.97);border:1px solid rgba(255,255,255,0.07);border-left:3px solid ${c};color:var(--text);font-size:11px;font-family:'JetBrains Mono',monospace;padding:11px 16px;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,0.7);max-width:300px;line-height:1.5;transform:translate3d(16px,0,0) scale(0.97);opacity:0;pointer-events:none;transition:transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275),opacity 0.4s ease;will-change:transform,opacity;`;
    t.innerHTML = `<div style="font-size:8px;color:${c};letter-spacing:.12em;margin-bottom:3px;opacity:.7;">SCHALE.DB</div><div>${msg}</div>`;
    document.body.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => { t.style.transform = 'translate3d(0,0,0) scale(1)'; t.style.opacity = '1'; }));
    setTimeout(() => {
        t.style.transform = 'translate3d(16px,0,0) scale(0.97)'; t.style.opacity = '0';
        setTimeout(() => { t.remove(); _toastN = Math.max(0, _toastN-1); }, 420);
    }, 4500);
}

const FUNNY_TOASTS = [
    'Fixed a memory leak. Probably.', 'Bug squashed. It had a family.',
    'Null check added. Just in case.', 'DataStore saved. Pinky promise.',
    'Server TPS: 60. Briefly.', 'Deployed to prod. No tests. YOLO.',
    'TODO written. Will never fix.', "Sensei, you've been here a while.",
    'Coffee consumed. Productivity +20%.', 'Anti-exploit updated. Take that.',
];
function startToasts() {
    setTimeout(() => {
        showToast(FUNNY_TOASTS[Math.floor(Math.random() * FUNNY_TOASTS.length)]);
        setInterval(() => {
            if (Math.random() > 0.5) showToast(FUNNY_TOASTS[Math.floor(Math.random() * FUNNY_TOASTS.length)]);
        }, 30000);
    }, 4500);
}

function initTooltips() {
    const tip = document.getElementById('tooltip');
    if (!tip) return;
    let tx = 0, ty = 0, vis = false;

    document.querySelectorAll('[data-tip]').forEach(el => {
        el.addEventListener('mouseenter', () => { tip.textContent = el.dataset.tip; tip.classList.add('show'); vis = true; }, { passive: true });
        el.addEventListener('mousemove',  e => { tx = e.clientX + 14; ty = e.clientY - 8; }, { passive: true });
        el.addEventListener('mouseleave', () => { tip.classList.remove('show'); vis = false; }, { passive: true });
    });

    _loop.add('tooltip', () => { if (vis) { tip.style.left = tx + 'px'; tip.style.top = ty + 'px'; } });
}

function initRipple() {
    document.querySelectorAll('[data-ripple]').forEach(btn => {
        btn.addEventListener('click', e => {
            const r = btn.getBoundingClientRect();
            const s = document.createElement('span');
            s.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;animation:ripple 0.55s linear;background:rgba(255,255,255,0.16);z-index:100;left:${e.clientX-r.left}px;top:${e.clientY-r.top}px;width:80px;height:80px;margin:-40px 0 0 -40px;transform:scale(0);`;
            btn.style.position = 'relative'; btn.style.overflow = 'hidden';
            btn.appendChild(s);
            setTimeout(() => s.remove(), 600);
        });
    });
}

function initMagnetic() {
    document.querySelectorAll('[data-mag]').forEach(btn => {
        btn.addEventListener('mouseenter', () => { btn.style.transition = 'transform 0.1s'; }, { passive: true });
        btn.addEventListener('mousemove', e => {
            const r  = btn.getBoundingClientRect();
            const dx = (e.clientX - r.left - r.width/2) * 0.24;
            const dy = (e.clientY - r.top - r.height/2) * 0.24;
            btn.style.transform = `translate3d(${dx}px,${dy}px,0)`;
        }, { passive: true });
        btn.addEventListener('mouseleave', () => {
            btn.style.transition = 'transform 0.45s var(--spring)';
            btn.style.transform  = 'translate3d(0,0,0)';
        }, { passive: true });
    });
}

function initCardSpotlight() {
    document.querySelectorAll('.card').forEach(c => {
        let pending = false, ex = 0, ey = 0;
        c.addEventListener('mousemove', e => {
            ex = e.clientX; ey = e.clientY;
            if (pending) return;
            pending = true;
            requestAnimationFrame(() => {
                const r = c.getBoundingClientRect();
                c.style.setProperty('--mx', (ex-r.left) + 'px');
                c.style.setProperty('--my', (ey-r.top)  + 'px');
                pending = false;
            });
        }, { passive: true });
    });
}

function initCursorTrail() {
    if (window.matchMedia('(pointer:coarse)').matches) return;
    const N = 10, trail = [];
    for (let i = 0; i < N; i++) {
        const sz = Math.max(1.5, 5 - i * 0.35);
        const al = Math.max(0, 0.4 - i * 0.04);
        const el = document.createElement('div');
        el.style.cssText = `position:fixed;pointer-events:none;z-index:9999;border-radius:50%;will-change:transform;width:${sz}px;height:${sz}px;background:rgba(26,168,255,${al});top:0;left:0;`;
        document.body.appendChild(el);
        trail.push({ el, x: -500, y: -500, half: sz * 0.5 });
    }
    let mx = -500, my = -500;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    _loop.add('cursor', () => {
        for (let i = 0; i < N; i++) {
            const t = trail[i];
            const sx = i === 0 ? mx : trail[i-1].x;
            const sy = i === 0 ? my : trail[i-1].y;
            t.x += (sx - t.x) * 0.4;
            t.y += (sy - t.y) * 0.4;
            t.el.style.transform = `translate3d(${t.x-t.half}px,${t.y-t.half}px,0)`;
        }
    });
}

function toggleMenu() {
    document.getElementById('mobile-menu')?.classList.toggle('open');
}

const COLOR_MAP = {
    blue:   { strip: 'strip-blue',   text: '#1AA8FF' },
    gold:   { strip: 'strip-gold',   text: '#FFB83A' },
    purple: { strip: 'strip-purple', text: '#a855f7' },
    gray:   { strip: 'strip-gray',   text: '#8898bb' },
};

function _toEmbed(url) {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}?mute=1&controls=0` : url;
}

function _media(p) {
    if (p.media === 'youtube') return `<iframe class="w-full h-full" style="opacity:0.65;transition:opacity .4s" src="${_toEmbed(p.src)}" frameborder="0" allow="autoplay"></iframe>`;
    if (p.media === 'image')   return `<img src="${p.src}" class="w-full h-full object-cover" style="opacity:0.65;transition:opacity .4s">`;
    return `<div class="w-full h-full flex items-center justify-center" style="background:rgba(20,24,40,0.8)"><i data-lucide="gamepad-2" style="width:40px;height:40px;color:var(--dim)"></i></div>`;
}

let _projFilter = 'all';
function filterProjects(cat, btn) {
    _projFilter = cat;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderProjects();
    playClick(600, 0.05);
}

function renderProjects() {
    const grid = document.getElementById('proj-grid');
    if (!grid) return;
    const list = _projFilter === 'all' ? SITE.projects : SITE.projects.filter(p => p.category === _projFilter);

    grid.innerHTML = list.map(p => {
        const s       = COLOR_MAP[p.color] || COLOR_MAP.blue;
        const visits  = p._visits  ? `<span class="mono" style="font-size:8px;color:var(--dim)">${RBLX.fmt(p._visits)} visits</span>`   : '';
        const playing = p._playing ? `<span class="mono" style="font-size:8px;color:var(--green)">${RBLX.fmt(p._playing)} playing</span>` : '';
        const liveRow = (visits || playing) ? `<div class="flex items-center gap-3 mt-2">${visits}${playing}</div>` : '';
        const btn     = p.link
            ? `<a href="${p.link}" target="_blank" onclick="event.stopPropagation()" class="btn btn-outline mt-4 w-full justify-center" style="padding:8px;border-radius:8px;font-size:10px;letter-spacing:.1em"><i data-lucide="gamepad-2" style="width:13px;height:13px"></i> PLAY GAME</a>`
            : '';
        return `
        <div class="card group">
            <div class="strip ${s.strip}"></div>
            <div style="height:186px;overflow:hidden;background:rgba(0,0,0,0.5);border-bottom:1px solid rgba(255,255,255,0.05);position:relative">${_media(p)}
                <span style="position:absolute;bottom:8px;left:8px;background:rgba(0,0,0,0.78);border:1px solid rgba(255,255,255,0.1);padding:3px 8px;border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:9px;color:#ccc">${p.tags[0]||''}</span>
            </div>
            <div style="padding:20px">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="display font-black text-white text-lg leading-none" style="transition:color .3s" onmouseover="this.style.color='${s.text}'" onmouseout="this.style.color='#fff'">${p.title}</h3>
                    <span style="font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;color:var(--dim);background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);padding:2px 7px;border-radius:4px;white-space:nowrap;margin-left:8px">${p.category}</span>
                </div>
                <p style="color:var(--dim);font-size:12px;line-height:1.5">${p.desc}</p>
                ${liveRow}${btn}
            </div>
        </div>`;
    }).join('');
    lucide.createIcons();
    initCardSpotlight();
}

function renderSkills() {
    const main = document.getElementById('skills-main');
    const fun  = document.getElementById('skills-fun');
    if (!main || !fun) return;

    const renderCard = (s, dim) => `
    <div class="card reveal" style="${dim?'opacity:0.55':''}">
        <div class="strip ${s.color==='purple'?'strip-purple':s.color==='gold'?'strip-gold':'strip-blue'}"></div>
        <div style="padding:18px 16px;padding-top:22px">
            <div class="flex justify-between items-end mb-4">
                <h3 class="display font-bold text-white" style="font-size:1.2rem">${s.name}</h3>
                <span style="font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;color:${s.color==='purple'?'var(--purple)':s.color==='gold'?'var(--gold)':'var(--accent)'}">${s.pct}%</span>
            </div>
            <div class="bar-track mb-3"><div class="bar-fill ${s.color}" data-w="${s.pct}%"></div></div>
            <p style="font-size:11px;color:var(--dim)">${s.desc}</p>
        </div>
    </div>`;

    main.innerHTML = SITE.skills.map(s => renderCard(s, false)).join('');
    fun.innerHTML  = SITE.funSkills.map(s => renderCard(s, true)).join('');
}

function renderTimeline() {
    const wrap = document.getElementById('timeline');
    if (!wrap) return;
    wrap.innerHTML = `<div class="tl-line"></div>` + SITE.timeline.map(t => `
    <div class="tl-item group reveal">
        <div class="tl-dot" style="${!t.accent?'border-color:rgba(255,255,255,0.2);box-shadow:none':''}"></div>
        <div class="card p-6 ${t.dim?'opacity-50':''}">
            ${t.accent?'<div class="strip strip-blue"></div>':''}
            <div class="flex flex-col md:flex-row md:items-center justify-between mb-2 pt-1 gap-1">
                <h3 class="display font-black text-white" style="font-size:1.25rem">${t.title}</h3>
                <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:${t.accent?'var(--accent)':'var(--dim)'};${t.accent?'background:rgba(26,168,255,0.08);border:1px solid rgba(26,168,255,0.2);':''}padding:3px 10px;border-radius:4px;white-space:nowrap">${t.period}</span>
            </div>
            <p style="color:var(--dim);font-size:13px;line-height:1.6;margin-bottom:${t.tags?.length?'12px':'0'}">${t.desc}</p>
            ${t.tags?.length?`<div class="flex flex-wrap gap-2">${t.tags.map(tag=>`<span style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--dim);background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);padding:3px 9px;border-radius:4px">${tag}</span>`).join('')}</div>`:''}
        </div>
    </div>`).join('');
}

function buildTabs() {
    const tabs = document.getElementById('code-tabs');
    if (!tabs) return;
    tabs.innerHTML = SITE.snippets.map((s, i) =>
        `<div class="code-tab${i===0?' active':''}" onclick="switchTab(${i},this)">${s.name}</div>`
    ).join('');
    const code = document.getElementById('code-body');
    if (code && SITE.snippets.length) { code.textContent = SITE.snippets[0].code; Prism.highlightElement(code); }
}

function switchTab(i, el) {
    playClick(800, 0.05);
    document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    const code = document.getElementById('code-body');
    if (code) { code.textContent = SITE.snippets[i].code; Prism.highlightElement(code); }
}

function copyCode() {
    const code = document.getElementById('code-body');
    if (!code) return;
    navigator.clipboard.writeText(code.textContent).then(() => {
        showToast('Code copied to clipboard!', 'var(--green)');
        const w = document.querySelector('.code-win');
        if (w) { w.style.borderColor = '#00ff88'; setTimeout(() => { w.style.borderColor = ''; }, 300); }
    });
}

let _basePrice = 2500;

function selectService(base, el) {
    _basePrice = base;
    document.querySelectorAll('.svc-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    calcBudget();
    playClick(600, 0.05);
}

function calcBudget() {
    const c   = parseFloat(document.getElementById('c-range')?.value || 1);
    const r   = parseFloat(document.getElementById('r-range')?.value || 1);
    const cur = document.getElementById('currency')?.value || 'R$';
    const cfg = SITE.pricing.currencies[cur] || SITE.pricing.currencies['R$'];

    const clbl = document.getElementById('c-lbl');
    if (clbl) { clbl.textContent = c < 1.3 ? 'Standard' : c < 1.7 ? 'Complex' : 'Architect Level'; clbl.style.color = c < 1.3 ? 'var(--dim)' : c < 1.7 ? 'var(--accent)' : 'var(--gold)'; }

    const rlbl = document.getElementById('r-lbl');
    if (rlbl) { rlbl.textContent = r < 1.2 ? 'Standard' : r < 1.4 ? 'Priority' : 'ASAP'; rlbl.style.color = r < 1.2 ? 'var(--dim)' : r < 1.4 ? 'var(--accent)' : 'var(--red)'; }

    const total = _basePrice * c * r;
    const conv  = Math.ceil(total * cfg.rate);
    const disp  = cfg.prefix ? cfg.sym + conv.toLocaleString() : conv.toLocaleString() + cfg.sym;

    const tp = document.getElementById('total-price');
    const sp = document.getElementById('sub-price');
    const rb = document.getElementById('r-base');
    const rc = document.getElementById('r-comp');
    const rr = document.getElementById('r-rush');

    if (tp) tp.textContent = disp;
    if (rb) rb.textContent = _basePrice.toLocaleString();
    if (rc) rc.textContent = `×${c.toFixed(1)}`;
    if (rr) rr.textContent = `×${r.toFixed(1)}`;
    if (sp) sp.textContent = cur !== 'USD' ? `≈ $${Math.ceil(total*0.0035)} USD` : `≈ ${Math.ceil(total).toLocaleString()} R$`;
}

const REVIEWS_KEY = 'schale_reviews_v4';
let _starRating = 5;

function _getReviews() { try { return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]'); } catch { return []; } }
function _allReviews() { return [...SITE.seedReviews, ..._getReviews()]; }

function _stars(n, size) {
    return Array.from({length:5}, (_,i) =>
        `<svg style="width:${size||14}px;height:${size||14}px;display:inline-block" fill="${i<n?'#FFA800':'none'}" stroke="#FFA800" stroke-width="1.5" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`
    ).join('');
}

function renderReviews() {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;
    const all = _allReviews();
    const avg = all.reduce((a, r) => a + r.stars, 0) / all.length;

    const countEl = document.getElementById('reviews-count');
    const avgEl   = document.getElementById('reviews-avg');
    if (countEl) countEl.textContent = all.length;
    if (avgEl)   avgEl.textContent   = avg.toFixed(1) + ' ★';

    grid.innerHTML = all.map((r, i) => `
    <div class="card reveal" style="animation-delay:${i*50}ms">
        <div class="strip strip-gold"></div>
        <div style="padding:20px;padding-top:24px">
            <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex items-center gap-3">
                    <div style="width:38px;height:38px;border-radius:50%;background:rgba(255,168,0,0.1);border:1px solid rgba(255,168,0,0.3);display:flex;align-items:center;justify-content:center;font-family:'Rajdhani',sans-serif;font-weight:900;font-size:16px;color:var(--gold);flex-shrink:0">${r.name.charAt(0).toUpperCase()}</div>
                    <div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <span style="font-weight:700;font-size:13px;color:#fff">${r.name}</span>
                            ${r.verified?`<span style="font-size:8px;font-weight:700;padding:1px 7px;border-radius:99px;background:rgba(46,232,154,0.1);color:var(--green);border:1px solid rgba(46,232,154,0.25)">✓ VERIFIED</span>`:''}
                        </div>
                        <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted);margin-top:1px">${r.date}</div>
                    </div>
                </div>
                <div>${_stars(r.stars)}</div>
            </div>
            <p style="font-size:12px;color:var(--dim);line-height:1.6;font-style:italic;border-left:2px solid rgba(255,184,58,0.3);padding-left:10px">"${r.text}"</p>
        </div>
    </div>`).join('');
}

function openReviewModal()  { playClick(880, 0.2); const m = document.getElementById('review-modal'); if (m) { m.classList.add('open'); _syncStars(5); } }
function closeReviewModal() { playClick(400, 0.1); document.getElementById('review-modal')?.classList.remove('open'); }

function _buildStars() {
    const sel = document.getElementById('star-sel');
    if (!sel) return;
    sel.innerHTML = Array.from({length:5}, (_,i) => `
        <span class="star-pick" data-v="${i+1}" style="font-size:26px;cursor:pointer;transition:transform .15s">
            <svg style="width:28px;height:28px;transition:all .15s" fill="${i<5?'#FFA800':'none'}" stroke="#FFA800" stroke-width="1.5" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
        </span>`
    ).join('');
    sel.querySelectorAll('.star-pick').forEach(s => {
        const v = parseInt(s.dataset.v);
        s.addEventListener('mouseenter', () => _syncStars(v), { passive: true });
        s.addEventListener('mouseleave', () => _syncStars(_starRating), { passive: true });
        s.addEventListener('click', () => { _starRating = v; _syncStars(v); playClick(600 + v*80, 0.05); });
    });
}

function _syncStars(n) {
    document.querySelectorAll('.star-pick').forEach((s, i) => {
        s.querySelector('svg')?.setAttribute('fill', i < n ? '#FFA800' : 'none');
        s.style.transform = i < n ? 'scale(1.08)' : 'scale(1)';
    });
}

function initReviewForm() {
    _buildStars(); _starRating = 5;
    const form = document.getElementById('review-form');
    const ta   = document.getElementById('review-text');
    const cc   = document.getElementById('char-count');
    if (ta && cc) ta.addEventListener('input', () => { const l = ta.value.length; cc.textContent = `${l}/280`; cc.style.color = l > 250 ? 'var(--red)' : ''; });
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('review-name')?.value.trim();
        const text = ta?.value.trim();
        if (!name || !text) return;
        const stored = _getReviews();
        stored.unshift({ id: 'u_'+Date.now(), name, stars: _starRating, text, date: new Date().toISOString().slice(0,10), verified: false });
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(stored));
        renderReviews();
        closeReviewModal();
        showToast('📝 Field report submitted! Thanks, operative.', 'var(--gold)');
        unlockAch('reviewer');
        playClick(1200, 0.3);
    });
}

window.adminClearReviews = function() { localStorage.removeItem(REVIEWS_KEY); renderReviews(); };

const ACHS = {
    first_visit:    { icon: '🔭', title: 'FIRST CONTACT',  desc: 'Opened the portfolio. Bold move.' },
    cli_power:      { icon: '💻', title: 'POWER USER',     desc: 'Used the terminal 5+ times.' },
    coffee_enjoyer: { icon: '☕', title: 'COFFEE ENJOYER', desc: 'Typed coffee in the terminal.' },
    no_life:        { icon: '🏆', title: 'NO LIFE',        desc: 'Clicked the logo exactly 7 times.' },
    linguist:       { icon: '🌐', title: 'LINGUIST',       desc: 'Switched the site language.' },
    night_owl:      { icon: '🌙', title: 'NIGHT OWL',      desc: 'Visiting between midnight and 5am.' },
    reviewer:       { icon: '📝', title: 'OPERATIVE',      desc: 'Submitted a field report.' },
    chaos_agent:    { icon: '🚨', title: 'CHAOS AGENT',    desc: 'Triggered the system override.' },
    konami:         { icon: '🎮', title: 'GAMER',          desc: 'Entered the Konami code.' },
    hacker:         { icon: '🖤', title: 'HACKER',         desc: 'Typed "hack" in the terminal.' },
    overdrive:      { icon: '🔥', title: 'OVERDRIVE',      desc: 'Mouse speed exceeded limit.' },
    idle_sensei:    { icon: '😴', title: 'IDLE SENSEI',    desc: 'Went AFK for over a minute.' },
};

let _unlocked = JSON.parse(localStorage.getItem('schale_ach') || '{}');

function unlockAch(id) {
    if (_unlocked[id] || !ACHS[id]) return;
    _unlocked[id] = Date.now();
    localStorage.setItem('schale_ach', JSON.stringify(_unlocked));
    _refreshAchPanel();

    const a = ACHS[id];
    const n = Object.keys(_unlocked).length;
    const card = document.createElement('div');
    card.style.cssText = `position:fixed;bottom:${88+(n%3)*88}px;left:22px;z-index:9997;width:280px;background:rgba(5,9,26,.98);border:1px solid rgba(255,184,58,.35);border-left:3px solid var(--gold);padding:11px 15px;border-radius:10px;box-shadow:0 8px 36px rgba(0,0,0,.7);transform:translateX(-320px);opacity:0;pointer-events:none;transition:all 0.42s cubic-bezier(0.175,0.885,0.32,1.275);font-family:'JetBrains Mono',monospace;will-change:transform,opacity;`;
    card.innerHTML = `<div style="font-size:7.5px;letter-spacing:.14em;color:var(--gold);margin-bottom:5px">★ ACHIEVEMENT UNLOCKED</div><div style="display:flex;align-items:center;gap:9px"><span style="font-size:24px">${a.icon}</span><div><div style="color:#fff;font-weight:900;font-size:10.5px;letter-spacing:.06em">${a.title}</div><div style="color:var(--dim);font-size:8.5px;margin-top:2px">${a.desc}</div></div></div>`;
    document.body.appendChild(card);
    requestAnimationFrame(() => requestAnimationFrame(() => { card.style.transform = 'translateX(0)'; card.style.opacity = '1'; }));
    setTimeout(() => { card.style.transform = 'translateX(-320px)'; card.style.opacity = '0'; setTimeout(() => card.remove(), 440); }, 5000);
    playClick(1320, 0.16);
}

function _buildAchList() {
    return Object.keys(ACHS).map(id => {
        const a  = ACHS[id];
        const ok = !!_unlocked[id];
        return `<div style="display:flex;align-items:center;gap:9px;padding:7px;border-radius:8px;margin-bottom:3px;background:${ok?'rgba(255,184,58,.05)':'rgba(255,255,255,.015)'};border:1px solid ${ok?'rgba(255,184,58,.2)':'rgba(255,255,255,.04)'}"><span style="font-size:18px;flex-shrink:0;${ok?'':'filter:grayscale(1);opacity:.2'}">${a.icon}</span><div style="min-width:0"><div style="font-size:9.5px;font-weight:900;letter-spacing:.05em;font-family:'Rajdhani',sans-serif;color:${ok?'#fff':'var(--muted)'}">${a.title}</div><div style="font-size:7.5px;font-family:'JetBrains Mono',monospace;color:${ok?'var(--dim)':'var(--muted)'};margin-top:1px">${ok?a.desc:'???'}</div></div>${ok?'<span style="margin-left:auto;font-size:8px;color:var(--gold);flex-shrink:0">✓</span>':''}</div>`;
    }).join('');
}

function _refreshAchPanel() {
    const cnt   = Object.keys(_unlocked).length;
    const tot   = Object.keys(ACHS).length;
    const pct   = Math.round(cnt / tot * 100);
    const badge = document.getElementById('ach-badge');
    const fill  = document.getElementById('ach-fill');
    const pctEl = document.getElementById('ach-pct');
    const list  = document.getElementById('ach-list');
    if (badge) badge.textContent = `${cnt}/${tot}`;
    if (fill)  fill.style.width  = pct + '%';
    if (pctEl) pctEl.textContent = `${cnt}/${tot} · ${pct}%`;
    if (list)  list.innerHTML    = _buildAchList();
}

function initAchPanel() {
    const btn   = document.getElementById('ach-btn');
    const panel = document.getElementById('ach-panel');
    if (!btn || !panel) return;
    _refreshAchPanel();
    let open = false;
    btn.addEventListener('click', () => {
        open = !open;
        panel.classList.toggle('open', open);
        btn.style.borderColor = open ? 'var(--gold)' : 'rgba(255,184,58,0.28)';
        if (open) _refreshAchPanel();
        playClick(open ? 880 : 400, 0.07);
    });
    document.addEventListener('click', e => {
        if (open && !panel.contains(e.target) && !btn.contains(e.target)) {
            open = false; panel.classList.remove('open');
            btn.style.borderColor = 'rgba(255,184,58,0.28)';
        }
    });
}

function initAchHooks() {
    if (!_unlocked.first_visit) setTimeout(() => unlockAch('first_visit'), 4000);
    if (new Date().getHours() < 5) unlockAch('night_owl');

    const inpEl = document.getElementById('cli-input');
    if (inpEl) {
        let cliCount = 0;
        inpEl.addEventListener('keypress', e => {
            if (e.key !== 'Enter') return;
            cliCount++;
            if (cliCount >= 5) unlockAch('cli_power');
            const cmd = inpEl.value.trim().toLowerCase();
            if (cmd === 'coffee') unlockAch('coffee_enjoyer');
            if (cmd === 'hack')   unlockAch('hacker');
        });
    }

    let logoClicks = 0, logoTimer;
    const logo = document.querySelector('[data-logo-egg]');
    if (logo) {
        logo.addEventListener('click', () => {
            logoClicks++; clearTimeout(logoTimer);
            logoTimer = setTimeout(() => { logoClicks = 0; }, 2200);
            if (logoClicks >= 7) { logoClicks = 0; unlockAch('no_life'); }
        });
    }

    let ki = 0;
    const kc = SITE.konami.map(k => k.toLowerCase());
    document.addEventListener('keydown', e => {
        if (e.key.toLowerCase() === kc[ki]) { ki++; if (ki === kc.length) { ki = 0; unlockAch('konami'); showToast('KONAMI CODE — chaos mode unlocked', 'var(--red)'); toggleOverride(); } }
        else ki = 0;
    });

    let lx = 0, ly = 0, lt = 0, triggered = false;
    window.addEventListener('mousemove', e => {
        const now = Date.now();
        if (lt && now - lt >= 16) {
            const spd = Math.hypot(e.clientX - lx, e.clientY - ly) / ((now - lt) / 1000);
            if (spd > 3200 && !triggered) { triggered = true; setTimeout(() => { triggered = false; }, 8000); unlockAch('overdrive'); }
        }
        lx = e.clientX; ly = e.clientY; lt = now;
    }, { passive: true });

    let idleT = Date.now(), warned30 = false, warned60 = false;
    const resetIdle = () => { idleT = Date.now(); warned30 = warned60 = false; };
    ['mousemove','keydown','click'].forEach(ev => window.addEventListener(ev, resetIdle, { passive: true }));
    setInterval(() => {
        const idle = Date.now() - idleT;
        if (idle > 30000 && !warned30) { warned30 = true; showToast('👀 Sensei… still there?', 'var(--dim)'); }
        if (idle > 60000 && !warned60) { warned60 = true; unlockAch('idle_sensei'); }
    }, 6000);
}

const TRANSMISSIONS = [
    { from: 'ARONA',  pri: 'LOW',     msg: "Sensei, your coffee is getting cold again. This is a critical alert." },
    { from: 'PLANA',  pri: 'NORMAL',  msg: "System integrity at 94.2%. The remaining 5.8% is vibes." },
    { from: 'ARONA',  pri: 'HIGH',    msg: "Someone has been on this portfolio for several minutes. Are they hiring?" },
    { from: 'SCHALE', pri: 'NORMAL',  msg: "Deployment status: optimal. Anomalies: 0 (officially)." },
    { from: 'PLANA',  pri: 'WARNING', msg: "Memory leak detected. Logged. Promptly ignored. Moving on." },
    { from: 'ARONA',  pri: 'LOW',     msg: "Water's commissions are still open. Tell a friend." },
    { from: 'PLANA',  pri: 'NORMAL',  msg: "Null pointer exception suppressed. Bug renamed 'feature'. Filed: resolved." },
    { from: 'ARONA',  pri: 'LOW',     msg: "It is late, Sensei. You should sleep. You won't. I know you." },
];
const PRI_COL = { LOW: 'var(--dim)', NORMAL: 'var(--accent)', HIGH: 'var(--gold)', WARNING: 'var(--red)' };

function triggerTransmission() {
    const t  = TRANSMISSIONS[Math.floor(Math.random() * TRANSMISSIONS.length)];
    const c  = PRI_COL[t.pri];
    const id = 'tx_' + Date.now();
    const card = document.createElement('div');
    card.id = id;
    card.style.cssText = `position:fixed;bottom:84px;right:24px;z-index:9992;width:300px;background:rgba(5,9,26,.98);border:1px solid rgba(255,255,255,.07);border-top:2px solid ${c};border-radius:12px;overflow:hidden;box-shadow:0 16px 56px rgba(0,0,0,.8);transform:translateX(330px);opacity:0;transition:all 0.42s cubic-bezier(0.175,0.885,0.32,1.275);font-family:'JetBrains Mono',monospace;will-change:transform,opacity;`;
    card.innerHTML = `<div style="padding:9px 13px;border-bottom:1px solid rgba(255,255,255,.05);background:rgba(26,168,255,.02);display:flex;align-items:center;justify-content:space-between"><span style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:11px;letter-spacing:.1em;color:#fff">📡 TRANSMISSION</span><div style="display:flex;align-items:center;gap:5px"><span style="font-size:7px;padding:2px 6px;border-radius:3px;border:1px solid ${c};color:${c}">${t.pri}</span><button onclick="document.getElementById('${id}').remove()" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:14px;padding:0 2px;transition:color .15s" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='var(--muted)'">×</button></div></div><div style="padding:13px"><div style="font-size:7.5px;letter-spacing:.1em;color:${c};margin-bottom:8px">FROM: ${t.from} // SCHALE.DB</div><p style="font-size:11px;color:var(--text);line-height:1.65;font-family:'Nunito',sans-serif;margin-bottom:10px">"${t.msg}"</p><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:7.5px;color:var(--muted)">${new Date().toLocaleTimeString()}</span><button onclick="document.getElementById('${id}').remove()" style="font-size:8.5px;font-weight:700;padding:4px 12px;border-radius:5px;cursor:pointer;background:${c};color:#000;border:none;font-family:'JetBrains Mono',monospace">ACK</button></div></div>`;
    document.body.appendChild(card);
    requestAnimationFrame(() => requestAnimationFrame(() => { card.style.transform = 'translateX(0)'; card.style.opacity = '1'; }));
    setTimeout(() => { card.style.transform = 'translateX(330px)'; card.style.opacity = '0'; setTimeout(() => { document.getElementById(id)?.remove(); }, 440); }, 9000);
    playClick(660, 0.08);
}

function triggerAnomaly() {
    document.body.style.animation = 'shake 0.44s ease both';
    setTimeout(() => { document.body.style.animation = ''; }, 450);
    document.body.style.filter = 'hue-rotate(90deg) saturate(2)';
    setTimeout(() => { document.body.style.filter = ''; }, 80);
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;z-index:99990;pointer-events:none;background:radial-gradient(ellipse 80% 80% at 50% 50%,transparent 50%,rgba(255,68,85,.1) 100%);opacity:1;transition:opacity .6s';
    document.body.appendChild(flash);
    requestAnimationFrame(() => requestAnimationFrame(() => { flash.style.opacity = '0'; setTimeout(() => flash.remove(), 700); }));
    showToast('⚠ ANOMALY DETECTED — source: unknown', 'var(--red)');
    playClick(80, 0.45);
}

const OPERATIVES = ['CryptoSage_88','Yuki_Phantom','NullPtr_Dev','ByteWitch_42','GhostScripter','DataVoid_7','NekoBytes_99','w4ter_fan_lol'];
function triggerOperative() { showToast(`👤 <b>${OPERATIVES[Math.floor(Math.random()*OPERATIVES.length)]}</b> connected.`, 'var(--green)'); playClick(880, 0.06); }

function triggerSyslog() {
    const out = document.getElementById('cli-output');
    if (!out) return;
    const msgs = ['Routine integrity check: <span style="color:#00ff88">PASSED</span>','Garbage collection: <span style="color:var(--accent)">847ms</span>','Coffee.reserve: <span style="color:var(--gold)">CRITICAL LOW</span>','DataStore heartbeat: <span style="color:#00ff88">NOMINAL</span>','Sleep.schedule: <span style="color:var(--red)">UNDEFINED</span>'];
    const d = document.createElement('div');
    d.style.cssText = 'margin-bottom:3px;font-size:9px;';
    d.innerHTML = `<span style="color:var(--muted)">[SYS]</span> <span style="color:#2e3d5a">${msgs[Math.floor(Math.random()*msgs.length)]}</span>`;
    out.appendChild(d); out.scrollTop = out.scrollHeight;
    playClick(1100, 0.012);
}

const EVENTS = [
    { id: 'tx', w: 5, cd: 80000,  fn: triggerTransmission },
    { id: 'op', w: 6, cd: 45000,  fn: triggerOperative },
    { id: 'sl', w: 8, cd: 28000,  fn: triggerSyslog },
    { id: 'an', w: 2, cd: 200000, fn: triggerAnomaly },
];
const _lastFired = {};

function _pickAndFire() {
    const now  = Date.now();
    const pool = EVENTS.filter(e => !_lastFired[e.id] || (now - _lastFired[e.id]) > e.cd);
    if (!pool.length) return;
    const tot = pool.reduce((s, e) => s + e.w, 0);
    let pick = Math.random() * tot, cum = 0, chosen = pool[pool.length-1];
    for (const e of pool) { cum += e.w; if (pick <= cum) { chosen = e; break; } }
    _lastFired[chosen.id] = now;
    chosen.fn();
}

function initRandomEvents() {
    setTimeout(() => {
        _pickAndFire();
        const loop = () => { setTimeout(() => { if (Math.random() < 0.65) _pickAndFire(); loop(); }, 20000 + Math.random() * 35000); };
        loop();
    }, 20000 + Math.random() * 15000);
}

function initCLI() {
    const inp = document.getElementById('cli-input');
    const out = document.getElementById('cli-output');
    if (!inp || !out) return;

    const B = 'color:var(--accent)', G = 'color:var(--gold)', P = 'color:var(--purple)';
    const GN = 'color:var(--green)', R = 'color:var(--red)', D = 'color:var(--dim)', M = 'color:var(--muted)';

    const go = (id, msg) => { setTimeout(() => navigateTo(id), 200); return `<span style="${D}">${msg}</span>`; };

    const cmds = {
        help:            () => [`<span style="${B}">Available commands:</span>`, `  <span style="${G}">about skills projects code estimator reviews contact</span>`, `  <span style="${G}">date whoami status neofetch coffee uwu hack sudo</span>`, `  <span style="${G}">git blame  ls  ping  clear  touch grass</span>`, `  <span style="${M}">(secrets hidden in the void)</span>`].join('<br>'),
        about:           () => go('home',      'Navigating to home...'),
        skills:          () => go('skills',    'Loading system specs...'),
        projects:        () => go('projects',  'Accessing mission reports...'),
        code:            () => go('code',      'Opening code vault...'),
        estimator:       () => go('estimator', 'Loading estimator...'),
        reviews:         () => go('reviews',   'Loading field reports...'),
        contact:         () => go('contact',   'Opening MomoTalk...'),
        date:            () => `<span style="${D}">[${new Date().toLocaleString()}]</span>`,
        whoami:          () => `<span style="${D}">Guest · Level 1 · Node: Kivotos-Alpha · IP: 127.0.0.1</span>`,
        status:          () => _override ? `<span style="${R}">CRITICAL — Override active.</span>` : `<span style="${GN}">✓ NOMINAL — All nodes green.</span>`,
        neofetch:        () => [`<span style="${B}">WATER</span>@<span style="${B}">kivotos</span>`, '  OS: KivotOS x64 · Host: SCHALE.DB v5', '  Shell: bash (certified bad decisions)', '  CPU: Galaxy Brain (2 cores, 0 free)', '  RAM: 16GB (14.9GB used by browser)', '  Coffee: <span style="color:var(--red)">CRITICAL LOW</span>', '  Bugs: 0 (official count)', `  <span style="color:var(--red)">●</span><span style="color:var(--gold)">●</span><span style="color:var(--green)">●</span><span style="color:var(--accent)">●</span><span style="color:var(--purple)">●</span>`].join('<br>'),
        coffee:          () => [`<span style="${G}">Brewing...</span>`, `<span style="${D}">Caffeine: 9000mg. Bugs fixed: still 0.</span>`].join('<br>'),
        uwu:             () => [`<span style="${P}">UwU what's this?? a stwange tewminal??</span>`, `<span style="${M}">[ this was a mistake. deeply sorry. ]</span>`].join('<br>'),
        sudo:            () => `<span style="${R}">Permission denied. Incident reported. (it wasn't)</span>`,
        hack:            () => [`<span style="${GN}">INITIATING HACK SEQUENCE...</span>`, `<span style="${D}">Bypassing mainframe... ████████░░</span>`, `<span style="${R}">ERROR: This is a portfolio. Nothing to hack.</span>`].join('<br>'),
        clear:           () => { out.innerHTML = ''; return null; },
        ls:              () => `<span style="${D}">home/ about/ skills/ history/ code/ projects/ estimator/ reviews/ contact/ secret_bugs/ TODO_never_fix/</span>`,
        ping:            () => `<span style="${GN}">PONG — 1ms (it's localhost, obviously)</span>`,
        'git blame':     () => `<span style="${D}">git blame: Water (100% of commits, 100% of bugs)</span>`,
        'git push':      () => `<span style="${R}">remote: Permission denied (this isn't your repo)</span>`,
        'touch grass':   () => `<span style="${GN}">✓ Grass touched. Achievement unlocked. Rare event.</span>`,
        vim:             () => `<span style="${D}">I know how to exit vim. I choose not to.</span>`,
        exit:            () => `<span style="${D}">lol no</span>`,
        'npm install':   () => `<span style="${D}">added 2,847 packages. 3 vulnerabilities. node_modules: 850MB.</span>`,
        'cat readme.md': () => `<span style="${D}">README: "portfolio built at 2am. please hire."</span>`,
        'reviews clear': () => { const p = prompt('Admin PIN:'); if (p !== SITE.adminPin) return `<span style="${R}">Access denied.</span>`; adminClearReviews(); return `<span style="${GN}">✓ User reviews cleared.</span>`; },
        'pfp reset':     () => { const p = prompt('Admin PIN:'); if (p !== SITE.adminPin) return `<span style="${R}">Access denied.</span>`; resetPfp(); return `<span style="${GN}">✓ Profile picture reset.</span>`; },
    };

    const SASSY = [
        c => `Command not found: "${c}". Type "help".`,
        c => `bash: ${c}: not found. skill issue detected.`,
        c => `"${c}" — never heard of it. have you tried turning it off and on again?`,
    ];

    const allKeys = Object.keys(cmds);
    inp.addEventListener('keydown', e => {
        if (e.key === 'Tab') { e.preventDefault(); const m = allKeys.find(k => k.startsWith(inp.value.toLowerCase().trim())); if (m) inp.value = m; }
    });

    inp.addEventListener('keypress', e => {
        if (e.key !== 'Enter') return;
        const raw = inp.value.trim(), cmd = raw.toLowerCase();
        if (!cmd) return;
        playClick(1200, 0.04);
        out.innerHTML += `<div style="margin-bottom:2px"><span style="${B}">visitor@schale:~$</span> <span style="color:#7080a0">${raw}</span></div>`;
        const h = cmds[cmd];
        if (h !== undefined) { const res = typeof h === 'function' ? h() : h; if (res) out.innerHTML += `<div style="margin-bottom:5px">${res}</div>`; }
        else { const fn = SASSY[Math.floor(Math.random() * SASSY.length)]; out.innerHTML += `<div style="${R};margin-bottom:5px">${fn(cmd)}</div>`; }
        inp.value = ''; out.scrollTop = out.scrollHeight;
    });
}

function initLogoEgg() {
    const logo = document.querySelector('[data-logo-egg]');
    if (!logo) return;
    let n = 0, t;
    logo.addEventListener('click', () => {
        n++; clearTimeout(t);
        t = setTimeout(() => { n = 0; }, 2200);
        if (n >= 7) {
            n = 0; showToast('Logo clicked 7× — Achievement: "No Life"'); playClick(440, 0.5);
            const cols = ['#FF4455','#FFB83A','#2EE89A','#1AA8FF','#a855f7'];
            let ci = 0;
            const iv = setInterval(() => {
                document.documentElement.style.setProperty('--accent', cols[ci++ % cols.length]);
                if (ci > 14) {
                    clearInterval(iv);
                    document.documentElement.style.setProperty('--accent',  '#1AA8FF');
                    document.documentElement.style.setProperty('--accent2', '#5CCFFF');
                    document.documentElement.style.setProperty('--glow',    'rgba(26,168,255,0.28)');
                }
            }, 100);
        }
    });
}

function initMobileLinks() {
    document.querySelectorAll('#mobile-menu a').forEach(a => {
        a.addEventListener('click', () => { document.getElementById('mobile-menu')?.classList.remove('open'); });
    });
}

(function() {
    setTimeout(() => console.log(
        '%c\n  SCHALE.DB — WATER PORTFOLIO v5\n  Hey, devtools lurker. Respect.\n  Bug count: 0 (official lie)\n  Try CLI: coffee · hack · neofetch\n',
        'color:#1AA8FF;font-family:monospace;font-size:11px;'
    ), 1200);
})();

document.addEventListener('DOMContentLoaded', () => {
    initVisitorCounter();
    injectPageNumbers();
    runBoot();
    initDots();
    initKeyboardNav();
    initWheelNav();
    initSwipeNav();
    initScrollProgress();
    initParticles();
    initCursorTrail();
    initMagnetic();
    initRipple();
    initTooltips();
    initCLI();
    initLogoEgg();
    initMobileLinks();
    initUptime();
    initAchPanel();
    initAchHooks();
    initRandomEvents();
    startToasts();

    renderSkills();
    renderTimeline();
    renderProjects();
    buildTabs();
    initReviewForm();

    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
    typeWriter();
    calcBudget();

    const firstSvc = document.querySelector('.svc-btn');
    if (firstSvc) firstSvc.click();

    setTimeout(() => showToast('Welcome, Sensei. Try the terminal.'), 3500);
    setTimeout(() => RBLX.init(), 800);

    const firstFilter = document.querySelector('.filter-btn');
    if (firstFilter) firstFilter.classList.add('active');
});
