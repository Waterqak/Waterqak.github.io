/* ============================================================
   REVIEWS.JS v4 — Field Reports
   - New storage key (v4) clears any old test reviews
   - Admin can delete reviews via CLI: "reviews clear"
   - Improved render with verified badge for seed reviews
   ============================================================ */

// VERSION KEY — changing this wipes old stored reviews on load
const REVIEWS_STORAGE_KEY = 'schale_reviews_v4';

const SEED_REVIEWS = [
    {
        id:       'seed_1',
        name:     'Kurokami_Dev',
        stars:    5,
        text:     'Absolute unit of a scripter. Fixed a DataStore corruption bug in under an hour that had been killing our game for weeks. 10/10 would hire again.',
        date:     '2025-02-14',
        verified: true,
    },
    {
        id:       'seed_2',
        name:     'StellarForge',
        stars:    5,
        text:     'Built our entire quest engine from scratch. Clean code, great communication, delivered ahead of schedule. Exactly what we needed.',
        date:     '2025-03-02',
        verified: true,
    },
    {
        id:       'seed_3',
        name:     'NexusRBX',
        stars:    5,
        text:     "Reduced server lag by 40% on our farm sim. Didn't just patch it — rewrote the backend the right way. Professional level work.",
        date:     '2025-04-20',
        verified: true,
    },
];

/* ── Storage helpers ───────────────────────────────────────── */
function getStoredReviews() {
    try {
        return JSON.parse(localStorage.getItem(REVIEWS_STORAGE_KEY) || '[]');
    } catch { return []; }
}

function getReviews() {
    return [...SEED_REVIEWS, ...getStoredReviews()];
}

function saveReview(review) {
    try {
        const stored = getStoredReviews();
        stored.unshift(review);
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(stored));
    } catch (e) {
        console.error('Could not save review:', e);
    }
}

// Called from CLI: "reviews clear" with admin PIN
window.adminClearUserReviews = function () {
    localStorage.removeItem(REVIEWS_STORAGE_KEY);
    renderReviews();
};

/* ── Star renderer ─────────────────────────────────────────── */
function renderStars(n, interactive = false, inputName = '') {
    if (interactive) {
        return Array.from({ length: 5 }, (_, i) => `
            <label class="cursor-pointer star-label" style="padding:2px;">
                <input type="radio" name="${inputName}" value="${i + 1}" class="hidden" ${i === 4 ? 'checked' : ''}>
                <svg class="star-icon w-7 h-7 inline-block transition-all duration-150 hover:scale-125"
                     data-val="${i + 1}"
                     fill="${i < 5 ? '#FFA800' : 'none'}" stroke="#FFA800" stroke-width="1.5" viewBox="0 0 24 24">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
            </label>`).join('');
    }
    return Array.from({ length: 5 }, (_, i) =>
        `<svg class="w-3.5 h-3.5 inline-block" fill="${i < n ? '#FFA800' : 'none'}" stroke="#FFA800" stroke-width="1.5" viewBox="0 0 24 24">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>`
    ).join('');
}

/* ── Render grid ───────────────────────────────────────────── */
function renderReviews() {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;
    const reviews = getReviews();

    // Average rating
    const avg = reviews.reduce((s, r) => s + r.stars, 0) / reviews.length;

    grid.innerHTML = reviews.map((r, idx) => {
        const verifiedBadge = r.verified
            ? `<span class="text-[8px] font-bold px-1.5 py-0.5 rounded-full ml-2 align-middle"
                    style="background:rgba(46,232,154,.1);color:#2EE89A;border:1px solid rgba(46,232,154,.25);">
                   ✓ VERIFIED
               </span>`
            : '';
        return `
        <div class="glass-card tilt-card rounded-xl p-6 flex flex-col gap-3 reveal-on-scroll"
             style="animation-delay:${idx * 60}ms;" data-aos="fade-up" data-aos-delay="${idx * 50}">
            <div class="card-header-strip strip-gold"></div>
            <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                         style="background:rgba(255,168,0,.1);border:1px solid rgba(255,168,0,.3);color:#FFB83A;">
                        ${r.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="flex items-center flex-wrap">
                            <span class="text-white font-bold text-sm">${r.name}</span>
                            ${verifiedBadge}
                        </div>
                        <div class="text-[10px] font-mono text-gray-600 mt-0.5">${r.date}</div>
                    </div>
                </div>
                <div class="flex gap-0.5 flex-shrink-0">${renderStars(r.stars)}</div>
            </div>
            <p class="text-gray-400 text-xs leading-relaxed border-l-2 pl-3 italic mt-1"
               style="border-color:rgba(255,184,58,.35);">"${r.text}"</p>
        </div>`;
    }).join('');

    // Update count badge
    const badge = document.getElementById('reviews-count');
    if (badge) badge.innerText = reviews.length;

    // Update avg rating
    const avgEl = document.getElementById('reviews-avg');
    if (avgEl) avgEl.innerText = avg.toFixed(1) + ' ★';

    lucide.createIcons();
    if (typeof initCardSpotlight === 'function') initCardSpotlight();
    if (typeof initCardTilt      === 'function') initCardTilt();
}

