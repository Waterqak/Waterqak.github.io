/* ============================================================
   AUDIO.JS — Sound effects and BGM controls
   ============================================================ */

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let isMuted = false;

function playClick(freq = 600, duration = 0.1) {
    if (isMuted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playHover() {
    if (isMuted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

function toggleMute() {
    isMuted = !isMuted;
    const bgm  = document.getElementById('bgm');
    const icon = document.getElementById('mute-icon');
    if (isMuted) {
        bgm.pause();
        icon.setAttribute('data-lucide', 'volume-x');
    } else {
        bgm.play();
        icon.setAttribute('data-lucide', 'volume-2');
    }
    lucide.createIcons();
}
