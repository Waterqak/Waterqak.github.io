/* ============================================================
   projects.js — Project grid rendering & filter logic
   ============================================================ */

const PROJECT_STYLES = {
    schale: { strip: 'strip-blue',    text: 'text-schale' },
    halo:   { strip: 'strip-purple',  text: 'text-purple-400' },
    momo:   { strip: 'bg-gray-500',   text: 'text-gray-400' },
    gold:   { strip: 'strip-gold',    text: 'text-gold' },
};

/** Builds the media element HTML for a project card. */
function buildVisual(project, textClass) {
    const { mediaType, source, icon } = project;
    if (mediaType === 'video') {
        return `<video src="${source}" autoplay loop muted playsinline
                    class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"></video>`;
    }
    if (mediaType === 'image') {
        return `<img src="${source}"
                    class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500">`;
    }
    if (mediaType === 'youtube') {
        return `<iframe class="w-full h-full opacity-60 group-hover:opacity-100"
                    src="${source}?autoplay=1&mute=1&controls=0&loop=1" frameborder="0"></iframe>`;
    }
    // Fallback icon
    return `<div class="w-full h-full flex items-center justify-center bg-[#1a1d24]">
                <i data-lucide="${icon}" class="${textClass} w-12 h-12"></i>
            </div>`;
}

/** Renders (or re-renders) the project grid. */
function renderProjects(filter = 'all') {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    const filtered = filter === 'all'
        ? myProjects
        : myProjects.filter(p => p.category === filter);

    container.innerHTML = filtered.map(p => {
        const s       = PROJECT_STYLES[p.color] || PROJECT_STYLES.schale;
        const isGold  = p.category === 'FULL GAME' ? 'border-gold/30' : '';
        const visual  = buildVisual(p, s.text);

        return `
        <div onmouseenter="playHover()"
             class="glass-card group rounded-xl overflow-hidden ${isGold}"
             data-aos="fade-up">
            <div class="card-header-strip ${s.strip}"></div>
            <div class="h-48 relative overflow-hidden bg-black/50 border-b border-white/5">
                ${visual}
                <div class="absolute bottom-2 left-2 bg-black/80 px-2 py-1 text-[10px] font-mono text-white rounded border border-white/10 backdrop-blur-md">
                    ${p.techStack[0]}
                </div>
            </div>
            <div class="p-6">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-lg font-black text-white group-hover:${s.text} transition-colors uppercase tracking-tight">${p.title}</h3>
                    <span class="text-[9px] font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase">${p.category}</span>
                </div>
                <p class="text-gray-400 text-xs mb-4 leading-relaxed line-clamp-2">${p.description}</p>
            </div>
        </div>`;
    }).join('');

    lucide.createIcons();

    // Re-apply spotlight hover to new cards
    document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });
}

/** Handles filter button clicks. */
function filterProjects(cat) {
    playClick();
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-schale', 'text-white');
        btn.classList.add('bg-panel', 'text-gray-400');
    });
    event.target.classList.remove('bg-panel', 'text-gray-400');
    event.target.classList.add('bg-schale', 'text-white');
    renderProjects(cat);
}
