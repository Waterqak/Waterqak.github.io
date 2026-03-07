/* ============================================================
   ✏️  TRANSLATIONS.JS — EN / TH text strings
   BUG FIX: now syncs #lang-display-mobile
   ============================================================ */

const translations = {

    EN: {
        nav_about:        "Home",
        nav_work:         "Projects",
        nav_estimator:    "Estimator",
        nav_hire:         "MomoTalk",
        hero_prefix:      "Sensei, I fix",
        hero_desc:        "Specialized Roblox Systems Engineer. Focusing on backend stability, data integrity, and complex game mechanics.",
        status_online:    "System Online",
        btn_see_work:     "VIEW DATABASE",
        contact_title:    "MomoTalk",
        contact_sub:      "Sensei, you have a new message.",
        calc_title:       "RESOURCE ESTIMATOR",
        calc_subtitle:    "Calculate budget requirements.",
        calc_type:        "OPERATION TYPE",
        serv_quick:       "Quick Task",
        serv_fix:         "Bug Fix",
        serv_sys:         "System",
        serv_game:        "Full Game",
        label_complexity: "Complexity",
        label_timeline:   "Urgency",
    },

    TH: {
        nav_about:        "หน้าหลัก",
        nav_work:         "ผลงาน",
        nav_estimator:    "ราคา",
        nav_hire:         "MomoTalk",
        hero_prefix:      "เซ็นเซย์ครับ ผมซ่อม",
        hero_desc:        "วิศวกรระบบ Roblox เชี่ยวชาญด้าน Backend เสถียรภาพของข้อมูล และระบบเกมซับซ้อน",
        status_online:    "สถานะ: ออนไลน์",
        btn_see_work:     "ดูฐานข้อมูล",
        contact_title:    "MomoTalk",
        contact_sub:      "เซ็นเซย์ มีข้อความใหม่ครับ",
        calc_title:       "ประเมินงบประมาณ",
        calc_subtitle:    "คำนวณงบประมาณที่ต้องใช้",
        calc_type:        "ประเภทภารกิจ",
        serv_quick:       "งานด่วน",
        serv_fix:         "แก้บั๊ก",
        serv_sys:         "ทำระบบ",
        serv_game:        "เกมเต็ม",
        label_complexity: "ความซับซ้อน",
        label_timeline:   "ความเร่งด่วน",
    },

};

function toggleLanguage() {
    const display       = document.getElementById('lang-display');
    const displayMobile = document.getElementById('lang-display-mobile'); // BUG FIX
    const next          = (display?.innerText || 'EN') === 'EN' ? 'TH' : 'EN';

    if (display)       display.innerText       = next;
    if (displayMobile) displayMobile.innerText = next; // BUG FIX: was missing

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const val = translations[next]?.[key];
        if (val) el.innerText = val;
    });

    // Re-run typewriter in new language
    if (typeof typeWriter === 'function') typeWriter();
}
