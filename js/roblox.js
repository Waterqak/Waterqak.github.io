const RBLX = (() => {
    const PROXY = 'https://corsproxy.io/?url=';

    function uid() {
        const m = (SITE.roblox || '').match(/users\/(\d+)/);
        return m ? m[1] : null;
    }

    async function get(url) {
        const res = await fetch(PROXY + encodeURIComponent(url));
        if (!res.ok) throw new Error(res.status);
        return res.json();
    }

    function fmt(n) {
        if (!n || n < 1) return '0';
        if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return String(n);
    }

    function el(id) { return document.getElementById(id); }

    async function loadProfile(id) {
        const [hs, body, user] = await Promise.all([
            get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${id}&size=420x420&format=Png`),
            get(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${id}&size=720x720&format=Png`),
            get(`https://users.roblox.com/v1/users/${id}`)
        ]);

        if (!localStorage.getItem('schale_pfp')) {
            const url = hs?.data?.[0]?.imageUrl;
            if (url) {
                const img = el('avatar-img');
                const ph  = el('avatar-ph');
                if (img) { img.src = url; img.classList.remove('hidden'); }
                if (ph)  ph.classList.add('hidden');
            }
        }

        const bodyUrl = body?.data?.[0]?.imageUrl;
        const bodyEl  = el('rblx-body');
        if (bodyEl && bodyUrl) { bodyEl.src = bodyUrl; bodyEl.style.opacity = '1'; }

        if (user) {
            const dn = el('rblx-dname');
            const un = el('rblx-uname');
            const jd = el('rblx-joined');
            const ds = el('rblx-desc');
            if (dn) dn.textContent = user.displayName || user.name;
            if (un) un.textContent = '@' + user.name;
            if (jd && user.created) jd.textContent = 'Joined ' + new Date(user.created).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            if (ds && user.description) ds.textContent = user.description.slice(0, 120) || '';
        }
    }

    async function loadGames(id) {
        const gData = await get(`https://games.roblox.com/v2/users/${id}/games?accessFilter=Public&limit=50&sortOrder=Asc`);
        const games = gData?.data;
        if (!games?.length) return;

        const uids = games.map(g => g.id);

        const [statsData, thumbData] = await Promise.all([
            get(`https://games.roblox.com/v1/games?universeIds=${uids.join(',')}`),
            get(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${uids.join(',')}&size=768x432&format=Png`)
        ]);

        const statsMap = Object.fromEntries((statsData?.data || []).map(g => [String(g.id), g]));
        const thumbMap = Object.fromEntries((thumbData?.data || []).map(g => [String(g.universeId), g.thumbnails?.[0]?.imageUrl]));
        const placeMap = Object.fromEntries(games.map(g => [String(g.rootPlace?.id), { uid: String(g.id) }]));

        let changed = false;
        SITE.projects.forEach(p => {
            const m = (p.link || '').match(/games\/(\d+)/);
            if (!m) return;
            const info = placeMap[m[1]];
            if (!info) return;
            const thumb = thumbMap[info.uid];
            const stat  = statsMap[info.uid];
            if (thumb && p.media === 'image') { p.src = thumb; changed = true; }
            if (stat)  { p._visits = stat.visits; p._playing = stat.playing; changed = true; }
            p._uid = info.uid;
        });

        if (changed && document.getElementById('pg-projects')?.classList.contains('active')) {
          requestAnimationFrame(() => renderProjects());
        }

        const total = Object.values(statsMap).reduce((s, g) => s + (g.visits || 0), 0);
        const visEl = el('rblx-visits');
        if (visEl && total > 0) visEl.textContent = fmt(total) + ' total visits';
    }

    async function init() {
        const id = uid();
        if (!id) return;
        try { await loadProfile(id); } catch (e) { console.warn('[RBLX] profile:', e.message); }
        try { await loadGames(id);   } catch (e) { console.warn('[RBLX] games:',   e.message); }
    }

    return { init, fmt };
})();
