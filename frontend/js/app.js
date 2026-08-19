document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initMobileAppTabs();
  initDemoModal();
});

// Theme Switcher (Dark / Light)
function initThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle');
  if (!themeBtn) return;

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
    ? '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>'
    : '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>';
}

// Mobile Menu Navigation
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const closeBtn = document.getElementById('close-drawer');

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => drawer.classList.add('open'));
  }
  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', () => drawer.classList.remove('open'));
  }
}

// Marg Integrated Mobile Apps Tab Selector (Original Site Apps)
function initMobileAppTabs() {
  const appTabs = document.querySelectorAll('.app-tab-btn');
  const phoneTitle = document.getElementById('phone-screen-title');
  const phoneBadge = document.getElementById('phone-screen-badge');
  const phoneList = document.getElementById('phone-screen-features');
  const screenshotImg = document.getElementById('app-screenshot-img');

  const appData = {
    eretail: {
      title: "Marg eRetail App",
      badge: "For Retail Customers & Chemists",
      image: "assets/eRetail.png",
      features: [
        "Place order to suppliers anytime anywhere",
        "Track orders, bills & dispatches",
        "View stock rates, deals & schemes",
        "Check ledger balance, outstanding & PDC",
        "Tax statement reconciliation & summaries"
      ]
    },
    eorder: {
      title: "Marg eOrder App",
      badge: "For Field Salesmen",
      image: "assets/eOrder.png",
      features: [
        "Create, manage, track, and control retailer orders with flexible limits.",
        "Identify priority stock and assign sales targets to drive product sales.",
        "Track dispatches, invoices, shortages, and real-time stock across the supply chain.",
        "Manage promotions, schemes, pricing, batches, barcodes, discounts, and product visibility."
      ]
    },
    eowner: {
      title: "Marg eOwner App",
      badge: "For Business Owners",
      image: "assets/eOwner.png",
      features: [
        "Easy tracking of field staff",
        "In-depth analysis of stock details",
        "Clear overview of clients outstanding any time",
        "Easy modification of purchase orders and see Financial reports",
        "Easy to use and understand"
      ]
    },
    sfaxpert: {
      title: "SFAXpert App",
      badge: "Sales Force Automation",
      image: "assets/SFAXpert.png",
      features: [
        "Stock sales analysis",
        "Easy Connectivity with Marg",
        "Dash Board Notification",
        "Attendance& expenses",
        "GPS tracking"
      ]
    },
    pharmanxt: {
      title: "PharmaNXT App",
      badge: "Medicine & Salt Information",
      image: "assets/PharmaNXT.png",
      features: [
        "Check medication side effects for specific patient conditions.",
        "Find distributor profiles and associated companies.",
        "View manufacturer details, products, salt compositions, and distributors.",
        "Easily access relevant medicine, manufacturer, and distributor information."
      ]
    },
    gps: {
      title: "GPS Tracking App",
      badge: "Field Force Tracking",
      image: "assets/GPS.png",
      features: [
        "Real-time updates about field sales force",
        "Improved worker punctuality & scheduling",
        "Decreased fuel costs & travel expenses",
        "Increased overall field productivity"
      ]
    }
  };

  appTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.app;
      appTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (appData[key] && phoneTitle && phoneBadge && phoneList) {
        phoneTitle.innerText = appData[key].title;
        phoneBadge.innerText = appData[key].badge;
        phoneList.innerHTML = appData[key].features.map(f => `<li><span class="icon">✓</span> ${f}</li>`).join('');
      }

      if (screenshotImg && appData[key]) {
        screenshotImg.classList.add('fade-out');
        setTimeout(() => {
          screenshotImg.src = appData[key].image;
          screenshotImg.alt = appData[key].title + ' Screenshot';
          screenshotImg.classList.remove('fade-out');
        }, 200);
      }
    });
  });
}

// Contact / Demo Modal
function initDemoModal() {
  const modal = document.getElementById('demo-modal');
  const openBtns = document.querySelectorAll('.open-demo-modal');
  const closeBtn = document.getElementById('close-demo-modal');
  const demoForm = document.getElementById('demo-form');

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) modal.classList.add('active');
    });
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('demo-name').value;
      const phone = document.getElementById('demo-phone').value;

      showToast(`Thank you, ${name}! Your inquiry has been sent. We will contact you at ${phone}.`);
      demoForm.reset();
      if (modal) modal.classList.remove('active');
    });
  }
}

// Toast Notification
function showToast(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}
