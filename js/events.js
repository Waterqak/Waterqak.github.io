/* ============================================================
   EVENTS.JS v4.0 — SCHALE Systems
   ▸ REAL visitor counter via CountAPI (no fake numbers)
   ▸ 8 random event types with weighted engine
   ▸ Achievement system with slide-in panel (14 achievements)
   ▸ Idle detection + operative ping
   ▸ Mouse overdrive detector
   ▸ Overrides initLocalSystem from ui.js
   ============================================================ */

/* ════════════════════════════════
   REAL VISITOR COUNTER
   Uses countapi.xyz — free, no auth, CORS-open
   Increments once per browser session via sessionStorage.
   Falls back to last cached real count on API failure.
════════════════════════════════ */
function initLocalSystem() {
    // Load saved profile picture
    var pfp = localStorage.getItem('schale_db_pfp');
    if (pfp) _applyPfp(pfp);

    var el = document.getElementById('visitor-count');
    function display(n) { if (el) el.innerText = parseInt(n).toLocaleString(); }

    // Pull last known count immediately so screen isn't blank
    var cached = localStorage.getItem('schale_real_count');
    if (cached) display(cached);

    // Only count one hit per calendar day per device
    var todayKey = 'schale_counted_' + new Date().toISOString().slice(0, 10);
    var alreadyCounted = sessionStorage.getItem(todayKey);

    var endpoint = alreadyCounted
        ? 'https://api.countapi.xyz/get/waterqak/schale-visits'
        : 'https://api.countapi.xyz/hit/waterqak/schale-visits';

    fetch(endpoint)
        .then(function (r) { return r.json(); })
        .then(function (d) {
            if (d && d.value) {
                display(d.value);
                localStorage.setItem('schale_real_count', d.value);
                if (!alreadyCounted) sessionStorage.setItem(todayKey, '1');
            }
        })
        .catch(function () {
            // API down — show last cached or graceful estimate
            if (!cached) display('--');
        });
}

/* ════════════════════════════════
   ACHIEVEMENT DEFINITIONS
════════════════════════════════ */
var ACHIEVEMENTS = {
    first_visit:    { icon: '🔭', title: 'FIRST CONTACT',    desc: 'You opened the portfolio. Bold move.' },
    cli_power:      { icon: '💻', title: 'POWER USER',       desc: 'Used the terminal 5+ times.' },
    coffee_enjoyer: { icon: '☕', title: 'COFFEE ENJOYER',   desc: 'Typed coffee. A kindred spirit.' },
    no_life:        { icon: '🏆', title: 'NO LIFE',          desc: 'Clicked the logo exactly 7 times.' },
    linguist:       { icon: '🌐', title: 'LINGUIST',         desc: 'Switched the site language.' },
    night_owl:      { icon: '🌙', title: 'NIGHT OWL',        desc: 'Visiting between midnight and 5am.' },
    reviewer:       { icon: '📝', title: 'OPERATIVE',        desc: 'Submitted a field report.' },
    chaos_agent:    { icon: '🚨', title: 'CHAOS AGENT',      desc: 'Triggered the system override.' },
    konami:         { icon: '🎮', title: 'GAMER',            desc: 'Entered the Konami code.' },
    explorer:       { icon: '🗺️',  title: 'EXPLORER',         desc: 'Visited every section.' },
    speed_reader:   { icon: '⚡', title: 'SPEED READER',     desc: 'Saw 4+ sections in under 30 seconds.' },
    idle_sensei:    { icon: '😴', title: 'IDLE SENSEI',      desc: 'Went AFK for over a minute.' },
    overdrive:      { icon: '🔥', title: 'OVERDRIVE',        desc: 'Mouse speed exceeded 3,000 px/s.' },
    hacker:         { icon: '🖤', title: 'HACKER',           desc: 'Typed "hack" in the terminal.' },
};

var _achievements      = JSON.parse(localStorage.getItem('schale_ach') || '{}');
var _cliUses           = 0;
var _sectionsVisited   = new Set();
var _pageLoadTime      = Date.now();
var _toastCountEvents  = 0;
var ACH_MAX_QUEUE      = 3;

