/* ============================================================
   ui.js — UI helpers: language toggle, typewriter, terminal,
           particles, system override, Konami code, misc utils
   ============================================================ */

// ── LOCAL STORAGE SYSTEM ─────────────────────────────────────

function initLocalSystem() {
    // Restore saved profile picture
    const savedPfp = localStorage.getItem('schale_db_pfp');
    if (savedPfp) {
        const img         = document.getElementById('avatar-img');
        const placeholder = document.getElementById('avatar-placeholder');
        if (img && placeholder) {
            img.src = savedPfp;
            img.classList.remove('hidden');
            placeholder.classList.add('hidden');
        }
    }

    // Simulated visitor counter
    let visits = parseInt(localStorage.getItem('schale_db_visits') || '0');
    visits++;
    localStorage.setItem('schale_db_visits', visits);
    const timeFactor = Math.floor(Date.now() / 3_600_000);
    const total      = config.visitorBase + timeFactor + visits;
    const counterEl  = document.getElementById('visitor-count');
    if (counterEl) counterEl.innerText = total.toLocaleString();
}

/** Prompt user for a new profile picture URL and persist it. */
window.updateProfilePicture = () => {
    const newUrl = prompt('Enter the URL for your new profile picture:');
    if (newUrl && (newUrl.startsWith('http') || newUrl.startsWith('data:image'))) {
        playClick(1000, 0.1);
        localStorage.setItem('schale_db_pfp', newUrl);
        const img         = document.getElementById('avatar-img');
        const placeholder = document.getElementById('avatar-placeholder');
        if (img && placeholder) {
            img.src = newUrl;
            img.classList.remove('hidden');
            placeholder.classList.add('hidden');
        }
    }
};

// ── TYPEWRITER ────────────────────────────────────────────────

let typeWriterTimeout;

function typeWriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    if (typeWriterTimeout) clearTimeout(typeWriterTimeout);

    const isEN = document.getElementById('lang-display').innerText === 'EN';
    const text = isEN ? 'Broken Code.' : 'โค้ดที่พังครับ';
    let i = 0;
    el.innerText = '';

    function tick() {
        if (i < text.length) {
            el.innerHTML += text.charAt(i++);
            typeWriterTimeout = setTimeout(tick, 80);
        }
    }
    tick();
}

// ── LANGUAGE TOGGLE ───────────────────────────────────────────

function toggleLanguage() {
    const display = document.getElementById('lang-display');
    const next    = display.innerText === 'EN' ? 'TH' : 'EN';
    display.innerText = next;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[next][key]) el.innerText = translations[next][key];
    });
    typeWriter();
}

// ── MOBILE MENU ───────────────────────────────────────────────

function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('open');
}

// ── CLOCK ─────────────────────────────────────────────────────

