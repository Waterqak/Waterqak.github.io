const ROBLOX = (() => {
    const userId = (SITE.roblox || '').match(/\/users\/(\d+)/)?.[1];
    const proxy  = 'https://corsproxy.io/?';

    async function get(url) {
        const res = await fetch(proxy + encodeURIComponent(url));
        if (!res.ok) throw new Error(res.status);
        return res.json();
    }

    function fmtNum(n) {
        if (n == null) return '-';
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
            if (headshotUrl && !localStorage.getItem('wds_pfp')) {
                if (typeof _applyPfp === 'function') {
                    _applyPfp(headshotUrl);
                } else {
                    const avatarImg = document.getElementById('avatar-img');
                    if (avatarImg) {
                        avatarImg.src = headshotUrl;
                        avatarImg.classList.remove('hidden');
                        const avatarPh = document.getElementById('avatar-ph');
                        if (avatarPh) avatarPh.classList.add('hidden');
                    }
                }
            }

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

    return { init: () => loadProfile() };
})();