function unlockAchievement(id) {
    if (_achievements[id]) return;
    _achievements[id] = Date.now();
    localStorage.setItem('schale_ach', JSON.stringify(_achievements));

    var a = ACHIEVEMENTS[id];
    if (!a) return;

    _updateAchievementPanel();

    // Achievement toast — slides in from the LEFT
    if (_toastCountEvents >= ACH_MAX_QUEUE) return;
    _toastCountEvents++;

    var card = document.createElement('div');
    var bot  = 88 + (_toastCountEvents - 1) * 88; // 88px base clears 56px ach button
    card.style.cssText = [
        'position:fixed;bottom:' + bot + 'px;left:24px;z-index:9997;width:290px;',
        'background:rgba(5,9,26,.98);',
        'border:1px solid rgba(255,184,58,.35);border-left:3px solid var(--gold);',
        'padding:12px 16px;border-radius:10px;',
        'box-shadow:0 8px 32px rgba(0,0,0,.7),0 0 24px rgba(255,184,58,.08);',
        'transform:translateX(-340px);opacity:0;pointer-events:none;',
        'transition:all 0.45s cubic-bezier(0.175,0.885,0.32,1.275);',
        'font-family:\'JetBrains Mono\',monospace;',
    ].join('');
    card.innerHTML =
        '<div style="font-size:8px;letter-spacing:.15em;color:var(--gold);margin-bottom:6px;">★ ACHIEVEMENT UNLOCKED</div>' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
            '<span style="font-size:26px;flex-shrink:0;filter:drop-shadow(0 0 8px rgba(255,184,58,.5));">' + a.icon + '</span>' +
            '<div>' +
                '<div style="color:#fff;font-weight:900;font-size:11px;letter-spacing:.06em;">' + a.title + '</div>' +
                '<div style="color:#4E6490;font-size:9px;margin-top:3px;line-height:1.4;">' + a.desc + '</div>' +
            '</div>' +
        '</div>';
    document.body.appendChild(card);

    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            card.style.transform = 'translateX(0)';
            card.style.opacity   = '1';
        });
    });
    setTimeout(function () {
        card.style.transform = 'translateX(-340px)';
        card.style.opacity   = '0';
        setTimeout(function () {
            card.remove();
            _toastCountEvents = Math.max(0, _toastCountEvents - 1);
        }, 450);
    }, 5200);

    if (typeof playClick === 'function') playClick(1320, 0.18);
}

/* ════════════════════════════════
   ACHIEVEMENT PANEL
   Floating button bottom-left, expands to full panel
════════════════════════════════ */
function _updateAchievementPanel() {
    var count  = Object.keys(_achievements).length;
    var total  = Object.keys(ACHIEVEMENTS).length;
    var badge  = document.getElementById('ach-badge');
    var fill   = document.getElementById('ach-fill');
    var pct    = Math.round((count / total) * 100);
    if (badge) badge.innerText = count + '/' + total;
    if (fill)  fill.style.width = pct + '%';
}

function initAchievementPanel() {
    var total = Object.keys(ACHIEVEMENTS).length;
    var count = Object.keys(_achievements).length;

    // Floating button
    var btn = document.createElement('div');
    btn.id = 'ach-btn';
    btn.style.cssText = [
        'position:fixed;bottom:24px;left:24px;z-index:9990;',
        'width:48px;height:48px;border-radius:12px;cursor:pointer;',
        'background:rgba(5,9,26,.95);border:1px solid rgba(255,184,58,.3);',
        'box-shadow:0 4px 20px rgba(0,0,0,.5);',
        'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;',
        'transition:all 0.2s;',
        'font-family:\'JetBrains Mono\',monospace;',
    ].join('');
    btn.innerHTML =
        '<span style="font-size:18px;">🏆</span>' +
        '<span id="ach-badge" style="font-size:7px;color:var(--gold);font-weight:700;letter-spacing:.05em;">' + count + '/' + total + '</span>';
    btn.title = 'Achievements';
    document.body.appendChild(btn);

    // Panel
    var panel = document.createElement('div');
    panel.id = 'ach-panel';
    panel.style.cssText = [
        'position:fixed;bottom:82px;left:24px;z-index:9989;width:320px;',
        'background:rgba(5,9,26,.98);border:1px solid rgba(255,255,255,.08);',
        'border-radius:14px;overflow:hidden;',
        'box-shadow:0 20px 60px rgba(0,0,0,.7);',
        'transform:translateY(16px) scale(.97);opacity:0;pointer-events:none;',
        'transition:all 0.35s cubic-bezier(0.175,0.885,0.32,1.275);',
        'max-height:480px;display:flex;flex-direction:column;',
    ].join('');

    // Panel header
    var pct = Math.round((count / total) * 100);
    panel.innerHTML =
        '<div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.06);' +
            'background:rgba(255,184,58,.05);flex-shrink:0;">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">' +
                '<span style="font-family:\'Rajdhani\',sans-serif;font-weight:900;font-size:13px;' +
                    'letter-spacing:.1em;color:#fff;">ACHIEVEMENTS</span>' +
                '<span id="ach-pct" style="font-size:9px;font-family:\'JetBrains Mono\',monospace;' +
                    'color:var(--gold);">' + count + '/' + total + ' · ' + pct + '%</span>' +
            '</div>' +
            '<div style="height:4px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;">' +
                '<div id="ach-fill" style="height:100%;width:' + pct + '%;' +
                    'background:linear-gradient(90deg,var(--gold),#ffcc44);' +
                    'border-radius:99px;transition:width 0.6s ease;' +
                    'box-shadow:0 0 8px rgba(255,184,58,.4);"></div>' +
            '</div>' +
        '</div>' +
        '<div id="ach-list" style="overflow-y:auto;padding:10px;flex:1;">' +
            _buildAchievementList() +
        '</div>';
    document.body.appendChild(panel);

    // Toggle
    var panelOpen = false;
    btn.addEventListener('click', function () {
        panelOpen = !panelOpen;
        if (panelOpen) {
            // Refresh list
            var list = document.getElementById('ach-list');
            var pctEl = document.getElementById('ach-pct');
            if (list) list.innerHTML = _buildAchievementList();
            var cnt = Object.keys(_achievements).length;
            var p   = Math.round((cnt / total) * 100);
            if (pctEl) pctEl.innerText = cnt + '/' + total + ' · ' + p + '%';
            _updateAchievementPanel();
            panel.style.opacity       = '1';
            panel.style.transform     = 'translateY(0) scale(1)';
            panel.style.pointerEvents = 'all';
            btn.style.borderColor     = 'var(--gold)';
            btn.style.boxShadow       = '0 4px 20px rgba(255,184,58,.2)';
        } else {
            panel.style.opacity       = '0';
            panel.style.transform     = 'translateY(16px) scale(.97)';
            panel.style.pointerEvents = 'none';
            btn.style.borderColor     = 'rgba(255,184,58,.3)';
            btn.style.boxShadow       = '0 4px 20px rgba(0,0,0,.5)';
        }
        if (typeof playClick === 'function') playClick(panelOpen ? 880 : 400, 0.08);
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
        if (panelOpen && !panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
            panelOpen = false;
            panel.style.opacity       = '0';
            panel.style.transform     = 'translateY(16px) scale(.97)';
            panel.style.pointerEvents = 'none';
            btn.style.borderColor     = 'rgba(255,184,58,.3)';
        }
    });
}

