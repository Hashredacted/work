/* ═══════════════════════════════════════════════════
   admin.js — Raizada CompuSoft Admin Panel
   API-backed: all data goes through Express backend.
   Token stored in sessionStorage as rcs_admin_token.
═══════════════════════════════════════════════════ */

const API = '/api';
let TOKEN = sessionStorage.getItem('rcs_admin_token') || null;

// ── State ──
let downloads = [];
let pricing   = {};
let settings  = {};
let partners  = [];
let editingDownloadId  = null;
let deleteTargetId     = null;
let editingPartnerId   = null;
let partnerDeleteMode  = false;

// ═══════════════ INIT ═══════════════
document.addEventListener('DOMContentLoaded', () => {
  verifySession();
  setupLogin();
});

async function verifySession() {
  if (!TOKEN) return;
  try {
    const res = await apiFetch('GET', '/auth/me');
    if (res.ok) {
      showApp();
    } else {
      TOKEN = null;
      sessionStorage.removeItem('rcs_admin_token');
    }
  } catch {
    // server offline — fall through to login screen
  }
}

async function showApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-app').style.display = 'block';
  setupNav();
  setupLogout();
  await loadAll();
  navigateTo('dashboard');
}

async function loadAll() {
  await Promise.all([loadDownloads(), loadPricing(), loadSettings(), loadLogo(), loadPartners()]);
}

// ═══════════════ API HELPER ═══════════════
async function apiFetch(method, endpoint, body = null, isForm = false) {
  const headers = {};
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  if (body && !isForm) headers['Content-Type'] = 'application/json';

  const opts = { method, headers };
  if (body) opts.body = isForm ? body : JSON.stringify(body);

  const res = await fetch(API + endpoint, opts);
  return res;
}

async function apiJSON(method, endpoint, body = null, isForm = false) {
  const res = await apiFetch(method, endpoint, body, isForm);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Server error');
  return json;
}

// ═══════════════ LOGIN ═══════════════
function setupLogin() {
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = document.getElementById('login-password').value;
    const err = document.getElementById('login-error');
    err.style.display = 'none';
    try {
      const data = await apiJSON('POST', '/auth/login', { password: pw });
      TOKEN = data.token;
      sessionStorage.setItem('rcs_admin_token', TOKEN);
      await showApp();
    } catch (ex) {
      err.style.display = 'block';
      err.textContent = '✕  ' + ex.message;
      document.getElementById('login-password').value = '';
    }
  });
}

// ═══════════════ NAV ═══════════════
function setupNav() {
  document.querySelectorAll('.sidebar-nav-item[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.panel));
  });
}

function navigateTo(panel) {
  document.querySelectorAll('.sidebar-nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelector(`.sidebar-nav-item[data-panel="${panel}"]`)?.classList.add('active');
  document.getElementById('panel-' + panel)?.classList.add('active');
  const titles = {
    dashboard: ['Dashboard', 'Welcome back, Admin'],
    logo:      ['Logo Manager', 'Upload and manage site logos'],
    downloads: ['Downloads Manager', 'CRUD — software download entries'],
    pricing:   ['Pricing Manager', 'Edit live pricing on the website'],
    partners:  ['Partners Manager', 'Manage partner listings & logos'],
    settings:  ['Settings', 'Admin portal configuration'],
  };
  const t = titles[panel] || ['Admin', ''];
  document.getElementById('topbar-title').textContent   = t[0];
  document.getElementById('topbar-subtitle').textContent = t[1];
}

function setupLogout() {
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    TOKEN = null;
    sessionStorage.removeItem('rcs_admin_token');
    location.reload();
  });
}

// ═══════════════ DASHBOARD ═══════════════
function renderDashboard() {
  document.getElementById('stat-total-downloads').textContent   = downloads.length;
  document.getElementById('stat-visible-downloads').textContent = downloads.filter(d => d.visible).length;
  document.getElementById('stat-erp-count').textContent         = downloads.filter(d => d.category === 'erp').length;
  document.getElementById('stat-mobile-count').textContent      = downloads.filter(d => d.category === 'mobile').length;
  const pStat = document.getElementById('stat-partners-count');
  if (pStat) pStat.textContent = partners.filter(p => p.visible).length;
}

