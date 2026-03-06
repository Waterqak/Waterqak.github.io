/* ============================================================
   UI.JS v2.0 — Upgraded interactions & animations
   ============================================================ */

// ── BOOT SEQUENCE ───────────────────────────────────────────

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
        { label: "BIOS_CHECK",         status: "OK" },
        { label: "MEMORY_INTEGRITY",    status: "OK" },
        { label: "NETWORK_UPLINK",      status: "OK" },
        { label: "SECURITY_PROTOCOL",   status: "OK" },
        { label: "SCHALE_DB_MOUNT",     status: "OK" },
    ];
    let i = 0;
    function next() {
        if (i < checks.length) {
            const div = document.createElement('div');
            div.className = 'boot-status-line';
            div.innerHTML = `<span>${checks[i].label}...</span><span class="check">${checks[i].status}</span>`;
            container.appendChild(div);
            playClick(800 + i * 80, 0.05);
            i++;
            setTimeout(next, 260);
        } else {
            setTimeout(() => {
                const btn = document.getElementById('connect-btn');
                btn.classList.remove('opacity-0', 'translate-y-4');
            }, 350);
        }
    }
    setTimeout(next, 400);
}

// ── LOCAL STORAGE ───────────────────────────────────────────

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

// ── TYPEWRITER ──────────────────────────────────────────────

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

// ── MOBILE MENU ──────────────────────────────────────────────

function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('open');
}

// ── DISCORD COPY ─────────────────────────────────────────────

function copyDiscord() {
    navigator.clipboard.writeText(config.discordHandle).then(() => {
        const el   = document.getElementById('contact-discord-text');
        const orig = el.innerText;
        el.innerText = 'COPIED!';
        setTimeout(() => el.innerText = orig, 2000);
    });
}

// ── PARTICLES (with connecting lines) ───────────────────────

function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();

    const mouse = { x: null, y: null };
    let particles = [];

    function createParticles() {
        const count = Math.min(50, Math.floor(window.innerWidth / 24));
        particles = Array.from({ length: count }, () => ({
            x:  Math.random() * canvas.width,
            y:  Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            s:  Math.random() * 1.5 + 0.5,
        }));
    }
    createParticles();

    window.addEventListener('mousemove', e => { mouse.x = e.x; mouse.y = e.y; });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const accentRgb = '0,164,255';

        particles.forEach((p, i) => {
            // Move
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height)  p.vy *= -1;

            // Mouse repel
            if (mouse.x !== null) {
                const dx = mouse.x - p.x, dy = mouse.y - p.y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < 120) {
                    p.x -= (dx / d) * 1.5;
                    p.y -= (dy / d) * 1.5;
                }
            }

            // Draw dot
            ctx.globalAlpha = 0.55;
            ctx.fillStyle = `rgba(${accentRgb},0.8)`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
            ctx.fill();

            // Connect nearby particles
            for (let j = i + 1; j < particles.length; j++) {
                const q  = particles[j];
                const dx = p.x - q.x, dy = p.y - q.y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < 130) {
                    ctx.globalAlpha = (1 - d / 130) * 0.12;
                    ctx.strokeStyle = `rgba(${accentRgb},1)`;
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.stroke();
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
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    const href = link.getAttribute('href').slice(1);
                    link.classList.toggle('active', href === id);
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

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
                setTimeout(() => {
                    fill.style.width = target;
                    fill.classList.add('animated');
                }, 100);
                observer.unobserve(fill);
            }
        });
    }, { threshold: 0.2 });

    bars.forEach(bar => observer.observe(bar));
}

// ── COUNTER ANIMATION ────────────────────────────────────────