function _buildAchievementList() {
    return Object.keys(ACHIEVEMENTS).map(function (id) {
        var a       = ACHIEVEMENTS[id];
        var unlocked = !!_achievements[id];
        return '<div style="display:flex;align-items:center;gap:10px;padding:8px 6px;border-radius:8px;' +
            'margin-bottom:4px;transition:background .15s;' +
            'background:' + (unlocked ? 'rgba(255,184,58,.05)' : 'rgba(255,255,255,.015)') + ';' +
            'border:1px solid ' + (unlocked ? 'rgba(255,184,58,.2)' : 'rgba(255,255,255,.04)') + ';">' +
            '<span style="font-size:20px;flex-shrink:0;' + (unlocked ? '' : 'filter:grayscale(1);opacity:.25;') + '">' +
                a.icon + '</span>' +
            '<div style="min-width:0;">' +
                '<div style="font-size:10px;font-weight:900;letter-spacing:.05em;' +
                    'color:' + (unlocked ? '#fff' : '#2e3450') + ';' +
                    'font-family:\'Rajdhani\',sans-serif;">' + a.title + '</div>' +
                '<div style="font-size:8px;color:' + (unlocked ? '#4E6490' : '#1a2035') + ';' +
                    'font-family:\'JetBrains Mono\',monospace;margin-top:1px;">' +
                    (unlocked ? a.desc : '???') + '</div>' +
            '</div>' +
            (unlocked ? '<span style="margin-left:auto;font-size:8px;color:var(--gold);flex-shrink:0;">✓</span>' : '') +
        '</div>';
    }).join('');
}

/* ════════════════════════════════
   ACHIEVEMENT HOOKS
════════════════════════════════ */
function initAchievements() {
    initAchievementPanel();

    // First visit
    if (!_achievements.first_visit) setTimeout(function () { unlockAchievement('first_visit'); }, 4000);

    // Night owl
    var h = new Date().getHours();
    if (h >= 0 && h < 5) unlockAchievement('night_owl');

    // Explorer — watch sections
    var ALL_SECTIONS = ['about','file','skills','history','code','projects','calculator','reviews','contact'];
    var sobs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                _sectionsVisited.add(e.target.id);
                if (_sectionsVisited.size >= ALL_SECTIONS.length) {
                    unlockAchievement('explorer');
                    sobs.disconnect();
                }
            }
        });
    }, { threshold: 0.25 });
    document.querySelectorAll('section[id],header[id],footer[id]').forEach(function (s) { sobs.observe(s); });

    // Speed reader
    setTimeout(function () {
        if (_sectionsVisited.size >= 4) unlockAchievement('speed_reader');
    }, 30000);

    // CLI hooks
    var inp = document.getElementById('cli-input');
    if (inp) {
        inp.addEventListener('keypress', function (e) {
            if (e.key !== 'Enter') return;
            var cmd = (this.value || '').trim().toLowerCase();
            if (!cmd) return;
            _cliUses++;
            if (_cliUses >= 5) unlockAchievement('cli_power');
            if (cmd === 'coffee') unlockAchievement('coffee_enjoyer');
            if (cmd === 'hack')   unlockAchievement('hacker');
        });
    }

    // Review form
    var form = document.getElementById('review-form');
    if (form) {
        form.addEventListener('submit', function () {
            setTimeout(function () { unlockAchievement('reviewer'); }, 600);
        });
    }

    // Language toggle
    document.querySelectorAll('[onclick*="toggleLanguage"]').forEach(function (el) {
        el.addEventListener('click', function () { unlockAchievement('linguist'); });
    });

    // System override (hero badge)
    var badge = document.querySelector('.hero-badge');
    if (badge) {
        badge.addEventListener('click', function () {
            setTimeout(function () { unlockAchievement('chaos_agent'); }, 120);
        });
    }

    // Logo easter egg
    var logo = document.querySelector('[data-logo-egg]');
    if (logo) {
        var _lc = 0, _lt;
        logo.addEventListener('click', function () {
            _lc++; clearTimeout(_lt);
            _lt = setTimeout(function () { _lc = 0; }, 2200);
            if (_lc >= 7) { _lc = 0; unlockAchievement('no_life'); }
        });
    }

    // Konami hook
    var _ki = 0;
    var KC  = ['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a'];
    document.addEventListener('keydown', function (e) {
        if (e.key.toLowerCase() === KC[_ki]) {
            _ki++;
            if (_ki === KC.length) { _ki = 0; unlockAchievement('konami'); }
        } else { _ki = 0; }
    });

    // Mouse overdrive
    var _lx = 0, _ly = 0, _lt2 = 0, _triggered = false;
    window.addEventListener('mousemove', function (e) {
        var now = Date.now();
        if (_lt2 && now - _lt2 >= 16) {
            var spd = Math.hypot(e.clientX - _lx, e.clientY - _ly) / ((now - _lt2) / 1000);
            if (spd > 3200 && !_triggered) {
                _triggered = true;
                setTimeout(function () { _triggered = false; }, 8000);
                unlockAchievement('overdrive');
                if (typeof showToast === 'function') showToast('⚡ OVERDRIVE DETECTED — sensei is in the zone', 'var(--gold)');
            }
        }
        _lx = e.clientX; _ly = e.clientY; _lt2 = now;
    }, { passive: true });
}