// ═══════════════ LOGO ═══════════════
async function loadLogo() {
  try {
    const data = await apiJSON('GET', '/logo');
    const currentImg = document.getElementById('logo-current-img');
    if (currentImg) currentImg.src = data.url;
    if (data.custom) {
      const stored = document.getElementById('logo-stored-img');
      const storedBox = document.getElementById('logo-stored-box');
      if (stored) stored.src = data.url;
      if (storedBox) storedBox.style.display = 'block';
    }
    // Update sidebar and login logo too
    ['sidebar-logo', 'login-logo-img'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.src = data.url;
    });
  } catch { /* server may not be running */ }
}

window.initLogoUpload = function () {
  const dropZone  = document.getElementById('logo-drop-zone');
  const fileInput = document.getElementById('logo-file-input');

  dropZone?.addEventListener('click', () => fileInput?.click());
  dropZone?.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleLogoFile(e.dataTransfer.files[0]);
  });
  fileInput?.addEventListener('change', () => {
    if (fileInput.files[0]) handleLogoFile(fileInput.files[0]);
  });

  document.getElementById('btn-save-logo')?.addEventListener('click', uploadLogo);
  document.getElementById('btn-reset-logo')?.addEventListener('click', resetLogo);
};

let pendingLogoFile = null;

function handleLogoFile(file) {
  if (!file.type.startsWith('image/')) { showToast('Please upload an image file.', 'error'); return; }
  pendingLogoFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('logo-upload-preview');
    if (preview) { preview.src = e.target.result; preview.parentElement.style.display = 'block'; }
    const label = document.getElementById('logo-drop-zone')?.querySelector('.drop-label');
    if (label) label.textContent = '✓ ' + file.name;
  };
  reader.readAsDataURL(file);
}

async function uploadLogo() {
  if (!pendingLogoFile) { showToast('No new logo selected.', 'error'); return; }
  const form = new FormData();
  form.append('logo', pendingLogoFile);
  try {
    const data = await apiJSON('POST', '/logo', form, true);
    showToast('✓ Logo uploaded and saved!');
    pendingLogoFile = null;
    await loadLogo();
  } catch (ex) {
    showToast('Upload failed: ' + ex.message, 'error');
  }
}

async function resetLogo() {
  try {
    await apiJSON('DELETE', '/logo');
    const storedBox = document.getElementById('logo-stored-box');
    if (storedBox) storedBox.style.display = 'none';
    showToast('✓ Logo reset to default.');
    await loadLogo();
  } catch (ex) {
    showToast('Reset failed: ' + ex.message, 'error');
  }
}

// ═══════════════ DOWNLOADS CRUD ═══════════════
async function loadDownloads() {
  try {
    downloads = await apiJSON('GET', '/downloads/all');
    renderDownloadsTable();
    renderDashboard();
  } catch {
    downloads = [];
  }
}

