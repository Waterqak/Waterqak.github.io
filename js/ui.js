/* ============================================================
   UI.JS v3.0 — Animations, Easter Eggs, Micro-interactions
   ============================================================ */

// ── CONSOLE ART (for devs who open devtools) ─────────────────
(function(){
    const s = [
        '%c',
        '  ██╗    ██╗ █████╗ ████████╗███████╗██████╗',
        '  ██║    ██║██╔══██╗╚══██╔══╝██╔════╝██╔══██╗',
        '  ██║ █╗ ██║███████║   ██║   █████╗  ██████╔╝',
        '  ██║███╗██║██╔══██║   ██║   ██╔══╝  ██╔══██╗',
        '  ╚███╔███╔╝██║  ██║   ██║   ███████╗██║  ██║',
        '   ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝',
        '',
        '  👋 Oh hey, a dev! Found the secret console!',
        '  🐛 If you find any bugs, they\'re features.',
        '  ☕ Built with: Lua knowledge + too much coffee + sleep deprivation',
        '  📝 Estimated bugs in this codebase: 0 (trust me)',
        '',
        '  — Water, age 15, somehow doing this professionally',
        '',
    ].join('\n');
    setTimeout(() => console.log(s, 'color:#00A4FF;font-family:monospace;font-size:11px;'), 1000);
})();

// ── BOOT SEQUENCE ────────────────────────────────────────────

function startExperience() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playClick(880, 0.3);
    const overlay = document.getElementById('start-overlay');
    overlay.style.animation = 'crtOff 0.5s forwards';
    setTimeout(() => {
        overlay.style.display = 'none';
        const bgm = document.getElementById('bgm');
        bgm.src = config.bgmUrl;
        bgm.volume = config.volume;
        bgm.play().catch(() => {});
    }, 480);
}

function runBootSequence() {
    const container = document.getElementById('boot-log-container');
    const checks = [
        { label: "BIOS_CHECK",                     status: "OK",   color: "#00ff88" },
        { label: "MEMORY_INTEGRITY",                status: "OK",   color: "#00ff88" },
        { label: "CHECKING_IF_SENSEI_IS_AWAKE",     status: "YES",  color: "#00A4FF" },
        { label: "LOADING_COPE_RESERVES",           status: "FULL", color: "#FFA800" },
        { label: "COUNTING_BUGS_IN_CODEBASE",       status: "0 ✓",  color: "#00ff88" },
        { label: "NETWORK_UPLINK",                  status: "OK",   color: "#00ff88" },
        { label: "VIRUS_DETECTED",                  status: "...",  color: "#FF4F4F" },
        { label: "just kidding lol",                status: "haha", color: "#888" },
        { label: "SCHALE_DB_MOUNT",                 status: "OK",   color: "#00ff88" },
    ];
    let i = 0;
    function next() {
        if (i < checks.length) {
            const div = document.createElement('div');
            div.className = 'boot-status-line';
            div.innerHTML = `<span>${checks[i].label}...</span><span class="check" style="color:${checks[i].color}">${checks[i].status}</span>`;
            container.appendChild(div);
            playClick(800 + i * 60, 0.04);
            i++;
            setTimeout(next, i === 7 ? 600 : 240); // pause on "VIRUS_DETECTED"
        } else {
            setTimeout(() => {
                document.getElementById('connect-btn').classList.remove('opacity-0', 'translate-y-4');
            }, 350);
        }
    }
    setTimeout(next, 400);
}

// ── LOCAL STORAGE ────────────────────────────────────────────

function initLocalSystem() {
    const pfp = localStorage.getItem('schale_db_pfp');
    if (pfp) {
        const img = document.getElementById('avatar-img');
        const ph  = document.getElementById('avatar-placeholder');
        img.src = pfp;
        img.classList.remove('hidden');
        ph.classList.add('hidden');
    }

    let visits = parseInt(localStorage.getItem('schale_db_visits') || '0');
    visits++;
    localStorage.setItem('schale_db_visits', visits);
    const total = config.visitorBase + Math.floor(Date.now() / 3_600_000) + visits;
    const el = document.getElementById('visitor-count');
    if (el) el.innerText = total.toLocaleString();
}

window.updateProfilePicture = () => {
    const url = prompt('Enter URL for your new profile picture:');
    if (url && (url.startsWith('http') || url.startsWith('data:image'))) {
        playClick(1000, 0.1);
        localStorage.setItem('schale_db_pfp', url);
        const img = document.getElementById('avatar-img');
        const ph  = document.getElementById('avatar-placeholder');
        img.src = url;
        img.classList.remove('hidden');
        ph.classList.add('hidden');
    }
};