/* ════════════════════════════════
   EVENT CONTENT POOLS
════════════════════════════════ */
var TRANSMISSIONS = [
    { from:'ARONA',   pri:'LOW',     msg:"Sensei, your coffee is getting cold again. This is a critical alert." },
    { from:'PLANA',   pri:'NORMAL',  msg:"System integrity at 94.2%. The remaining 5.8% is vibes." },
    { from:'ARONA',   pri:'HIGH',    msg:"Sensei! Someone has been on this portfolio for several minutes. Are they hiring?" },
    { from:'SCHALE',  pri:'NORMAL',  msg:"Deployment status: optimal. Anomalies: 0 (officially)." },
    { from:'PLANA',   pri:'WARNING', msg:"Memory leak detected. Logged. Promptly ignored. Moving on." },
    { from:'ARONA',   pri:'LOW',     msg:"Reminder: Water's commissions are still open. Tell a friend." },
    { from:'PLANA',   pri:'NORMAL',  msg:"Portfolio load time: acceptable. I won't say more than that." },
    { from:'ARONA',   pri:'LOW',     msg:"It is late, Sensei. You should sleep. You won't. I know you." },
    { from:'SCHALE',  pri:'HIGH',    msg:"Visitor detected in sector: PROJECTS. Engagement confirmed. Excellent." },
    { from:'PLANA',   pri:'WARNING', msg:"Null pointer exception suppressed. Bug renamed to 'feature'. Filed under: resolved." },
    { from:'ARONA',   pri:'NORMAL',  msg:"Fun fact: every bug in this portfolio once had a name. RIP Bugsy." },
    { from:'SCHALE',  pri:'LOW',     msg:"DataStore backup complete. No data was harmed in this process." },
];
var PRI_COLORS = { LOW:'#4E6490', NORMAL:'var(--accent)', HIGH:'var(--gold)', WARNING:'var(--alert)' };

var SYSLOG_LINES = [
    'Routine integrity check: <span style="color:#00ff88">PASSED</span>',
    'Garbage collection cycle completed in <span style="color:var(--accent)">847ms</span>',
    'Portfolio backup: <span style="color:#00ff88">SUCCESSFUL</span>',
    'Coffee.reserve critically low: <span style="color:var(--gold)">WARNING</span>',
    'Anti-exploit scan: <span style="color:#00ff88">0 THREATS DETECTED</span>',
    'DataStore heartbeat: <span style="color:#00ff88">NOMINAL</span>',
    'Memory optimization pass: <span style="color:var(--accent)">APPLIED (briefly)</span>',
    'Sleep.schedule: <span style="color:var(--alert)">UNDEFINED — CRITICAL</span>',
    'Server node latency: <span style="color:#00ff88">1ms</span> (it\'s localhost, obviously)',
    'TODO.txt status: <span style="color:var(--gold)">STILL EMPTY</span>',
    'Profanity filter: <span style="color:#00ff88">ARMED AND READY</span>',
    'Null check added: <span style="color:#00ff88">just in case</span>',
];