function renderDownloadsTable() {
  const tbody = document.getElementById('downloads-tbody');
  if (!tbody) return;
  if (downloads.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📦</div><p>No entries. Click "+ Add New" to start.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = downloads.map(d => `
    <tr>
      <td><strong>${esc(d.name)}</strong><br><span style="font-size:11px;color:var(--admin-muted);">${esc(d.subtitle)}</span></td>
      <td><span class="cat-badge cat-${d.category}">${catLabel(d.category)}</span></td>
      <td style="font-size:12px;">${esc(d.platform)}</td>
      <td style="font-size:12px;">${esc(d.version)}</td>
      <td style="font-size:12px;">${esc(d.size)}</td>
      <td><span style="font-size:12px;font-weight:700;color:${d.visible ? 'var(--admin-green)' : 'var(--admin-muted)'}">
        ${d.visible ? '● Live' : '○ Hidden'}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-edit-sm" onclick="openEditDownload('${d.id}')">✏️ Edit</button>
          <button class="btn-danger-sm" onclick="confirmDelete('${d.id}')">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');
  renderDashboard();
}

function catLabel(cat) {
  return { erp:'🖥️ ERP', mobile:'📱 Mobile', hrms:'👔 HRMS', support:'🛠️ Support' }[cat] || cat;
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

window.openAddDownload = function () {
  editingDownloadId = null;
  document.getElementById('dl-modal-title').textContent = '+ Add New Download';
  resetDownloadForm();
  document.getElementById('dl-modal').classList.add('open');
};

window.openEditDownload = function (id) {
  const item = downloads.find(d => String(d.id) === String(id));
  if (!item) return;
  editingDownloadId = id;
  document.getElementById('dl-modal-title').textContent = '✏️ Edit Download';
  document.getElementById('dl-name').value     = item.name;
  document.getElementById('dl-subtitle').value = item.subtitle;
  document.getElementById('dl-category').value = item.category;
  document.getElementById('dl-platform').value = item.platform;
  document.getElementById('dl-version').value  = item.version;
  document.getElementById('dl-size').value     = item.size;
  document.getElementById('dl-url').value      = item.url;
  document.getElementById('dl-visible').checked = item.visible;
  document.getElementById('dl-modal').classList.add('open');
};

window.saveDownloadEntry = async function () {
  const body = {
    name:     document.getElementById('dl-name').value.trim(),
    subtitle: document.getElementById('dl-subtitle').value.trim(),
    category: document.getElementById('dl-category').value,
    platform: document.getElementById('dl-platform').value.trim(),
    version:  document.getElementById('dl-version').value.trim(),
    size:     document.getElementById('dl-size').value.trim(),
    url:      document.getElementById('dl-url').value.trim(),
    visible:  document.getElementById('dl-visible').checked,
  };
  if (!body.name || !body.url) { showToast('Name and URL are required.', 'error'); return; }
  try {
    if (editingDownloadId !== null) {
      await apiJSON('PUT', `/downloads/${editingDownloadId}`, body);
      showToast('✓ Download entry updated.');
    } else {
      await apiJSON('POST', '/downloads', body);
      showToast('✓ New download entry added.');
    }
    await loadDownloads();
    closeDownloadModal();
  } catch (ex) {
    showToast('Save failed: ' + ex.message, 'error');
  }
};

window.confirmDelete = function (id) {
  partnerDeleteMode = false;
  deleteTargetId = id;
  const item = downloads.find(d => String(d.id) === String(id));
  document.getElementById('confirm-delete-name').textContent = item?.name || 'this entry';
  document.getElementById('confirm-dialog').classList.add('open');
};

window.executeDelete = async function () {
  try {
    if (partnerDeleteMode) {
      await apiJSON('DELETE', `/partners/${deleteTargetId}`);
      showToast('✓ Partner deleted.');
      await loadPartners();
      partnerDeleteMode = false;
    } else {
      await apiJSON('DELETE', `/downloads/${deleteTargetId}`);
      showToast('✓ Entry deleted.');
      await loadDownloads();
    }
  } catch (ex) {
    showToast('Delete failed: ' + ex.message, 'error');
  }
  document.getElementById('confirm-dialog').classList.remove('open');
};

window.closeDownloadModal = function () {
  document.getElementById('dl-modal').classList.remove('open');
  editingDownloadId = null;
};

window.closeConfirm = function () {
  document.getElementById('confirm-dialog').classList.remove('open');
  partnerDeleteMode = false;
};

function resetDownloadForm() {
  ['dl-name','dl-subtitle','dl-platform','dl-version','dl-size','dl-url'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('dl-category').value = 'erp';
  document.getElementById('dl-visible').checked = true;
}

window.resetDownloads = async function () {
  // Re-fetch from server (server has the seed)
  if (confirm('Re-fetch downloads from server defaults? Any custom entries will be lost.')) {
    showToast('Reloaded from server.');
    await loadDownloads();
  }
};

// ═══════════════════════════════
//  PRICING MANAGER (Full Catalog)
// ═══════════════════════════════
const PRICING_GROUPS_META = {
  erp: {
    title: '🖥️ Marg ERP 9+ — Desktop Editions & Add-ons',
    badge: 'Desktop ERP',
    desc: 'Editions (Nano, Basic, Silver, Gold), Extra User Licenses & ARC maintenance rates',
  },
  cloud: {
    title: '☁️ MargCloud — Hosted Plans & Specifications',
    badge: 'Cloud Server',
    desc: 'Marg Basic Cloud & Marg Silver Cloud (Base vs Premium specs) and Extra Cloud User fees',
  },
  mobile_eorder: {
    title: '🚚 eOrder / eRetail / eBilling / eDelivery Plans',
    badge: 'Field & Retail Apps',
    desc: 'Salesmen tiers (Starter, Standard, Growth, Business, Enterprise) with Unlimited Retailers',
  },
  mobile_eowner: {
    title: '📊 Marg eOwner — Business Owner Plans',
    badge: 'Owner App',
    desc: 'Live business tracking plans for Solo (1 owner), Duo (2 owners), and Group (5 owners)',
  },
  mobile_other: {
    title: '🎯 SFAXpert, GPS Tracking & PharmaNXT Apps',
    badge: 'Specialized Apps',
    desc: 'Sales force automation, live field GPS tracking, and 3 Lakh+ medicine information database',
  },
  hrms: {
    title: '👔 MargHRMS — Payroll Plans & Employee Add-ons',
    badge: 'Payroll & HR',
    desc: 'Basic, Silver, Gold edition tiers, extra employee monthly fees & add-on modules (GPS, Face, PMS, TMS)',
  },
};

let activePricingFilter = 'all';

async function loadPricing() {
  try {
    pricing = await apiJSON('GET', '/pricing');
    renderPricingEditor();
  } catch (e) {
    pricing = {};
    showToast('Failed to load pricing: ' + e.message, 'error');
  }
}

function renderPricingEditor() {
  const container = document.getElementById('pricing-groups-container');
  if (!container) return;

  const groups = Object.keys(pricing);
  if (groups.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">💰</div><p>No pricing groups found. Click "↺ Reload from Server".</p></div>`;
    return;
  }

  container.innerHTML = groups.map(group => {
    const meta = PRICING_GROUPS_META[group] || {
      title: `📦 ${group.toUpperCase()}`,
      badge: 'Product Group',
      desc: 'Product pricing tiers',
    };
    const items = pricing[group] || [];
    const isVisible = activePricingFilter === 'all' || activePricingFilter === group;

    return `
      <div class="section-box pricing-group-card" data-group="${group}" style="display: ${isVisible ? 'block' : 'none'}; margin-bottom: 24px;">
        <div class="section-box-header">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <div class="section-box-title" style="font-size:16px;">${esc(meta.title)}</div>
              <span class="cat-badge cat-${group.startsWith('mobile') ? 'mobile' : (group === 'hrms' ? 'hrms' : 'erp')}">${esc(meta.badge)}</span>
            </div>
            <div class="section-box-subtitle">${esc(meta.desc)}</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn-ghost-sm" onclick="openAddPriceModal('${group}')">+ Add Tier</button>
            <button class="btn-ghost-sm" onclick="resetPricingGroup('${group}')">↺ Reset</button>
            <button class="btn-primary-sm" onclick="savePricingChanges('${group}')">💾 Save ${esc(meta.badge)}</button>
          </div>
        </div>

        <div class="pricing-items-list" id="group-list-${group}">
          ${items.map((item, idx) => `
            <div class="pricing-row" data-group="${group}" data-key="${esc(item.key)}">
              <div class="pricing-row-info">
                <input class="pricing-row-label-input" type="text" value="${esc(item.label)}"
                  placeholder="Plan Name"
                  onchange="updatePriceField('${group}', ${idx}, 'label', this.value)">
                <input class="pricing-row-note-input" type="text" value="${esc(item.note || '')}"
                  placeholder="Features / note (e.g. 2 Salesmen · Unlimited Retailers)"
                  onchange="updatePriceField('${group}', ${idx}, 'note', this.value)">
              </div>
              <div class="pricing-row-price-wrap">
                <span class="pricing-row-currency">₹</span>
                <input class="pricing-row-input" type="number" value="${item.price}"
                  data-group="${group}" data-index="${idx}"
                  onchange="updatePriceField('${group}', ${idx}, 'price', this.value)">
              </div>
              <div>
                <input class="pricing-row-unit-input" type="text" value="${esc(item.unit || '/yr')}"
                  placeholder="Unit" title="e.g. /yr, /mo, /user/yr, /emp/mo"
                  onchange="updatePriceField('${group}', ${idx}, 'unit', this.value)">
              </div>
              <div>
                <button class="btn-danger-sm" title="Delete this price row" onclick="deletePriceItem('${group}', '${esc(item.key)}', ${idx})">🗑</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  setupPricingFilters();
}

function setupPricingFilters() {
  document.querySelectorAll('.pricing-filter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.pricing-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePricingFilter = btn.dataset.groupFilter;
      document.querySelectorAll('.pricing-group-card').forEach(card => {
        const grp = card.dataset.group;
        card.style.display = (activePricingFilter === 'all' || activePricingFilter === grp) ? 'block' : 'none';
      });
    };
  });
}

window.updatePriceField = function (group, idx, field, val) {
  if (!pricing[group] || !pricing[group][idx]) return;
  if (field === 'price') {
    pricing[group][idx].price = parseInt(val, 10) || 0;
  } else {
    pricing[group][idx][field] = String(val || '').trim();
  }
};

window.savePricingChanges = async function (group) {
  try {
    pricing[group] = await apiJSON('PUT', `/pricing/${group}`, pricing[group]);
    showToast(`✓ ${group.toUpperCase()} pricing saved!`);
    renderPricingEditor();
  } catch (ex) {
    showToast('Save failed: ' + ex.message, 'error');
  }
};

window.saveAllPricingGroups = async function () {
  try {
    const groups = Object.keys(pricing);
    for (const group of groups) {
      await apiJSON('PUT', `/pricing/${group}`, pricing[group]);
    }
    showToast('✓ All pricing groups saved successfully!');
    renderPricingEditor();
  } catch (ex) {
    showToast('Save failed: ' + ex.message, 'error');
  }
};

window.resetPricingGroup = async function (group) {
  await loadPricing();
  showToast(`✓ ${group.toUpperCase()} pricing reloaded from server.`);
};

window.openAddPriceModal = function (preselectGroup = 'erp') {
  const groupSelect = document.getElementById('pm-group');
  if (groupSelect && preselectGroup) groupSelect.value = preselectGroup;
  document.getElementById('pm-label').value = '';
  document.getElementById('pm-price').value = '';
  document.getElementById('pm-unit').value = '/yr';
  document.getElementById('pm-key').value = '';
  document.getElementById('pm-note').value = '';
  document.getElementById('price-modal').classList.add('open');
};

window.closePriceModal = function () {
  document.getElementById('price-modal').classList.remove('open');
};

window.saveNewPriceItem = async function () {
  const group = document.getElementById('pm-group').value;
  const label = document.getElementById('pm-label').value.trim();
  const price = parseInt(document.getElementById('pm-price').value, 10) || 0;
  const unit  = document.getElementById('pm-unit').value.trim() || '/yr';
  const key   = document.getElementById('pm-key').value.trim() || `plan_${Date.now()}`;
  const note  = document.getElementById('pm-note').value.trim();

  if (!label) { showToast('Plan name is required.', 'error'); return; }

  try {
    const newItem = { key, label, price, unit, note };
    if (!pricing[group]) pricing[group] = [];
    pricing[group].push(newItem);
    await apiJSON('PUT', `/pricing/${group}`, pricing[group]);
    showToast(`✓ Added "${label}" to ${group}!`);
    closePriceModal();
    renderPricingEditor();
  } catch (ex) {
    showToast('Failed to add item: ' + ex.message, 'error');
  }
};

window.deletePriceItem = async function (group, key, idx) {
  if (!confirm(`Delete this pricing tier?`)) return;
  try {
    if (pricing[group]) {
      pricing[group].splice(idx, 1);
      await apiJSON('PUT', `/pricing/${group}`, pricing[group]);
      showToast('✓ Pricing item removed.');
      renderPricingEditor();
    }
  } catch (ex) {
    showToast('Failed to delete: ' + ex.message, 'error');
  }
};

// ═══════════════ SETTINGS ═══════════════
async function loadSettings() {
  try {
    settings = await apiJSON('GET', '/settings');
    // Populate settings form fields
    const map = {
      's-site-name': 'siteName', 's-tagline': 'tagline', 's-address': 'address',
      's-phone1': 'phone1', 's-phone2': 'phone2', 's-phone3': 'phone3',
      's-email': 'email', 's-whatsapp': 'whatsapp', 's-maps-url': 'googleMapsUrl',
      's-marquee-title': 'marqueeTitle',
    };
    for (const [id, key] of Object.entries(map)) {
      const el = document.getElementById(id);
      if (el && settings[key] !== undefined) el.value = settings[key];
    }
    const marqueeEnabledEl = document.getElementById('s-marquee-enabled');
    if (marqueeEnabledEl) {
      marqueeEnabledEl.value = settings.marqueeEnabled !== false ? 'true' : 'false';
    }
    renderMarqueePhotos();
  } catch { /* server offline */ }
}

window.saveSettings = async function () {
  const map = {
    's-site-name': 'siteName', 's-tagline': 'tagline', 's-address': 'address',
    's-phone1': 'phone1', 's-phone2': 'phone2', 's-phone3': 'phone3',
    's-email': 'email', 's-whatsapp': 'whatsapp', 's-maps-url': 'googleMapsUrl',
    's-marquee-title': 'marqueeTitle',
  };
  const body = {};
  for (const [id, key] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) body[key] = el.value;
  }
  const marqueeEnabledEl = document.getElementById('s-marquee-enabled');
  if (marqueeEnabledEl) {
    body.marqueeEnabled = marqueeEnabledEl.value === 'true';
  }
  try {
    settings = await apiJSON('PUT', '/settings', body);
    showToast('✓ Settings saved!');
  } catch (ex) {
    showToast('Save failed: ' + ex.message, 'error');
  }
};

