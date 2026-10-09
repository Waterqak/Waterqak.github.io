// Viewport fit:
// 1. Normal screens use their full size.
// 2. Content panes handle their own scrolling.
// 3. Very small screens use a restrained scale adjustment.
(() => {
    const MIN_W = 360, MIN_H = 640, MIN_SCALE = 0.55; // the smallest screen the layout is designed for
    const root = document.documentElement;


    function fit() {
        const w = window.innerWidth, h = window.innerHeight;
        const s = Math.max(MIN_SCALE, Math.min(1, w / MIN_W, h / MIN_H));
        root.style.zoom = s < 1 ? String(s) : '';
        root.style.setProperty('--ui-scale', s);
        // vh/vw are not scaled by zoom, so hand the CSS corrected units
        if (s < 1) {
            root.style.setProperty('--vh', (h / s / 100) + 'px');
            root.style.setProperty('--vw', (w / s / 100) + 'px');
        } else {
            root.style.removeProperty('--vh');
            root.style.removeProperty('--vw');
        }
    }
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
})();
