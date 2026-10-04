// Defensive DOM compatibility: some constrained/embedded environments omit
// HTMLDocument even though document is available.
if (typeof window !== 'undefined' && typeof window.HTMLDocument === 'undefined' && typeof document !== 'undefined') {
    window.HTMLDocument = document.constructor;
}

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
    const osc = audioCtx.createOscillator();
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
    lucide.createIcons();
}

let _active = 0;
let _busy   = false;
const DUR   = 800; // wheel turn time, keep in sync with .8s in tactical.css
const _inited = {};

function navigateTo(id, instant) {
    const ids  = SITE.sections.map(s => s.id);
    const next = ids.indexOf(id);
    if (next === -1 || (next === _active && !instant) || _busy) return;

    const curEl  = document.querySelector('.page.active');
    const nextEl = document.getElementById('pg-' + id);
    if (!nextEl) return;

    _updateNav(id);
    _updateDots(next);

    const root = document.documentElement;
    if (instant || !curEl || curEl === nextEl) {
        root.classList.add('wheel-snap'); // jump, no turn
        if (curEl && curEl !== nextEl) curEl.classList.remove('active');
        nextEl.classList.add('active');
        root.style.setProperty('--active', next);
        _active = next;
        void nextEl.offsetWidth;
        root.classList.remove('wheel-snap');
        _onEnter(id);
        return;
    }

    // The whole site sits on one wheel. Changing --active turns the ring and
    // swings every page around the same pivot, so the content travels with it.
    _busy = true;
    curEl.classList.remove('active');
    nextEl.classList.add('active');
    root.style.setProperty('--active', next);
    _active = next;
    setTimeout(() => _onEnter(id), 250);
    setTimeout(() => { _busy = false; }, DUR);
}

function _onEnter(id) {
    if (_inited[id]) return;
    _inited[id] = true;
    const page = document.getElementById('pg-' + id);
    if (!page) return;
    page.querySelectorAll('.reveal').forEach((el, i) => {
        setTimeout(() => el.classList.add('done'), i * 65);
    });
    if (id === 'home') setTimeout(_animCounters, 350);
}

function _updateNav(id) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.section === id));
}
function _updateDots(idx) {
    document.querySelectorAll('.wheel-btn').forEach((b, i) => {
        b.classList.toggle('active', i === idx);
        b.setAttribute('aria-current', i === idx ? 'page' : 'false');
    });
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
}

function initKeyboardNav() {
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const ids = SITE.sections.map(s => s.id);
        if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); navigateTo(ids[Math.min(_active + 1, ids.length - 1)]); }
        if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); navigateTo(ids[Math.max(_active - 1, 0)]); }
    });
}

function initWheelNav() {
    let cd = false;
    document.addEventListener('wheel', e => {
        // Code has its own scroll surface. Never let a tiny code-scroll gesture
        // become a full page turn. Users can still turn the wheel anywhere else.
        if (e.target.closest && e.target.closest('#pg-code .spec-body')) return;

        if (_busy || cd) return;
        const pg = document.querySelector('.page.active');
        if (!pg) return;
        const ids = SITE.sections.map(s => s.id);
        const dir = e.deltaY > 0 ? 1 : -1;
        if (Math.abs(e.deltaY) < 35 && Math.abs(e.deltaX) < 35) return;
        e.preventDefault();
        cd = true;
        setTimeout(() => { cd = false; }, 900);
        navigateTo(ids[Math.max(0, Math.min(ids.length - 1, _active + dir))]);
    }, { passive: false });
}

function initSwipeNav() {
    let sy = 0, st = 0, blocked = false;
    const ids = SITE.sections.map(s => s.id);
    const app = document.getElementById('app');
    if (!app) return;
    app.addEventListener('touchstart', e => {
        const t = e.target;
        blocked = !!(t.closest && (t.closest('#pg-code .spec-body') || t.closest('.board-card') || t.closest('.board-lane-body')));
        sy = e.touches[0].clientY; st = Date.now();
    }, { passive: true });
    app.addEventListener('touchend', e => {
        if (blocked) { blocked = false; return; }
        const dy = sy - e.changedTouches[0].clientY;
        const dt = Date.now() - st;
        if (Math.abs(dy) < 60 || dt > 400) return;
        const pg    = document.querySelector('.page.active');
        const atBot = pg.scrollHeight - pg.scrollTop - pg.clientHeight < 10;
        const atTop = pg.scrollTop < 10;
        if (dy > 0 && atBot) navigateTo(ids[Math.min(_active + 1, ids.length - 1)]);
        if (dy < 0 && atTop) navigateTo(ids[Math.max(_active - 1, 0)]);
    }, { passive: true });
}