// ── TYPEWRITER ───────────────────────────────────────────────

let twTimeout;
function typeWriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    if (twTimeout) clearTimeout(twTimeout);
    const isEN = document.getElementById('lang-display').innerText === 'EN';
    const text = isEN ? 'Broken Code.' : 'โค้ดที่พังครับ';
    let i = 0;
    el.innerText = '';
    function tick() {
        if (i < text.length) {
            el.innerHTML += text.charAt(i++);
            twTimeout = setTimeout(tick, 85);
        }
    }
    tick();
}

// ── TEXT SCRAMBLE ────────────────────────────────────────────

class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const len = Math.max(this.el.innerText.length, newText.length);
        const p   = new Promise(res => this.resolve = res);
        this.queue = [];
        for (let i = 0; i < len; i++) {
            const from  = this.el.innerText[i] || '';
            const to    = newText[i] || '';
            const start = Math.floor(Math.random() * 20);
            const end   = start + Math.floor(Math.random() * 20);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameReq);
        this.frame = 0;
        this.update();
        return p;
    }
    update() {
        let output = '', done = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                done++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.chars[Math.floor(Math.random() * this.chars.length)];
                    this.queue[i].char = char;
                }
                output += `<span style="color:var(--accent);opacity:0.6">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (done === this.queue.length) {
            this.resolve();
        } else {
            this.frameReq = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
}

function initScrambleHeadings() {
    const headings = document.querySelectorAll('[data-scramble]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.getAttribute('data-scramble');
                const fx = new TextScramble(el);
                fx.setText(text);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    headings.forEach(h => observer.observe(h));
}

// ── CURSOR TRAIL ─────────────────────────────────────────────

function initCursorTrail() {
    if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch
    const dots = [];
    const N = 12;
    for (let i = 0; i < N; i++) {
        const d = document.createElement('div');
        d.className = 'cursor-dot';
        d.style.cssText = `position:fixed;pointer-events:none;z-index:9999;border-radius:50%;transition:transform 0.1s;`;
        document.body.appendChild(d);
        dots.push({ el: d, x: 0, y: 0 });
    }
    let mx = 0, my = 0;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    let frame;
    function animate() {
        let x = mx, y = my;
        dots.forEach((dot, i) => {
            const prev = dots[i - 1] || { x: mx, y: my };
            dot.x += (prev.x - dot.x) * 0.45;
            dot.y += (prev.y - dot.y) * 0.45;
            const size = Math.max(2, 6 - i * 0.4);
            const alpha = Math.max(0, 0.5 - i * 0.04);
            dot.el.style.cssText = `position:fixed;pointer-events:none;z-index:9999;border-radius:50%;
                width:${size}px;height:${size}px;
                background:rgba(0,164,255,${alpha});
                left:${dot.x - size/2}px;top:${dot.y - size/2}px;
                box-shadow:0 0 ${size*2}px rgba(0,164,255,${alpha*0.5});`;
        });
        frame = requestAnimationFrame(animate);
    }
    animate();
}

// ── MAGNETIC BUTTONS ──────────────────────────────────────────

function initMagneticButtons() {
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top  + rect.height / 2;
            const dx = (e.clientX - cx) * 0.25;
            const dy = (e.clientY - cy) * 0.25;
            btn.style.transform = `translate(${dx}px, ${dy}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0,0)';
            btn.style.transition = 'transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275)';
        });
        btn.addEventListener('mouseenter', () => {
            btn.style.transition = 'transform 0.1s';
        });
    });
}

// ── CARD TILT ─────────────────────────────────────────────────

function initCardTilt() {
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width  / 2;
            const cy = rect.top  + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width  / 2);
            const dy = (e.clientY - cy) / (rect.height / 2);
            const rx = dy * -8;
            const ry = dx *  8;
            card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s cubic-bezier(0.175,0.885,0.32,1.275)';
            card.style.transform  = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        });
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s';
        });
    });
}

// ── RIPPLE EFFECT ────────────────────────────────────────────

function addRipple(e) {
    const btn  = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    const y    = e.clientY - rect.top;
    const r    = document.createElement('span');
    r.style.cssText = `position:absolute;border-radius:50%;transform:scale(0);
        animation:ripple-anim 0.55s linear;pointer-events:none;
        left:${x}px;top:${y}px;width:80px;height:80px;margin:-40px 0 0 -40px;
        background:rgba(255,255,255,0.2);z-index:100;`;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(r);
    setTimeout(() => r.remove(), 600);
}

