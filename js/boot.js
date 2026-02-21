/* ============================================================
   boot.js — Loading overlay, boot sequence, experience start
   ============================================================ */

/** Dismisses the loading screen and starts BGM. */
function startExperience() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playClick(880, 0.3);

    const overlay = document.getElementById('start-overlay');
    overlay.classList.add('animate-crt-off');

    setTimeout(() => {
        overlay.style.display = 'none';
        const bgm = document.getElementById('bgm');
        bgm.src    = config.bgmUrl;
        bgm.volume = config.volume;
        bgm.play().catch(() => {}); // autoplay may be blocked — silent fail
    }, 500);
}

/** Runs the animated BIOS-style boot log. */
function runBootSequence() {
    const container = document.getElementById('boot-log-container');
    const checks = [
        { text: "BIOS_CHECK" },
        { text: "MEMORY_INTEGRITY" },
        { text: "NETWORK_UPLINK" },
        { text: "SECURITY_PROTOCOL" },
    ];

    let i = 0;

    function runCheck() {
        if (i < checks.length) {
            const div = document.createElement('div');
            div.className = 'boot-status-line';
            div.innerHTML = `<span>${checks[i].text}...</span><span class="check">OK</span>`;
            container.appendChild(div);
            playClick(800 + i * 100, 0.05);
            i++;
            setTimeout(runCheck, 300);
        } else {
            setTimeout(() => {
                const btn = document.getElementById('connect-btn');
                btn.classList.remove('opacity-0', 'translate-y-4');
            }, 400);
        }
    }

    setTimeout(runCheck, 500);
}