// ── Marquee Photos Management ──
function renderMarqueePhotos() {
  const grid = document.getElementById('marquee-photos-grid');
  const countEl = document.getElementById('marquee-photos-count');
  const images = settings.marqueeImages || [];

  if (countEl) countEl.textContent = images.length;
  if (!grid) return;

  if (images.length === 0) {
    grid.innerHTML = `<div style="color:var(--admin-muted); font-size:13px; grid-column:1/-1; text-align:center; padding:24px 0;">No photos uploaded to the marquee yet. Use the upload box above.</div>`;
    return;
  }

  grid.innerHTML = images.map((imgUrl, idx) => {
    const filename = imgUrl.split('/').pop();
    return `
      <div class="marquee-photo-card">
        <img src="${imgUrl}" alt="Marquee photo ${idx + 1}" class="marquee-photo-thumb" onerror="this.src='assets/logo.png'">
        <span style="font-size:10px; color:var(--admin-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; width:100%; text-align:center;" title="${filename}">${filename}</span>
        <button type="button" class="marquee-photo-delete" onclick="deleteMarqueePhoto('${imgUrl.replace(/'/g, "\\'")}')">🗑 Remove</button>
      </div>`;
  }).join('');
}

window.uploadMarqueePhotos = async function (files) {
  if (!files || files.length === 0) return;
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('photos', files[i]);
  }

  showToast('Uploading marquee photos…');
  try {
    const res = await apiFetch('POST', '/settings/marquee/upload', formData, true);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    settings.marqueeImages = data.marqueeImages;
    renderMarqueePhotos();
    showToast(`✓ ${files.length} photo${files.length > 1 ? 's' : ''} added to marquee!`);
    const input = document.getElementById('marquee-file-input');
    if (input) input.value = '';
  } catch (err) {
    showToast(err.message || 'Upload failed', 'error');
  }
};