function initRippleButtons() {
    document.querySelectorAll('[data-ripple]').forEach(btn => {
        btn.addEventListener('click', addRipple);
    });
}

// ── TOOLTIP SYSTEM ────────────────────────────────────────────

let tooltipEl;
function initTooltips() {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'global-tooltip';
    tooltipEl.style.cssText = `
        position:fixed;z-index:10000;pointer-events:none;
        background:rgba(10,12,16,0.95);border:1px solid rgba(255,255,255,0.1);
        color:#e4e6ef;font-size:11px;font-family:'JetBrains Mono',monospace;
        padding:6px 12px;border-radius:6px;
        box-shadow:0 8px 24px rgba(0,0,0,0.5);
        opacity:0;transition:opacity 0.15s;white-space:nowrap;
        pointer-events:none;
    `;
    document.body.appendChild(tooltipEl);

    document.querySelectorAll('[data-tip]').forEach(el => {
        el.addEventListener('mouseenter', e => {
            tooltipEl.innerText = el.getAttribute('data-tip');
            tooltipEl.style.opacity = '1';
        });
        el.addEventListener('mousemove', e => {
            tooltipEl.style.left = `${e.clientX + 14}px`;
            tooltipEl.style.top  = `${e.clientY - 6}px`;
        });
        el.addEventListener('mouseleave', () => {
            tooltipEl.style.opacity = '0';
        });
    });
}

// ── LIVE UPTIME COUNTER ──────────────────────────────────────

function initUptimeCounter() {
    const el = document.getElementById('uptime-counter');
    if (!el) return;
    const start = Date.now() - (Math.random() * 1000 * 60 * 60 * 24 * 3); // fake 0-3 days uptime
    function tick() {
        const diff = Date.now() - start;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        el.innerText = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    tick();
    setInterval(tick, 1000);
}

// ── RANDOM "BUG FIXED" TOAST ─────────────────────────────────

const funnyToasts = [
    "✓ Fixed a memory leak. Probably.",
    "⚡ Optimized loop by 0.003ms. Huge.",
    "🐛 Bug squashed. It had a family.",
    "☕ Coffee consumed. Productivity +20%",
    "📦 Dependency updated. Nothing broke. Wow.",
    "🎯 Null check added. Just in case.",
    "💾 Data saved. Pinky promise.",
    "🔐 Anti-exploit updated. Take that, exploiters.",
    "🤔 TODO comment written. Won't fix.",
    "🚀 Deployed to production. No tests. YOLO.",
];
let toastCooldown = false;

function showFunnyToast(msg) {
    if (toastCooldown) return;
    toastCooldown = true;
    setTimeout(() => toastCooldown = false, 8000);

    const toast = document.createElement('div');
    toast.style.cssText = `
        position:fixed;bottom:24px;right:24px;z-index:9998;
        background:rgba(10,12,16,0.96);border:1px solid rgba(0,164,255,0.25);
        color:#e4e6ef;font-size:11px;font-family:'JetBrains Mono',monospace;
        padding:12px 20px;border-radius:10px;
        box-shadow:0 8px 32px rgba(0,0,0,0.6),0 0 0 1px rgba(0,164,255,0.05);
        transform:translateY(20px) scale(0.95);opacity:0;
        transition:all 0.35s cubic-bezier(0.175,0.885,0.32,1.275);
        max-width:280px;line-height:1.5;
        border-left:3px solid var(--accent);
    `;
    toast.innerHTML = `<div style="color:var(--accent);font-size:9px;letter-spacing:0.1em;margin-bottom:3px;">SCHALE.DB NOTIFICATION</div>${msg}`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0) scale(1)';
            toast.style.opacity   = '1';
        });
    });
    setTimeout(() => {
        toast.style.transform = 'translateY(20px) scale(0.95)';
        toast.style.opacity   = '0';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

function startRandomToasts() {
    // Show first one after 6 seconds, then random intervals
    setTimeout(() => {
        showFunnyToast(funnyToasts[Math.floor(Math.random() * funnyToasts.length)]);
        setInterval(() => {
            if (Math.random() > 0.5) {
                showFunnyToast(funnyToasts[Math.floor(Math.random() * funnyToasts.length)]);
            }
        }, 25000);
    }, 6000);
}

// ── PARTICLES (connecting lines) ─────────────────────────────

function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    const mouse = { x: null, y: null };
    let particles = [];
    function createParticles() {
        const count = Math.min(55, Math.floor(window.innerWidth / 22));
        particles = Array.from({ length: count }, () => ({
            x:  Math.random() * canvas.width,
            y:  Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            s:  Math.random() * 1.5 + 0.5,
        }));
    }
    createParticles();
    window.addEventListener('mousemove', e => { mouse.x = e.x; mouse.y = e.y; });
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height)  p.vy *= -1;
            if (mouse.x !== null) {
                const dx = mouse.x - p.x, dy = mouse.y - p.y;
                const d = Math.sqrt(dx*dx + dy*dy);
                if (d < 110) { p.x -= (dx/d)*1.8; p.y -= (dy/d)*1.8; }
            }
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = 'rgba(0,164,255,0.9)';
            ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI*2); ctx.fill();
            for (let j = i+1; j < particles.length; j++) {
                const q = particles[j];
                const dx = p.x-q.x, dy = p.y-q.y;
                const d = Math.sqrt(dx*dx+dy*dy);
                if (d < 120) {
                    ctx.globalAlpha = (1 - d/120) * 0.1;
                    ctx.strokeStyle = 'rgba(0,164,255,1)';
                    ctx.lineWidth = 0.6;
                    ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
                }
            }
        });
        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener('resize', () => { resize(); createParticles(); });
}

