/* ============================================================
   CALCULATOR.JS — Price estimator logic
   Edit CURRENCY_RATES or pricing tiers if needed.
   ============================================================ */

let basePrice = 2500;

const CURRENCY_RATES = {
    'R$':  { r: 1,      prefix: false, symbol: ' R$' },
    'USD': { r: 0.0035, prefix: true,  symbol: '$'   },
    'THB': { r: 0.12,   prefix: true,  symbol: '฿'   },
    'VND': { r: 90,     prefix: false, symbol: '₫'   },
};

function selectService(price, btn) {
    basePrice = price;
    document.querySelectorAll('.service-btn').forEach(b => {
        b.classList.remove('border-schale');
        b.classList.add('border-white/10');
        b.querySelector('div')?.classList.remove('bg-schale/5');
    });
    btn.classList.remove('border-white/10');
    btn.classList.add('border-schale');
    btn.querySelector('div')?.classList.add('bg-schale/5');
    calculateBudget();
}

function calculateBudget() {
    const c  = parseFloat(document.getElementById('complexity-range').value);
    const r  = parseFloat(document.getElementById('rush-range').value);
    const cu = document.getElementById('currency-select').value;

    // Complexity label
    const cl = document.getElementById('complexity-val');
    if (c < 1.3)      { cl.innerText = 'Standard';       cl.className = 'text-gray-400 text-xs font-mono bg-white/5 px-2 py-0.5 rounded'; }
    else if (c < 1.7) { cl.innerText = 'Complex';        cl.className = 'text-schale text-xs font-mono bg-schale/10 px-2 py-0.5 rounded'; }
    else              { cl.innerText = 'Architect Level'; cl.className = 'text-gold text-xs font-mono bg-gold/10 px-2 py-0.5 rounded'; }

    // Urgency label
    const rl = document.getElementById('rush-val');
    if (r < 1.2)      { rl.innerText = 'Standard'; rl.className = 'text-gray-400 text-xs font-mono bg-white/5 px-2 py-0.5 rounded'; }
    else if (r < 1.4) { rl.innerText = 'Priority';  rl.className = 'text-schale text-xs font-mono bg-schale/10 px-2 py-0.5 rounded'; }
    else              { rl.innerText = 'ASAP';       rl.className = 'text-alert text-xs font-mono bg-alert/10 px-2 py-0.5 rounded'; }

    // Total
    const { r: rate, prefix, symbol } = CURRENCY_RATES[cu];
    const total   = basePrice * c * r;
    const conv    = Math.ceil(total * rate);
    const display = prefix ? symbol + conv.toLocaleString() : conv.toLocaleString() + symbol;

    document.getElementById('receipt-base').innerText = basePrice.toLocaleString();
    document.getElementById('receipt-comp').innerText = `x${c.toFixed(1)}`;
    document.getElementById('receipt-rush').innerText = `x${r.toFixed(1)}`;
    document.getElementById('total-price').innerText  = display;
    document.getElementById('sub-price').innerText    = cu !== 'USD'
        ? `approx ~$${Math.ceil(total * CURRENCY_RATES['USD'].r)} USD`
        : `approx ${Math.ceil(total).toLocaleString()} R$`;
}