var SCHALE_REPORTS = [
    { label:'BUGS IN PRODUCTION', value:'0',      note:'(officially. don\'t ask)' },
    { label:'SERVER TPS',         value:'60',      note:'(for about 4 seconds)' },
    { label:'DATASTORE WRITES',   value:'1,337',   note:'this session' },
    { label:'LINES WRITTEN TODAY',value:'4,200',   note:'feat. sleep deprivation' },
    { label:'LINES DELETED TODAY',value:'4,199',   note:'one was actually good' },
    { label:'COFFEE CONSUMED',    value:'∞',       note:'and still rising' },
    { label:'OPEN BROWSER TABS',  value:'47',      note:'please send help' },
    { label:'EXPLOITERS BANNED',  value:'14',      note:'just today, in one game' },
    { label:'TODOS RESOLVED',     value:'0',       note:'shocking. truly.' },
    { label:'NULL CHECKS ADDED',  value:'∞',       note:'just to be safe' },
    { label:'UPTIME THIS MONTH',  value:'99.3%',   note:'close enough to 100' },
    { label:'FIRST COMPILE OK',   value:'NEVER',   note:'but we don\'t talk about it' },
];

var LORE_ENTRIES = [
    { tag:'PERSONNEL.NOTE', text:'Subject: Water. Age 15. Somehow professional. Dangerous amounts of Red Bull detected in bloodstream.' },
    { tag:'SYSTEM.FACT',    text:'This portfolio was built between 11pm and 4am over several sessions. The bugs were features all along.' },
    { tag:'DATA.FRAGMENT',  text:'DataStore myth: if you pray hard enough before SetAsync, it won\'t fail. Water has tested this hypothesis.' },
    { tag:'SCHALE.INTEL',   text:'Water\'s first ever commit message was "added stuff". For historical accuracy, it has been preserved in the void.' },
    { tag:'KIVOTOS.LOG',    text:'Server TPS dropped to 0 on March 3rd, 2024. Investigation concluded the culprit was a while(true) with no task.wait(). Water has since apologized to the server.' },
    { tag:'PERSONNEL.NOTE', text:'Subject claims to have zero open tabs. Security footage shows 47. This contradiction is under review.' },
    { tag:'SCHALE.INTEL',   text:'fun fact: every null check in Water\'s codebase was added after something exploded in production. Growth through pain.' },
];

var OPERATIVES = [
    'CryptoSage_88','Yuki_Phantom','NullPtr_Dev','ByteWitch_42','Kivotos_Alpha',
    'DataVoid_7','ShadowByte','GhostScripter','VoidRunner_X','LuauLegend_01',
    'SchaleAgent_01','w4ter_fan_lol','NekoBytes_99','SysAdmin_404','CaffeineDev',
    'AnonymousReader','ZeroDay_Z','Plana_WatchesYou','BugHunter_Pro',
];

/* ════════════════════════════════
   EVENT: INCOMING TRANSMISSION
════════════════════════════════ */
function triggerTransmission() {
    var t   = TRANSMISSIONS[Math.floor(Math.random() * TRANSMISSIONS.length)];
    var col = PRI_COLORS[t.pri] || 'var(--accent)';
    var id  = 'tx_' + Date.now();

    var card = document.createElement('div');
    card.id   = id;
    card.style.cssText = [
        'position:fixed;bottom:88px;right:28px;z-index:9992;width:310px;',
        'background:rgba(5,9,26,.98);',
        'border:1px solid rgba(255,255,255,.07);border-top:2px solid ' + col + ';',
        'border-radius:12px;overflow:hidden;',
        'box-shadow:0 16px 50px rgba(0,0,0,.8),0 0 0 1px rgba(26,168,255,.04);',
        'transform:translateX(340px);opacity:0;',
        'transition:all 0.45s cubic-bezier(0.175,0.885,0.32,1.275);',
        'font-family:\'JetBrains Mono\',monospace;',
    ].join('');

    card.innerHTML =
        // header
        '<div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.05);' +
            'background:rgba(26,168,255,.03);display:flex;align-items:center;justify-content:space-between;">' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
                '<span style="font-size:11px;">📡</span>' +
                '<span style="font-family:\'Rajdhani\',sans-serif;font-weight:900;font-size:12px;' +
                    'letter-spacing:.12em;color:#fff;">INCOMING TRANSMISSION</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:6px;">' +
                '<span style="font-size:7px;font-weight:700;letter-spacing:.1em;padding:2px 7px;border-radius:4px;' +
                    'background:rgba(255,255,255,.04);border:1px solid ' + col + ';color:' + col + ';">' + t.pri + '</span>' +
                '<button onclick="document.getElementById(\'' + id + '\').remove();if(typeof playClick===\'function\')playClick(300,.08);" ' +
                    'style="background:none;border:none;color:#2e3450;cursor:pointer;font-size:14px;' +
                    'line-height:1;padding:0 2px;transition:color .15s;" ' +
                    'onmouseover="this.style.color=\'#fff\'" onmouseout="this.style.color=\'#2e3450\'">×</button>' +
            '</div>' +
        '</div>' +
        // body
        '<div style="padding:14px;">' +
            '<div style="font-size:8px;letter-spacing:.1em;color:' + col + ';margin-bottom:10px;">FROM: ' + t.from + ' // SCHALE_DB</div>' +
            '<p style="font-size:11.5px;color:#c8d0e8;line-height:1.7;font-family:\'Nunito\',sans-serif;' +
                'margin:0 0 12px;">"' + t.msg + '"</p>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:8px;color:#2e3450;">' + new Date().toLocaleTimeString() + '</span>' +
                '<button onclick="document.getElementById(\'' + id + '\').remove();if(typeof playClick===\'function\')playClick(400,.1);" ' +
                    'style="font-size:9px;font-weight:700;letter-spacing:.1em;padding:5px 14px;border-radius:6px;' +
                    'cursor:pointer;background:' + col + ';color:#000;border:none;' +
                    'font-family:\'JetBrains Mono\',monospace;transition:opacity .15s;" ' +
                    'onmouseover="this.style.opacity=\'.8\'" onmouseout="this.style.opacity=\'1\'">ACKNOWLEDGE</button>' +
            '</div>' +
        '</div>';

    document.body.appendChild(card);
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            card.style.transform = 'translateX(0)';
            card.style.opacity   = '1';
        });
    });
    setTimeout(function () {
        var el = document.getElementById(id);
        if (el) { el.style.transform = 'translateX(340px)'; el.style.opacity = '0'; }
        setTimeout(function () { var el2 = document.getElementById(id); if (el2) el2.remove(); }, 450);
    }, 10000);

    if (typeof playClick === 'function') playClick(660, 0.1);
}

