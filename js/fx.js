// Command palette, shortcuts, text scramble, parallax, konami. Needs config.js + main.js
(() => {
    const el = (tag, cls, text) => {
        const node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text != null) node.textContent = text;
        return node;
    };
    const typing = t => t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- overlays ----------
    const overlay = el('div', 'pal');
    overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true');
    document.body.append(overlay);
    overlay.addEventListener('mousedown', e => { if (e.target === overlay) close(); });
    const close = () => overlay.classList.remove('open');
    const isOpen = () => overlay.classList.contains('open');

    // ---------- command palette ----------
    function commands() {
        return [
            ...SITE.sections.map((s, i) => ({ label: 'Go to ' + s.label, hint: String(i + 1), run: () => navigateTo(s.id) })),
            ...SITE.projects.map(p => ({
                label: 'Project: ' + p.title, hint: p.category,
                run: () => { navigateTo('hub'); setTimeout(() => window.hubSelect && window.hubSelect(p.title), 300); },
            })),
            { label: 'Copy Discord', hint: SITE.discord, run: () => copyDiscord() },
            { label: 'Open Roblox profile', hint: 'link', run: () => window.open(SITE.roblox, '_blank', 'noopener') },
            { label: 'Show shortcuts', hint: '?', run: () => openHelp() },
        ];
    }

    function openPalette() {
        const all = commands();
        let shown = all, at = 0;
        const input = el('input', 'pal-input');
        input.placeholder = 'type a command or page'; input.setAttribute('aria-label', 'Command palette');
        const ul = el('ul', 'pal-list'); ul.setAttribute('role', 'listbox');

        function paint() {
            ul.replaceChildren(...shown.map((c, i) => {
                const li = el('li', 'pal-item');
                li.setAttribute('role', 'option');
                li.setAttribute('aria-selected', i === at ? 'true' : 'false');
                li.append(el('span', '', c.label), el('span', '', c.hint));
                li.addEventListener('mousemove', () => { if (at !== i) { at = i; paint(); } });
                li.addEventListener('click', () => run(c));
                return li;
            }));
            const sel = ul.children[at];
            if (sel) sel.scrollIntoView({ block: 'nearest' });
        }
        function run(c) { close(); if (c) setTimeout(c.run, 60); }

        input.addEventListener('input', () => {
            const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
            shown = all.filter(c => words.every(w => (c.label + ' ' + c.hint).toLowerCase().includes(w)));
            at = 0; paint();
        });
        input.addEventListener('keydown', e => {
            e.stopPropagation();
            if (e.key === 'ArrowDown') { e.preventDefault(); at = Math.min(shown.length - 1, at + 1); paint(); }
            if (e.key === 'ArrowUp')   { e.preventDefault(); at = Math.max(0, at - 1); paint(); }
            if (e.key === 'Enter')     { e.preventDefault(); run(shown[at]); }
            if (e.key === 'Escape')    { close(); }
        });

        const box = el('div', 'pal-box');
        box.append(input, ul);
        overlay.replaceChildren(box);
        overlay.classList.add('open');
        paint(); input.focus();
    }
    window.openPalette = openPalette;
    window.openHelp = () => openHelp();

    // ---------- shortcuts overlay ----------
    function openHelp() {
        const rows = [['Ctrl K or /', 'command palette'], ['1 to ' + SITE.sections.length, 'jump to a page'], ['? ', 'this panel'], ['Esc', 'close anything'], ['Arrow keys', 'move through hub rows']];
        const help = el('dl', 'pal-help');
        rows.forEach(([k, v]) => { const kbd = el('kbd', '', k.trim()); const dt = el('dt'); dt.append(kbd); help.append(dt, el('dd', '', v)); });
        const box = el('div', 'pal-box');
        box.append(help);
        overlay.replaceChildren(box);
        overlay.classList.add('open');
    }

    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); isOpen() ? close() : openPalette(); return; }
        if (e.key === 'Escape' && isOpen()) { close(); return; }
        if (typing(e.target) || e.ctrlKey || e.metaKey || e.altKey || isOpen()) return;
        if (e.key === '/') { e.preventDefault(); openPalette(); return; }
        if (e.key === '?') { openHelp(); return; }
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= SITE.sections.length) navigateTo(SITE.sections[n - 1].id);
    });

    // ---------- title scramble when a page opens ----------
    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/+<>';
    function scramble(node) {
        if (reduce || node.children.length || node._busy) return;
        const final = node.dataset.final || (node.dataset.final = node.textContent);
        const total = 16;
        let frame = 0;
        node._busy = true;
        const timer = setInterval(() => {
            const shownCount = Math.floor(final.length * frame / total);
            node.textContent = final.split('').map((ch, i) => (i < shownCount || ch === ' ') ? ch : glyphs[Math.floor(Math.random() * glyphs.length)]).join('');
            if (++frame > total) { clearInterval(timer); node.textContent = final; node._busy = false; }
        }, 32);
    }
    document.querySelectorAll('.page').forEach(page => {
        let was = page.classList.contains('active');
        new MutationObserver(() => {
            const now = page.classList.contains('active');
            if (now && !was) page.querySelectorAll('.section-title').forEach(scramble);
            was = now;
        }).observe(page, { attributes: true, attributeFilter: ['class'] });
    });

    // ---------- backdrop parallax ----------
    if (!reduce && !window.matchMedia('(pointer:coarse)').matches) {
        let frame = 0, mx = 0, my = 0;
        window.addEventListener('mousemove', e => {
            mx = (e.clientX / window.innerWidth - 0.5) * -24;
            my = (e.clientY / window.innerHeight - 0.5) * -16;
            if (frame) return;
            frame = requestAnimationFrame(() => {
                document.documentElement.style.setProperty('--px', mx.toFixed(1) + 'px');
                document.documentElement.style.setProperty('--py', my.toFixed(1) + 'px');
                frame = 0;
            });
        }, { passive: true });
    }

    // ---------- konami ----------
    let step = 0;
    document.addEventListener('keydown', e => {
        if (typing(e.target)) return;
        const want = SITE.konami[step];
        step = e.key.toLowerCase() === want.toLowerCase() ? step + 1 : (e.key === SITE.konami[0] ? 1 : 0);
        if (step === SITE.konami.length) { step = 0; document.body.dataset.konami = 'active'; setTimeout(() => delete document.body.dataset.konami, 1600); }
    });
})();