// ── ACTIVE NAV TRACKING ──────────────────────────────────────

function initActiveNav() {
    const sections = document.querySelectorAll('section[id], header[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href').slice(1) === id);
                });
            }
        });
    }, { rootMargin: '-35% 0px -60% 0px' });
    sections.forEach(s => observer.observe(s));
}

// ── SKILL BAR ANIMATION ──────────────────────────────────────

function initSkillBars() {
    const bars = document.querySelectorAll('.skill-bar-fill');
    if (!bars.length) return;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const target = fill.getAttribute('data-width');
                setTimeout(() => { fill.style.width = target; fill.classList.add('animated'); }, 150);
                observer.unobserve(fill);
            }
        });
    }, { threshold: 0.2 });
    bars.forEach(b => observer.observe(b));
}

// ── COUNTER ANIMATION ────────────────────────────────────────

function animateCounter(el, target, duration = 1600, suffix = '') {
    el._startTime = null;
    const step = ts => {
        if (!el._startTime) el._startTime = ts;
        const p = Math.min((ts - el._startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.innerText = Math.floor(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                animateCounter(el, parseInt(el.getAttribute('data-counter')), 1600, el.getAttribute('data-suffix') || '');
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
}

// ── NAV SCROLL STYLE ──────────────────────────────────────────

function initNavScroll() {
    const nav = document.querySelector('.nav-bar');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
}

// ── MOBILE MENU ───────────────────────────────────────────────

function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('open');
}

// ── DISCORD COPY ──────────────────────────────────────────────

function copyDiscord() {
    navigator.clipboard.writeText(config.discordHandle).then(() => {
        const el = document.getElementById('contact-discord-text');
        const orig = el.innerText;
        el.innerText = 'COPIED! ✓';
        showFunnyToast('📋 Discord username copied! Don\'t be a stranger.');
        setTimeout(() => el.innerText = orig, 2000);
    });
}

// ── SYSTEM OVERRIDE ───────────────────────────────────────────

let isOverride = false;
function toggleSystemOverride(force = null) {
    if (force !== null) isOverride = !force;
    isOverride = !isOverride;
    const root = document.documentElement;
    const st = document.getElementById('system-status-text');
    const sd = document.getElementById('status-dot');
    const sp = document.getElementById('status-ping');
    const badge = document.querySelector('.hero-badge');
    if (isOverride) {
        root.style.setProperty('--accent', '#FF4F4F');
        root.style.setProperty('--accent-dim', 'rgba(255,79,79,0.1)');
        root.style.setProperty('--accent-glow', 'rgba(255,79,79,0.35)');
        document.body.classList.add('animate-shake');
        setTimeout(() => document.body.classList.remove('animate-shake'), 500);
        st.innerText = 'SYSTEM CRITICAL';
        ['text-green-500','text-schale'].forEach(c => st.classList.remove(c)); st.classList.add('text-red-500');
        ['bg-green-500'].forEach(c => sd.classList.remove(c)); sd.classList.add('bg-red-500');
        ['bg-green-500'].forEach(c => sp.classList.remove(c)); sp.classList.add('bg-red-500');
        badge?.classList.add('critical');
        playClick(150, 0.5);
        showFunnyToast('🚨 SYSTEM CRITICAL — sensei please help');
    } else {
        root.style.setProperty('--accent', '#00A4FF');
        root.style.setProperty('--accent-dim', 'rgba(0,164,255,0.1)');
        root.style.setProperty('--accent-glow', 'rgba(0,164,255,0.35)');
        st.innerText = 'SYSTEM ONLINE';
        ['text-red-500'].forEach(c => st.classList.remove(c)); st.classList.add('text-green-500');
        ['bg-red-500'].forEach(c => sd.classList.remove(c)); sd.classList.add('bg-green-500');
        ['bg-red-500'].forEach(c => sp.classList.remove(c)); sp.classList.add('bg-green-500');
        badge?.classList.remove('critical');
        playClick(1200, 0.3);
    }
}

// ── KONAMI CODE ───────────────────────────────────────────────

let konamiIdx = 0;
document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === config.konamiCode[konamiIdx].toLowerCase()) {
        konamiIdx++;
        if (konamiIdx === config.konamiCode.length) {
            toggleSystemOverride(true);
            konamiIdx = 0;
            const out = document.getElementById('cli-output');
            if (out) out.innerHTML += `<div class="text-red-500 font-bold mb-2">>> KONAMI CODE DETECTED. AUTHORIZATION GRANTED. CHAOS MODE ENABLED.</div>`;
        }
    } else { konamiIdx = 0; }
});

