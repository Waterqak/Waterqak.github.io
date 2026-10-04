// Commission panel (contact page) + hero availability text. Reads SITE.commission
(() => {
    const c = SITE.commission;
    if (!c) return;
    const labels = { OPEN: 'Open for commissions', LIMITED: 'Limited availability', CLOSED: 'Commissions closed' };
    window.availText = () => labels[c.status] || 'System Online';

    const badge = document.getElementById('status-txt');
    if (badge) badge.textContent = window.availText();

    const panel = document.getElementById('commission-panel');
    if (!panel) return;
    const el = (tag, cls, text) => {
        const node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text != null) node.textContent = text;
        return node;
    };
    const status = el('span', 'commission-status');
    status.dataset.s = c.status;
    status.append(el('i'), c.status);
    const head = el('div', 'commission-head');
    head.append(el('span', 'commission-title', 'COMMISSIONS'), status);

    const grid = el('dl', 'commission-grid');
    c.terms.forEach(([k, v]) => { const d = el('div'); d.append(el('dt', '', k.toUpperCase()), el('dd', '', v)); grid.append(d); });
    panel.append(head, el('p', 'commission-note', c.note), grid);
})();