/* ════════════════════════════════
   EVENT: SCHALE REPORT CARD
════════════════════════════════ */
function triggerSchaleReport() {
    var r   = SCHALE_REPORTS[Math.floor(Math.random() * SCHALE_REPORTS.length)];
    var id  = 'sr_' + Date.now();

    var card = document.createElement('div');
    card.id   = id;
    card.style.cssText = [
        'position:fixed;top:84px;right:28px;z-index:9991;width:240px;',
        'background:rgba(5,9,26,.98);',
        'border:1px solid rgba(255,184,58,.2);border-top:2px solid var(--gold);',
        'border-radius:12px;overflow:hidden;',
        'box-shadow:0 12px 40px rgba(0,0,0,.7),0 0 20px rgba(255,184,58,.06);',
        'transform:translateX(280px);opacity:0;',
        'transition:all 0.45s cubic-bezier(0.175,0.885,0.32,1.275);pointer-events:none;',
        'font-family:\'JetBrains Mono\',monospace;',
    ].join('');

    card.innerHTML =
        '<div style="padding:10px 14px;border-bottom:1px solid rgba(255,184,58,.12);' +
            'background:rgba(255,184,58,.04);display:flex;align-items:center;gap:7px;">' +
            '<span style="font-size:11px;">📊</span>' +
            '<span style="font-family:\'Rajdhani\',sans-serif;font-weight:900;font-size:11px;' +
                'letter-spacing:.12em;color:var(--gold);">SCHALE REPORT</span>' +
        '</div>' +
        '<div style="padding:14px 16px;">' +
            '<div style="font-size:7.5px;color:#4E6490;letter-spacing:.12em;margin-bottom:6px;text-transform:uppercase;">' + r.label + '</div>' +
            '<div style="font-size:32px;font-weight:900;color:#fff;font-family:\'Rajdhani\',sans-serif;line-height:1;">' + r.value + '</div>' +
            '<div style="font-size:9px;color:#2e3450;margin-top:4px;font-style:italic;">' + r.note + '</div>' +
        '</div>';

    document.body.appendChild(card);
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            card.style.transform = 'translateX(0)';
            card.style.opacity   = '1';
        });
    });
    setTimeout(function () {
        var el = document.getElementById(id);
        if (el) { el.style.transform = 'translateX(280px)'; el.style.opacity = '0'; }
        setTimeout(function () { var el2 = document.getElementById(id); if (el2) el2.remove(); }, 450);
    }, 7500);
}

/* ════════════════════════════════
   EVENT: LORE FRAGMENT
════════════════════════════════ */
function triggerLoreFragment() {
    var l   = LORE_ENTRIES[Math.floor(Math.random() * LORE_ENTRIES.length)];
    var id  = 'lf_' + Date.now();

    var card = document.createElement('div');
    card.id   = id;
    card.style.cssText = [
        'position:fixed;bottom:28px;right:28px;z-index:9991;width:300px;',
        'background:rgba(5,9,26,.98);',
        'border:1px solid rgba(168,85,247,.25);border-left:3px solid #a855f7;',
        'border-radius:10px;padding:14px 16px;',
        'box-shadow:0 12px 40px rgba(0,0,0,.7),0 0 20px rgba(168,85,247,.07);',
        'transform:translateY(40px) scale(.96);opacity:0;',
        'transition:all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);pointer-events:none;',
        'font-family:\'JetBrains Mono\',monospace;',
    ].join('');

    card.innerHTML =
        '<div style="font-size:7.5px;letter-spacing:.14em;color:#a855f7;margin-bottom:8px;' +
            'display:flex;align-items:center;gap:6px;">' +
            '<span>◈</span> SCHALE DATABASE // ' + l.tag +
        '</div>' +
        '<p style="font-size:11px;color:#8898bb;line-height:1.65;margin:0;font-family:\'Nunito\',sans-serif;">' +
            l.text + '</p>';

    document.body.appendChild(card);
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.opacity   = '1';
        });
    });
    setTimeout(function () {
        var el = document.getElementById(id);
        if (el) { el.style.transform = 'translateY(40px) scale(.96)'; el.style.opacity = '0'; }
        setTimeout(function () { var el2 = document.getElementById(id); if (el2) el2.remove(); }, 450);
    }, 8000);
}

