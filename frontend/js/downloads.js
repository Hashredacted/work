// ── Downloads Page JS — API-driven ──
// Fetches entries from /api/downloads and renders cards dynamically.

document.addEventListener('DOMContentLoaded', async () => {
  initThemeToggle();
  initFilterTabs();
  initQRModal();
  await loadAndRender();
  initSearch(); // init after cards exist
});

// ═══════════════════════════
//  Theme Toggle
// ═══════════════════════════
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const current = localStorage.getItem('rcs_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', current);
  setIcon(btn, current);
  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('rcs_theme', next);
    setIcon(btn, next);
  });
}

function setIcon(btn, theme) {
  btn.innerHTML = theme === 'dark'
    ? '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>'
    : '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>';
}

// ═══════════════════════════
//  Fetch + Render
// ═══════════════════════════
async function loadAndRender() {
  const grid = document.getElementById('downloads-grid');
  if (!grid) return;

  // Show skeleton
  grid.innerHTML = `<div class="dl-loading">⏳ Loading downloads…</div>`;

  let items = [];
  try {
    const res = await fetch('/api/downloads');
    if (res.ok) {
      items = await res.json(); // only visible entries
    }
  } catch {
    // API not available — fall back to default static list
    items = FALLBACK_DOWNLOADS;
  }

  if (items.length === 0) {
    grid.innerHTML = `<div class="dl-empty-state"><div style="font-size:40px;margin-bottom:12px;">📦</div><p>No downloads available right now. Check back soon.</p></div>`;
    return;
  }

  grid.innerHTML = items.map(d => buildCard(d)).join('');

  // Rebind interactions on fresh cards
  bindDownloadButtons();
  bindQRButtons();
}

// ═══════════════════════════
//  Card Builder
// ═══════════════════════════
const CAT_META = {
  erp:     { icon: '🖥️', osTag: '<span class="meta-pill os-win">🪟 Windows</span>', actionLabel: '⬇ Download', actionType: 'link' },
  mobile:  { icon: '📱', osTag: '<span class="meta-pill os-android">🤖 Android</span><span class="meta-pill os-ios">🍎 iOS</span>', actionLabel: '📲 Get on Mobile', actionType: 'qr' },
  hrms:    { icon: '👔', osTag: '<span class="meta-pill os-win">🪟 Windows</span><span class="meta-pill">🇮🇳 India Ready</span>', actionLabel: '⬇ Download', actionType: 'link' },
  support: { icon: '🛠️', osTag: '<span class="meta-pill os-win">🪟 Windows</span>', actionLabel: '⬇ Download', actionType: 'link' },
};

const FEATURED_CATS = new Set(['erp', 'hrms']);

function esc(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildCard(d) {
  const meta  = CAT_META[d.category] || CAT_META.erp;
  const isMobile = d.category === 'mobile';
  const isFeatured = FEATURED_CATS.has(d.category);

  const iconHtml = `
    <div class="app-icon-wrap">
      <span class="app-icon-font">${meta.icon}</span>
    </div>`;

  const actionBtn = isMobile
    ? `<button class="btn-download-main" data-name="${esc(d.name)}"
         data-qr-app="${esc(d.name)}"
         data-play-url="${esc(d.url)}">
         ${meta.actionLabel}
       </button>`
    : `<a href="${esc(d.url)}" target="_blank" rel="noopener"
         class="btn-download-main" data-name="${esc(d.name)}">
         ${meta.actionLabel} ${esc(d.name)}
       </a>`;

  const platformPill = d.platform
    ? `<span class="meta-pill">${esc(d.platform)}</span>` : '';
  const sizePill = d.size
    ? `<span class="meta-pill">📦 ${esc(d.size)}</span>` : '';
  const versionPill = d.version && d.version !== 'Latest'
    ? `<span class="meta-pill">🔖 ${esc(d.version)}</span>` : '';

  return `
  <div class="dl-card${isFeatured ? ' featured-card' : ''}" data-cat="${esc(d.category)}" data-id="${d.id}">
    <div class="card-top">
      ${iconHtml}
      <div class="card-header-info">
        <div class="card-title-row">
          <div class="card-title">${esc(d.name)}</div>
          ${isFeatured ? `<span class="badge-featured">${d.category === 'hrms' ? 'Payroll' : 'Desktop'}</span>` : ''}
        </div>
        <div class="card-subtitle">${esc(d.subtitle)}</div>
      </div>
    </div>
    <div class="meta-badges">
      ${platformPill}
      ${sizePill}
      ${versionPill}
    </div>
    <div class="card-actions" style="margin-top:auto;">
      ${actionBtn}
      <div class="sub-actions-row">
        ${isMobile
          ? `<a href="${esc(d.url)}" target="_blank" rel="noopener" class="btn-secondary-action">🤖 Play Store</a>`
          : `<a href="index.html#contact" class="btn-secondary-action">📞 Get Support</a>`
        }
      </div>
    </div>
  </div>`;
}

// ═══════════════════════════
//  Search
// ═══════════════════════════
function initSearch() {
  const input = document.getElementById('dl-search');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    const activeFilter = document.querySelector('.filter-tab-btn.active')?.dataset.cat || 'all';
    document.querySelectorAll('.dl-card').forEach(card => {
      const matchSearch = card.textContent.toLowerCase().includes(q);
      const matchCat = activeFilter === 'all' || card.dataset.cat === activeFilter;
      card.style.display = (matchSearch && matchCat) ? '' : 'none';
    });
  });
}

