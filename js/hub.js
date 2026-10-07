// Terminal Hub + Code Specimens. Reads SITE.hub, SITE.projects, SITE.specimens from config.js
(() => {
    const el = (tag, cls, text) => {
        const node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text != null) node.textContent = text;
        return node;
    };
    const pad = n => String(n + 1).padStart(2, '0');

    // A project shows up in the hub if it is listed in SITE.hub OR has its own status field
    function allRows() {
        const listed = SITE.hub.map(h => ({ ...h, project: SITE.projects.find(p => p.title === h.title) }));
        const own = SITE.projects
            .filter(p => p.status && !SITE.hub.some(h => h.title === p.title))
            .map(p => ({ title: p.title, status: p.status, params: p.params, project: p }));
        return [...listed, ...own].filter(r => r.project);
    }

    function buildHub() {
        const list = document.getElementById('hub-list');
        const detail = document.getElementById('hub-detail');
        const search = document.getElementById('hub-search');
        const chipBox = document.getElementById('hub-chips');
        if (!list || !detail) return;

        const rows = allRows();
        list.parentElement.classList.add('owns-scroll'); // the list of work scrolls in its own frame
        detail.classList.add('owns-scroll');
        const state = { q: '', status: 'ALL' };
        let visible = [], buttons = [];

        function renderDetail(r, i) {
            const p = r.project;
            detail.replaceChildren(
                el('div', 'hub-prompt', `[ ${pad(i)} // ${r.status} ]`),
                el('h3', '', p.title),
                el('p', '', p.desc)
            );
            const params = el('dl', 'hub-params');
            const entries = { category: p.category, stack: p.tags.join(', '), ...(p.role ? { role: p.role } : {}), ...(p.result ? { result: p.result } : {}), status: r.status, ...(p.rbx ? { playing: (window.fmtRbxNum || String)(p.rbx.playing), visits: (window.fmtRbxNum || String)(p.rbx.visits) } : {}), ...(r.params || {}) };
            Object.entries(entries).forEach(([k, v]) => { params.append(el('dt', '', k), el('dd', '', v)); });
            const links = el('div', 'hub-links');
            const url = p.link || (p.media === 'youtube' ? p.src : '');
            if (url) {
                const a = el('a', 'btn btn-outline mono', p.link ? '[ OPEN ON ROBLOX ]' : '[ WATCH DEMO ]');
                a.href = url; a.target = '_blank'; a.rel = 'noopener';
                links.append(a);
            }
            detail.append(params, links, el('div', 'hub-prompt', 'guest@spearhead:~$ _'));
        }

        function select(i, focus) {
            buttons.forEach((b, j) => {
                b.setAttribute('aria-selected', j === i ? 'true' : 'false');
                b.tabIndex = j === i ? 0 : -1;
            });
            if (focus) buttons[i].focus();
            renderDetail(visible[i], i);
        }

        function renderList(keepTitle) {
            const q = state.q;
            visible = rows.filter(r => {
                const text = (r.title + ' ' + r.project.category + ' ' + r.project.tags.join(' ')).toLowerCase();
                return (state.status === 'ALL' || r.status === state.status) && text.includes(q);
            });
            buttons = [];
            list.replaceChildren();
            if (!visible.length) {
                list.append(el('div', 'hub-empty', 'no matches'));
                detail.replaceChildren(el('div', 'hub-prompt', 'guest@spearhead:~$ grep: nothing found'));
                return;
            }
            visible.forEach((r, i) => {
                const b = el('button', 'hub-row');
                b.type = 'button'; b.setAttribute('role', 'option');
                b.style.animationDelay = (i * 40) + 'ms';
                const status = el('span', '');
                status.append(el('i', 'blk ' + (r.status === 'SHIPPED' ? 'done' : 'wip')), r.status);
                b.append(el('span', '', pad(i)), el('span', '', r.title), status);
                b.addEventListener('click', () => select(i));
                buttons.push(b); list.append(b);
            });
            const at = keepTitle ? visible.findIndex(r => r.title === keepTitle) : 0;
            select(Math.max(0, at));
        }

        function renderChips() {
            const statuses = ['ALL', ...new Set(rows.map(r => r.status))];
            chipBox.replaceChildren(...statuses.map(s => {
                const n = s === 'ALL' ? rows.length : rows.filter(r => r.status === s).length;
                const c = el('button', 'chip', `${s} ${n}`);
                c.type = 'button';
                c.setAttribute('aria-pressed', state.status === s ? 'true' : 'false');
                c.addEventListener('click', () => { state.status = s; renderChips(); renderList(); });
                return c;
            }));
        }

        list.addEventListener('keydown', e => {
            const now = buttons.findIndex(b => b.getAttribute('aria-selected') === 'true');
            const keys = { ArrowDown: now + 1, ArrowUp: now - 1, Home: 0, End: visible.length - 1 };
            if (!(e.key in keys) || !visible.length) return;
            e.preventDefault();
            e.stopPropagation(); // main.js uses arrows for page nav
            select(Math.max(0, Math.min(visible.length - 1, keys[e.key])), true);
        });

        if (search) {
            search.addEventListener('input', () => { state.q = search.value.trim().toLowerCase(); renderList(); });
            search.addEventListener('keydown', e => {
                e.stopPropagation();
                if (e.key === 'ArrowDown' && buttons[0]) { e.preventDefault(); buttons[0].focus(); }
                if (e.key === 'Escape') { search.value = ''; state.q = ''; renderList(); }
            });
        }

        // used by the command palette
        window.hubSelect = title => {
            state.q = ''; state.status = 'ALL';
            if (search) search.value = '';
            renderChips(); renderList(title);
        };

        if (chipBox) renderChips();
        renderList();

        // live Roblox numbers or descriptions arrived: redraw the open row's detail
        window.addEventListener('rbx:update', () => {
            const at = buttons.findIndex(b => b.getAttribute('aria-selected') === 'true');
            if (at >= 0 && visible[at]) renderDetail(visible[at], at);
        });
    }

    function buildSpecimens() {
        const bar = document.getElementById('spec-tabs');
        const code = document.getElementById('spec-code');
        const gutter = document.getElementById('spec-gutter');
        const note = document.getElementById('spec-note');
        if (!bar || !code) return;
        const tabs = [];
        let current = 0;

        function show(i) {
            current = i;
            const s = SITE.specimens[i];
            tabs.forEach((t, j) => t.setAttribute('aria-selected', j === i ? 'true' : 'false'));
            code.textContent = s.code;
            gutter.textContent = s.code.split('\n').map((_, n) => n + 1).join('\n');
            note.textContent = '// ' + s.note;
            if (window.Prism) Prism.highlightElement(code);
            [code, gutter].forEach(n => { n.classList.remove('swap'); void n.offsetWidth; n.classList.add('swap'); });
        }

        SITE.specimens.forEach((s, i) => {
            const t = el('button', 'spec-tab', s.file);
            t.type = 'button'; t.setAttribute('role', 'tab');
            t.addEventListener('click', () => show(i));
            tabs.push(t); bar.append(t);
        });
        const copy = el('button', 'spec-tab spec-copy', '[ COPY ]');
        copy.type = 'button';
        copy.addEventListener('click', () => {
            navigator.clipboard.writeText(SITE.specimens[current].code).then(() => {
                copy.textContent = '[ COPIED ]';
                setTimeout(() => { copy.textContent = '[ COPY ]'; }, 1200);
            });
        });
        bar.append(copy);
        if (SITE.specimens.length) show(0);
    }

    buildHub();
    buildSpecimens();
})();
