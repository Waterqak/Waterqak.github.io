const ROBLOX = (() => {
    const userId = (SITE.roblox || '').match(/\/users\/(\d+)/)?.[1];
    const proxy  = 'https://corsproxy.io/?';

    async function get(url) {
        const res = await fetch(proxy + encodeURIComponent(url));
        if (!res.ok) throw new Error(res.status);
        return res.json();
    }

    function fmtNum(n) {
        if (n == null) return '—';
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
        return n.toLocaleString();
    }
    window.fmtRbxNum = fmtNum;

    function placeId(url) {
        return url?.match(/\/games\/(\d+)/)?.[1] ?? null;
    }

    async function universeId(pid) {
        const d = await get(`https://apis.roblox.com/universes/v1/places/${pid}/universe`);
        return d?.universeId ?? null;
    }

    async function loadProfile() {
        if (!userId) return;
        try {
            const [user, headshot, fullbody, followers, friends] = await Promise.all([
                get(`https://users.roblox.com/v1/users/${userId}`),
                get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png`),
                get(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png`),
                get(`https://friends.roblox.com/v1/users/${userId}/followers/count`),
                get(`https://friends.roblox.com/v1/users/${userId}/friends/count`),
            ]);

            const headshotUrl = headshot?.data?.[0]?.imageUrl;
            if (headshotUrl && !localStorage.getItem('schale_pfp')) _applyPfp(headshotUrl);

            const fullbodyUrl = fullbody?.data?.[0]?.imageUrl;
            const fbImg  = document.getElementById('rbx-fullbody');
            const fbWrap = document.getElementById('rbx-avatar-wrap');
            if (fbImg && fullbodyUrl) {
                fbImg.src = fullbodyUrl;
                fbWrap?.classList.remove('hidden');
            }

            const nameEl = document.getElementById('rbx-displayname');
            if (nameEl && user.displayName) nameEl.textContent = user.displayName;

            const joinEl = document.getElementById('rbx-join');
            if (joinEl && user.created) {
                joinEl.textContent = new Date(user.created).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                joinEl.closest('[data-rbx-row]')?.classList.remove('hidden');
            }

            const follEl = document.getElementById('rbx-followers');
            if (follEl && followers?.count != null) {
                follEl.textContent = fmtNum(followers.count);
                follEl.closest('[data-rbx-row]')?.classList.remove('hidden');
            }

            const friendEl = document.getElementById('rbx-friends');
            if (friendEl && friends?.count != null) {
                friendEl.textContent = fmtNum(friends.count);
                friendEl.closest('[data-rbx-row]')?.classList.remove('hidden');
            }

            const descEl  = document.getElementById('rbx-desc');
            const descWrap = document.getElementById('rbx-desc-wrap');
            if (descEl && user.description?.trim()) {
                descEl.textContent = user.description.trim();
                descWrap?.classList.remove('hidden');
            }

            const statsWrap = document.getElementById('rbx-live-stats');
            if (statsWrap) {
                statsWrap.innerHTML = `
                    <div class="stat-card" data-tip="Roblox followers">
                        <div class="stat-val">${fmtNum(followers?.count ?? 0)}</div>
                        <div class="stat-lbl">Followers</div>
                    </div>
                    <div class="stat-card" data-tip="Roblox friends">
                        <div class="stat-val">${fmtNum(friends?.count ?? 0)}</div>
                        <div class="stat-lbl">Friends</div>
                    </div>
                    <div class="stat-card" data-tip="Member since">
                        <div class="stat-val">${new Date(user.created).getFullYear()}</div>
                        <div class="stat-lbl">Since</div>
                    </div>`;
                statsWrap.classList.remove('hidden');
                initTooltips();
            }

        } catch { /* silent */ }
    }

    async function loadGameData() {
        const rbxProjects = SITE.projects.filter(p => p.link?.includes('roblox.com/games'));
        if (!rbxProjects.length) return;
        try {
            const pairs = await Promise.all(
                rbxProjects.map(async p => {
                    const pid = placeId(p.link);
                    if (!pid) return null;
                    const uid = await universeId(pid).catch(() => null);
                    return uid ? { project: p, uid } : null;
                })
            );
            const valid = pairs.filter(Boolean);
            if (!valid.length) return;

            const ids = valid.map(v => v.uid).join(',');
            const [icons, banners, gameData] = await Promise.all([
                get(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${ids}&size=512x512&format=Png`),
                get(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${ids}&size=768x432&format=Png&countPerUniverse=1`),
                get(`https://games.roblox.com/v1/games?universeIds=${ids}`),
            ]);

            const bannerMap = {};
            banners?.data?.forEach(g => {
                const u = g.thumbnails?.[0]?.imageUrl;
                if (u) bannerMap[g.universeId] = u;
            });

            const iconMap = {};
            icons?.data?.forEach(g => { if (g.imageUrl) iconMap[g.targetId] = g.imageUrl; });

            const infoMap = {};
            gameData?.data?.forEach(g => {
                infoMap[g.id] = { visits: g.visits, playing: g.playing, favorited: g.favoritedCount };
            });

            let changed = false;
            valid.forEach(({ project, uid }) => {
                const img = bannerMap[uid] || iconMap[uid];
                if (img) { project.src = img; project.media = 'image'; changed = true; }
                const info = infoMap[uid];
                if (info) { project.rbxVisits = info.visits; project.rbxPlaying = info.playing; project.rbxFav = info.favorited; }
            });

            if (changed) renderProjects();

        } catch { /* silent */ }
    }

    return { init: () => Promise.all([loadProfile(), loadGameData()]) };
})();