/* ════════════════════════════════
   EVENT: OPERATIVE CONNECTED
════════════════════════════════ */
function triggerOperative() {
    var name = OPERATIVES[Math.floor(Math.random() * OPERATIVES.length)];
    if (typeof showToast === 'function')
        showToast('👤 <b>' + name + '</b> connected to the network.', 'var(--green)');
    if (typeof playClick === 'function') playClick(880, 0.07);
}

/* ════════════════════════════════
   EVENT: AUTO SYSLOG (writes to terminal)
════════════════════════════════ */
function triggerSyslog() {
    var out = document.getElementById('cli-output');
    if (!out) return;
    var msg  = SYSLOG_LINES[Math.floor(Math.random() * SYSLOG_LINES.length)];
    var line = document.createElement('div');
    line.style.cssText = 'margin-bottom:4px;font-size:9.5px;';
    line.innerHTML = '<span style="color:#1f2d50;font-family:\'JetBrains Mono\',monospace;">[SYS]</span> ' +
        '<span style="color:#2e3d5a;">' + msg + '</span>';
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
    if (typeof playClick === 'function') playClick(1100, 0.015);
}

/* ════════════════════════════════
   EVENT: ANOMALY — visual glitch
════════════════════════════════ */
function triggerAnomaly() {
    // CSS glitch
    if (!document.getElementById('anomaly-keyframe')) {
        var s = document.createElement('style');
        s.id  = 'anomaly-keyframe';
        s.textContent =
            '@keyframes glitchStrip{' +
            '0%{clip-path:inset(40% 0 50% 0)}25%{clip-path:inset(60% 0 20% 0)}' +
            '50%{clip-path:inset(10% 0 80% 0)}75%{clip-path:inset(70% 0 5% 0)}100%{clip-path:inset(40% 0 50% 0)}}';
        document.head.appendChild(s);
    }

    // Body shake
    document.body.style.animation = 'shake 0.45s cubic-bezier(.36,.07,.19,.97) both';
    setTimeout(function () { document.body.style.animation = ''; }, 450);

    // Red vignette flash
    var flash = document.createElement('div');
    flash.style.cssText =
        'position:fixed;inset:0;z-index:99990;pointer-events:none;' +
        'background:radial-gradient(ellipse 80% 80% at 50% 50%,transparent 50%,rgba(255,68,85,.12) 100%);' +
        'opacity:1;transition:opacity 0.6s ease;';
    document.body.appendChild(flash);
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            flash.style.opacity = '0';
            setTimeout(function () { flash.remove(); }, 700);
        });
    });

    // Brief hue glitch
    document.body.style.filter = 'hue-rotate(90deg) saturate(2)';
    setTimeout(function () { document.body.style.filter = ''; }, 90);

    if (typeof showToast === 'function') showToast('⚠ ANOMALY DETECTED — source: unknown', 'var(--alert)');
    if (typeof playClick === 'function') playClick(80, 0.5);
}

/* ════════════════════════════════
   EVENT: MATRIX FLASH (terminal)
════════════════════════════════ */
function triggerMatrixFlash() {
    var out = document.getElementById('cli-output');
    if (!out) return;
    var saved = out.innerHTML;
    var glyphs = 'アウエカサクスタナハマヤラ0123456789ABCDEF@#$!?<>/\\|~';
    var tick   = 0;
    if (typeof showToast === 'function') showToast('📡 SIGNAL SCRAMBLED — rerouting...', 'var(--alert)');
    if (typeof playClick === 'function') playClick(200, 0.3);

    var iv = setInterval(function () {
        var html = '';
        for (var r = 0; r < 7; r++) {
            var row = '';
            for (var c = 0; c < 38; c++) row += glyphs[Math.floor(Math.random() * glyphs.length)];
            html += '<div style="color:rgba(26,168,255,' + (0.05 + Math.random() * 0.25) + ');' +
                'font-size:9px;line-height:1.8;font-family:\'JetBrains Mono\',monospace;">' + row + '</div>';
        }
        out.innerHTML = html;
        tick++;
        if (tick >= 24) {
            clearInterval(iv);
            out.innerHTML = saved;
            var restore = document.createElement('div');
            restore.style.cssText = 'font-size:9px;color:var(--green);font-family:\'JetBrains Mono\',monospace;margin-bottom:4px;';
            restore.innerHTML = '[SYS] Signal restored. All data intact.';
            out.appendChild(restore);
            out.scrollTop = out.scrollHeight;
        }
    }, 75);
}

