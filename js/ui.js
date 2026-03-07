/* ============================================================
   UI.JS v4.0  —  Blue Archive Edition
   ALL BUGS FIXED:
     ✓ cursor trail: initialised off-screen (no 0,0 flash)
     ✓ glass-card / skill-card: no CSS transform on :hover (tilt JS owns it)
     ✓ toggleSystemOverride: resets all 5 --accent-* vars to correct BA blue
     ✓ logo easter egg: resets all 5 accent vars
     ✓ initActiveNav / initCounters: correct IntersectionObserver pattern
     ✓ blink keyframe unified to `blink`
     ✓ toggleLanguage: synced with #lang-display-mobile (in translations.js)
     ✓ profilePicture: PIN-protected, only owner can change it
   NEW:
     ✓ Tab autocomplete in CLI
     ✓ neofetch, touch grass, uname, pwd, ls -la, git commit, git push
     ✓ Admin CLI: "reviews clear", "pfp reset" (PIN-gated)
     ✓ Toast queue (up to 3 simultaneous, stacked)
     ✓ Section reveal animations
     ✓ showFunnyToast alias preserved
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
   BOOT SEQUENCE
════════════════════════════════ */
function startExperience() {
    if (typeof audioCtx !== 'undefined' && audioCtx.state === 'suspended') audioCtx.resume();
    playClick(880, 0.3);
    const overlay = document.getElementById('start-overlay');
    if (!overlay) return;
    overlay.style.animation = 'crtOff 0.5s forwards';

    // Fade the main content in smoothly
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0s';

    setTimeout(() => {
        overlay.style.display = 'none';
        // Staggered fade-in for nav + hero
        document.body.style.opacity   = '0';
        document.body.style.transition = 'opacity 0.7s ease';
        requestAnimationFrame(() => { document.body.style.opacity = '1'; });

        const bgm = document.getElementById('bgm');
        if (bgm && config && config.bgmUrl) {
            bgm.src    = config.bgmUrl;
            bgm.volume = config.volume || 0.15;
            bgm.play().catch(() => {});
        }
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
        { label: 'COUNTING_BUGS_IN_CODEBASE', cls: 'check', status: '0 check' },
        { label: 'NETWORK_UPLINK',            cls: 'check', status: 'OK'   },
        { label: 'VIRUS_DETECTED',            cls: 'err',   status: '...'  },
        { label: 'just_kidding_lol',          cls: 'info',  status: 'haha' },
        { label: 'SCHALE_DB_MOUNT',           cls: 'check', status: 'OK'   },
    ];
    let i = 0;
    function next() {
        if (i < checks.length) {
            var ch = checks[i];
            var div = document.createElement('div');
            div.className = 'boot-status-line';
            div.innerHTML = '<span>' + ch.label + '...</span><span class="' + ch.cls + '">' + ch.status + '</span>';
            container.appendChild(div);
            playClick(800 + i * 55, 0.04);
            i++;
            setTimeout(next, i === 7 ? 650 : 230);
        } else {
            setTimeout(function () {
                var btn = document.getElementById('connect-btn');
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
    var img = document.getElementById('avatar-img');
    var ph  = document.getElementById('avatar-placeholder');
    if (!img || !ph) return;
    img.src = url;
    img.classList.remove('hidden');
    ph.classList.add('hidden');
    img.onerror = function () {
        img.classList.add('hidden');
        ph.classList.remove('hidden');
        localStorage.removeItem('schale_db_pfp');
    };
}

// initLocalSystem is defined in events.js (real counter via CountAPI).
// This stub runs only if events.js hasn't loaded yet.
function initLocalSystem() {
    var pfp = localStorage.getItem('schale_db_pfp');
    if (pfp) _applyPfp(pfp);
    var el = document.getElementById('visitor-count');
    if (el) el.innerText = '...';
}

/* ── PIN-PROTECTED profile picture update ──
   Set config.profilePin in config.js.
   Visitors without the PIN cannot change the photo.     */
window.updateProfilePicture = function () {
    var correctPin = (config && config.profilePin) ? String(config.profilePin) : 'schale';
    var pin = prompt('Lock Admin PIN required to update profile photo:\n\nHint: check config.js');
    if (pin === null) return;
    if (pin.trim() !== correctPin) {
        showToast('Access denied — wrong PIN.', 'var(--alert)');
        playClick(220, 0.4);
        return;
    }
    var url = prompt('PIN accepted!\n\nPaste your profile picture URL:\n(Direct image link or data: URI)');
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
    var img = document.getElementById('avatar-img');
    var ph  = document.getElementById('avatar-placeholder');
    if (img) { img.src = ''; img.classList.add('hidden'); }
    if (ph)  ph.classList.remove('hidden');
};

/* ════════════════════════════════
   TYPEWRITER
════════════════════════════════ */
var _twTimer;
function typeWriter() {
    var el = document.getElementById('typewriter');
    if (!el) return;
    clearTimeout(_twTimer);
    var langEl = document.getElementById('lang-display');
    var isEN   = (langEl ? langEl.innerText : 'EN') === 'EN';
    var text   = isEN ? 'Broken Code.' : 'โค้ดที่พังครับ';
    var i = 0;
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
var TextScramble = (function () {
    function TS(el) {
        this.el    = el;
        this.chars = '!<>-_\\/[]{}=+*^?#ABCDEFabcdef0123456789';
        this.update = this.update.bind(this);
    }
    TS.prototype.setText = function (newText) {
        var old   = this.el.innerText;
        this.queue = [];
        for (var i = 0; i < Math.max(old.length, newText.length); i++) {
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
        var self = this;
        return new Promise(function (r) { self._res = r; self.update(); });
    };
    TS.prototype.update = function () {
        var out = '', done = 0;
        for (var i = 0; i < this.queue.length; i++) {
            var q = this.queue[i];
            if (this.frame >= q.end)        { done++; out += q.to; }
            else if (this.frame >= q.start) {
                if (!q.char || Math.random() < 0.28)
                    q.char = this.chars[Math.floor(Math.random() * this.chars.length)];
                out += '<span style="color:var(--accent);opacity:.55">' + q.char + '</span>';
            } else { out += q.from; }
        }
        this.el.innerHTML = out;
        if (done === this.queue.length) { if (this._res) this._res(); }
        else { this._raf = requestAnimationFrame(this.update); this.frame++; }
    };
    return TS;
})();

function initScrambleHeadings() {
    var els = document.querySelectorAll('[data-scramble]');
    if (!els.length) return;
    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var text = entry.target.getAttribute('data-scramble');
            if (text) new TextScramble(entry.target).setText(text);
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.6 });
    els.forEach(function (e) { obs.observe(e); });
}
function initScrambleAll() { initScrambleHeadings(); }

/* ════════════════════════════════
   CURSOR TRAIL
   BUG FIX: starts at -500,-500 so no 0,0 flash
════════════════════════════════ */
function initCursorTrail() {
    if (window.matchMedia('(pointer:coarse)').matches) return;
    var N = 12, dots = [], mx = -500, my = -500;
    for (var i = 0; i < N; i++) {
        var d = document.createElement('div');
        d.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;border-radius:50%;';
        document.body.appendChild(d);
        dots.push({ el: d, x: -500, y: -500 });
    }
    window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function loop() {
        dots.forEach(function (dot, i) {
            var prev = i === 0 ? { x: mx, y: my } : dots[i - 1];
            dot.x += (prev.x - dot.x) * 0.42;
            dot.y += (prev.y - dot.y) * 0.42;
            var sz = Math.max(1.5, 5.5 - i * 0.35);
            var al = Math.max(0, 0.45 - i * 0.035);
            dot.el.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;border-radius:50%;'
                + 'width:' + sz + 'px;height:' + sz + 'px;'
                + 'background:rgba(26,168,255,' + al + ');'
                + 'left:' + (dot.x - sz / 2) + 'px;top:' + (dot.y - sz / 2) + 'px;'
                + 'box-shadow:0 0 ' + (sz * 2) + 'px rgba(26,168,255,' + (al * 0.5) + ');';
        });
        requestAnimationFrame(loop);
    })();
}

/* ════════════════════════════════
   MAGNETIC BUTTONS
════════════════════════════════ */
function initMagneticButtons() {
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
        btn.addEventListener('mouseenter', function () { btn.style.transition = 'transform 0.1s'; });
        btn.addEventListener('mousemove', function (e) {
            var r  = btn.getBoundingClientRect();
            var dx = (e.clientX - r.left - r.width  / 2) * 0.26;
            var dy = (e.clientY - r.top  - r.height / 2) * 0.26;
            btn.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        });
        btn.addEventListener('mouseleave', function () {
            btn.style.transition = 'transform 0.45s cubic-bezier(0.175,0.885,0.32,1.275)';
            btn.style.transform  = 'translate(0,0)';
        });
    });
}

/* ════════════════════════════════
   CARD TILT
   BUG FIX: CSS .glass-card:hover and .skill-card:hover
   have NO transform — this function owns it entirely
════════════════════════════════ */
function initCardTilt() {
    document.querySelectorAll('.tilt-card').forEach(function (card) {
        card.addEventListener('mouseenter', function () { card.style.transition = 'transform 0.1s'; });
        card.addEventListener('mousemove', function (e) {
            var r  = card.getBoundingClientRect();
            var dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
            var dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
            card.style.transform = 'perspective(800px) rotateX(' + (dy * -7) + 'deg) rotateY(' + (dx * 7) + 'deg) translateZ(8px)';
        });
        card.addEventListener('mouseleave', function () {
            card.style.transition = 'transform 0.5s cubic-bezier(0.175,0.885,0.32,1.275)';
            card.style.transform  = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
}

/* ════════════════════════════════
   RIPPLE
════════════════════════════════ */
function addRipple(e) {
    var btn  = e.currentTarget;
    var rect = btn.getBoundingClientRect();
    var span = document.createElement('span');
    span.style.cssText = 'position:absolute;border-radius:50%;transform:scale(0);'
        + 'animation:ripple-anim 0.6s linear;pointer-events:none;'
        + 'left:' + (e.clientX - rect.left) + 'px;top:' + (e.clientY - rect.top) + 'px;'
        + 'width:80px;height:80px;margin:-40px 0 0 -40px;'
        + 'background:rgba(255,255,255,.18);z-index:100;';
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(span);
    setTimeout(function () { span.remove(); }, 650);
}
function initRippleButtons() {
    document.querySelectorAll('[data-ripple]').forEach(function (b) {
        b.addEventListener('click', addRipple);
    });
}

/* ════════════════════════════════
   TOOLTIP
════════════════════════════════ */
function initTooltips() {
    var tip = document.getElementById('global-tooltip');
    if (!tip) {
        tip = document.createElement('div');
        tip.id = 'global-tooltip';
        document.body.appendChild(tip);
    }
    document.querySelectorAll('[data-tip]').forEach(function (el) {
        el.addEventListener('mouseenter', function () {
            tip.innerText = el.getAttribute('data-tip');
            tip.classList.add('visible');
        });
        el.addEventListener('mousemove', function (e) {
            tip.style.left = (e.clientX + 14) + 'px';
            tip.style.top  = (e.clientY - 8)  + 'px';
        });
        el.addEventListener('mouseleave', function () { tip.classList.remove('visible'); });
    });
}

/* ════════════════════════════════
   UPTIME COUNTER
════════════════════════════════ */
function initUptimeCounter() {
    var el = document.getElementById('uptime-counter');
    if (!el) return;
    var start = Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 48);
    function tick() {
        var d = Date.now() - start;
        var h = Math.floor(d / 3600000);
        var m = Math.floor((d % 3600000) / 60000);
        var s = Math.floor((d % 60000) / 1000);
        el.innerText = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    }
    tick();
    setInterval(tick, 1000);
}

/* ════════════════════════════════
   TOAST NOTIFICATIONS
   NEW: stackable up to 3 simultaneous
════════════════════════════════ */
var _toastCount = 0;
var _toastMax   = 3;

/* Toast base is 88px — clears the 52px music pill at bottom:24px right:24px */
var _TOAST_BASE = 88;

function showToast(msg, color) {
    if (_toastCount >= _toastMax) return;
    _toastCount++;
    var t   = document.createElement('div');
    var col = color || 'var(--accent)';
    var off = (_toastCount - 1) * 80;
    t.style.cssText =
        'position:fixed;bottom:' + (_TOAST_BASE + off) + 'px;right:24px;z-index:9998;' +
        'background:rgba(5,9,26,.98);' +
        'border:1px solid rgba(255,255,255,.07);border-left:3px solid ' + col + ';' +
        'color:var(--text);font-size:11px;font-family:\'JetBrains Mono\',monospace;' +
        'padding:12px 18px;border-radius:10px;' +
        'box-shadow:0 10px 35px rgba(0,0,0,.7);' +
        'transform:translateX(20px) scale(.97);opacity:0;' +
        'transition:all 0.42s cubic-bezier(0.175,0.885,0.32,1.275);' +
        'max-width:310px;line-height:1.5;pointer-events:none;backdrop-filter:blur(12px);';
    t.innerHTML =
        '<div style="font-size:8px;letter-spacing:.14em;color:' + col + ';margin-bottom:4px;opacity:.8;">SCHALE.DB</div>' +
        '<div>' + msg + '</div>';
    document.body.appendChild(t);
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            t.style.transform = 'translateX(0) scale(1)';
            t.style.opacity   = '1';
        });
    });
    setTimeout(function () {
        t.style.transform = 'translateX(20px) scale(.97)';
        t.style.opacity   = '0';
        setTimeout(function () {
            t.remove();
            _toastCount = Math.max(0, _toastCount - 1);
        }, 440);
    }, 4500);
}

/* Alias */
var showFunnyToast = showToast;

var TOASTS = [
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
    'Sensei, you\'ve been on this page a while.',
];
var _toastCd = false;

function startRandomToasts() {
    setTimeout(function () {
        showToast(TOASTS[Math.floor(Math.random() * TOASTS.length)]);
        setInterval(function () {
            if (Math.random() > 0.45) showToast(TOASTS[Math.floor(Math.random() * TOASTS.length)]);
        }, 28000);
    }, 5000);
}

/* ════════════════════════════════
   PARTICLES
════════════════════════════════ */
function initParticles() {
    var canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    var ctx   = canvas.getContext('2d');
    var mouse = { x: -9999, y: -9999 };
    var pts   = [];

    // Particle colors — BA palette
    var COLORS = [
        'rgba(26,168,255,',
        'rgba(92,207,255,',
        'rgba(168,85,247,',
        'rgba(26,168,255,',
        'rgba(26,168,255,',
    ];

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    function spawn() {
        var n = Math.min(60, Math.floor(window.innerWidth / 20));
        pts = [];
        for (var i = 0; i < n; i++) pts.push({
            x:  Math.random() * canvas.width,
            y:  Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            s:  Math.random() * 1.6 + 0.4,
            c:  COLORS[Math.floor(Math.random() * COLORS.length)],
        });
    }
    resize(); spawn();
    window.addEventListener('mousemove', function (e) { mouse.x = e.x; mouse.y = e.y; }, { passive: true });
    window.addEventListener('resize',    function ()  { resize(); spawn(); });

    (function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < pts.length; i++) {
            var p = pts[i];
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height)  p.vy *= -1;

            // Subtle mouse repulsion
            var dx = mouse.x - p.x, dy = mouse.y - p.y;
            var md = Math.sqrt(dx * dx + dy * dy);
            if (md < 90 && md > 0) { p.x -= (dx / md) * 1.4; p.y -= (dy / md) * 1.4; }

            // Draw particle
            ctx.globalAlpha = 0.5;
            ctx.fillStyle   = p.c + '0.9)';
            ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();

            // Draw connections
            for (var j = i + 1; j < pts.length; j++) {
                var q   = pts[j];
                var ddx = p.x - q.x, ddy = p.y - q.y;
                var d   = Math.sqrt(ddx * ddx + ddy * ddy);
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
   ACTIVE NAV
   BUG FIX: correct observer pattern
════════════════════════════════ */
function initActiveNav() {
    var sections = document.querySelectorAll('section[id], header[id], footer[id]');
    var links    = document.querySelectorAll('.nav-link[href^="#"]');
    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            var id = e.target.id;
            links.forEach(function (l) {
                l.classList.toggle('active', l.getAttribute('href').slice(1) === id);
            });
        });
    }, { rootMargin: '-35% 0px -60% 0px' });
    sections.forEach(function (s) { obs.observe(s); });
}

