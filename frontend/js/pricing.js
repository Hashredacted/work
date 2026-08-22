// ── Product Tab Switching ──
function switchTab(tabId) {
  document.querySelectorAll('.product-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
    btn.setAttribute('aria-selected', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.product-tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === 'panel-' + tabId);
  });
  document.querySelector('.product-tabs-nav').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
document.querySelectorAll('.product-tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    if (btn.dataset.tab === 'payroll') {
      e.preventDefault();
      window.location.href = 'payroll.html';
      return;
    }
    if (btn.dataset.tab === 'downloads') {
      e.preventDefault();
      window.location.href = 'downloads.html';
      return;
    }
    switchTab(btn.dataset.tab);
  });
});

// ── App Sub-tabs ──
document.querySelectorAll('.app-subtab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.app-subtab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.app-sub-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('app-panel-' + btn.dataset.app).classList.add('active');
  });
});

// ── Cloud Pricing Toggle (Base / Premium) ──
let isPremium = false;
const cloudToggle = document.getElementById('cloud-toggle');
const lblBase = document.getElementById('lbl-base');
const lblPremium = document.getElementById('lbl-premium');
const cloudBadge = document.getElementById('cloud-badge');

function updateCloudPrices() {
  // 1. Update Price Amounts (Cards & Table)
  document.querySelectorAll('.cloud-price').forEach(el => {
    const raw = isPremium ? el.dataset.premium : el.dataset.base;
    const val = parseInt(raw, 10);
    if (!isNaN(val)) {
      el.textContent = val.toLocaleString('en-IN');
    }
  });

  // 2. Update Period & Period Badges
  document.querySelectorAll('.cloud-period').forEach(el => {
    el.textContent = isPremium ? '(Premium)' : '(Base)';
  });
  document.querySelectorAll('.cloud-period-badge').forEach(el => {
    el.textContent = isPremium ? '(Premium)' : '(Base)';
  });

  // 3. Update Price Notes & Plan Limits
  document.querySelectorAll('.cloud-note').forEach(el => {
    if (el.dataset.premium && el.dataset.base) {
      el.textContent = isPremium ? el.dataset.premium : el.dataset.base;
    }
  });

  // 4. Update Toggle Switch & Label States
  if (cloudToggle) {
    cloudToggle.setAttribute('aria-checked', isPremium ? 'true' : 'false');
    cloudToggle.classList.toggle('on', isPremium);
    cloudToggle.classList.toggle('active', isPremium);
  }
  if (lblBase) {
    lblBase.classList.toggle('active-label', !isPremium);
    lblBase.classList.toggle('active', !isPremium);
  }
  if (lblPremium) {
    lblPremium.classList.toggle('active-label', isPremium);
    lblPremium.classList.toggle('active', isPremium);
  }

  // 5. Update Badge text & style
  if (cloudBadge) {
    cloudBadge.classList.toggle('premium-badge', isPremium);
    cloudBadge.textContent = isPremium
      ? '16-Core Xeon · 5x Daily Backup · Azure Included'
      : '8-Core Xeon · 2x Daily Backup';
  }

  // 6. Update Hardware Specs across Cards & Comparison Table
  document.querySelectorAll('.cloud-feat-hw').forEach(el => {
    if (el.dataset.premium && el.dataset.base) {
      el.textContent = isPremium ? el.dataset.premium : el.dataset.base;
    }
  });
  document.querySelectorAll('.cloud-feat-bk').forEach(el => {
    if (el.dataset.premium && el.dataset.base) {
      el.textContent = isPremium ? el.dataset.premium : el.dataset.base;
    }
  });
  document.querySelectorAll('.cloud-feat-azure').forEach(el => {
    if (el.dataset.premium && el.dataset.base) {
      el.textContent = isPremium ? el.dataset.premium : el.dataset.base;
    }
  });
  document.querySelectorAll('.cloud-feat-azure-icon').forEach(el => {
    el.innerHTML = isPremium
      ? '<span class="feature-check">✓</span>'
      : '<span class="feature-cross">✗</span>';
  });
  document.querySelectorAll('.cloud-feat-snap').forEach(el => {
    if (el.dataset.premium && el.dataset.base) {
      el.textContent = isPremium ? el.dataset.premium : el.dataset.base;
    }
  });
  document.querySelectorAll('.cloud-feat-ms').forEach(el => {
    if (el.dataset.premium && el.dataset.base) {
      el.textContent = isPremium ? el.dataset.premium : el.dataset.base;
    }
  });
  document.querySelectorAll('.cloud-feat-dns').forEach(el => {
    if (el.dataset.premium && el.dataset.base) {
      el.textContent = isPremium ? el.dataset.premium : el.dataset.base;
    }
  });
  document.querySelectorAll('.cloud-cost-user').forEach(el => {
    if (el.dataset.premium && el.dataset.base) {
      el.textContent = isPremium ? el.dataset.premium : el.dataset.base;
    }
  });
  document.querySelectorAll('.cloud-table-azure').forEach(el => {
    if (el.dataset.premium && el.dataset.base) {
      el.textContent = isPremium ? el.dataset.premium : el.dataset.base;
      el.style.color = isPremium ? 'var(--success-color)' : 'var(--text-muted)';
    }
  });
}

