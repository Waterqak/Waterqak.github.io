/* ============================================================
   ✏️  REVIEWS.JS — Client Field Reports
   Seed reviews + localStorage persistence + modal logic
   ============================================================ */

const SEED_REVIEWS = [
    {
        id: 'seed_1',
        name: 'Kurokami_Dev',
        stars: 5,
        text: 'Absolute unit of a scripter. Fixed a DataStore corruption bug in under an hour that had been killing our game for weeks. 10/10 would hire again.',
        date: '2025-02-14',
    },
    {
        id: 'seed_2',
        name: 'StellarForge',
        stars: 5,
        text: 'Built our entire quest engine from scratch. Clean code, great communication, delivered ahead of schedule. Exactly what we needed.',
        date: '2025-03-02',
    },
    {
        id: 'seed_3',
        name: 'NexusRBX',
        stars: 5,
        text: 'Reduced server lag by 40% on our farm sim. Didn\'t just patch it — rewrote the backend the right way. Professional level work.',
        date: '2025-04-20',
    },
];

function getReviews() {
    try {
        const stored = JSON.parse(localStorage.getItem('schale_reviews') || '[]');
        return [...SEED_REVIEWS, ...stored];
    } catch {
        return [...SEED_REVIEWS];
    }
}

function saveReview(review) {
    try {
        const stored = JSON.parse(localStorage.getItem('schale_reviews') || '[]');
        stored.unshift(review);
        localStorage.setItem('schale_reviews', JSON.stringify(stored));
    } catch (e) {
        console.error('Could not save review:', e);
    }
}

function renderStars(n, interactive = false, inputName = '') {
    if (interactive) {
        return Array.from({ length: 5 }, (_, i) => `
            <label class="cursor-pointer">
                <input type="radio" name="${inputName}" value="${i + 1}" class="hidden" ${i === 4 ? 'checked' : ''}>
                <svg class="star-icon w-7 h-7 inline-block transition-colors duration-150" data-val="${i + 1}"
                     fill="${i < 5 ? '#FFA800' : 'none'}" stroke="#FFA800" stroke-width="1.5" viewBox="0 0 24 24">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
            </label>`).join('');
    }
    return Array.from({ length: 5 }, (_, i) =>
        `<svg class="w-4 h-4 inline-block" fill="${i < n ? '#FFA800' : 'none'}" stroke="#FFA800" stroke-width="1.5" viewBox="0 0 24 24">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>`
    ).join('');
}

function renderReviews() {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;
    const reviews = getReviews();

    grid.innerHTML = reviews.map(r => `
        <div class="glass-card rounded-xl p-6 flex flex-col gap-3" data-aos="fade-up">
            <div class="card-header-strip strip-gold"></div>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-black text-gold text-sm">
                        ${r.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="text-white font-bold text-sm">${r.name}</div>
                        <div class="text-[10px] font-mono text-gray-500">${r.date}</div>
                    </div>
                </div>
                <div class="flex gap-0.5">${renderStars(r.stars)}</div>
            </div>
            <p class="text-gray-400 text-xs leading-relaxed border-l-2 border-gold/30 pl-3 italic">"${r.text}"</p>
        </div>
    `).join('');

    // Update count badge
    const badge = document.getElementById('reviews-count');
    if (badge) badge.innerText = reviews.length;

    lucide.createIcons();
    initCardSpotlight();
}

/* ── MODAL ─────────────────────────────────────────────────── */

function openReviewModal() {
    playClick(880, 0.2);
    document.getElementById('review-modal').classList.remove('hidden');
    document.getElementById('review-modal').classList.add('flex');
}

function closeReviewModal() {
    playClick(400, 0.1);
    document.getElementById('review-modal').classList.add('hidden');
    document.getElementById('review-modal').classList.remove('flex');
    document.getElementById('review-form').reset();
    syncStarUI(5);
}

function syncStarUI(val) {
    document.querySelectorAll('.star-icon').forEach(svg => {
        const v = parseInt(svg.getAttribute('data-val'));
        svg.setAttribute('fill', v <= val ? '#FFA800' : 'none');
    });
}

function initReviewForm() {
    const form = document.getElementById('review-form');
    if (!form) return;

    // Star hover/click effects
    document.querySelectorAll('.star-icon').forEach(svg => {
        svg.addEventListener('mouseenter', () => syncStarUI(parseInt(svg.getAttribute('data-val'))));
        svg.addEventListener('mouseleave', () => {
            const checked = form.querySelector('input[name="stars"]:checked');
            syncStarUI(checked ? parseInt(checked.value) : 5);
        });
        svg.closest('label')?.addEventListener('click', () => {
            const v = parseInt(svg.getAttribute('data-val'));
            syncStarUI(v);
        });
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        const name  = document.getElementById('review-name').value.trim();
        const stars = parseInt(form.querySelector('input[name="stars"]:checked')?.value || '5');
        const text  = document.getElementById('review-text').value.trim();
        if (!name || !text) return;

        const review = {
            id:    'user_' + Date.now(),
            name,
            stars,
            text,
            date:  new Date().toISOString().slice(0, 10),
        };

        saveReview(review);
        renderReviews();
        closeReviewModal();
        playClick(1200, 0.3);

        // Flash confirmation
        const btn = document.getElementById('reviews-submit-btn');
        const origText = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="check" class="w-4 h-4 inline mr-1"></i> SUBMITTED!';
        btn.classList.add('bg-green-600');
        btn.classList.remove('bg-schale');
        lucide.createIcons();
        setTimeout(() => {
            btn.innerHTML = origText;
            btn.classList.remove('bg-green-600');
            btn.classList.add('bg-schale');
        }, 2500);
    });
}