window.deleteMarqueePhoto = async function (imagePath) {
  if (!confirm('Remove this photo from the homepage marquee?')) return;
  try {
    const res = await apiFetch('DELETE', '/settings/marquee/image', { imagePath });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Delete failed');
    settings.marqueeImages = data.marqueeImages;
    renderMarqueePhotos();
    showToast('✓ Photo removed from marquee.');
  } catch (err) {
    showToast(err.message || 'Delete failed', 'error');
  }
};

function initMarqueeDropZone() {
  const dropZone = document.getElementById('marquee-drop-zone');
  if (!dropZone) return;

  ['dragenter', 'dragover'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      uploadMarqueePhotos(files);
    }
  });
}

window.changePassword = function () {
  showToast('Password management requires a backend config change. Edit ADMIN_PASSWORD in backend/config.js.', 'error');
};

// ═══════════════ EXPORT / IMPORT ═══════════════
window.exportData = function () {
  const data = { downloads, pricing, settings, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: `rcs_export_${Date.now()}.json` });
  a.click();
  URL.revokeObjectURL(url);
  showToast('✓ Data exported as JSON.');
};

window.importData = function () {
  document.getElementById('import-file')?.click();
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('import-file')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        // Push each download to the server
        if (Array.isArray(data.downloads)) {
          for (const d of data.downloads) {
            try { await apiJSON('POST', '/downloads', d); } catch {}
          }
          await loadDownloads();
        }
        showToast('✓ Data imported!');
      } catch {
        showToast('Invalid JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });
});

