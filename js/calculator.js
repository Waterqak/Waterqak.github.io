/* ============================================================
   calculator.js — Price estimator / budget calculator
   ============================================================ */

let basePrice = 2500;

const CURRENCY_RATES = {
    'R$':  { r: 1,    prefix: false, symbol: ' R$'  },
    'USD': { r: 0.0035, prefix: true,  symbol: '$'   },
    'THB': { r: 0.12,  prefix: true,  symbol: '฿'   },
    'VND': { r: 90,   prefix: false, symbol: '₫'   },
};

/** Called when any service button is clicked. */
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

/** Recalculates and updates the receipt panel. */
function calculateBudget() {
    const c  = parseFloat(document.getElementById('complexity-range').value);
    const r  = parseFloat(document.getElementById('rush-range').value);
    const cu = document.getElementById('currency-select').value;

    // Complexity label
    const compLabel = document.getElementById('complexity-val');
    if (c < 1.3) {
        compLabel.innerText  = 'Standard';
        compLabel.className  = 'text-gray-400 text-xs font-mono bg-white/5 px-2 py-0.5 rounded';
    } else if (c < 1.7) {
        compLabel.innerText  = 'Complex';
        compLabel.className  = 'text-schale text-xs font-mono bg-schale/10 px-2 py-0.5 rounded';
    } else {
        compLabel.innerText  = 'Architect Level';
        compLabel.className  = 'text-gold text-xs font-mono bg-gold/10 px-2 py-0.5 rounded';
    }

    // Urgency label
    const rushLabel = document.getElementById('rush-val');
    if (r < 1.2) {
        rushLabel.innerText  = 'Standard';
        rushLabel.className  = 'text-gray-400 text-xs font-mono bg-white/5 px-2 py-0.5 rounded';
    } else if (r < 1.4) {
        rushLabel.innerText  = 'Priority';
        rushLabel.className  = 'text-schale text-xs font-mono bg-schale/10 px-2 py-0.5 rounded';
    } else {
        rushLabel.innerText  = 'ASAP';
        rushLabel.className  = 'text-alert text-xs font-mono bg-alert/10 px-2 py-0.5 rounded';
    }

    // Totals
    const { r: rate, prefix, symbol } = CURRENCY_RATES[cu];
    const total   = basePrice * c * r;
    const converted = Math.ceil(total * rate);
    const display = prefix
        ? symbol + converted.toLocaleString()
        : converted.toLocaleString() + symbol;

    document.getElementById('receipt-base').innerText = basePrice.toLocaleString();
    document.getElementById('receipt-comp').innerText = `x${c.toFixed(1)}`;
    document.getElementById('receipt-rush').innerText = `x${r.toFixed(1)}`;
    document.getElementById('total-price').innerText  = display;

    if (cu !== 'USD') {
        document.getElementById('sub-price').innerText =
            `approx ~$${Math.ceil(total * CURRENCY_RATES['USD'].r)} USD`;
    } else {
        document.getElementById('sub-price').innerText =
            `approx ${Math.ceil(total).toLocaleString()} R$`;
    }
}