/* ════════════════════════════════
   SKILL BARS
════════════════════════════════ */
function initSkillBars() {
    var bars = document.querySelectorAll('.skill-bar-fill');
    if (!bars.length) return;
    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var bar   = entry.target;
            var idx   = Array.prototype.indexOf.call(bars, bar);
            var delay = (idx % 4) * 90; // stagger within each row of 4
            setTimeout(function () {
                bar.style.width = bar.getAttribute('data-width') || '0%';
                bar.classList.add('animated');
            }, 120 + delay);
            obs.unobserve(bar);
        });
    }, { threshold: 0.15 });
    bars.forEach(function (b) { obs.observe(b); });
}

/* ════════════════════════════════
   COUNTERS
   BUG FIX: correct IntersectionObserver pattern
════════════════════════════════ */
function animateCounter(el, target, dur, suffix) {
    el.style.transition = 'filter 0.4s ease, opacity 0.4s ease';
    el.style.filter     = 'blur(4px)';
    el.style.opacity    = '0.4';
    var start = null;
    (function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.innerText = Math.floor(eased * target) + suffix;
        if (p < 0.15) {
            el.style.filter  = 'blur(' + (4 - p * 26.67) + 'px)';
            el.style.opacity = String(0.4 + p * 4);
        } else {
            el.style.filter  = 'blur(0px)';
            el.style.opacity = '1';
        }
        if (p < 1) requestAnimationFrame(step);
    })(performance.now());
}
function initCounters() {
    var els = document.querySelectorAll('[data-counter]');
    if (!els.length) return;
    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            var el = e.target;
            animateCounter(el,
                parseInt(el.getAttribute('data-counter')),
                1600,
                el.getAttribute('data-suffix') || '');
            obs.unobserve(el);
        });
    }, { threshold: 0.5 });
    els.forEach(function (el) { obs.observe(el); });
}

