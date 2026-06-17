import './style.css';

// ─── PRICING DATA ───────────────────────────────────────────────
// Prices valid from 1 May 2026. Source: Sand City flyer.
//
// DELIVERED: columns are 1m³, 2m³, 3m³, 4m³, 5m³, 6m³, 10m³, 12m³
// SELF COLLECT: only ½m³ and 1m³ are available (no larger volumes)

const prices = {
  delivered: [
    //  Product                  1m³         2m³         3m³         4m³         5m³         6m³         10m³        12m³
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
    //  Product                  ½m³         1m³
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

// Column headers per mode
const headers = {
  delivered: ['1m³', '2m³', '3m³', '4m³', '5m³', '6m³', '10m³', '12m³'],
  collect:   ['½m³', '1m³'],
};

// ─── RENDER PRICING TABLE ────────────────────────────────────────
function renderTable(type) {
  // Update thead
  const thead = document.querySelector('#price-table thead tr');
  if (thead) {
    thead.innerHTML =
      '<th>Product</th>' +
      headers[type].map(h => `<th>${h}</th>`).join('');
  }

  // Update tbody
  const tbody = document.getElementById('price-body');
  if (!tbody) return;
  tbody.innerHTML = prices[type]
    .map(row => `
      <tr>
        ${row.map(cell => `<td>${cell}</td>`).join('')}
      </tr>
    `).join('');
}

window.showPricing = function(type) {
  renderTable(type);
  document.getElementById('btn-deliver').classList.toggle('active', type === 'delivered');
  document.getElementById('btn-collect').classList.toggle('active', type === 'collect');
};

// Render delivered prices by default on load
renderTable('delivered');


// ─── WHATSAPP ORDER ──────────────────────────────────────────────
const WHATSAPP_NUMBER = '27828022147';

window.sendWhatsApp = function() {
  const name     = document.getElementById('f-name').value.trim();
  const phone    = document.getElementById('f-phone').value.trim();
  const product  = document.getElementById('f-product').value;
  const volume   = document.getElementById('f-volume').value;
  const delivery = document.getElementById('f-delivery').value;
  const address  = document.getElementById('f-address').value.trim();
  const notes    = document.getElementById('f-msg').value.trim();

  if (!name || !phone || !product || !volume || !delivery) {
    alert('Please fill in all required fields (marked with *).');
    return;
  }

  const message = [
    `🏗️ *New Order – Sand City Website*`,
    ``,
    `👤 *Name:* ${name}`,
    `📞 *Phone:* ${phone}`,
    `📦 *Product:* ${product}`,
    `📐 *Volume:* ${volume}`,
    `🚚 *Delivery/Collect:* ${delivery}`,
    address ? `📍 *Address:* ${address}` : null,
    notes   ? `📝 *Notes:* ${notes}`    : null,
  ]
  .filter(Boolean)
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