function runBoot() {
    const cont = document.getElementById('boot-log');
    if (!cont) return;
    const fill  = document.getElementById('boot-fill');
    const pct   = document.getElementById('boot-pct');
    const state = document.getElementById('boot-state');
    const btn   = document.getElementById('boot-btn');
    const clock = document.getElementById('boot-clock');
    const lines = [
        { txt: 'BIOS CHECK',      cls: 'ok',   val: 'OK'       },
        { txt: 'MEMORY',          cls: 'ok',   val: 'OK'       },
        { txt: 'NETWORK UPLINK',  cls: 'ok',   val: 'OK'       },
        { txt: 'LEGION SIGNAL',   cls: 'err',  val: 'DETECTED' },
        { txt: 'COUNTERMEASURES', cls: 'info', val: 'ARMED'    },
        { txt: 'SYSTEM',          cls: 'info', val: 'READY'    },
    ];

    const tick = () => { clock.textContent = new Date().toLocaleTimeString('en-GB'); };
    tick();
    window._bootClock = setInterval(tick, 1000);

    // Enter also starts the site once the button is up
    window._bootKey = e => { if (e.key === 'Enter' && btn.classList.contains('ready')) startExperience(); };
    document.addEventListener('keydown', window._bootKey);

    let i = 0;
    function next() {
        if (i >= lines.length) {
            state.textContent = 'READY';
            state.style.color = 'var(--accent)';
            setTimeout(() => btn.classList.add('ready'), 250);
            return;
        }
        const l = lines[i];
        const d = document.createElement('div');
        d.className = 'boot-line';
        d.innerHTML = `<span>${l.txt}</span><span class="${l.cls}">${l.val}</span>`;
        cont.appendChild(d);
        playClick(800 + i * 50, 0.04);
        i++;
        const p = Math.round(i / lines.length * 100);
        fill.style.width = p + '%';
        pct.textContent = p + '%';
        setTimeout(next, 260);
    }
    setTimeout(next, 450);
}

