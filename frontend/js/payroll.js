document.addEventListener('DOMContentLoaded', () => {

    // Theme Switcher (Dark / Light)
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        const currentTheme = localStorage.getItem('rcs_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateThemeIcon(themeBtn, currentTheme);

        themeBtn.addEventListener('click', () => {
            const activeTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('rcs_theme', newTheme);
            updateThemeIcon(themeBtn, newTheme);
        });
    }

    function updateThemeIcon(btn, theme) {
        btn.innerHTML = theme === 'dark'
            ? '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>'
            : '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>';
    }

    // 1. Table Category Toggle (Collapse / Expand)
    document.querySelectorAll('.category-row').forEach(row => {
        row.addEventListener('click', () => {
            const cat = row.dataset.cat;
            const subRows = document.querySelectorAll('.sub-row.cat-' + cat);
            const toggle = row.querySelector('.category-toggle');
            const isHidden = subRows.length > 0 && subRows[0].classList.contains('hidden');

            subRows.forEach(r => r.classList.toggle('hidden', !isHidden));
            if (toggle) {
                toggle.textContent = isHidden ? '−' : '+';
            }
        });
    });

    // 2. Add-on Plan Selector Tabs
    const addonData = {
        basic: {
            gps: '✗ (Not Available)',
            face: '&#8377;20 / Employee / Mo',
            pms: '✗ (Not Included)',
            tms: '✗ (Not Included)',
            multi: '✗ (Not Included)'
        },
        silver: {
            gps: '&#8377;150 / Employee / Mo',
            face: '&#8377;20 / Employee / Mo',
            pms: '&#8377;30 / Employee / Mo',
            tms: '&#8377;15 / Employee / Mo',
            multi: '&#8377;3,600 / Company / Yr'
        },
        gold: {
            gps: '&#8377;150 / Employee / Mo',
            face: '&#10003; (Included)',
            pms: '&#10003; (Included)',
            tms: '&#10003; (Included)',
            multi: '&#10003; (Included Multi-branch)'
        }
    };

    const addonElements = {
        gps: document.getElementById('addon-gps'),
        face: document.getElementById('addon-face'),
        pms: document.getElementById('addon-pms'),
        tms: document.getElementById('addon-tms'),
        multi: document.getElementById('addon-multi')
    };

    document.querySelectorAll('.addon-plan-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.addon-plan-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            const plan = btn.dataset.addonPlan;
            const data = addonData[plan];
            if (!data) return;

            Object.keys(addonElements).forEach(key => {
                const el = addonElements[key];
                if (el) {
                    el.innerHTML = data[key];
                    const isNot = data[key].includes('✗');
                    el.classList.toggle('not-included', isNot);
                }
            });
        });
    });

    // 3. Demo Modal Controls
    const modal = document.getElementById('demoModal');
    const toast = document.getElementById('toastMsg');

    function showToast() {
        if (!toast) return;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 3500);
    }

    document.querySelectorAll('.open-demo-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (modal) modal.classList.add('open');
        });
    });

    const closeBtn = document.getElementById('closeModal');
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('open');
        });
    }

    // 4. Form Submit handlers
    const ctaForm = document.getElementById('payroll-cta-form');
    if (ctaForm) {
        ctaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            ctaForm.reset();
            showToast();
        });
    }

    const modalForm = document.getElementById('modal-lead-form');
    if (modalForm) {
        modalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            modalForm.reset();
            if (modal) modal.classList.remove('open');
            showToast();
        });
    }

    // 5. Sync Payroll Pricing from Backend API
    async function syncPayrollPricing() {
        try {
            const res = await fetch('/api/pricing/hrms');
            if (!res.ok) return;
            const hrms = await res.json();
            const priceEls = document.querySelectorAll('.plan-header-price');
            const hrmsMap = { hrms_basic: 0, hrms_silver: 1, hrms_gold: 2 };
            hrms.forEach(item => {
                const idx = hrmsMap[item.key];
                if (idx !== undefined && priceEls[idx]) {
                    priceEls[idx].innerHTML = `&#8377;${item.price.toLocaleString('en-IN')}<span>/ Year</span>`;
                }
            });
        } catch {
            // fallback to default HTML
        }
    }

    syncPayrollPricing();
});