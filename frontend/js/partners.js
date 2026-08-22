/* ══════════════════════════════════════
   partners.js — Public Partners Page
   Location-based dropdown filtering (State + City cascade)
══════════════════════════════════════ */

let allPartners = [];
let activeState = '';
let activeCity  = '';

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Fetch & Init ──────────────────────
async function loadPartners() {
  try {
    const res = await fetch('/api/partners');
    if (!res.ok) throw new Error('Failed to load partners');
    allPartners = await res.json();
    buildDropdowns();
    renderPartners();
    updateStats();
  } catch (err) {
    const grid = document.getElementById('partners-grid');
    if (grid) grid.innerHTML = `
      <div class="partners-empty" style="grid-column:1/-1;">
        <div class="partners-empty-icon">😕</div>
        <h3>Could not load partners</h3>
        <p>${escapeHtml(err.message)}</p>
      </div>`;
  }
}

// ── Build dropdowns from data ─────────
function buildDropdowns() {
  const stateSelect = document.getElementById('filter-state');
  const citySelect  = document.getElementById('filter-city');
  if (!stateSelect || !citySelect) return;

  // Unique states sorted
  const states = [...new Set(allPartners.map(p => (p.state || '').trim()).filter(Boolean))].sort();

  stateSelect.innerHTML = '<option value="">All States</option>' +
    states.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');

  citySelect.innerHTML = '<option value="">All Cities</option>' +
    getCitiesForState('').map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

function getCitiesForState(state) {
  const source = state
    ? allPartners.filter(p => p.state === state)
    : allPartners;
  return [...new Set(source.map(p => (p.city || '').trim()).filter(Boolean))].sort();
}

// ── Event Handlers ────────────────────
function onStateChange() {
  const stateSelect = document.getElementById('filter-state');
  const citySelect  = document.getElementById('filter-city');
  activeState = stateSelect.value;
  activeCity  = '';

  // Cascade: repopulate cities based on chosen state
  const cities = getCitiesForState(activeState);
  citySelect.innerHTML = '<option value="">All Cities</option>' +
    cities.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  citySelect.value = '';

  renderPartners();
}

function onCityChange() {
  const citySelect = document.getElementById('filter-city');
  activeCity = citySelect.value;
  // If a city is chosen, lock state too (in case user jumped straight to city)
  if (activeCity) {
    const partner = allPartners.find(p => p.city === activeCity);
    if (partner && partner.state) {
      const stateSelect = document.getElementById('filter-state');
      if (!activeState) {
        activeState = partner.state;
        stateSelect.value = activeState;
        // Repopulate cities for this state
        const cities = getCitiesForState(activeState);
        citySelect.innerHTML = '<option value="">All Cities</option>' +
          cities.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
        citySelect.value = activeCity;
      }
    }
  }
  renderPartners();
}

function resetFilters() {
  activeState = '';
  activeCity  = '';
  const stateSelect = document.getElementById('filter-state');
  const citySelect  = document.getElementById('filter-city');
  if (stateSelect) stateSelect.value = '';
  buildDropdowns(); // rebuild cities to full list
  if (citySelect) citySelect.value = '';
  renderPartners();
}

// Expose to HTML onchange / onclick attributes
window.onStateChange = onStateChange;
window.onCityChange  = onCityChange;
window.resetFilters  = resetFilters;

// ── Render Grid ───────────────────────
function renderPartners() {
  const grid   = document.getElementById('partners-grid');
  const badge  = document.getElementById('filter-result-badge');
  if (!grid) return;

  let filtered = allPartners;
  if (activeState) filtered = filtered.filter(p => p.state === activeState);
  if (activeCity)  filtered = filtered.filter(p => p.city  === activeCity);

  // Update result badge
  if (badge) {
    if (!activeState && !activeCity) {
      badge.textContent = `All ${allPartners.length} Partners`;
    } else {
      const loc = [activeCity, activeState].filter(Boolean).join(', ');
      badge.textContent = `${filtered.length} in ${loc}`;
    }
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="partners-empty" style="grid-column:1/-1;">
        <div class="partners-empty-icon">🔍</div>
        <h3>No partners found</h3>
        <p>Try a different state or city, or <button onclick="resetFilters()" style="background:none;border:none;color:var(--accent-primary);font-weight:700;cursor:pointer;font-size:inherit;">clear the filters</button>.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => buildCard(p)).join('');
}

// ── Card Builder ──────────────────────
function buildCard(p) {
  const logoHtml = p.logo
    ? `<img src="${p.logo}" alt="${escapeHtml(p.name)} logo" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
       <div class="partner-logo-placeholder" style="display:none">🤝</div>`
    : `<div class="partner-logo-placeholder">🤝</div>`;

  const locationText = [p.city, p.state].filter(Boolean).join(', ');
  const locationHtml = locationText
    ? `<div class="partner-location">📍 ${escapeHtml(locationText)}</div>`
    : '';

  const linkHtml = p.website
    ? `<a href="${p.website}" target="_blank" rel="noopener noreferrer" class="partner-link">
        Visit Website <span>→</span>
       </a>`
    : '';

  return `
    <div class="partner-card">
      <div class="partner-logo-wrap">${logoHtml}</div>
      ${locationHtml}
      <h3 class="partner-name">${escapeHtml(p.name)}</h3>
      <p class="partner-desc">${escapeHtml(p.description || '')}</p>
      ${linkHtml}
    </div>`;
}

// ── Stats ─────────────────────────────
function updateStats() {
  const statsEl = document.getElementById('partners-stats');
  const totalEl = document.getElementById('stat-total-partners');
  const locsEl  = document.getElementById('stat-categories-count');

  if (allPartners.length > 0 && statsEl) {
    const locs = new Set(allPartners.map(p => p.state || '').filter(Boolean));
    if (totalEl) totalEl.textContent = allPartners.length;
    if (locsEl)  locsEl.textContent  = locs.size;
    statsEl.style.display = 'grid';
  }
}

// ── Init ──────────────────────────────
document.addEventListener('DOMContentLoaded', loadPartners);