function animateCounter(el, target, duration = 1500, suffix = '') {
    const start = 0;
    const step = (timestamp) => {
        if (!el._startTime) el._startTime = timestamp;
        const progress = Math.min((timestamp - el._startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
        el.innerText = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el     = entry.target;
                const target = parseInt(el.getAttribute('data-counter'));
                const suffix = el.getAttribute('data-suffix') || '';
                el._startTime = null;
                animateCounter(el, target, 1400, suffix);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

// ── NAV SCROLL STYLE ─────────────────────────────────────────

function initNavScroll() {
    const nav = document.querySelector('.nav-bar');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
}

// ── SYSTEM OVERRIDE ──────────────────────────────────────────

let isOverride = false;

function toggleSystemOverride(force = null) {
    if (force !== null) isOverride = !force;
    isOverride = !isOverride;

    const root = document.documentElement;
    const st   = document.getElementById('system-status-text');
    const sd   = document.getElementById('status-dot');
    const sp   = document.getElementById('status-ping');
    const badge = document.querySelector('.hero-badge');

    if (isOverride) {
        root.style.setProperty('--accent', '#FF4F4F');
        root.style.setProperty('--accent-dim', 'rgba(255,79,79,0.1)');
        root.style.setProperty('--accent-glow', 'rgba(255,79,79,0.35)');
        document.body.classList.add('animate-shake');
        setTimeout(() => document.body.classList.remove('animate-shake'), 500);
        st.innerText = 'SYSTEM CRITICAL';
        st.className = st.className.replace('text-green-500', 'text-red-500');
        sd.className = sd.className.replace('bg-green-500', 'bg-red-500');
        sp.className = sp.className.replace('bg-green-500', 'bg-red-500');
        badge?.classList.add('critical');
        playClick(150, 0.5);
    } else {
        root.style.setProperty('--accent', '#00A4FF');
        root.style.setProperty('--accent-dim', 'rgba(0,164,255,0.1)');
        root.style.setProperty('--accent-glow', 'rgba(0,164,255,0.35)');
        st.innerText = 'SYSTEM ONLINE';
        st.className = st.className.replace('text-red-500', 'text-green-500');
        sd.className = sd.className.replace('bg-red-500', 'bg-green-500');
        sp.className = sp.className.replace('bg-red-500', 'bg-green-500');
        badge?.classList.remove('critical');
        playClick(1200, 0.3);
    }
}

// ── KONAMI CODE ──────────────────────────────────────────────

let konamiIdx = 0;
document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === config.konamiCode[konamiIdx].toLowerCase()) {
        konamiIdx++;
        if (konamiIdx === config.konamiCode.length) {
            toggleSystemOverride(true);
            konamiIdx = 0;
            const out = document.getElementById('cli-output');
            if (out) out.innerHTML += `<div class="text-red-500 font-bold mb-2">>> KONAMI CODE DETECTED. OVERRIDE AUTHORIZED.</div>`;
        }
    } else { konamiIdx = 0; }
});

// ── TERMINAL ─────────────────────────────────────────────────

function initCLI() {
    const inp = document.getElementById('cli-input');
    const out = document.getElementById('cli-output');
    if (!inp) return;

    const commands = {
        help:     'Commands: help, clear, about, skills, projects, reviews, date, whoami, status',
        about:    'Navigating to personnel file...',
        skills:   'Loading system specifications...',
        projects: 'Accessing mission reports...',
        reviews:  'Loading field reports...',
        date:     () => `[${new Date().toLocaleString()}]`,
        whoami:   'User: Guest [Access Level: 1] | Node: Kivotos-Alpha',
        status:   () => isOverride ? '⚠ SYSTEM CRITICAL — Override Active' : '✓ SYSTEM NOMINAL — All nodes online',
        clear:    () => { out.innerHTML = ''; return ''; },
    };

    inp.addEventListener('keypress', function(e) {
        if (e.key !== 'Enter') return;
        const cmd = this.value.toLowerCase().trim();
        if (!cmd) return;

        playClick(1200, 0.05);
        out.innerHTML += `<div><span class="text-schale">visitor@schale:~$</span> ${this.value}</div>`;

        if (commands[cmd] !== undefined) {
            const response = typeof commands[cmd] === 'function' ? commands[cmd]() : commands[cmd];
            if (response) out.innerHTML += `<div class="text-gray-400 mb-2">${response}</div>`;
            if (cmd === 'about')    { setTimeout(() => location.href = '#file',    200); }
            if (cmd === 'skills')   { setTimeout(() => location.href = '#skills',  200); }
            if (cmd === 'projects') { setTimeout(() => location.href = '#projects',200); }
            if (cmd === 'reviews')  { setTimeout(() => location.href = '#reviews', 200); }
        } else {
            out.innerHTML += `<div class="text-red-400 mb-2">Command not found: "${cmd}". Type 'help'.</div>`;
        }
        this.value = '';
        out.scrollTop = out.scrollHeight;
    });
}

// ── CARD SPOTLIGHT ───────────────────────────────────────────

function initCardSpotlight() {
    document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
        });
    });
}