/* ── Modal open/close ──────────────────────────────────────── */
function openReviewModal() {
    if (typeof playClick === 'function') playClick(880, 0.2);
    const modal = document.getElementById('review-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    // Reset form
    document.getElementById('review-form')?.reset();
    syncStarUI(5);
}

function closeReviewModal() {
    if (typeof playClick === 'function') playClick(400, 0.1);
    const modal = document.getElementById('review-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

/* ── Star interaction ──────────────────────────────────────── */
function syncStarUI(val) {
    document.querySelectorAll('.star-icon').forEach(svg => {
        const v = parseInt(svg.getAttribute('data-val'));
        svg.setAttribute('fill', v <= val ? '#FFA800' : 'none');
        svg.style.transform = v <= val ? 'scale(1.1)' : 'scale(1)';
    });
}

function initReviewForm() {
    const form = document.getElementById('review-form');
    if (!form) return;

    // Re-build star UI if needed
    const starSel = document.getElementById('star-selector');
    if (starSel && !starSel.querySelector('input')) {
        starSel.innerHTML = renderStars(5, true, 'stars');
    }

    // Star hover/click — direct listeners (no document delegation)
    function bindStars() {
        document.querySelectorAll('.star-label').forEach(lbl => {
            const svg   = lbl.querySelector('.star-icon');
            const radio = lbl.querySelector('input[type="radio"]');
            if (!svg) return;
            const v = parseInt(svg.getAttribute('data-val'));
            lbl.addEventListener('mouseenter', () => syncStarUI(v));
            lbl.addEventListener('mouseleave', () => {
                const checked = form.querySelector('input[name="stars"]:checked');
                syncStarUI(checked ? parseInt(checked.value) : 5);
            });
            lbl.addEventListener('click', () => {
                if (radio) radio.checked = true;
                syncStarUI(v);
                if (typeof playClick === 'function') playClick(600 + v * 80, 0.05);
            });
        });
    }
    bindStars();

    // Character counter
    const textarea   = document.getElementById('review-text');
    const charCount  = document.getElementById('review-char-count');
    if (textarea && charCount) {
        textarea.addEventListener('input', () => {
            const len = textarea.value.length;
            charCount.innerText = `${len}/280`;
            charCount.style.color = len > 250 ? 'var(--alert)' : '';
        });
    }

    // Submit
    form.addEventListener('submit', e => {
        e.preventDefault();
        const name  = document.getElementById('review-name')?.value.trim();
        const text  = document.getElementById('review-text')?.value.trim();
        const stars = parseInt(form.querySelector('input[name="stars"]:checked')?.value || '5');
        if (!name || !text) return;

        const review = {
            id:    'user_' + Date.now(),
            name,
            stars,
            text,
            date:  new Date().toISOString().slice(0, 10),
            verified: false,
        };

        saveReview(review);
        renderReviews();
        closeReviewModal();
        if (typeof playClick   === 'function') playClick(1200, 0.3);
        if (typeof showToast   === 'function') showToast('📝 Field report transmitted! Thanks, operative.', 'var(--gold)');
    });
}
