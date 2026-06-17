import './style.css';

// ─── PRICING DATA ───────────────────────────────────────────────
// Prices valid from 1 May 2026. Source: Sand City flyer.
// DELIVERED columns: 1m³, 2m³, 3m³, 4m³, 5m³, 6m³, 10m³, 12m³
// SELF COLLECT columns: ½m³, 1m³

const prices = {
  delivered: [
    ['Plaster Sand',        'R 800',    'R 1,150',  'R 1,600',  'R 1,840',  'R 2,220',  'R 2,560',  'R 3,800',  'R 4,420'],
    ['Building Sand',       'R 660',    'R 1,100',  'R 1,480',  'R 1,750',  'R 1,900',  'R 2,000',  'R 2,800',  'R 3,270'],
    ['Gravel (Sifted)',     'R 660',    'R 1,100',  'R 1,480',  'R 1,750',  'R 1,900',  'R 2,000',  'R 2,800',  'R 3,270'],
    ['Gravel (Unsifted)',   'R 610',    'R 990',    'R 1,150',  'R 1,520',  'R 1,750',  'R 1,870',  'R 2,500',  'R 2,880'],
    ['Topsoil',             'R 610',    'R 990',    'R 1,150',  'R 1,520',  'R 1,750',  'R 1,870',  'R 2,500',  'R 2,880'],
    ['Crusher Dust',        'R 980',    'R 1,720',  'R 2,300',  'R 2,820',  'R 3,500',  'R 3,800',  'R 6,200',  'R 6,800'],
    ['Concrete Stone 13mm', 'R 890',    'R 1,670',  'R 2,180',  'R 2,760',  'R 3,390',  'R 3,800',  'R 6,000',  'R 6,800'],
    ['Concrete Stone 19mm', 'R 890',    'R 1,670',  'R 2,180',  'R 2,760',  'R 3,390',  'R 3,800',  'R 6,000',  'R 6,800'],
    ['Builders Blend',      'R 890',    'R 1,670',  'R 2,180',  'R 2,760',  'R 3,390',  'R 3,800',  'R 6,000',  'R 6,800'],
  ],
  collect: [
    ['Plaster Sand',        'R 270',    'R 440'],
    ['Building Sand',       'R 260',    'R 400'],
    ['Gravel (Sifted)',     'R 260',    'R 400'],
    ['Gravel (Unsifted)',   'R 240',    'R 350'],
    ['Topsoil',             'R 240',    'R 350'],
    ['Crusher Dust',        'R 470',    'R 830'],
    ['Concrete Stone 13mm', 'R 450',    'R 780'],
    ['Concrete Stone 19mm', 'R 450',    'R 780'],
    ['Builders Blend',      'R 450',    'R 780'],
  ]
};

const headers = {
  delivered: ['1m³', '2m³', '3m³', '4m³', '5m³', '6m³', '10m³', '12m³'],
  collect:   ['½m³', '1m³'],
};

// Maps the dropdown volume label -> column index for each mode
const volumeIndex = {
  delivered: { '1 m³':0, '2 m³':1, '3 m³':2, '4 m³':3, '5 m³':4, '6 m³':5, '10 m³':6, '12 m³':7 },
  collect:   { '½ m³':0, '1 m³':1 },
};