/* ════════════════════════════════
   SECTION REVEAL — staggered children
════════════════════════════════ */
function initSectionReveals() {
    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            var el  = e.target;
            var dir = el.getAttribute('data-reveal') || 'up';
            var del = parseInt(el.getAttribute('data-reveal-delay') || '0');
            setTimeout(function () {
                el.style.opacity   = '1';
                el.style.transform = 'translate(0,0) scale(1)';
                el.style.filter    = 'blur(0px)';
            }, del);
            obs.unobserve(el);
        });
    }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.reveal-on-scroll').forEach(function (el, i) {
        var dir = el.getAttribute('data-reveal') || 'up';
        var transInit = dir === 'left'  ? 'translateX(-28px)' :
                        dir === 'right' ? 'translateX(28px)'  :
                        dir === 'down'  ? 'translateY(-20px)'  :
                        'translateY(24px)';
        el.style.opacity    = '0';
        el.style.transform  = transInit;
        el.style.filter     = 'blur(3px)';
        el.style.transition = 'opacity 0.65s ease, transform 0.65s cubic-bezier(0.0,0.0,0.2,1), filter 0.65s ease';
        obs.observe(el);
    });

    // Auto-stagger direct children of [data-stagger] containers
    document.querySelectorAll('[data-stagger]').forEach(function (parent) {
        var children = parent.children;
        var base     = parseInt(parent.getAttribute('data-stagger') || '60');
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            child.style.opacity    = '0';
            child.style.transform  = 'translateY(18px)';
            child.style.filter     = 'blur(2px)';
            child.style.transition = 'opacity 0.55s ease ' + (i * base) + 'ms, transform 0.55s cubic-bezier(0.0,0.0,0.2,1) ' + (i * base) + 'ms, filter 0.55s ease ' + (i * base) + 'ms';
        }
        var staggerObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                var kids = e.target.children;
                for (var j = 0; j < kids.length; j++) {
                    kids[j].style.opacity   = '1';
                    kids[j].style.transform = 'translateY(0)';
                    kids[j].style.filter    = 'blur(0px)';
                }
                staggerObs.unobserve(e.target);
            });
        }, { threshold: 0.08 });
        staggerObs.observe(parent);
    });
}