// ═══════════════════════════
//  Filter Tabs
// ═══════════════════════════
function initFilterTabs() {
  document.querySelectorAll('.filter-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.dl-card').forEach(card => {
        card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
      });
      const searchInput = document.getElementById('dl-search');
      if (searchInput) searchInput.value = '';
    });
  });
}

// ═══════════════════════════
//  Download Button Toast
// ═══════════════════════════
function bindDownloadButtons() {
  document.querySelectorAll('.btn-download-main[data-name]:not([data-qr-app])').forEach(btn => {
    btn.addEventListener('click', () => {
      showDlToast(`⬇ Starting ${btn.dataset.name} download…`);
    });
  });
}

function showDlToast(msg) {
  const toast = document.getElementById('dl-toast');
  if (!toast) return;
  toast.textContent = '✓  ' + msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ═══════════════════════════
//  QR / Mobile Modal
// ═══════════════════════════
function initQRModal() {
  const overlay = document.getElementById('qr-modal');
  document.getElementById('qr-modal-close')?.addEventListener('click', () => overlay?.classList.remove('active'));
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
}

function bindQRButtons() {
  const overlay   = document.getElementById('qr-modal');
  const titleEl   = document.getElementById('qr-modal-title');
  const subtitleEl = document.getElementById('qr-modal-subtitle');
  const linksEl   = document.getElementById('qr-modal-links');

  document.querySelectorAll('[data-qr-app]').forEach(btn => {
    btn.addEventListener('click', () => {
      const appName = btn.dataset.qrApp;
      const playUrl = btn.dataset.playUrl || null;
      if (titleEl) titleEl.textContent = appName;
      if (subtitleEl) subtitleEl.textContent = 'Tap the store button to download on your phone.';
      if (linksEl) {
        linksEl.innerHTML = playUrl
          ? `<a href="${playUrl}" target="_blank" class="btn-secondary-action">🤖 Google Play</a>`
          : `<p style="color:var(--text-muted);font-size:13px;">Contact our team for the download link.</p>`;
      }
      overlay?.classList.add('active');
    });
  });
}

// ═══════════════════════════
//  Fallback (if API offline)
// ═══════════════════════════
const FALLBACK_DOWNLOADS = [
  { id:1, name:'Marg ERP 9+',    subtitle:'Billing & Accounting Software',  category:'erp',     platform:'Windows', version:'v9.9.x', size:'~85 MB',  url:'https://www.margbooks.com/downloads.asp', visible:true },
  { id:2, name:'MargCloud Agent',subtitle:'Cloud Access Client',             category:'erp',     platform:'Windows', version:'Latest', size:'~12 MB',  url:'https://www.margbooks.com/downloads.asp', visible:true },
  { id:3, name:'Marg eRetail',   subtitle:'For Retailers & Chemists',        category:'mobile',  platform:'Android / iOS', version:'Latest', size:'App Store', url:'https://play.google.com/store/search?q=marg+eretail&c=apps', visible:true },
  { id:4, name:'Marg eOrder',    subtitle:'For Field Salesmen',              category:'mobile',  platform:'Android / iOS', version:'Latest', size:'App Store', url:'https://play.google.com/store/search?q=marg+eorder&c=apps',  visible:true },
  { id:5, name:'Marg eOwner',    subtitle:'For Business Owners',             category:'mobile',  platform:'Android / iOS', version:'Latest', size:'App Store', url:'https://play.google.com/store/search?q=marg+eowner&c=apps',  visible:true },
  { id:6, name:'SFAXpert',       subtitle:'Sales Force Automation',          category:'mobile',  platform:'Android / iOS', version:'Latest', size:'App Store', url:'https://play.google.com/store/search?q=sfaxpert+marg&c=apps', visible:true },
  { id:7, name:'PharmaNXT',      subtitle:'Medicine & Salt Info',            category:'mobile',  platform:'Android / iOS', version:'Latest', size:'App Store', url:'https://play.google.com/store/search?q=pharmanxt&c=apps',    visible:true },
  { id:8, name:'GPS Tracking',   subtitle:'Field Force Tracking',            category:'mobile',  platform:'Android / iOS', version:'Latest', size:'App Store', url:'https://play.google.com/store/search?q=marg+gps+tracking&c=apps', visible:true },
  { id:9, name:'MargHRMS',       subtitle:'Payroll & HR Management',         category:'hrms',    platform:'Windows', version:'Latest', size:'~60 MB',  url:'https://www.margbooks.com/downloads.asp', visible:true },
  { id:10,name:'AnyDesk',        subtitle:'Remote Desktop Support',          category:'support', platform:'Windows / Android', version:'Latest', size:'~5 MB', url:'https://anydesk.com/en/downloads/windows', visible:true },
  { id:11,name:'TeamViewer',     subtitle:'Remote Desktop Support',          category:'support', platform:'All Platforms', version:'Latest', size:'~50 MB', url:'https://www.teamviewer.com/en-in/download/windows/', visible:true },
];