window.clearAllData = function () {
  showToast('Clear All: delete entries individually or reset the JSON files in backend/data/.', 'error');
};

// ═══════════════ TOAST ═══════════════
function showToast(msg, type = 'success') {
  const toast = document.getElementById('admin-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `admin-toast${type === 'error' ? ' error' : ''} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ═══════════════ PARTNERS CRUD ═══════════════

async function loadPartners() {
  try {
    partners = await apiJSON('GET', '/partners?all=1');
    renderPartners();
    updatePartnerStats();
  } catch (err) {
    console.warn('Partners load failed:', err.message);
  }
}

function getHostname(urlStr) {
  if (!urlStr) return '';
  try {
    const formatted = /^https?:\/\//i.test(urlStr) ? urlStr : 'https://' + urlStr;
    return new URL(formatted).hostname;
  } catch {
    return urlStr;
  }
}

function renderPartners() {
  const tbody = document.getElementById('partners-tbody');
  const label = document.getElementById('partners-count-label');
  if (!tbody) return;

  if (label) label.textContent = `${partners.length} partner${partners.length !== 1 ? 's' : ''} total`;

  if (partners.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--admin-muted);">No partners yet. Click "+ Add Partner" to add one.</td></tr>`;
    return;
  }

  tbody.innerHTML = partners.map(p => {
    const logoHtml = p.logo
      ? `<img src="${p.logo}" alt="${esc(p.name)}" style="height:36px;width:36px;object-fit:contain;border-radius:6px;background:var(--admin-bg);border:1px solid var(--admin-border);padding:3px;display:block;">`
      : `<span style="font-size:22px;display:block;text-align:center;">🤝</span>`;
    const visibleBadge = p.visible
      ? `<span style="background:rgba(34,197,94,0.12);color:var(--admin-green);padding:3px 10px;border-radius:10px;font-size:11.5px;font-weight:700;">● Live</span>`
      : `<span style="background:rgba(239,68,68,0.12);color:var(--admin-red);padding:3px 10px;border-radius:10px;font-size:11.5px;font-weight:700;">○ Hidden</span>`;
    
    const loc = [p.city, p.state].filter(Boolean).join(', ');
    const locHtml = loc
      ? `<span style="font-size:12px; color:var(--admin-text); display:inline-flex; align-items:center; gap:4px; font-weight:600;">📍 ${esc(loc)}</span>`
      : '<span style="color:var(--admin-muted); font-size:12px;">—</span>';

    const webHref = p.website ? (/^https?:\/\//i.test(p.website) ? p.website : 'https://' + p.website) : '';
    const websiteLink = webHref
      ? `<a href="${webHref}" target="_blank" rel="noopener noreferrer" style="color:var(--admin-accent);font-size:12.5px;font-weight:500;">${esc(getHostname(p.website))} ↗</a>`
      : '<span style="color:var(--admin-muted);font-size:12px;">—</span>';

    return `
      <tr>
        <td style="vertical-align:middle;">${logoHtml}</td>
        <td><strong style="color:#fff;">${esc(p.name)}</strong><br><span style="font-size:11px;color:var(--admin-muted);">${esc((p.description || '').slice(0, 50))}${p.description && p.description.length > 50 ? '…' : ''}</span></td>
        <td>${locHtml}</td>
        <td>${websiteLink}</td>
        <td style="text-align:center;font-weight:600;">${p.order || 0}</td>
        <td>${visibleBadge}</td>
        <td>
          <div class="table-actions">
            <button class="btn-edit-sm" onclick="editPartner('${p.id}')">✏️ Edit</button>
            <button class="btn-danger-sm" onclick="confirmDeletePartner('${p.id}', '${esc(p.name)}')">🗑</button>
          </div>
        </td>
      </tr>`;
  }).join('');
  renderDashboard();
}

function updatePartnerStats() {
  const el = document.getElementById('stat-partners-count');
  if (el) el.textContent = partners.filter(p => p.visible).length;
}

window.openAddPartner = function () {
  editingPartnerId = null;
  document.getElementById('partner-modal-title').textContent = 'Add Partner';
  document.getElementById('pm-name').value     = '';
  document.getElementById('pm-order').value    = '';
  document.getElementById('pm-city').value     = '';
  document.getElementById('pm-state').value    = '';
  document.getElementById('pm-website').value  = '';
  document.getElementById('pm-desc').value     = '';
  document.getElementById('pm-visible').value  = 'true';
  document.getElementById('pm-logo-file').value = '';
  document.getElementById('pm-logo-current-wrap').style.display = 'none';
  document.getElementById('pm-save-btn').textContent = '💾 Save Partner';
  document.getElementById('partner-modal').classList.add('open');
};

window.editPartner = function (id) {
  const p = partners.find(x => String(x.id) === String(id));
  if (!p) return;
  editingPartnerId = id;
  document.getElementById('partner-modal-title').textContent = 'Edit Partner';
  document.getElementById('pm-name').value     = p.name || '';
  document.getElementById('pm-order').value    = p.order ?? 0;
  document.getElementById('pm-city').value     = p.city || '';
  document.getElementById('pm-state').value    = p.state || '';
  document.getElementById('pm-website').value  = p.website || '';
  document.getElementById('pm-desc').value     = p.description || '';
  document.getElementById('pm-visible').value  = p.visible ? 'true' : 'false';
  document.getElementById('pm-logo-file').value = '';

  const logoWrap = document.getElementById('pm-logo-current-wrap');
  const logoImg  = document.getElementById('pm-logo-current');
  if (p.logo) {
    logoImg.src = p.logo;
    logoWrap.style.display = 'block';
  } else {
    logoWrap.style.display = 'none';
  }

  document.getElementById('pm-save-btn').textContent = '💾 Update Partner';
  document.getElementById('partner-modal').classList.add('open');
};

window.savePartner = async function () {
  const name = document.getElementById('pm-name').value.trim();
  if (!name) { showToast('Partner name is required.', 'error'); return; }

  const payload = {
    name,
    order:       Number(document.getElementById('pm-order').value) || 0,
    city:        document.getElementById('pm-city').value.trim(),
    state:       document.getElementById('pm-state').value.trim(),
    website:     document.getElementById('pm-website').value.trim(),
    description: document.getElementById('pm-desc').value.trim(),
    visible:     document.getElementById('pm-visible').value === 'true',
  };

  const btn = document.getElementById('pm-save-btn');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  try {
    let saved;
    if (editingPartnerId) {
      saved = await apiJSON('PUT', `/partners/${editingPartnerId}`, payload);
    } else {
      saved = await apiJSON('POST', '/partners', payload);
    }

    // Upload logo file if selected
    const fileInput = document.getElementById('pm-logo-file');
    if (fileInput.files && fileInput.files[0]) {
      const formData = new FormData();
      formData.append('logo', fileInput.files[0]);
      const logoRes = await apiFetch('POST', `/partners/${saved.id}/logo`, formData, true);
      if (logoRes.ok) {
        const logoData = await logoRes.json();
        saved = logoData.partner;
      }
    }

    closePartnerModal();
    await loadPartners();
    showToast(editingPartnerId ? '✓ Partner updated!' : '✓ Partner added!');
  } catch (err) {
    showToast(err.message || 'Save failed.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '💾 Save Partner';
  }
};

window.confirmDeletePartner = function (id, name) {
  partnerDeleteMode = true;
  deleteTargetId = id;
  document.getElementById('confirm-delete-name').textContent = name;
  document.getElementById('confirm-dialog').classList.add('open');
};

window.closePartnerModal = function () {
  document.getElementById('partner-modal').classList.remove('open');
  editingPartnerId = null;
};
