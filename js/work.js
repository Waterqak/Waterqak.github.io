// Projects (case-study viewer) and History (timeline).
// Reads SITE.projects, SITE.hub and SITE.timeline from config.js. Nothing is hard-coded here.
(() => {
    const el = (tag, cls, text) => {
        const node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text != null) node.textContent = text;
        return node;
    };

    // Group projects clearly into Featured, Systems, Other, and All
    const KINDS = [
        { id: 'featured', label: 'Featured Work', blurb: 'Top engineering projects: live games, DataStore setups, and optimization.' },
        { id: 'systems',  label: 'Systems & Demos', blurb: 'Modular engines, weather, dialogue, and gameplay mechanics.' },
        { id: 'other',    label: 'Other Work',    blurb: 'Showcases, Live2D scenes, and UI concepts.' },
        { id: 'all',      label: 'All Projects',  blurb: 'Full catalogue of 20+ shipped projects and prototypes.' },
    ];
    const kindOf = p => KINDS.find(k => k.id === (p.group || 'other')) || KINDS[0];

    function statusOf(p) {
        const hub = SITE.hub.find(h => h.title === p.title);
        const tag = ((hub && hub.status) || p.status || '').toUpperCase();
        if (tag === 'ON HOLD') return { text: 'On hold', tone: 'hold' };
        if (tag === 'IN PROGRESS' || /in development/i.test(p.result || '')) return { text: 'In development', tone: 'wip' };
        if (p.link) return { text: 'Live on Roblox', tone: 'live' };
        return { text: p.category === 'UI DESIGN' ? 'Design' : 'System demo', tone: 'done' };
    }

    const ytId = src => { const m = (src || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/); return m ? m[1] : null; };
    const thumbOf = p => p.media === 'youtube' ? (ytId(p.src) ? 'https://i.ytimg.com/vi/' + ytId(p.src) + '/mqdefault.jpg' : null) : p.src;

    const CHEV = d => `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

    // ---------- projects ----------
    function buildProjects() {
        const filterBox = document.getElementById('work-filter');
        const lede = document.getElementById('work-lede');
        const stage = document.getElementById('work-stage');
        const rail = document.getElementById('work-rail');
        if (!stage) return;

        const state = { kind: 'featured', i: 0, shot: 0 };
        const visible = () => SITE.projects.filter(p => state.kind === 'all' || (p.group || 'other') === state.kind);

        function frame(p) {
            const box = el('div', 'work-frame');
            const shots = p.rbx && p.rbx.screenshots && p.rbx.screenshots.length ? p.rbx.screenshots : null;
            if (p.media === 'youtube') {
                const f = el('iframe');
                f.src = _toEmbed(p.src); f.title = p.title + ' demo'; f.allow = 'autoplay'; f.loading = 'lazy';
                box.append(f);
            } else if (p.media === 'image') {
                const img = el('img');
                img.src = shots ? shots[state.shot % shots.length] : p.src; img.alt = p.title + ' screenshot'; img.loading = 'lazy';
                if (p.category === 'UI DESIGN') img.className = 'is-ui';
                img.addEventListener('error', () => { img.remove(); box.append(el('span', 'work-missing', 'Preview unavailable')); });
                box.append(img);
                if (shots && shots.length > 1) {
                    const dots = el('div', 'work-dots');
                    shots.forEach((url, k) => {
                        const b = el('button', k === state.shot % shots.length ? 'on' : '');
                        b.type = 'button'; b.setAttribute('aria-label', 'Screenshot ' + (k + 1) + ' of ' + shots.length);
                        b.addEventListener('click', () => {
                            state.shot = k; img.src = url;
                            dots.querySelectorAll('button').forEach((x, n) => x.className = n === k ? 'on' : '');
                        });
                        dots.append(b);
                    });
                    box.append(dots);
                }
            }
            return box;
        }

        function renderStage() {
            const list = visible();
            const p = list[state.i];
            if (!p) { stage.replaceChildren(el('p', 'work-missing', 'Nothing in this group yet.')); return; }
            const st = statusOf(p);

            const media = el('figure', 'work-media');
            const cap = el('figcaption', 'work-caption');
            const dot = el('i', 'dot ' + st.tone);
            const statusChip = el('span', 'work-chip');
            statusChip.append(dot, st.text);
            cap.append(el('span', 'work-chip', kindOf(p).label.replace(/s$/, '')), statusChip);
            if (p.rbx) {
                const fmt = window.fmtRbxNum || String;
                const chip = (key, text, live) => {
                    const c = el('span', 'work-chip' + (live ? ' is-live' : ''));
                    c.dataset.k = key; c.title = 'Live from Roblox';
                    if (live) c.append(el('i', 'dot'));
                    c.append(el('span', '', text));
                    cap.append(c);
                };
                if (p.rbx.playing != null) chip('playing', fmt(p.rbx.playing) + ' playing', true);
                if (p.rbx.visits != null)  chip('visits', fmt(p.rbx.visits) + ' visits');
                const votes = (p.rbx.likes || 0) + (p.rbx.dislikes || 0);
                if (votes > 0) chip('liked', Math.round(100 * p.rbx.likes / votes) + '% liked');
            }
            media.append(frame(p), cap);

            const info = el('div', 'work-info owns-scroll');
            info.append(el('h3', '', p.title), el('p', 'work-summary', p.desc));

            const facts = el('dl', 'work-facts');
            [['My role', p.role], ['Result', p.result], ['Built with', (p.tags || []).join(', ')]].forEach(([k, v]) => {
                if (!v) return;
                const row = el('div'); row.append(el('dt', '', k), el('dd', '', v)); facts.append(row);
            });
            info.append(facts);

            const actions = el('div', 'work-actions');
            const demo = p.media === 'youtube' ? p.src : '';
            if (p.link) { const a = el('a', 'btn btn-primary', 'Play on Roblox'); a.href = p.link; a.target = '_blank'; a.rel = 'noopener'; actions.append(a); }
            if (demo)   { const a = el('a', 'btn btn-outline', 'Watch on YouTube'); a.href = demo; a.target = '_blank'; a.rel = 'noopener'; actions.append(a); }
            if (actions.children.length) info.append(actions);

            const step = el('div', 'work-step');
            const prev = el('button', 'work-arrow'); prev.type = 'button'; prev.setAttribute('aria-label', 'Previous project'); prev.innerHTML = CHEV('M15 6l-6 6 6 6');
            const next = el('button', 'work-arrow'); next.type = 'button'; next.setAttribute('aria-label', 'Next project'); next.innerHTML = CHEV('M9 6l6 6-6 6');
            prev.addEventListener('click', () => move(-1)); next.addEventListener('click', () => move(1));
            step.append(prev, el('span', '', (state.i + 1) + ' of ' + list.length), next);
            cap.append(step);

            stage.replaceChildren(media, info);
        }

        function renderRail() {
            const list = visible();
            rail.replaceChildren(...list.map((p, i) => {
                const b = el('button', 'rail-item'); b.type = 'button';
                b.setAttribute('role', 'option'); b.setAttribute('aria-selected', i === state.i ? 'true' : 'false');
                const t = el('span', 'rail-thumb');
                const url = thumbOf(p);
                if (url) { const img = el('img'); img.src = url; img.alt = ''; img.loading = 'lazy'; img.addEventListener('error', () => img.remove()); t.append(img); }
                b.append(t, el('span', 'rail-name', p.title));
                b.addEventListener('click', () => select(i));
                return b;
            }));
        }

        function select(i) {
            state.i = i; state.shot = 0;
            renderStage(); renderRail();
            const on = rail.children[i];
            if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'center' });
            if (typeof playClick === 'function') playClick(640, 0.04);
        }
        function move(d) { const n = visible().length; select((state.i + d + n) % n); }

        function setKind(id) {
            state.kind = id; state.i = 0; state.shot = 0;
            const k = KINDS.find(x => x.id === id);
            lede.textContent = k.blurb;
            filterBox.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.kind === id ? 'true' : 'false'));
            renderStage(); renderRail();
        }

        // A mouse wheel over the strip scrolls it sideways instead of turning the page
        rail.addEventListener('wheel', e => {
            if (rail.scrollWidth <= rail.clientWidth + 2 || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
            const atEnd = e.deltaY > 0 ? rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2 : rail.scrollLeft <= 2;
            if (atEnd) return;
            e.preventDefault(); e.stopPropagation();
            rail.scrollLeft += e.deltaY;
        }, { passive: false });

        KINDS.forEach(k => {
            const n = k.id === 'all' ? SITE.projects.length : SITE.projects.filter(p => kindOf(p).id === k.id).length;
            if (!n) return;
            const c = el('button', 'chip', k.label + ' ' + n);
            c.type = 'button'; c.dataset.kind = k.id;
            c.addEventListener('click', () => setKind(k.id));
            filterBox.append(c);
        });

        document.addEventListener('keydown', e => {
            if (typeof _active !== 'number' || SITE.sections[_active].id !== 'projects') return;
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
            if (e.key === 'ArrowLeft')  { e.preventDefault(); move(-1); }
        });

        // Roblox data arrived. The first time it redraws; later number updates just change the chip text.
        window.addEventListener('rbx:update', e => {
            if (e.detail && e.detail.full) { renderStage(); renderRail(); return; }
            const p = visible()[state.i];
            if (!p || !p.rbx) return;
            const fmt = window.fmtRbxNum || String;
            const votes = (p.rbx.likes || 0) + (p.rbx.dislikes || 0);
            const text = { playing: fmt(p.rbx.playing) + ' playing', visits: fmt(p.rbx.visits) + ' visits', liked: votes ? Math.round(100 * p.rbx.likes / votes) + '% liked' : '' };
            stage.querySelectorAll('.work-chip[data-k]').forEach(c => { const t = text[c.dataset.k]; if (t) c.lastChild.textContent = t; });
        });

        setKind('all');
    }

    // ---------- history ----------
    function buildHistory() {
        const list = document.getElementById('timeline');
        if (!list) return;
        SITE.timeline.forEach((t, i) => {
            const li = el('li', 'hist-item' + (i === 0 ? ' is-now' : '') + (t.dim ? ' is-dim' : ''));
            const body = el('div', 'hist-body');
            body.append(el('h3', '', t.title), el('p', '', t.desc));
            if (t.tags && t.tags.length) body.append(el('p', 'hist-tags', t.tags.join('  /  ')));
            li.append(el('div', 'hist-when', t.period), el('span', 'hist-dot'), body);
            list.append(li);
        });
    }

    buildProjects();
    buildHistory();
})();
