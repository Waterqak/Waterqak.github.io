/* ============================================================
   ✏️  PROJECTS.JS — Add/edit/remove your projects here
   ============================================================

   HOW TO ADD A PROJECT:
   Copy the block below, paste it inside the array, fill in your info.

   FIELDS:
   ┌─────────────────────────────────────────────────────────┐
   │ title       → Name shown on the card                    │
   │ category    → "GAMEPLAY" | "FULL GAME" |                │
   │               "OPTIMIZATION" | "RPG SYSTEM"             │
   │ description → Short description text                    │
   │ techStack   → Array of tags. First tag shows on thumb.  │
   │ gameLink    → Roblox game URL, or "" to hide button     │
   │                                                         │
   │ mediaType   → "image"   — a direct image URL            │
   │               "youtube" — any YouTube link              │
   │               "none"    — shows icon instead            │
   │                                                         │
   │ source      → The image URL or YouTube URL              │
   │               YouTube: youtu.be/ID or youtube.com/...   │
   │                                                         │
   │ icon        → Lucide icon name (used when type="none")  │
   │ color       → "schale" (blue) | "gold" | "halo" (purple)│
   │               | "momo" (gray)                           │
   └─────────────────────────────────────────────────────────┘

   ============================================================ */

const myProjects = [

    // ── PROJECT 1 ────────────────────────────────────────────
    {
        title:       "Chillin Place",
        category:    "FULL GAME",
        description: "A complete hangout place with full DataStore persistence.",
        techStack:   ["Game Design", "Hangout", "DataStore"],
        gameLink:    "https://www.roblox.com/games/17290214724/Chillin-Place",  // ← paste your game link
        mediaType:   "image",
        source:      "https://tr.rbxcdn.com/180DAY-c69740761a8556385075f48b5b71147a/768/432/Image/Png/noFilter",
        icon:        "gamepad-2",
        color:       "gold",
    },

    {
        title:       "Escape Lava to collect brainrots",
        category:    "FULL GAME",
        description: "A complete brainrot game with full DataStore persistence.",
        techStack:   ["Game Design", "Escape", "DataStore"],
        gameLink:    "https://www.roblox.com/games/85862915773488/Escape-Lava-to-collect-brainrots",  // ← paste your game link
        mediaType:   "image",
        source:      "https://tr.rbxcdn.com/180DAY-1f5e4f49f3ff9eddbf732387c8b19cd7/768/432/Image/Webp/noFilter",
        icon:        "gamepad-2",
        color:       "gold",
    },

    // ── PROJECT 2 ────────────────────────────────────────────
    {
        title:       "Blind Mode Logic",
        category:    "GAMEPLAY",
        description: "Immersive vision restriction mechanic with dynamic spawn handling.",
        techStack:   ["Lighting", "SpawnLocation", "Camera"],
        gameLink:    "",
        mediaType:   "youtube",
        source:      "https://youtu.be/k8hV66kJ8cc",
        icon:        "eye-off",
        color:       "schale",
    },

    // ── PROJECT 3 ────────────────────────────────────────────
    {
        title:       "Quest Engine",
        category:    "RPG SYSTEM",
        description: "Visual Novel style interaction system with branching dialogue paths.",
        techStack:   ["ModuleScript", "RichText", "UI Tweening"],
        gameLink:    "",
        mediaType:   "youtube",
        source:      "https://www.youtube.com/watch?v=_HTzGpFwIiU",
        icon:        "message-square",
        color:       "halo",
    },

    // ── PROJECT 4 ────────────────────────────────────────────
    {
        title:       "Farm Optimization",
        category:    "OPTIMIZATION",
        description: "Fixed critical bugs and optimized backend logic, reducing server lag by 40%.",
        techStack:   ["Refactoring", "Optimization", "Memory"],
        gameLink:    "",
        mediaType:   "youtube",
        source:      "https://youtu.be/YyX5ma58v2Q",
        icon:        "sprout",
        color:       "momo",
    },

    // ── ADD NEW PROJECT HERE — copy and paste this block ─────
    // {
    //     title:       "My New Project",
    //     category:    "GAMEPLAY",
    //     description: "Describe what this project does.",
    //     techStack:   ["Tag1", "Tag2", "Tag3"],
    //     gameLink:    "https://www.roblox.com/games/YOUR_GAME_ID",
    //     mediaType:   "image",       // "image" | "youtube" | "none"
    //     source:      "https://...", // image link or YouTube link
    //     icon:        "star",
    //     color:       "schale",      // "schale" | "gold" | "halo" | "momo"
    // },

];