// ── TERMINAL / CLI ────────────────────────────────────────────

function initCLI() {
    const inp = document.getElementById('cli-input');
    const out = document.getElementById('cli-output');
    if (!inp) return;

    const commands = {
        help: () => [
            '<span style="color:var(--accent)">Available commands:</span>',
            '  <span style="color:#FFA800">about</span>  · · navigate to personnel file',
            '  <span style="color:#FFA800">skills</span> · · view system specs',
            '  <span style="color:#FFA800">projects</span>· view mission reports',
            '  <span style="color:#FFA800">reviews</span>· view field reports',
            '  <span style="color:#FFA800">date</span>   · · current timestamp',
            '  <span style="color:#FFA800">whoami</span> · · identify current user',
            '  <span style="color:#FFA800">status</span> · · system status check',
            '  <span style="color:#FFA800">hire</span>   · · open contact section',
            '  <span style="color:#FFA800">coffee</span> · · very important command',
            '  <span style="color:#FFA800">uwu</span>    · · ...',
            '  <span style="color:#FFA800">sudo</span>   · · elevate privileges (not really)',
            '  <span style="color:#FFA800">clear</span>  · · clear terminal',
        ].join('<br>'),
        about:    () => { setTimeout(() => location.href='#file',200);    return '<span style="color:#888">Navigating to personnel file...</span>'; },
        skills:   () => { setTimeout(() => location.href='#skills',200);  return '<span style="color:#888">Loading system specifications...</span>'; },
        projects: () => { setTimeout(() => location.href='#projects',200);return '<span style="color:#888">Accessing mission reports...</span>'; },
        reviews:  () => { setTimeout(() => location.href='#reviews',200); return '<span style="color:#888">Loading field reports...</span>'; },
        hire:     () => { setTimeout(() => location.href='#contact',200); return '<span style="color:#FFA8C5">Opening MomoTalk... sensei is waiting.</span>'; },
        date:     () => `<span style="color:#888">[${new Date().toLocaleString()}]</span>`,
        whoami:   () => `<span style="color:#888">User: Guest · Access Level: 1 · Node: Kivotos-Alpha · IP: definitely not logged</span>`,
        status:   () => isOverride
            ? '<span style="color:#FF4F4F">⚠ SYSTEM CRITICAL — Override Active. Sensei, please.</span>'
            : '<span style="color:#00ff88">✓ SYSTEM NOMINAL — All nodes green. Backend is behaving. For now.</span>',
        coffee:   () => [
            '<span style="color:#FFA800">Brewing coffee...</span>',
            '<span style="color:#888">☕ Current caffeine level: 9000mg</span>',
            '<span style="color:#888">📈 Estimated productivity boost: marginal</span>',
            '<span style="color:#888">🐛 Bugs fixed after coffee: probably 0</span>',
        ].join('<br>'),
        uwu:      () => [
            '<span style="color:#FFA8C5">UwU what\'s this?? a stwange tewminal??</span>',
            '<span style="color:#FFA8C5">*nuzzles ur datacenter* OwO</span>',
            '<span style="color:#888">[ this command was a mistake. i regret it. ]</span>',
        ].join('<br>'),
        sudo:     () => [
            '<span style="color:#FF4F4F">sudo: access denied.</span>',
            '<span style="color:#888">This incident has been reported. (it hasn\'t)</span>',
            '<span style="color:#888">Nice try though. 5/10 for effort.</span>',
        ].join('<br>'),
        hack:     () => [
            '<span style="color:#00ff88">INITIATING HACK SEQUENCE...</span>',
            '<span style="color:#888">Bypassing mainframe... ████████░░</span>',
            '<span style="color:#888">Accessing database... </span>',
            '<span style="color:#FF4F4F">ERROR: This is a portfolio site. There is nothing to hack.</span>',
            '<span style="color:#888">Nice try, Mr. Robot.</span>',
        ].join('<br>'),
        rm:       () => '<span style="color:#FF4F4F">nice try. the site lives. you cannot delete it with a terminal widget.</span>',
        clear:    () => { out.innerHTML = ''; return ''; },
    };
    // alias
    commands['ls']          = () => '<span style="color:#888">about/  skills/  projects/  reviews/  contact/  secret_bugs/  TODO_never_fix/</span>';
    commands['cat']         = () => '<span style="color:#888">cat: no file specified. try cat README.md</span>';
    commands['cat readme.md']= () => '<span style="color:#888">README.md: "this portfolio built at 2am. please hire."</span>';
    commands['cd ..']       = () => '<span style="color:#888">you cannot leave. this is your home now.</span>';
    commands['exit']        = () => '<span style="color:#888">lol no</span>';
    commands['vim']         = () => '<span style="color:#888">I know how to exit vim. I just choose not to.</span>';
    commands['git blame']   = () => '<span style="color:#888">git blame: Water (100% of commits)</span>';
    commands['npm install'] = () => '<span style="color:#888">node_modules: 847MB downloaded. 3 vulnerabilities found. Added 2,847 packages. good luck.</span>';
    commands['penis']       = () => '<span style="color:#888">bruh</span>';

    inp.addEventListener('keypress', function(e) {
        if (e.key !== 'Enter') return;
        const raw = this.value.trim();
        const cmd = raw.toLowerCase();
        if (!cmd) return;
        playClick(1200, 0.05);
        out.innerHTML += `<div><span style="color:var(--accent)">visitor@schale:~$</span> <span style="color:#ccc">${raw}</span></div>`;
        const handler = commands[cmd];
        if (handler !== undefined) {
            const response = typeof handler === 'function' ? handler() : handler;
            if (response) out.innerHTML += `<div class="mb-2">${response}</div>`;
        } else {
            const sass = [
                `Command not found: "${cmd}". Did you mean "help"? Probably not, but still.`,
                `"${cmd}" — never heard of it. Try "help" like a normal person.`,
                `bash: ${cmd}: command not found. skill issue.`,
            ];
            out.innerHTML += `<div style="color:#FF4F4F" class="mb-2">${sass[Math.floor(Math.random()*sass.length)]}</div>`;
        }
        this.value = '';
        out.scrollTop = out.scrollHeight;
    });
}