// ─── PRICING TABLE (unchanged) ───────────────────────────────────
function renderTable(type) {
  const thead = document.querySelector('#price-table thead tr');
  if (thead) {
    thead.innerHTML = '<th>Product</th>' + headers[type].map(h => `<th>${h}</th>`).join('');
  }
  const tbody = document.getElementById('price-body');
  if (!tbody) return;
  tbody.innerHTML = prices[type]
    .map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`)
    .join('');
}

window.showPricing = function(type) {
  renderTable(type);
  document.getElementById('btn-deliver').classList.toggle('active', type === 'delivered');
  document.getElementById('btn-collect').classList.toggle('active', type === 'collect');
};

renderTable('delivered');


// ─── PRICE LOOKUP HELPER ─────────────────────────────────────────
// Returns a number (rands) if we have an exact price, or null if not.
function lookupPrice(product, volume, delivery) {
  // Bricks/cement and "Other / ask" never have a table price
  if (product === 'Bricks / Cement' || volume === 'Other / ask') return null;

  const mode = delivery === 'Self Collect' ? 'collect' : 'delivered';
  const colIndex = volumeIndex[mode][volume];
  if (colIndex === undefined) return null; // volume not in this mode's table

  const row = prices[mode].find(r => r[0] === product);
  if (!row) return null;

  const cell = row[colIndex + 1]; // +1 because col 0 is the product name
  if (!cell) return null;

  // "R 1,150" -> 1150
  return Number(cell.replace(/[^0-9]/g, ''));
}

function formatRand(n) {
  return 'R ' + n.toLocaleString('en-ZA');
}


// ─── ORDER STATE ─────────────────────────────────────────────────
// This array IS the order. Everything on screen is drawn FROM it.
// Add to it -> re-draw. Remove from it -> re-draw. This is "state".
let orderItems = [];

window.addItem = function() {
  const product  = document.getElementById('f-product').value;
  const volume   = document.getElementById('f-volume').value;
  const delivery = document.getElementById('f-delivery').value;

  if (!product || !volume || !delivery) {
    alert('Please choose a product, volume and delivery option before adding.');
    return;
  }

  const price = lookupPrice(product, volume, delivery); // number or null
  orderItems.push({ product, volume, delivery, price });

  // Reset the builder dropdowns so they can add another
  document.getElementById('f-product').value  = '';
  document.getElementById('f-volume').value   = '';
  document.getElementById('f-delivery').value = '';

  renderOrder();
};

window.removeItem = function(index) {
  orderItems.splice(index, 1); // remove 1 item at that position
  renderOrder();
};

function renderOrder() {
  const list  = document.getElementById('order-list');
  const empty = document.getElementById('order-empty');
  const totalBar = document.getElementById('order-total');
  const totalAmount = document.getElementById('total-amount');

  // Empty state
  if (orderItems.length === 0) {
    list.innerHTML = '<p class="order-empty" id="order-empty">No items added yet. Build your order above.</p>';
    totalBar.style.display = 'none';
    return;
  }

  // Build a row for each item
  list.innerHTML = orderItems.map((item, i) => {
    const priceLabel = item.price !== null
      ? `<span class="order-row-price">${formatRand(item.price)}</span>`
      : `<span class="order-row-price tbc">Price on request</span>`;

    return `
      <div class="order-row">
        <div class="order-row-info">
          <strong>${item.product}</strong>
          <span>${item.volume} · ${item.delivery}</span>
        </div>
        <div class="order-row-right">
          ${priceLabel}
          <button class="remove-btn" onclick="removeItem(${i})" aria-label="Remove item">×</button>
        </div>
      </div>
    `;
  }).join('');

  // Sum only the items we have a real price for
  const knownTotal = orderItems
    .filter(item => item.price !== null)
    .reduce((sum, item) => sum + item.price, 0);

  const hasUnknown = orderItems.some(item => item.price === null);

  totalBar.style.display = 'flex';
  totalAmount.textContent = hasUnknown
    ? `${formatRand(knownTotal)}+`   // "+" signals there are extra to-be-quoted items
    : formatRand(knownTotal);
}


// ─── WHATSAPP ORDER ──────────────────────────────────────────────
const WHATSAPP_NUMBER = '27828022147';

window.sendWhatsApp = function() {
  const name    = document.getElementById('f-name').value.trim();
  const phone   = document.getElementById('f-phone').value.trim();
  const address = document.getElementById('f-address').value.trim();
  const notes   = document.getElementById('f-msg').value.trim();

  if (orderItems.length === 0) {
    alert('Please add at least one item to your order.');
    return;
  }
  if (!name || !phone) {
    alert('Please fill in your name and phone number.');
    return;
  }

  // Build the itemised lines
  const itemLines = orderItems.map((item, i) => {
    const priceText = item.price !== null ? formatRand(item.price) : 'price on request';
    return `${i + 1}. ${item.product} — ${item.volume} (${item.delivery}) — ${priceText}`;
  });

  const knownTotal = orderItems
    .filter(item => item.price !== null)
    .reduce((sum, item) => sum + item.price, 0);
  const hasUnknown = orderItems.some(item => item.price === null);
  const totalText = hasUnknown ? `${formatRand(knownTotal)}+ (some items quoted on request)` : formatRand(knownTotal);

  const message = [
    `🏗️ *New Order – Sand City Website*`,
    ``,
    `👤 *Name:* ${name}`,
    `📞 *Phone:* ${phone}`,
    address ? `📍 *Address:* ${address}` : null,
    ``,
    `🧱 *Items:*`,
    ...itemLines,
    ``,
    `💰 *Estimated total:* ${totalText}`,
    notes ? `\n📝 *Notes:* ${notes}` : null,
  ]
  .filter(item => item !== null)
  .join('\n');

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};


// ─── SCROLL REVEAL ───────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 0.08 + 's';
  observer.observe(el);
});


// ─── MOBILE NAV TOGGLE ───────────────────────────────────────────
document.getElementById('nav-toggle').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.remove('open');
  });
});


// ─── MOBILE PRODUCTS COLLAPSE ────────────────────────────────────
function initProductCollapse() {
  if (window.innerWidth > 900) return;
  const grid = document.querySelector('.products-grid');
  const cards = [...document.querySelectorAll('.product-card')];
  if (!grid || cards.length <= 4) return;

  cards.slice(4).forEach(card => card.style.display = 'none');

  const btn = document.createElement('button');
  btn.textContent = 'Show all products';
  btn.className = 'show-more-btn';
  btn.addEventListener('click', () => {
    cards.slice(4).forEach(card => card.style.display = 'block');
    btn.style.display = 'none';
  });
  grid.after(btn);
}
initProductCollapse();