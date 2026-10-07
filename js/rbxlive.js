// Live Roblox data for projects that link to a game. Projects WITHOUT a Roblox game link
// keep using config.js exactly as before (and so does any project with `live: false`).
//
// Where the data comes from, best first:
//   1. live, through a CORS proxy (Roblox does not allow browsers on other sites to call it directly)
//   2. data/roblox.json, kept fresh by the GitHub Action in .github/workflows/roblox-sync.yml
//   3. the last live result saved in this browser
//   4. whatever is written in config.js
const RBXLIVE = (() => {
    const CACHE_KEY = 'wdsRbxLive';
    const PROXIES = SITE.rbxProxies || ['https://corsproxy.io/?', 'https://api.allorigins.win/raw?url='];
    const POLL_MS = 60000;
    let proxyAt = 0, liveOk = true, tick = 0;

    const placeIdOf = p => ((p.link || '').match(/roblox\.com\/games\/(\d+)/) || [])[1] || null;
    const gameProjects = () => SITE.projects.filter(p => p.live !== false && placeIdOf(p));

    // First couple of sentences of the Roblox description, kept short enough for a project card
    function blurb(text) {
        const clean = (text || '').replace(/\s+/g, ' ').trim();
        if (clean.length <= 240) return clean;
        const cut = clean.slice(0, 240);
        const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
        if (end > 80) return cut.slice(0, end + 1);
        const words = cut.replace(/\s+\S*$/, '');
        return /[.!?]$/.test(words) ? words : words + '...';
    }

    function apply(project, g) {
        if (!g) return;
        project.rbx = { ...(project.rbx || {}), ...g };
        const text = blurb(g.description);
        if (text) project.desc = text;
        if (project.media !== 'youtube') {
            const img = (g.screenshots && g.screenshots[0]) || g.icon;
            if (img) { project.src = img; project.media = 'image'; }
        }
    }
    function applyMap(map, full) {
        let any = false;
        gameProjects().forEach(p => { const g = map && map[placeIdOf(p)]; if (g) { apply(p, g); any = true; } });
        if (any) window.dispatchEvent(new CustomEvent('rbx:update', { detail: { full } }));
        return any;
    }

    async function viaProxy(url) {
        let lastErr;
        for (let n = 0; n < PROXIES.length; n++) {
            const i = (proxyAt + n) % PROXIES.length;
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 7000);
            try {
                const res = await fetch(PROXIES[i] + encodeURIComponent(url), { signal: ctrl.signal });
                clearTimeout(timer);
                if (!res.ok) throw new Error(res.status);
                proxyAt = i;
                return await res.json();
            } catch (err) { clearTimeout(timer); lastErr = err; }
        }
        throw lastErr;
    }

    // full = also refresh pictures. Polling only needs the numbers.
    async function fetchLive(full) {
        const list = gameProjects();
        if (!list.length) return false;

        const uni = {};
        for (const p of list) {
            const pid = placeIdOf(p);
            uni[pid] = p.rbx && p.rbx.universeId;
            if (!uni[pid]) {
                const d = await viaProxy(`https://apis.roblox.com/universes/v1/places/${pid}/universe`);
                uni[pid] = d && d.universeId;
            }
        }
        const ids = Object.values(uni).filter(Boolean).join(',');
        if (!ids) return false;

        const jobs = [viaProxy(`https://games.roblox.com/v1/games?universeIds=${ids}`), viaProxy(`https://games.roblox.com/v1/games/votes?universeIds=${ids}`).catch(() => ({ data: [] }))];
        if (full) {
            jobs.push(viaProxy(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${ids}&size=512x512&format=Png&returnPolicy=PlaceHolder`).catch(() => ({ data: [] })));
            jobs.push(viaProxy(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${ids}&size=768x432&format=Png&countPerUniverse=5`).catch(() => ({ data: [] })));
        }
        const [info, votes, icons, shots] = await Promise.all(jobs);
        const by = (res, key) => Object.fromEntries(((res && res.data) || []).map(x => [x[key], x]));
        const infoBy = by(info, 'id'), voteBy = by(votes, 'id'), iconBy = by(icons, 'targetId'), shotBy = by(shots, 'universeId');

        const map = {};
        Object.entries(uni).forEach(([pid, u]) => {
            const i = infoBy[u];
            if (!i) return;
            const v = voteBy[u] || {};
            const g = {
                universeId: u, name: i.name, description: i.description || '', genre: i.genre || '',
                maxPlayers: i.maxPlayers, created: i.created, updated: i.updated,
                playing: i.playing, visits: i.visits, favorites: i.favoritedCount,
                likes: v.upVotes, dislikes: v.downVotes,
            };
            if (full) {
                g.icon = (iconBy[u] && iconBy[u].imageUrl) || null;
                g.screenshots = ((shotBy[u] && shotBy[u].thumbnails) || []).filter(t => t.imageUrl && (!t.state || t.state === 'Completed')).map(t => t.imageUrl);
                if (!g.screenshots.length) delete g.screenshots;
                if (!g.icon) delete g.icon;
            }
            map[pid] = g;
        });
        const ok = applyMap(map, full);
        if (ok && full) {
            try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), games: gameProjects().reduce((o, p) => (p.rbx && (o[placeIdOf(p)] = p.rbx), o), {}) })); } catch {}
        }
        return ok;
    }

    async function init() {
        if (!gameProjects().length) return;
        let snapshotAt = 0;
        try {
            const res = await fetch('data/roblox.json?t=' + Math.floor(Date.now() / 600000), { cache: 'no-cache' });
            if (res.ok) {
                const snap = await res.json();
                snapshotAt = Date.parse(snap.updatedAt) || 0;
                applyMap(snap.games, true);
            }
        } catch { /* running from a file, or no snapshot yet */ }

        try {
            const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
            if (cached && cached.t > snapshotAt) applyMap(cached.games, true);
        } catch {}

        try { liveOk = await fetchLive(true); } catch { liveOk = false; }

        setInterval(poll, POLL_MS);
    }

    // Keeps "playing now" and the other numbers moving while someone is looking at the work
    async function poll() {
        if (document.hidden) return;
        const here = typeof _active === 'number' ? SITE.sections[_active].id : '';
        if (here !== 'projects' && here !== 'hub') return;
        if (!liveOk && ++tick % 5) return;           // proxy was down: try again every 5th minute
        try { liveOk = await fetchLive(false); } catch { liveOk = false; }
    }

    return { init, poll, refresh: () => fetchLive(true), blurb };
})();
window.RBXLIVE = RBXLIVE;
RBXLIVE.init();