// ── CARD SPOTLIGHT ────────────────────────────────────────────

function initCardSpotlight() {
    document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
        });
    });
}

// ── LOGO EASTER EGG (click 7x) ────────────────────────────────

function initLogoEasterEgg() {
    const logo = document.querySelector('[data-logo-egg]');
    if (!logo) return;
    let clicks = 0, timer;
    logo.addEventListener('click', () => {
        clicks++;
        clearTimeout(timer);
        timer = setTimeout(() => clicks = 0, 2000);
        if (clicks >= 7) {
            clicks = 0;
            showFunnyToast('🎉 You clicked the logo 7 times. Achievement unlocked: "No life"');
            playClick(440, 0.5);
            // quick rainbow flash
            let i = 0;
            const colors = ['#FF4F4F','#FFA800','#00ff88','#00A4FF','#a855f7','#FF4F4F'];
            const iv = setInterval(() => {
                document.documentElement.style.setProperty('--accent', colors[i % colors.length]);
                i++;
                if (i > 12) { clearInterval(iv); document.documentElement.style.setProperty('--accent','#00A4FF'); }
            }, 120);
        }
    });
}

// ── SECTION REVEAL ANIMATION ──────────────────────────────────

function initSectionNumbers() {
    // Just ensure number labels exist — they're in the HTML
}