/* ════════════════════════════════
   EVENT: SIGNAL LOSS (static overlay)
════════════════════════════════ */
function triggerSignalLoss() {
    var cv = document.createElement('canvas');
    cv.width  = window.innerWidth;
    cv.height = window.innerHeight;
    cv.style.cssText =
        'position:fixed;inset:0;z-index:9988;pointer-events:none;opacity:0;' +
        'transition:opacity .18s;';
    document.body.appendChild(cv);

    var ctx = cv.getContext('2d');
    var f   = 0, MAX = 20;
    requestAnimationFrame(function () { cv.style.opacity = '0.14'; });

    var iv = setInterval(function () {
        var d = ctx.createImageData(cv.width, cv.height);
        for (var i = 0; i < d.data.length; i += 4) {
            var v = Math.random() > 0.5 ? 255 : 0;
            d.data[i] = d.data[i+1] = d.data[i+2] = v;
            d.data[i+3] = Math.floor(Math.random() * 200);
        }
        ctx.putImageData(d, 0, 0);
        f++;
        if (f >= MAX) {
            clearInterval(iv);
            cv.style.opacity = '0';
            setTimeout(function () { cv.remove(); }, 280);
        }
    }, 55);

    if (typeof showToast === 'function') showToast('📶 CONNECTION UNSTABLE — rerouting via backup node', 'var(--gold)');
    if (typeof playClick === 'function') playClick(100, 0.4);
}

/* ════════════════════════════════
   IDLE DETECTION
════════════════════════════════ */
function initIdleDetection() {
    var lastActive = Date.now();
    var warned30   = false;
    var warned60   = false;
    var warned120  = false;

    function resetIdle() { lastActive = Date.now(); warned30 = warned60 = warned120 = false; }
    window.addEventListener('mousemove', resetIdle, { passive: true });
    window.addEventListener('keydown',   resetIdle, { passive: true });
    window.addEventListener('click',     resetIdle, { passive: true });

    setInterval(function () {
        var idle = Date.now() - lastActive;

        if (idle > 30000 && !warned30) {
            warned30 = true;
            if (typeof showToast === 'function')
                showToast('👀 Sensei... still there?', '#4E6490');
        }
        if (idle > 60000 && !warned60) {
            warned60 = true;
            unlockAchievement('idle_sensei');
            triggerSyslog();
            var out = document.getElementById('cli-output');
            if (out) {
                var line = document.createElement('div');
                line.style.cssText = 'font-size:9px;color:var(--gold);font-family:\'JetBrains Mono\',monospace;margin-bottom:4px;';
                line.innerHTML = '[IDLE] Sensei inactive for 60s — issuing wellness check';
                out.appendChild(line);
                out.scrollTop = out.scrollHeight;
            }
        }
        if (idle > 120000 && !warned120) {
            warned120 = true;
            triggerTransmission();
        }
    }, 6000);
}

/* ════════════════════════════════
   RANDOM EVENTS ENGINE
════════════════════════════════ */
var _lastFired = {};
var EVENT_POOL = [
    { id:'transmission',  weight:5, cooldown:80000  },
    { id:'operative',     weight:6, cooldown:45000  },
    { id:'syslog',        weight:8, cooldown:30000  },
    { id:'schale_report', weight:4, cooldown:100000 },
    { id:'lore',          weight:4, cooldown:90000  },
    { id:'anomaly',       weight:2, cooldown:200000 },
    { id:'signal_loss',   weight:2, cooldown:250000 },
    { id:'matrix_flash',  weight:1, cooldown:320000 },
];

function _pickEvent() {
    var now  = Date.now();
    var pool = EVENT_POOL.filter(function (e) {
        return !_lastFired[e.id] || (now - _lastFired[e.id]) > e.cooldown;
    });
    if (!pool.length) return null;
    var total = pool.reduce(function (s, e) { return s + e.weight; }, 0);
    var pick  = Math.random() * total, cum = 0;
    for (var i = 0; i < pool.length; i++) {
        cum += pool[i].weight;
        if (pick <= cum) return pool[i];
    }
    return pool[pool.length - 1];
}

function _fireEvent(ev) {
    if (!ev) return;
    _lastFired[ev.id] = Date.now();
    switch (ev.id) {
        case 'transmission':  triggerTransmission();  break;
        case 'operative':     triggerOperative();     break;
        case 'syslog':        triggerSyslog();        break;
        case 'schale_report': triggerSchaleReport();  break;
        case 'lore':          triggerLoreFragment();  break;
        case 'anomaly':       triggerAnomaly();       break;
        case 'signal_loss':   triggerSignalLoss();    break;
        case 'matrix_flash':  triggerMatrixFlash();   break;
    }
}

function initRandomEvents() {
    // First event fires 18–35s after page enters view
    setTimeout(function () {
        _fireEvent(_pickEvent());

        // Then on a rolling interval of 20–55s, 60% chance to fire
        function schedule() {
            setTimeout(function () {
                if (Math.random() < 0.6) _fireEvent(_pickEvent());
                schedule();
            }, 20000 + Math.random() * 35000);
        }
        schedule();
    }, 18000 + Math.random() * 17000);
}
