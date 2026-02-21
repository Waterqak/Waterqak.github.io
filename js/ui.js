/* ============================================================
   UI.JS — All UI logic: boot, terminal, particles, overrides
   ============================================================ */

// ── BOOT SEQUENCE ────────────────────────────────────────────

function startExperience() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playClick(880, 0.3);
    const overlay = document.getElementById('start-overlay');
    overlay.classList.add('animate-crt-off');
    setTimeout(() => {
        overlay.style.display = 'none';
        const bgm = document.getElementById('bgm');
        bgm.src    = config.bgmUrl;
        bgm.volume = config.volume;
        bgm.play().catch(() => {});
    }, 500);
}

function runBootSequence() {
    const container = document.getElementById('boot-log-container');
    const checks    = ["BIOS_CHECK", "MEMORY_INTEGRITY", "NETWORK_UPLINK", "SECURITY_PROTOCOL"];
    let i = 0;
    function next() {
        if (i < checks.length) {
            const div = document.createElement('div');
            div.className = 'boot-status-line';
            div.innerHTML = `<span>${checks[i]}...</span><span class="check">OK</span>`;
            container.appendChild(div);
            playClick(800 + i * 100, 0.05);
            i++;
            setTimeout(next, 300);
        } else {
            setTimeout(() => {
                document.getElementById('connect-btn').classList.remove('opacity-0', 'translate-y-4');
            }, 400);
        }
    }
    setTimeout(next, 500);
}

// ── LOCAL STORAGE ────────────────────────────────────────────

function initLocalSystem() {
    // Restore saved profile picture
    const pfp = localStorage.getItem('schale_db_pfp');
    if (pfp) {
        const img = document.getElementById('avatar-img');
        const ph  = document.getElementById('avatar-placeholder');
        img.src = pfp;
        img.classList.remove('hidden');
        ph.classList.add('hidden');
    }

    // Simulated visitor counter
    let visits = parseInt(localStorage.getItem('schale_db_visits') || '0');
    visits++;
    localStorage.setItem('schale_db_visits', visits);
    const total = config.visitorBase + Math.floor(Date.now() / 3_600_000) + visits;
    const el    = document.getElementById('visitor-count');
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

// ── TYPEWRITER ────────────────────────────────────────────────

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
            twTimeout = setTimeout(tick, 80);
        }
    }
    tick();
}

// ── MOBILE MENU ───────────────────────────────────────────────

function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('open');
}

// ── DISCORD COPY ──────────────────────────────────────────────

function copyDiscord() {
    navigator.clipboard.writeText(config.discordHandle).then(() => {
        const el   = document.getElementById('contact-discord-text');
        const orig = el.innerText;
        el.innerText = 'COPIED!';
        setTimeout(() => el.innerText = orig, 2000);
    });
}

// ── PARTICLES ─────────────────────────────────────────────────

function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    const ctx    = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const mouse     = { x: null, y: null };
    const particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,  y: Math.random() * canvas.height,
        s: Math.random() * 2,
        bx: Math.random() * canvas.width, by: Math.random() * canvas.height,
    }));

    window.addEventListener('mousemove', e => { mouse.x = e.x; mouse.y = e.y; });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
        particles.forEach(p => {
            const dx = mouse.x - p.x, dy = mouse.y - p.y;
            const d  = Math.sqrt(dx * dx + dy * dy);
            if (d < 100) { p.x -= dx / d; p.y -= dy / d; }
            else {
                if (p.x !== p.bx) p.x -= (p.x - p.bx) / 20;
                if (p.y !== p.by) p.y -= (p.y - p.by) / 20;
            }
            ctx.globalAlpha = 0.5;
            ctx.fillRect(p.x, p.y, p.s, p.s);
        });
        requestAnimationFrame(draw);
    }
    draw();
}

window.addEventListener('resize', () => {
    const canvas = document.getElementById('particles-canvas');
    if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
});

// ── SYSTEM OVERRIDE ───────────────────────────────────────────

let isOverride = false;

function toggleSystemOverride(force = null) {
    if (force !== null) isOverride = !force;
    isOverride = !isOverride;

    const root = document.documentElement;
    const st   = document.getElementById('system-status-text');
    const sd   = document.getElementById('status-dot');
    const sp   = document.getElementById('status-ping');

    if (isOverride) {
        root.style.setProperty('--accent-color', '#FF4F4F');
        document.body.classList.add('animate-shake');
        setTimeout(() => document.body.classList.remove('animate-shake'), 500);
        st.innerText = 'SYSTEM CRITICAL';
        st.classList.replace('text-green-500', 'text-red-500');
        sd.classList.replace('bg-green-500',   'bg-red-500');
        sp.classList.replace('bg-green-500',   'bg-red-500');
        playClick(150, 0.5);
    } else {
        root.style.setProperty('--accent-color', '#00A4FF');
        st.innerText = 'SYSTEM ONLINE';
        st.classList.replace('text-red-500', 'text-green-500');
        sd.classList.replace('bg-red-500',   'bg-green-500');
        sp.classList.replace('bg-red-500',   'bg-green-500');
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
            if (out) out.innerHTML += `<div class="text-red-500 font-bold mb-2">>> KONAMI CODE DETECTED. OVERRIDE AUTHORIZED.</div>`;
        }
    } else {
        konamiIdx = 0;
    }
});

// ── TERMINAL (CLI) ────────────────────────────────────────────

function initCLI() {
    const inp = document.getElementById('cli-input');
    const out = document.getElementById('cli-output');
    if (!inp) return;

    const commands = {
        help:     'Available commands: help, clear, about, skills, projects, date, whoami',
        about:    'Navigating to personnel file...',
        skills:   'Loading system specifications...',
        projects: 'Accessing mission reports...',
        date:     () => new Date().toLocaleString(),
        whoami:   'User: Guest [Access Level: 1]',
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
            if (cmd === 'about')    location.href = '#file';
            if (cmd === 'skills')   location.href = '#skills';
            if (cmd === 'projects') location.href = '#projects';
        } else {
            out.innerHTML += `<div class="text-red-400 mb-2">Command not found: ${cmd}</div>`;
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
