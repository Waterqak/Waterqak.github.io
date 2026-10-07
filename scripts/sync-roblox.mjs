// Pulls live game info from Roblox for every project in js/config.js that links to a game,
// and writes it to data/roblox.json. GitHub Actions runs this on a schedule (see
// .github/workflows/roblox-sync.yml). To run it by hand: node scripts/sync-roblox.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = new Function(readFileSync(join(root, 'js/config.js'), 'utf8') + '; return SITE;')();
const OUT = join(root, 'data/roblox.json');
const STALE_MS = 6 * 3600 * 1000;                                  // rewrite at least this often
const VOLATILE = ['playing', 'visits', 'favorites', 'likes', 'dislikes']; // change constantly, do not trigger a commit alone

async function get(url, tries = 3) {
    for (let i = 1; ; i++) {
        try {
            const res = await fetch(url, { headers: { accept: 'application/json' } });
            if (res.ok) return await res.json();
            if (i >= tries || (res.status < 500 && res.status !== 429)) throw new Error(res.status + ' ' + url);
        } catch (err) {
            if (i >= tries) throw err;
        }
        await new Promise(r => setTimeout(r, 800 * i));
    }
}

const stable = g => JSON.stringify(Object.fromEntries(Object.entries(g || {}).filter(([k]) => !VOLATILE.includes(k))));

const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { updatedAt: null, games: {} };

const wanted = SITE.projects
    .filter(p => p.live !== false)
    .map(p => ({ title: p.title, placeId: (p.link || '').match(/roblox\.com\/games\/(\d+)/)?.[1] }))
    .filter(g => g.placeId);

if (!wanted.length) { console.log('No projects link to a Roblox game. Nothing to sync.'); process.exit(0); }

const resolved = [];
for (const g of wanted) {
    try {
        const d = await get(`https://apis.roblox.com/universes/v1/places/${g.placeId}/universe`);
        if (d && d.universeId) resolved.push({ ...g, universeId: d.universeId });
    } catch (err) {
        console.warn(`Could not resolve ${g.title} (${g.placeId}): ${err.message}`);
    }
}
if (!resolved.length) { console.warn('Nothing resolved, keeping the old file.'); process.exit(0); }

const ids = resolved.map(g => g.universeId).join(',');
const [info, votes, icons, shots] = await Promise.all([
    get(`https://games.roblox.com/v1/games?universeIds=${ids}`),
    get(`https://games.roblox.com/v1/games/votes?universeIds=${ids}`).catch(() => ({ data: [] })),
    get(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${ids}&size=512x512&format=Png&returnPolicy=PlaceHolder`).catch(() => ({ data: [] })),
    get(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${ids}&size=768x432&format=Png&countPerUniverse=5`).catch(() => ({ data: [] })),
]);

const by = (list, key) => Object.fromEntries((list.data || []).map(x => [x[key], x]));
const infoBy = by(info, 'id'), voteBy = by(votes, 'id'), iconBy = by(icons, 'targetId'), shotBy = by(shots, 'universeId');

const games = { ...previous.games };
for (const g of resolved) {
    const i = infoBy[g.universeId];
    if (!i) { console.warn(`No data for ${g.title}, keeping the old entry.`); continue; }
    const v = voteBy[g.universeId] || {};
    games[g.placeId] = {
        universeId: g.universeId,
        name: i.name,
        description: i.description || '',
        genre: i.genre || '',
        maxPlayers: i.maxPlayers ?? null,
        created: i.created,
        updated: i.updated,
        playing: i.playing ?? 0,
        visits: i.visits ?? 0,
        favorites: i.favoritedCount ?? 0,
        likes: v.upVotes ?? 0,
        dislikes: v.downVotes ?? 0,
        icon: iconBy[g.universeId]?.imageUrl || null,
        screenshots: (shotBy[g.universeId]?.thumbnails || []).filter(t => t.imageUrl && (!t.state || t.state === 'Completed')).map(t => t.imageUrl),
    };
}

const changed = Object.keys(games).some(k => stable(games[k]) !== stable(previous.games[k]));
const stale = !previous.updatedAt || Date.now() - Date.parse(previous.updatedAt) > STALE_MS;
if (!changed && !stale) { console.log('Only live numbers moved. File left alone.'); process.exit(0); }

writeFileSync(OUT, JSON.stringify({ updatedAt: new Date().toISOString(), games }, null, 2) + '\n');
console.log(`Wrote ${Object.keys(games).length} games to data/roblox.json`);