if (cloudToggle) {
  cloudToggle.addEventListener('click', () => {
    isPremium = !isPremium;
    updateCloudPrices();
  });
  cloudToggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      isPremium = !isPremium;
      updateCloudPrices();
    }
  });
}

if (lblBase) {
  lblBase.addEventListener('click', () => {
    if (isPremium) {
      isPremium = false;
      updateCloudPrices();
    }
  });
  lblBase.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isPremium) {
        isPremium = false;
        updateCloudPrices();
      }
    }
  });
}

if (lblPremium) {
  lblPremium.addEventListener('click', () => {
    if (!isPremium) {
      isPremium = true;
      updateCloudPrices();
    }
  });
  lblPremium.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isPremium) {
        isPremium = true;
        updateCloudPrices();
      }
    }
  });
}

// ── FAQ Accordion ──
document.querySelectorAll('.faq-question').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    document.querySelectorAll('.faq-question span:last-child').forEach(s => s.textContent = '+');
    if (!wasOpen) {
      item.classList.add('open');
      q.querySelector('span:last-child').textContent = '−';
    }
  });
});

// ── Sync Pricing from API dynamically ──
async function syncPricingFromAPI() {
  try {
    const res = await fetch('/api/pricing');
    if (!res.ok) return;
    const data = await res.json();

    // 1. Marg ERP 9+ Software
    if (data.erp) {
      const erpMap = { nano: 0, basic: 1, silver: 2, gold: 3 };
      const amountEls = document.querySelectorAll('#panel-erp .pricing-card .price-amount');
      data.erp.forEach(item => {
        const idx = erpMap[item.key];
        if (idx !== undefined && amountEls[idx]) {
          amountEls[idx].textContent = item.price.toLocaleString('en-IN');
        }
      });
    }

    // 2. MargCloud Plans
    if (data.cloud) {
      const basicCloud = data.cloud.find(c => c.key === 'basic_base');
      const basicCloudPrem = data.cloud.find(c => c.key === 'basic_premium');
      const silverCloud = data.cloud.find(c => c.key === 'silver_base');
      const silverCloudPrem = data.cloud.find(c => c.key === 'silver_premium');

      const cloudCards = document.querySelectorAll('#panel-cloud .cloud-price');
      if (cloudCards[0] && basicCloud) cloudCards[0].dataset.base = basicCloud.price;
      if (cloudCards[0] && basicCloudPrem) cloudCards[0].dataset.premium = basicCloudPrem.price;
      if (cloudCards[1] && silverCloud) cloudCards[1].dataset.base = silverCloud.price;
      if (cloudCards[1] && silverCloudPrem) cloudCards[1].dataset.premium = silverCloudPrem.price;
      updateCloudPrices();
    }

    // 3. eOrder / eRetail / eBilling / eDelivery
    if (data.mobile_eorder) {
      const eorderMap = { eorder_starter: 0, eorder_standard: 1, eorder_growth: 2, eorder_business: 3, eorder_enterprise: 4 };
      const eorderEls = document.querySelectorAll('#app-panel-eorder .pricing-card .price-amount');
      data.mobile_eorder.forEach(item => {
        const idx = eorderMap[item.key];
        if (idx !== undefined && eorderEls[idx]) {
          eorderEls[idx].textContent = item.price.toLocaleString('en-IN');
        }
      });
    }

    // 4. eOwner
    if (data.mobile_eowner) {
      const eownerMap = { eowner_solo: 0, eowner_duo: 1, eowner_group: 2 };
      const eownerEls = document.querySelectorAll('#app-panel-eowner .pricing-card .price-amount');
      data.mobile_eowner.forEach(item => {
        const idx = eownerMap[item.key];
        if (idx !== undefined && eownerEls[idx]) {
          eownerEls[idx].textContent = item.price.toLocaleString('en-IN');
        }
      });
    }

    // 5. SFAXpert, GPS, PharmaNXT
    if (data.mobile_other) {
      const sfaxpert = data.mobile_other.find(i => i.key === 'sfaxpert_std');
      const gps = data.mobile_other.find(i => i.key === 'gps_std');
      const pharmanxt = data.mobile_other.find(i => i.key === 'pharmanxt_pro');

      if (sfaxpert) {
        const el = document.querySelector('#app-panel-sfaxpert .price-amount');
        if (el) el.textContent = sfaxpert.price.toLocaleString('en-IN');
      }
      if (gps) {
        const el = document.querySelector('#app-panel-gps .price-amount');
        if (el) el.textContent = gps.price.toLocaleString('en-IN');
      }
      if (pharmanxt) {
        const el = document.querySelector('#app-panel-pharmanxt .price-amount');
        if (el) el.textContent = pharmanxt.price.toLocaleString('en-IN');
      }
    }
  } catch {
    // offline or static mode
  }
}

document.addEventListener('DOMContentLoaded', () => {
  syncPricingFromAPI();
});