/* ============================================================
   PROJECT RENDERING — don't edit below this line
   ============================================================ */

const PROJECT_STYLES = {
    schale: { strip: 'strip-blue',   text: 'text-schale'     },
    halo:   { strip: 'strip-purple', text: 'text-purple-400' },
    momo:   { strip: 'bg-gray-500',  text: 'text-gray-400'   },
    gold:   { strip: 'strip-gold',   text: 'text-gold'       },
};

function toEmbedUrl(url) {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${m[1]}`;
    return url;
}

function buildVisual(p, textClass) {
    if (p.mediaType === 'youtube') {
        return `<iframe class="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                    src="${toEmbedUrl(p.source)}" frameborder="0" allow="autoplay"></iframe>`;
    }
    if (p.mediaType === 'image') {
        return `<img src="${p.source}" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500">`;
    }
    return `<div class="w-full h-full flex items-center justify-center bg-[#1a1d24]">
                <i data-lucide="${p.icon}" class="${textClass} w-12 h-12"></i>
            </div>`;
}

function renderProjects(filter = 'all') {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    const filtered = filter === 'all' ? myProjects : myProjects.filter(p => p.category === filter);

    container.innerHTML = filtered.map(p => {
        const s      = PROJECT_STYLES[p.color] || PROJECT_STYLES.schale;
        const isGold = p.category === 'FULL GAME' ? 'border-gold/30' : '';
        const visual = buildVisual(p, s.text);
        const gameBtn = p.gameLink
            ? `<a href="${p.gameLink}" target="_blank" onclick="event.stopPropagation()"
                  class="mt-4 w-full flex items-center justify-center gap-2 bg-schale/10 hover:bg-schale
                         text-schale hover:text-white border border-schale/30 hover:border-schale
                         text-xs font-bold py-2 rounded-lg transition-all">
                  <i data-lucide="gamepad-2" class="w-3.5 h-3.5"></i> PLAY GAME
               </a>`
            : '';

        return `
        <div onmouseenter="playHover()" class="glass-card group rounded-xl overflow-hidden ${isGold}" data-aos="fade-up">
            <div class="card-header-strip ${s.strip}"></div>
            <div class="h-48 relative overflow-hidden bg-black/50 border-b border-white/5">
                ${visual}
                <div class="absolute bottom-2 left-2 bg-black/80 px-2 py-1 text-[10px] font-mono
                            text-white rounded border border-white/10 backdrop-blur-md">
                    ${p.techStack[0]}
                </div>
            </div>
            <div class="p-6">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-lg font-black text-white group-hover:${s.text} transition-colors uppercase tracking-tight">
                        ${p.title}
                    </h3>
                    <span class="text-[9px] font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase">
                        ${p.category}
                    </span>
                </div>
                <p class="text-gray-400 text-xs leading-relaxed line-clamp-2">${p.description}</p>
                ${gameBtn}
            </div>
        </div>`;
    }).join('');

    lucide.createIcons();

    document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
        });
    });
}

function filterProjects(cat) {
    playClick();
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('bg-schale', 'text-white');
        b.classList.add('bg-panel', 'text-gray-400');
    });
    event.target.classList.remove('bg-panel', 'text-gray-400');
    event.target.classList.add('bg-schale', 'text-white');
    renderProjects(cat);
}
