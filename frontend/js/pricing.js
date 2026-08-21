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
      // 1. Update Price Amounts
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

      // 4. Update Cloud Cost per user in breakdown box
      document.querySelectorAll('.cloud-cost-user').forEach(el => {
        if (el.dataset.premium && el.dataset.base) {
          el.textContent = isPremium ? el.dataset.premium : el.dataset.base;
        }
      });

      // 5. Update Dynamic Features (Hardware, Backup, Snapshots, Managed Services, DNS)
      document.querySelectorAll('[class^="cloud-feat-"]').forEach(el => {
        if (el.dataset.premium && el.dataset.base) {
          el.textContent = isPremium ? el.dataset.premium : el.dataset.base;
        }
      });

      // 6. Update Azure Backup icon in cards
      document.querySelectorAll('.cloud-feat-azure-icon').forEach(el => {
        el.innerHTML = isPremium
          ? '<span class="feature-check">✓</span>'
          : '<span class="feature-cross">✗</span>';
      });

      // 7. Update Azure Backup cell in comparison table
      document.querySelectorAll('.cloud-table-azure').forEach(el => {
        if (el.dataset.premium && el.dataset.base) {
          el.textContent = isPremium ? el.dataset.premium : el.dataset.base;
          const td = el.closest('td');
          if (td) {
            td.classList.toggle('check-yes', isPremium);
            td.classList.toggle('check-no', !isPremium);
          }
        }
      });

      // 8. Update Toggle and Labels
      if (lblBase) lblBase.classList.toggle('active-label', !isPremium);
      if (lblPremium) lblPremium.classList.toggle('active-label', isPremium);
      if (cloudToggle) {
        cloudToggle.classList.toggle('on', isPremium);
        cloudToggle.setAttribute('aria-checked', isPremium);
      }
      if (cloudBadge) {
        cloudBadge.innerHTML = isPremium ? '⚡ 16-Core Xeon · 5x Backup · Azure' : '8-Core Xeon · 2x Daily Backup';
        cloudBadge.classList.toggle('premium-badge', isPremium);
      }
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