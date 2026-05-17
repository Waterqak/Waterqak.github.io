const ROBLOX = (() => {
    const userId = (SITE.roblox || '').match(/\/users\/(\d+)/)?.[1];
    const proxy  = 'https://corsproxy.io/?';

    async function get(url) {
        const res = await fetch(proxy + encodeURIComponent(url));
        if (!res.ok) throw new Error(res.status);
        return res.json();
    }

    function extractPlaceId(url) {
        return url?.match(/\/games\/(\d+)/)?.[1] ?? null;
    }

    async function toUniverseId(placeId) {
        const d = await get(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
        return d?.universeId ?? null;
    }

    async function loadProfile() {
        if (!userId) return;
        try {
            const [user, headshot] = await Promise.all([
                get(`https://users.roblox.com/v1/users/${userId}`),
                get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png`),
            ]);

            const avatarUrl = headshot?.data?.[0]?.imageUrl;
            if (avatarUrl && !localStorage.getItem('schale_pfp')) _applyPfp(avatarUrl);

            const descEl = document.getElementById('rbx-desc');
            if (descEl && user.description?.trim()) {
                descEl.textContent = user.description.trim();
                descEl.closest('[data-rbx-row]')?.classList.remove('hidden');
            }

            const joinEl = document.getElementById('rbx-join');
            if (joinEl && user.created) {
                joinEl.textContent = new Date(user.created).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                joinEl.closest('[data-rbx-row]')?.classList.remove('hidden');
            }

            const nameEl = document.getElementById('rbx-displayname');
            if (nameEl && user.displayName) nameEl.textContent = user.displayName;

        } catch { /* silent fail */ }
    }

    async function loadGameThumbnails() {
        const robloxProjects = SITE.projects.filter(p => p.link?.includes('roblox.com/games'));
        if (!robloxProjects.length) return;

        try {
            const pairs = await Promise.all(
                robloxProjects.map(async p => {
                    const pid = extractPlaceId(p.link);
                    if (!pid) return null;
                    const uid = await toUniverseId(pid).catch(() => null);
                    return uid ? { project: p, uid } : null;
                })
            );

            const valid = pairs.filter(Boolean);
            if (!valid.length) return;

            const ids = valid.map(v => v.uid).join(',');

            const [icons, banners] = await Promise.all([
                get(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${ids}&size=512x512&format=Png`),
                get(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${ids}&size=768x432&format=Png&countPerUniverse=1`),
            ]);

            const bannerMap = {};
            banners?.data?.forEach(g => {
                const url = g.thumbnails?.[0]?.imageUrl;
                if (url) bannerMap[g.universeId] = url;
            });

            const iconMap = {};
            icons?.data?.forEach(g => {
                if (g.imageUrl) iconMap[g.targetId] = g.imageUrl;
            });

            let updated = false;
            valid.forEach(({ project, uid }) => {
                const img = bannerMap[uid] || iconMap[uid];
                if (img) { project.src = img; project.media = 'image'; updated = true; }
            });

            if (updated) renderProjects();

        } catch { /* silent fail */ }
    }

    return {
        init: () => Promise.all([loadProfile(), loadGameThumbnails()]),
    };
})();