/* ════════════════════════════════
   NAV SCROLL
════════════════════════════════ */
function initNavScroll() {
    var nav = document.querySelector('.nav-bar');
    if (!nav) return;
    window.addEventListener('scroll', function () {
        nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
}

/* ════════════════════════════════
   MOBILE MENU
════════════════════════════════ */
function toggleMobileMenu() {
    var m = document.getElementById('mobile-menu');
    if (m) m.classList.toggle('open');
}

/* ════════════════════════════════
   DISCORD COPY
════════════════════════════════ */
function copyDiscord() {
    var handle = (config && config.discordHandle) ? config.discordHandle : 'hokpy';
    navigator.clipboard.writeText(handle).then(function () {
        var el = document.getElementById('contact-discord-text');
        if (!el) return;
        var orig = el.innerText;
        el.innerText = 'COPIED! check';
        showToast("Discord copied! Don't be a stranger.");
        setTimeout(function () { el.innerText = orig; }, 2200);
    });
}

/* ════════════════════════════════
   SYSTEM OVERRIDE
   BUG FIX: resets all 5 --accent vars to correct BA blue
════════════════════════════════ */
var _override = false;
function toggleSystemOverride(force) {
    if (force !== undefined) _override = !force;
    _override = !_override;
    var root  = document.documentElement;
    var st    = document.getElementById('system-status-text');
    var sd    = document.getElementById('status-dot');
    var sp    = document.getElementById('status-ping');
    var badge = document.querySelector('.hero-badge');

    if (_override) {
        root.style.setProperty('--accent',        '#FF4455');
        root.style.setProperty('--accent-bright', '#FF6677');
        root.style.setProperty('--accent-dim',    'rgba(255,68,85,.1)');
        root.style.setProperty('--accent-glow',   'rgba(255,68,85,.38)');
        root.style.setProperty('--accent-border', 'rgba(255,68,85,.22)');
        document.body.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both';
        setTimeout(function () { document.body.style.animation = ''; }, 520);
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
var _ki = 0;
document.addEventListener('keydown', function (e) {
    if (!config || !config.konamiCode) return;
    var kc = config.konamiCode;
    if (e.key.toLowerCase() === kc[_ki].toLowerCase()) {
        _ki++;
        if (_ki === kc.length) {
            toggleSystemOverride(true);
            _ki = 0;
            var out = document.getElementById('cli-output');
            if (out) out.innerHTML += '<div style="color:var(--alert);font-weight:700;margin-bottom:4px;">&gt;&gt; KONAMI CODE DETECTED. CHAOS MODE ACTIVE.</div>';
        }
    } else { _ki = 0; }
});

/* ════════════════════════════════
   CLI TERMINAL
   NEW: tab autocomplete, neofetch, admin commands
════════════════════════════════ */
function initCLI() {
    var inp = document.getElementById('cli-input');
    var out = document.getElementById('cli-output');
    if (!inp || !out) return;

    var B = 'color:var(--accent)', G = 'color:#FFB83A', P = 'color:#FF6FAE';
    var E = 'color:#2EE89A',       R = 'color:var(--alert)';
    var S = 'color:#4E6490',       M = 'color:#283450';

    function nav(href, msg) { setTimeout(function () { location.href = href; }, 200); return '<span style="' + S + '">' + msg + '</span>'; }

    var cmds = {
        help: function () { return [
            '<span style="' + B + '">Commands:</span>',
            '  <span style="' + G + '">about</span>    navigation',
            '  <span style="' + G + '">skills</span>   system specs',
            '  <span style="' + G + '">projects</span> mission reports',
            '  <span style="' + G + '">reviews</span>  field reports',
            '  <span style="' + G + '">hire</span>     contact',
            '  <span style="' + G + '">date</span>     timestamp',
            '  <span style="' + G + '">whoami</span>   identify',
            '  <span style="' + G + '">status</span>   system status',
            '  <span style="' + G + '">neofetch</span> sysinfo',
            '  <span style="' + G + '">coffee</span>   critical cmd',
            '  <span style="' + G + '">uwu</span>      please dont',
            '  <span style="' + G + '">sudo</span>     nice try',
            '  <span style="' + G + '">clear</span>    clear terminal',
            '  <span style="' + M + '">(secrets hidden in the dark)</span>',
        ].join('<br>'); },
        about:    function () { return nav('#file',     'Navigating to personnel file...'); },
        skills:   function () { return nav('#skills',   'Loading system specs...'); },
        projects: function () { return nav('#projects', 'Accessing mission reports...'); },
        reviews:  function () { return nav('#reviews',  'Loading field reports...'); },
        hire:     function () { return nav('#contact',  'Opening MomoTalk...'); },
        date:     function () { return '<span style="' + S + '">[' + new Date().toLocaleString() + ']</span>'; },
        whoami:   function () { return '<span style="' + S + '">Guest &middot; Level 1 &middot; Node: Kivotos-Alpha &middot; IP: 127.0.0.1</span>'; },
        status:   function () { return _override
            ? '<span style="' + R + '">CRITICAL &mdash; Override active.</span>'
            : '<span style="' + E + '">check NOMINAL &mdash; All nodes green. For now.</span>'; },

        neofetch: function () { return [
            '<span style="' + B + '">  WATER</span>@<span style="' + B + '">kivotos</span>',
            '  OS: KivotOS x64 &middot; Host: SCHALE.DB v4.0',
            '  Shell: bash (certified bad decisions)',
            '  CPU: Galaxy brain (2 cores, 0 free)',
            '  RAM: 16GB (14.9GB used by Chrome)',
            '  Uptime: way too long',
            '  Coffee: CRITICAL LOW',
            '  Bugs: 0 (official count)',
            '  <span style="color:#FF4455;">&#x25CF;</span><span style="color:#FFB83A;">&#x25CF;</span><span style="color:#2EE89A;">&#x25CF;</span><span style="color:#1AA8FF;">&#x25CF;</span><span style="color:#a855f7;">&#x25CF;</span><span style="color:#FF6FAE;">&#x25CF;</span>',
        ].join('<br>'); },

        coffee: function () { return [
            '<span style="' + G + '">Brewing...</span>',
            '<span style="' + S + '">Caffeine: 9000mg. Productivity boost: marginal.</span>',
            '<span style="' + S + '">Bugs fixed post-coffee: still 0.</span>',
        ].join('<br>'); },

        uwu: function () { return [
            '<span style="' + P + '">UwU what\'s this?? a stwange tewminal??</span>',
            '<span style="' + P + '">*nuzzles ur datacentew* OwO</span>',
            '<span style="' + M + '">[ this was a mistake. deeply sorry. ]</span>',
        ].join('<br>'); },

        sudo: function () { return [
            '<span style="' + R + '">sudo: Permission denied.</span>',
            '<span style="' + S + '">Incident reported. (it wasn\'t) 5/10 for effort.</span>',
        ].join('<br>'); },

        hack: function () { return [
            '<span style="' + E + '">INITIATING HACK SEQUENCE...</span>',
            '<span style="' + S + '">Bypassing mainframe... &#x2588;&#x2588;&#x2588;&#x2588;&#x2588;&#x2588;&#x2588;&#x2588;&#x2591;&#x2591;</span>',
            '<span style="' + R + '">ERROR: This is a portfolio. Nothing to hack.</span>',
            '<span style="' + S + '">Respectfully: nice try, Mr Robot.</span>',
        ].join('<br>'); },

        clear: function () { out.innerHTML = ''; return null; },

        ls:             function () { return '<span style="' + S + '">about/&nbsp; skills/&nbsp; projects/&nbsp; reviews/&nbsp; contact/&nbsp; secret_bugs/&nbsp; TODO_never_fix/</span>'; },
        'cat readme.md':function () { return '<span style="' + S + '">README: "portfolio built at 2am. please hire."</span>'; },
        cat:            function () { return '<span style="' + S + '">cat: specify file. try: cat readme.md</span>'; },
        'ls -la':       function () { return '<span style="' + S + '">drwx------ sensei sensei 4096 Jan 1 2025 .<br>-rw-r--r-- sensei sensei 1337 Jan 1 2025 secrets.txt<br>-rw-r--r-- sensei sensei  666 Jan 1 2025 bugs_i_caused.log<br>-rwxr-xr-x sensei sensei  404 Jan 1 2025 TODO (empty)</span>'; },
        'cd ..':        function () { return '<span style="' + S + '">you cannot leave. this is your home now.</span>'; },
        exit:           function () { return '<span style="' + S + '">lol no</span>'; },
        vim:            function () { return '<span style="' + S + '">I know how to exit vim. I choose not to.</span>'; },
        'git blame':    function () { return '<span style="' + S + '">git blame: Water (100% of commits, 100% of bugs)</span>'; },
        'git commit':   function () { return '<span style="' + S + '">git commit -m "fixed a thing, broke 3 others"</span>'; },
        'git push':     function () { return '<span style="' + R + '">remote: Permission denied (this isn\'t your repo)</span>'; },
        'npm install':  function () { return '<span style="' + S + '">added 2,847 packages. 3 vulnerabilities. node_modules: 850MB.</span>'; },
        rm:             function () { return '<span style="' + R + '">the site lives. you cannot delete it from here.</span>'; },
        penis:          function () { return '<span style="' + S + '">bruh</span>'; },
        ping:           function () { return '<span style="' + E + '">PONG &mdash; 1ms (it\'s localhost obviously)</span>'; },
        whoops:         function () { return '<span style="' + G + '">we\'ve all been there</span>'; },
        uname:          function () { return '<span style="' + S + '">KivotOS 5.15.0-schale x86_64 GNU/Luau</span>'; },
        pwd:            function () { return '<span style="' + S + '">/home/sensei/schale.db/portfolio</span>'; },
        'touch grass':  function () { return '<span style="' + E + '">check Grass touched. Achievement unlocked. Rare event.</span>'; },

        // ── ADMIN (PIN-gated) ─────────────────────────────────
        'reviews clear': function () {
            var pin = prompt('Admin PIN required:');
            if (!pin || pin !== ((config && config.adminPin) || 'water2025')) return '<span style="' + R + '">Access denied.</span>';
            if (typeof adminClearUserReviews === 'function') adminClearUserReviews();
            return '<span style="' + E + '">check User reviews cleared. Seed reviews preserved.</span>';
        },
        'pfp reset': function () {
            var pin = prompt('Admin PIN required:');
            if (!pin || pin !== ((config && config.adminPin) || 'water2025')) return '<span style="' + R + '">Access denied.</span>';
            if (typeof adminResetPfp === 'function') adminResetPfp();
            return '<span style="' + E + '">check Profile picture reset.</span>';
        },
    };

    var allCmdKeys = Object.keys(cmds);
    var SASSY = [
        function (c) { return 'Command not found: "' + c + '". Try "help". Probably.'; },
        function (c) { return '"' + c + '" &mdash; never heard of it. Type "help".'; },
        function (c) { return 'bash: ' + c + ': command not found. skill issue detected.'; },
        function (c) { return '[' + c + ']: unknown. Have you tried turning it off and on again?'; },
    ];

    inp.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            var partial = this.value.toLowerCase().trim();
            if (!partial) return;
            var match = allCmdKeys.find(function (k) { return k.startsWith(partial); });
            if (match) this.value = match;
        }
    });

    inp.addEventListener('keypress', function (e) {
        if (e.key !== 'Enter') return;
        var raw = this.value.trim();
        var cmd = raw.toLowerCase();
        if (!cmd) return;
        playClick(1200, 0.05);
        out.innerHTML += '<div style="margin-bottom:2px;"><span style="' + B + '">visitor@schale:~$</span> <span style="color:#8a9ec0">' + raw + '</span></div>';
        var handler = cmds[cmd];
        if (handler !== undefined) {
            var res = typeof handler === 'function' ? handler() : handler;
            if (res) out.innerHTML += '<div style="margin-bottom:6px;">' + res + '</div>';
        } else {
            var fn = SASSY[Math.floor(Math.random() * SASSY.length)];
            out.innerHTML += '<div style="' + R + ';margin-bottom:6px;">' + fn(cmd) + '</div>';
        }
        this.value = '';
        out.scrollTop = out.scrollHeight;
    });
}

/* ════════════════════════════════
   CARD SPOTLIGHT
════════════════════════════════ */
function initCardSpotlight() {
    document.querySelectorAll('.glass-card').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            var r = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', (e.clientX - r.left) + 'px');
            card.style.setProperty('--mouse-y', (e.clientY - r.top)  + 'px');
        });
    });
}

/* ════════════════════════════════
   LOGO EASTER EGG
   BUG FIX: resets ALL 5 accent vars
════════════════════════════════ */
function initLogoEasterEgg() {
    var logo = document.querySelector('[data-logo-egg]');
    if (!logo) return;
    var n = 0, t;
    logo.addEventListener('click', function () {
        n++; clearTimeout(t);
        t = setTimeout(function () { n = 0; }, 2200);
        if (n >= 7) {
            n = 0;
            showToast('Logo clicked 7x &mdash; Achievement: "No Life"');
            playClick(440, 0.5);
            var i = 0;
            var cols = ['#FF4455','#FFB83A','#2EE89A','#1AA8FF','#a855f7','#FF6FAE'];
            var iv = setInterval(function () {
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