function updateTime() {
    const d = new Date(new Date().getTime() + (new Date().getTimezoneOffset() * 60000) + (3600000 * 7));
    const el = document.getElementById('local-time');
    if (el) {
        const h  = d.getHours();
        const m  = d.getMinutes().toString().padStart(2, '0');
        el.innerText = `${h}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
    }
}

// ── DISCORD COPY ──────────────────────────────────────────────

function copyDiscord() {
    navigator.clipboard.writeText(config.discordHandle).then(() => {
        const el   = document.getElementById('contact-discord-text');
        const orig = el.innerText;
        el.innerText = 'COPIED!';
        setTimeout(() => (el.innerText = orig), 2000);
    });
}

// ── PARTICLES ─────────────────────────────────────────────────

function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    const ctx    = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const mouse = { x: null, y: null };
    const particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,  y: Math.random() * canvas.height,
        s: Math.random() * 2,
        bx: Math.random() * canvas.width, by: Math.random() * canvas.height,
    }));

    window.addEventListener('mousemove', e => { mouse.x = e.x; mouse.y = e.y; });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--accent-color').trim();
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

// ── SYSTEM OVERRIDE (STATUS BADGE) ───────────────────────────

let isSystemOverride = false;

function toggleSystemOverride(forceOn = null) {
    if (forceOn !== null) { isSystemOverride = !forceOn; }
    isSystemOverride = !isSystemOverride;

    const root       = document.documentElement;
    const statusText = document.getElementById('system-status-text');
    const statusDot  = document.getElementById('status-dot');
    const statusPing = document.getElementById('status-ping');

    if (isSystemOverride) {
        root.style.setProperty('--accent-color', '#FF4F4F');
        document.body.classList.add('animate-shake');
        setTimeout(() => document.body.classList.remove('animate-shake'), 500);
        statusText.innerText = 'SYSTEM CRITICAL';
        statusText.classList.replace('text-green-500', 'text-red-500');
        statusDot.classList.replace('bg-green-500', 'bg-red-500');
        statusPing.classList.replace('bg-green-500', 'bg-red-500');
        playClick(150, 0.5);
    } else {
        root.style.setProperty('--accent-color', '#00A4FF');
        statusText.innerText = 'SYSTEM ONLINE';
        statusText.classList.replace('text-red-500', 'text-green-500');
        statusDot.classList.replace('bg-red-500', 'bg-green-500');
        statusPing.classList.replace('bg-red-500', 'bg-green-500');
        playClick(1200, 0.3);
    }
}

// ── KONAMI CODE ───────────────────────────────────────────────

let konamiIndex = 0;
document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === config.konamiCode[konamiIndex].toLowerCase()) {
        konamiIndex++;
        if (konamiIndex === config.konamiCode.length) {
            toggleSystemOverride(true);
            konamiIndex = 0;
            const out = document.getElementById('cli-output');
            if (out) out.innerHTML += `<div class="text-red-500 font-bold mb-2">>> KONAMI CODE DETECTED. OVERRIDE AUTHORIZED.</div>`;
        }
    } else {
        konamiIndex = 0;
    }
});

// ── INTERACTIVE TERMINAL (CLI) ────────────────────────────────

function initCLI() {
    const cliInput  = document.getElementById('cli-input');
    const cliOutput = document.getElementById('cli-output');
    if (!cliInput) return;

    const commands = {
        help:     'Available commands: help, clear, about, skills, projects, date, whoami',
        about:    'Navigating to personnel file...',
        skills:   'Loading system specifications...',
        projects: 'Accessing mission reports...',
        date:     () => new Date().toLocaleString(),
        whoami:   'User: Guest [Access Level: 1]',
        clear:    () => { cliOutput.innerHTML = ''; return ''; },
    };

    cliInput.addEventListener('keypress', function (e) {
        if (e.key !== 'Enter') return;
        const cmd = this.value.toLowerCase().trim();
        if (!cmd) return;

        playClick(1200, 0.05);
        cliOutput.innerHTML += `<div><span class="text-schale">visitor@schale:~$</span> ${this.value}</div>`;

        if (commands[cmd] !== undefined) {
            const response = typeof commands[cmd] === 'function' ? commands[cmd]() : commands[cmd];
            if (response) cliOutput.innerHTML += `<div class="text-gray-400 mb-2">${response}</div>`;
            if (cmd === 'about')    window.location.href = '#file';
            if (cmd === 'skills')   window.location.href = '#skills';
            if (cmd === 'projects') window.location.href = '#projects';
        } else {
            cliOutput.innerHTML += `<div class="text-red-400 mb-2">Command not found: ${cmd}</div>`;
        }

        this.value = '';
        cliOutput.scrollTop = cliOutput.scrollHeight;
    });
}

// ── CODE VAULT ────────────────────────────────────────────────

function switchTab(index, el) {
    playClick(800, 0.05);
    document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    const codeEl = document.getElementById('code-display');
    codeEl.textContent = codeSnippets[index].content;
    Prism.highlightElement(codeEl);
}

function copyCode() {
    navigator.clipboard.writeText(document.getElementById('code-display').textContent).then(() => {
        const win = document.querySelector('.code-window');
        win.style.borderColor = '#00ff88';
        setTimeout(() => (win.style.borderColor = '#333'), 300);
    });
}

// ── CARD SPOTLIGHT ────────────────────────────────────────────

function initCardSpotlight() {
    document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });
}