function startExperience() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playClick(880, 0.25);
    const boot = document.getElementById('boot');
    if (!boot) return;
    boot.classList.add('exit');
    clearInterval(window._bootClock);
    document.removeEventListener('keydown', window._bootKey);
    setTimeout(() => {
        boot.style.display = 'none';
        document.body.style.opacity    = '0';
        document.body.style.transition = 'opacity 0.6s ease';
        requestAnimationFrame(() => { document.body.style.opacity = '1'; });
        const bgm = document.getElementById('bgm');
        if (bgm && SITE.bgm) { bgm.src = SITE.bgm; bgm.volume = SITE.volume || 1; bgm.play().catch(() => {}); }
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

    ctx.strokeStyle = 'rgba(61,139,255,1)';
    ctx.lineWidth   = 0.5;

    _loop.add('particles', () => {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(61,139,255,0.9)';

        for (let i = 0; i < N; i++) {
            px[i] += pvx[i];
            py[i] += pvy[i];
            if (px[i] < 0 || px[i] > W) pvx[i] *= -1;
            if (py[i] < 0 || py[i] > H) pvy[i] *= -1;

            const dx  = _mx - px[i];
            const dy  = _my - py[i];
            const dsq = dx * dx + dy * dy;
            if (dsq < RDIST_SQ && dsq > 0) {
                const d = Math.sqrt(dsq);
                px[i] -= dx / d * 1.2;
                py[i] -= dy / d * 1.2;
            }

            ctx.globalAlpha = 0.45;
            ctx.beginPath();
            ctx.arc(px[i], py[i], pz[i], 0, TAU);
            ctx.fill();
        }

        for (let i = 0; i < N - 1; i++) {
            for (let j = i + 1; j < N; j++) {
                const dx  = px[i] - px[j];
                const dy  = py[i] - py[j];
                const dsq = dx * dx + dy * dy;
                if (dsq < CDIST_SQ) {
                    ctx.globalAlpha = (1 - Math.sqrt(dsq) / CDIST) * 0.07;
                    ctx.beginPath();
                    ctx.moveTo(px[i], py[i]);
                    ctx.lineTo(px[j], py[j]);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;
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
function typeWriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    clearTimeout(_twTimer);
    const phrases = SITE.phrases || ['Broken Code.'];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = phrases[0]; return; }
    let p = 0, i = 0, deleting = false;
    (function tick() {
        const text = phrases[p];
        el.textContent = text.slice(0, i);
        if (!deleting && i === text.length) { deleting = true; _twTimer = setTimeout(tick, 1600); return; }
        if (deleting && i === 0) { deleting = false; p = (p + 1) % phrases.length; }
        i += deleting ? -1 : 1;
        _twTimer = setTimeout(tick, deleting ? 35 : 80);
    })();
}


function esc(s) {
    return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function copyDiscord() {
    navigator.clipboard.writeText(SITE.discord).then(() => {
        const el = document.getElementById('discord-text');
        if (el) { const o = el.textContent; el.textContent = 'COPIED!'; setTimeout(() => { el.textContent = o; }, 2000); }
    }).catch(() => showToast('Could not copy Discord. Please copy it manually.', 'var(--red)'));
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
        root.style.setProperty('--accent',  '#8bbcff');
        root.style.setProperty('--accent2', '#b5d4ff');
        root.style.setProperty('--glow',    'rgba(80,144,208,0.28)');
        document.body.style.animation = 'shake 0.45s ease both';
        setTimeout(() => { document.body.style.animation = ''; }, 460);
        if (st)    st.textContent = 'REPUBLIC OVERRIDE';
        if (dot)   dot.classList.replace('bg-green-500', 'bg-blue-500');
        if (ping)  ping.classList.replace('bg-green-500', 'bg-blue-500');
        if (badge) badge.classList.add('critical');
        playClick(140, 0.5);
    } else {
        root.style.setProperty('--accent',  '#3d8bff');
        root.style.setProperty('--accent2', '#3d8bff');
        root.style.setProperty('--glow',    'rgba(61,139,255,0.30)');
        if (st)    st.textContent = window.availText ? window.availText() : 'System Online';
        if (dot)   dot.classList.replace('bg-blue-500', 'bg-green-500');
        if (ping)  ping.classList.replace('bg-blue-500', 'bg-green-500');
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
        el.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };
    tick(); setInterval(tick, 1000);
}

function initVisitorCounter() {
    const el = document.getElementById('visitor-count');
    if (!el) return;

    // Keep the visitor display local-only. Remote counter APIs are frequently
    // blocked by privacy extensions and should never generate console noise
    // or affect the rest of the site.
    const cached = localStorage.getItem('wds_count');
    if (cached && Number.isFinite(Number(cached))) {
        el.textContent = Number(cached).toLocaleString();
    } else {
        el.textContent = '--';
    }
}

let _toastN = 0;
// Reserved for actionable failures only (clipboard/API/runtime errors).
function showToast(msg, color = 'var(--red)') {
    if (_toastN >= 3) return;
    _toastN++;
    const t = document.createElement('div');
    const c = color;
    t.style.cssText = `position:fixed;bottom:${84 + (_toastN - 1) * 76}px;right:22px;z-index:9998;background:rgba(4,6,15,0.97);border:1px solid rgba(255,255,255,0.07);border-left:3px solid ${c};color:var(--text);font-size:11px;font-family:'JetBrains Mono',monospace;padding:11px 16px;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,0.7);max-width:300px;line-height:1.5;transform:translate3d(16px,0,0) scale(0.97);opacity:0;pointer-events:none;transition:transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275),opacity 0.4s ease;will-change:transform,opacity;`;
    t.innerHTML = `<div style="font-size:8px;color:${c};letter-spacing:.12em;margin-bottom:3px;opacity:.7;">WATER.SYS</div><div>${msg}</div>`;
    document.body.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => { t.style.transform = 'translate3d(0,0,0) scale(1)'; t.style.opacity = '1'; }));
    setTimeout(() => {
        t.style.transform = 'translate3d(16px,0,0) scale(0.97)'; t.style.opacity = '0';
        setTimeout(() => { t.remove(); _toastN = Math.max(0, _toastN - 1); }, 420);
    }, 4500);
}

function initTooltips() {
    const tip = document.getElementById('tooltip');
    if (!tip) return;
    let tx = 0, ty = 0, vis = false;

    document.querySelectorAll('[data-tip]').forEach(el => {
        if (el._tipInit) return;
        el._tipInit = true;
        el.addEventListener('mouseenter', () => { tip.textContent = el.dataset.tip; tip.classList.add('show'); vis = true; }, { passive: true });
        el.addEventListener('mousemove',  e => { tx = e.clientX + 14; ty = e.clientY - 8; }, { passive: true });
        el.addEventListener('mouseleave', () => { tip.classList.remove('show'); vis = false; }, { passive: true });
    });

    if (!_loop._tipRunning) {
        _loop._tipRunning = true;
        _loop.add('tooltip', () => { if (vis) { tip.style.left = tx + 'px'; tip.style.top = ty + 'px'; } });
    }
}

function initRipple() {
    document.querySelectorAll('[data-ripple]').forEach(btn => {
        if (btn._rippleInit) return;
        btn._rippleInit = true;
        btn.addEventListener('click', e => {
            const r = btn.getBoundingClientRect();
            const s = document.createElement('span');
            s.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;animation:ripple 0.55s linear;background:rgba(255,255,255,0.16);z-index:100;left:${e.clientX - r.left}px;top:${e.clientY - r.top}px;width:80px;height:80px;margin:-40px 0 0 -40px;transform:scale(0);`;
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
            const dx = (e.clientX - r.left - r.width / 2) * 0.24;
            const dy = (e.clientY - r.top  - r.height / 2) * 0.24;
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
        if (c._spotInit) return;
        c._spotInit = true;
        let pending = false, ex = 0, ey = 0;
        c.addEventListener('mousemove', e => {
            ex = e.clientX; ey = e.clientY;
            if (pending) return;
            pending = true;
            requestAnimationFrame(() => {
                const r = c.getBoundingClientRect();
                c.style.setProperty('--mx', (ex - r.left) + 'px');
                c.style.setProperty('--my', (ey - r.top)  + 'px');
                pending = false;
            });
        }, { passive: true });
    });
}

function initCursorTrail() {
    if (window.matchMedia('(pointer:coarse)').matches) return;
    const N     = 10;
    const trail = [];

    for (let i = 0; i < N; i++) {
        const sz = Math.max(1.5, 5 - i * 0.35);
        const al = Math.max(0, 0.4 - i * 0.04);
        const el = document.createElement('div');
        el.style.cssText = `position:fixed;pointer-events:none;z-index:9999;border-radius:50%;will-change:transform;width:${sz}px;height:${sz}px;background:rgba(61,139,255,${al});top:0;left:0;`;
        document.body.appendChild(el);
        trail.push({ el, x: -500, y: -500, half: sz * 0.5 });
    }

    let mx = -500, my = -500;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

    _loop.add('cursor', () => {
        for (let i = 0; i < N; i++) {
            const t  = trail[i];
            const sx = i === 0 ? mx : trail[i - 1].x;
            const sy = i === 0 ? my : trail[i - 1].y;
            t.x += (sx - t.x) * 0.4;
            t.y += (sy - t.y) * 0.4;
            t.el.style.transform = `translate3d(${t.x - t.half}px,${t.y - t.half}px,0)`;
        }
    });
}

function toggleMenu() {
    document.getElementById('mobile-menu')?.classList.toggle('open');
}

const COLOR_MAP = {
    blue:   { strip: 'strip-blue',   text: '#C8192A' },
    gold:   { strip: 'strip-gold',   text: '#FFB83A' },
    purple: { strip: 'strip-purple', text: '#a855f7' },
    gray:   { strip: 'strip-gray',   text: '#8898bb' },
};

function _toEmbed(url) {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${m[1]}` : url;
}

function _media(p) {
    if (p.media === 'youtube') {
        return `<iframe class="w-full h-full" style="opacity:0.65;transition:opacity .4s" src="${_toEmbed(p.src)}" frameborder="0" allow="autoplay"></iframe>`;
    }
    if (p.media === 'image') {
        const isUI = p.category === 'UI DESIGN';
        return `<img src="${p.src}" class="w-full h-full" style="opacity:${isUI ? '0.92' : '0.65'};transition:opacity .4s;object-fit:${isUI ? 'contain' : 'cover'};object-position:center;background:#050508;" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                <div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;flex-direction:column;gap:8px;background:rgba(20,24,40,0.8);">
                  <i data-lucide="image-off" style="width:32px;height:32px;color:var(--dim)"></i>
                  <span style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted)">Image not found</span>
                </div>`;
    }
    return `<div class="w-full h-full flex items-center justify-center" style="background:rgba(20,24,40,0.8);"><i data-lucide="gamepad-2" style="width:40px;height:40px;color:var(--dim)"></i></div>`;
}

let _projFilter = 'all';
const PROJECT_BOARD_KEY = 'wds_project_board_v2';
const TIMELINE_BOARD_KEY = 'wds_timeline_board_v2';

const BOARD_LANES = {
    projects: [
        { id: 'shipped', label: 'SHIPPED', hint: 'live / delivered' },
        { id: 'building', label: 'IN BUILD', hint: 'active / developing' },
        { id: 'systems', label: 'SYSTEMS', hint: 'mechanics / showcase' },
    ],
    timeline: [
        { id: 'current', label: 'CURRENT', hint: '2022 → now' },
        { id: 'growth', label: 'DEVELOPMENT', hint: '2021 → 2022' },
        { id: 'origin', label: 'ORIGIN', hint: '~2020' },
    ],
};

function _loadBoard(key, items, lanes, defaults) {
    let state = null;
    try { state = JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) {}
    if (!state || !state.lanes) state = { lanes: Object.fromEntries(lanes.map(l => [l.id, []])) };

    const known = new Set(items.map(x => x.id));
    for (const lane of lanes) {
        if (!Array.isArray(state.lanes[lane.id])) state.lanes[lane.id] = [];
        state.lanes[lane.id] = state.lanes[lane.id].filter(id => known.has(id));
    }

    const placed = new Set(Object.values(state.lanes).flat());
    items.forEach(item => {
        if (!placed.has(item.id)) {
            const lane = defaults(item);
            state.lanes[lane] ||= [];
            state.lanes[lane].push(item.id);
        }
    });
    return state;
}

function _saveBoard(key, state) {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (_) {}
}

function _boardCard(project, index, compact = false) {
    const s = COLOR_MAP[project.color] || COLOR_MAP.blue;
    const mediaH = compact ? '132px' : '148px';
    const playBtn = project.link
        ? `<a href="${project.link}" target="_blank" rel="noreferrer" onclick="event.stopPropagation()" class="btn btn-outline mt-3 w-full justify-center" style="padding:7px;border-radius:6px;font-size:10px;letter-spacing:.08em">\n             <i data-lucide="gamepad-2" style="width:13px;height:13px"></i> OPEN EXPERIENCE\n           </a>`
        : '';
    const meta = (project.role || project.result)
        ? `<dl class="proj-meta board-meta">${project.role ? `<div><dt>ROLE</dt><dd>${project.role}</dd></div>` : ''}${project.result ? `<div><dt>RESULT</dt><dd>${project.result}</dd></div>` : ''}</dl>`
        : '';
    const tags = (project.tags || []).map(tag => `<span class="board-tag">${tag}</span>`).join('');

    return `<article class="board-card card" draggable="true" data-board-id="${encodeURIComponent(project.id)}" data-board-type="projects" tabindex="0" aria-label="Drag ${project.title}">
        <div class="board-card-top">
            <span class="board-drag-handle" aria-hidden="true"><i data-lucide="grip-vertical" style="width:14px;height:14px"></i></span>
            <span class="board-index">${String(index + 1).padStart(2, '0')}</span>
            <span class="board-cat">${project.category}</span>
        </div>
        <div class="board-media" style="height:${mediaH}">${_media(project)}</div>
        <div class="board-body">
            <div class="board-title-row"><h3>${project.title}</h3></div>
            <p class="board-desc">${project.desc}</p>
            ${meta}
            ${tags ? `<div class="board-tags">${tags}</div>` : ''}
            ${playBtn}
        </div>
    </article>`;
}

function _boardShell(type, state, itemMap, lanes, emptyText) {
    return lanes.map((lane, laneIndex) => {
        const ids = state.lanes[lane.id] || [];
        const cards = ids.map((id, i) => itemMap.get(id)).filter(Boolean)
            .map((item, i) => type === 'projects' ? _boardCard(item, i) : _timelineCard(item, i)).join('');
        return `<section class="board-lane" data-lane-id="${lane.id}" data-board-type="${type}">
            <header class="board-lane-head">
                <div><span class="board-lane-kicker">0${laneIndex + 1}</span><h3>${lane.label}</h3><p>${lane.hint}</p></div>
                <span class="board-count">${ids.length}</span>
            </header>
            <div class="board-lane-body" data-drop-lane="${lane.id}">${cards || `<div class="board-empty">${emptyText}</div>`}</div>
        </section>`;
    }).join('');
}

function _timelineCard(item, index) {
    return `<article class="board-card timeline-board-card card" draggable="true" data-board-id="${encodeURIComponent(item.id)}" data-board-type="timeline" tabindex="0" aria-label="Drag ${item.title}">
        <div class="board-card-top">
            <span class="board-drag-handle" aria-hidden="true"><i data-lucide="grip-vertical" style="width:14px;height:14px"></i></span>
            <span class="board-index">${String(index + 1).padStart(2, '0')}</span>
            <span class="board-cat">${item.period}</span>
        </div>
        <div class="board-body">
            <h3>${item.title}</h3>
            <p class="board-desc">${item.desc}</p>
            ${item.tags?.length ? `<div class="board-tags">${item.tags.map(tag => `<span class="board-tag">${tag}</span>`).join('')}</div>` : ''}
        </div>
    </article>`;
}

function _initBoardDrag(container, key, items, lanes, defaults, type) {
    if (!container || container.dataset.boardReady === '1') return;
    container.dataset.boardReady = '1';

    container.addEventListener('dragstart', e => {
        const card = e.target.closest('.board-card');
        if (!card || card.dataset.boardType !== type) return;
        if (e.target.closest('a,button,input,textarea,iframe')) { e.preventDefault(); return; }
        card.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify({ id: decodeURIComponent(card.dataset.boardId), type }));
    });

    container.addEventListener('dragend', e => {
        const card = e.target.closest('.board-card');
        card?.classList.remove('is-dragging');
        container.querySelectorAll('.board-lane.is-over,.board-card.is-drop-target').forEach(el => el.classList.remove('is-over','is-drop-target'));
    });

    container.addEventListener('dragover', e => {
        const lane = e.target.closest('.board-lane');
        if (!lane || lane.dataset.boardType !== type) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        container.querySelectorAll('.board-lane.is-over').forEach(el => { if (el !== lane) el.classList.remove('is-over'); });
        lane.classList.add('is-over');
        const card = e.target.closest('.board-card');
        container.querySelectorAll('.board-card.is-drop-target').forEach(el => { if (el !== card) el.classList.remove('is-drop-target'); });
        if (card) card.classList.add('is-drop-target');
    });

    container.addEventListener('drop', e => {
        const laneEl = e.target.closest('.board-lane');
        if (!laneEl) return;
        e.preventDefault();
        container.querySelectorAll('.board-lane.is-over,.board-card.is-drop-target').forEach(el => el.classList.remove('is-over','is-drop-target'));
        let payload; try { payload = JSON.parse(e.dataTransfer.getData('text/plain') || '{}'); } catch (_) { return; }
        if (!payload.id || payload.type !== type) return;

        const itemList = type === 'projects' ? items.map((x, i) => ({...x, id: `project-${i}`})) : items.map((x, i) => ({...x, id: `timeline-${i}`}));
        const state = _loadBoard(key, itemList, lanes, defaults);
        let fromLane = lanes.find(l => state.lanes[l.id]?.includes(payload.id));
        if (!fromLane) return;
        const fromIndex = state.lanes[fromLane.id].indexOf(payload.id);
        state.lanes[fromLane.id].splice(fromIndex, 1);
        const toLane = laneEl.dataset.laneId;
        const targetCard = e.target.closest('.board-card');
        let insertIndex = state.lanes[toLane]?.length || 0;
        if (targetCard) {
            const targetId = decodeURIComponent(targetCard.dataset.boardId);
            const current = state.lanes[toLane] || [];
            const targetIndex = current.indexOf(targetId);
            if (targetIndex >= 0) insertIndex = targetIndex + (e.clientY > targetCard.getBoundingClientRect().top + targetCard.getBoundingClientRect().height / 2 ? 1 : 0);
        }
        state.lanes[toLane] ||= [];
        state.lanes[toLane].splice(Math.max(0, Math.min(insertIndex, state.lanes[toLane].length)), 0, payload.id);
        _saveBoard(key, state);
        type === 'projects' ? renderProjects() : renderTimeline();
        playClick(760, 0.05);
    });
}

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
    const all = SITE.projects.map((p, i) => ({ ...p, id: `project-${i}` }));
    const itemMap = new Map(all.map(p => [p.id, p]));
    const state = _loadBoard(PROJECT_BOARD_KEY, all, BOARD_LANES.projects, p => /in development/i.test(p.result || '') ? 'building' : /live on roblox/i.test(p.result || '') ? 'shipped' : 'systems');
    const visible = _projFilter === 'all' ? all : all.filter(p => p.category === _projFilter);
    const visibleSet = new Set(visible.map(p => p.id));
    const filteredState = { lanes: Object.fromEntries(BOARD_LANES.projects.map(l => [l.id, (state.lanes[l.id] || []).filter(id => visibleSet.has(id))])) };
    grid.className = 'ops-board';
    grid.innerHTML = _boardShell('projects', filteredState, itemMap, BOARD_LANES.projects, 'Drop a project here');
    lucide.createIcons();
    _initBoardDrag(grid, PROJECT_BOARD_KEY, all, BOARD_LANES.projects, p => /in development/i.test(p.result || '') ? 'building' : /live on roblox/i.test(p.result || '') ? 'shipped' : 'systems', 'projects');
}

function renderTimeline() {
    const wrap = document.getElementById('timeline');
    if (!wrap) return;
    const all = SITE.timeline.map((t, i) => ({ ...t, id: `timeline-${i}` }));
    const itemMap = new Map(all.map(t => [t.id, t]));
    const state = _loadBoard(TIMELINE_BOARD_KEY, all, BOARD_LANES.timeline, t => t.id === 'timeline-0' ? 'current' : t.id === 'timeline-1' ? 'growth' : 'origin');
    wrap.className = 'ops-board';
    wrap.innerHTML = _boardShell('timeline', state, itemMap, BOARD_LANES.timeline, 'Drop a record here');
    lucide.createIcons();
    _initBoardDrag(wrap, TIMELINE_BOARD_KEY, all, BOARD_LANES.timeline, t => t.id === 'timeline-0' ? 'current' : t.id === 'timeline-1' ? 'growth' : 'origin', 'timeline');
}

const REVIEWS_KEY = 'wds_reviews_v1';
let _starRating = 5;

function _getReviews() { try { return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]'); } catch { return []; } }
function _allReviews() { return _getReviews(); }

function _stars(n, size) {
    return Array.from({ length: 5 }, (_, i) =>
        `<svg style="width:${size || 14}px;height:${size || 14}px;display:inline-block" fill="${i < n ? '#FFA800' : 'none'}" stroke="#FFA800" stroke-width="1.5" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`
    ).join('');
}

/* Ambient notifications intentionally disabled: the wheel + inline system states are the only persistent UI signals. */

function initCLI() {
    const inp = document.getElementById('cli-input');
    const out = document.getElementById('cli-output');
    if (!inp || !out) return;

    const B  = 'color:var(--accent)', G  = 'color:var(--gold)',   P  = 'color:var(--purple)';
    const GN = 'color:var(--green)',  R  = 'color:var(--red)',    D  = 'color:var(--dim)';
    const M  = 'color:var(--muted)';

    const go = (id, msg) => { setTimeout(() => navigateTo(id), 200); return `<span style="${D}">${msg}</span>`; };

    const cmds = {
        hub:       () => go('hub',  'Opening hub...'),
        code:      () => go('code', 'Opening code specimens...'),
        palette:   () => { setTimeout(() => window.openPalette && window.openPalette(), 120); return 'Opening palette...'; },
        shortcuts: () => { setTimeout(() => window.openHelp && window.openHelp(), 120); return 'Shortcuts:'; },
        help:     () => [`<span style="${B}">Available commands:</span>`, `  <span style="${G}">about projects contact</span>`, `  <span style="${G}">date whoami status neofetch coffee uwu hack sudo</span>`, `  <span style="${G}">git blame  ls  ping  clear  touch grass</span>`, `  <span style="${M}">(secrets hidden in the void)</span>`].join('<br>'),
        about:    () => go('home',     'Navigating...'),
        projects: () => go('projects', 'Accessing mission reports...'),
        contact:  () => go('contact',  'Opening comms...'),
        date:     () => `<span style="${D}">[${new Date().toLocaleString()}]</span>`,
        whoami:   () => `<span style="${D}">Guest · Level 1 · Node: Spearhead-Alpha · IP: 127.0.0.1</span>`,
        status:   () => _override ? `<span style="${B}">REPUBLIC OVERRIDE active.</span>` : `<span style="${GN}">✓ NOMINAL: All nodes green.</span>`,
        neofetch: () => [`<span style="${B}">WATER</span>@<span style="${B}">spearhead</span>`, '  OS: EightyOS x64 · Host: WATER.SYS v1', '  Shell: bash (certified bad decisions)', '  CPU: Galaxy Brain (2 cores, 0 free)', '  RAM: 16GB (14.9GB used by browser)', '  Coffee: <span style="color:var(--red)">CRITICAL LOW</span>', '  Bugs: 0 (official count)', '  Legion: <span style="color:var(--red)">ACTIVE</span>', `  <span style="color:var(--red)">●</span><span style="color:var(--gold)">●</span><span style="color:var(--green)">●</span><span style="color:var(--accent)">●</span><span style="color:var(--purple)">●</span>`].join('<br>'),
        coffee:   () => [`<span style="${G}">Brewing...</span>`, `<span style="${D}">Caffeine: 9000mg. Bugs fixed: still 0.</span>`].join('<br>'),
        uwu:      () => [`<span style="${P}">UwU what's this?? a stwange tewminal??</span>`, `<span style="${M}">[ this was a mistake. deeply sorry. ]</span>`].join('<br>'),
        sudo:     () => `<span style="${R}">Permission denied. Reported to Handler One.</span>`,
        hack:     () => [`<span style="${GN}">INITIATING HACK SEQUENCE...</span>`, `<span style="${D}">Bypassing Legion core... ████████░░</span>`, `<span style="${R}">ERROR: This is a portfolio. Nothing to hack.</span>`].join('<br>'),
        clear:    () => { out.innerHTML = ''; return null; },
        ls:       () => `<span style="${D}">home/ about/ history/ projects/ contact/ classified/ TODO_never_fix/</span>`,
        ping:     () => `<span style="${GN}">PONG: 1ms (localhost, obviously)</span>`,
        'git blame':     () => `<span style="${D}">git blame: Water (100% of commits, 100% of bugs)</span>`,
        'git push':      () => `<span style="${R}">remote: Permission denied.</span>`,
        'touch grass':   () => `<span style="${GN}">✓ Grass touched. Rare event.</span>`,
        vim:             () => `<span style="${D}">I know how to exit vim. I choose not to.</span>`,
        exit:            () => `<span style="${D}">lol no</span>`,
        'npm install':   () => `<span style="${D}">added 2,847 packages. 3 vulnerabilities. node_modules: 850MB.</span>`,
        'cat readme.md': () => `<span style="${D}">README: "built at 2am. please hire."</span>`,
    };

    const SASSY = [
        c => `Command not found: "${c}". Type "help".`,
        c => `bash: ${c}: not found. skill issue.`,
        c => `"${c}": never heard of it.`,
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
        out.innerHTML += `<div style="margin-bottom:2px"><span style="${B}">guest@spearhead:~$</span> <span style="color:#7080a0">${esc(raw)}</span></div>`;
        const jump = cmd.match(/^(?:goto|cd)\s+(\w+)$/);
        const h = jump && SITE.sections.some(s => s.id === jump[1]) ? () => go(jump[1], 'Navigating...') : cmds[cmd];
        if (h !== undefined) { const res = typeof h === 'function' ? h() : h; if (res) out.innerHTML += `<div style="margin-bottom:5px">${res}</div>`; }
        else { const fn = SASSY[Math.floor(Math.random() * SASSY.length)]; out.innerHTML += `<div style="color:var(--red);margin-bottom:5px">${fn(esc(cmd))}</div>`; }
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
            n = 0; playClick(440, 0.5);
            const cols = ['#C8192A', '#FFB83A', '#2EE89A', '#5090D0', '#a855f7'];
            let ci = 0;
            const iv = setInterval(() => {
                document.documentElement.style.setProperty('--accent', cols[ci++ % cols.length]);
                if (ci > 14) {
                    clearInterval(iv);
                    document.documentElement.style.setProperty('--accent',  '#C8192A');
                    document.documentElement.style.setProperty('--accent2', '#E8364A');
                    document.documentElement.style.setProperty('--glow',    'rgba(61,139,255,0.30)');
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

(function () {
    setTimeout(() => console.log(
        '%c\n  WATER DATABASE SYSTEM v1\n  SPEARHEAD SQUADRON: CLASSIFIED\n  Bug count: 0 (official lie)\n  Try CLI: coffee · hack · neofetch\n',
        'color:#C8192A;font-family:monospace;font-size:11px;'
    ), 1200);
})();

document.addEventListener('DOMContentLoaded', () => {
    initVisitorCounter();
    runBoot();
    initKeyboardNav();
    initWheelNav();
    initSwipeNav();
    initParticles();
    initTooltips();
    initCLI();
    initLogoEgg();
    initMobileLinks();
    initUptime();

    renderTimeline();
    renderProjects();

    lucide.createIcons();
    typeWriter();

    const firstFilter = document.querySelector('.filter-btn');
    if (firstFilter) firstFilter.classList.add('active');


    ROBLOX.init();
});
