# Raizada CompuSoft – Marg® ERP Partner Website

Full-stack website for **Raizada CompuSoft**, the authorized Marg® ERP sales & service partner in Aligarh, UP.

> **Dev server**: `python -m http.server 8080 --directory frontend` → http://localhost:8080

---

## 📁 Project Structure

```
work/
├── README.md
├── backend/                    # (placeholder — not yet implemented)
└── frontend/
    ├── index.html              # Main homepage
    ├── pricing.html            # Pricing page (ERP 9+, MargCloud, Mobile Apps, Payroll redirect)
    ├── payroll.html            # MargHRMS Payroll & HRMS pricing page (Basic/Silver/Gold)
    ├── table.html              # Software feature comparison chart (Basic/Silver/Gold)
    ├── admin.html              # Admin portal placeholder ("Coming Soon")
    ├── css/
    │   └── styles.css          # Global design system (dark/light theme CSS variables)
    ├── js/
    │   ├── app.js              # Global JS: theme, mobile drawer, app tabs, demo modal
    │   └── hsn-data.js         # HSN/SAC code reference data
    └── assets/
        ├── logo.png
        ├── eRetail.png
        ├── eOrder.png
        ├── eOwner.png
        ├── SFAXpert.png
        ├── GPS.png
        └── PharmaNXT.png
```

---

## 🎨 Design System

- **Font**: Inter (Google Fonts — 400/500/600/700/800/900)
- **Theme**: Dark by default (`data-theme="dark"` on `<html>`), user-toggleable via localStorage key `rcs_theme`
- **CSS Variables** (defined in `styles.css`):
  - `--bg-primary`, `--bg-secondary`, `--bg-card`, `--bg-glass`
  - `--text-primary`, `--text-secondary`, `--text-muted`
  - `--accent-primary` (indigo `#6366f1`), `--accent-secondary` (violet `#a78bfa`)
  - `--border-color`, `--shadow-*`
- **pricing.html** has its own `<style>` block (~700 lines) for all pricing-specific components

---

## 🖥️ Pages

### `index.html` — Homepage

| Section | Details |
|---|---|
| Top bar | Address, 3 phone numbers, email, theme toggle, admin link |
| Hero | "Empower Your Business with Marg® ERP Software" + CTA buttons |
| About | Raizada CompuSoft authorized partner description |
| Mobile Apps Showcase | Interactive 6-app tab switcher with phone mockup |
| GST & Compliance | e-Invoicing, e-Way Bill, GST Billing, HSN/SAC Finder links |
| Contact CTA | "Can We Help Your Business Grow?" with demo modal |
| Footer | Address, phones, links |

**Contact Info:**
- 📍 Shop No. 16, 1st Floor, C.M. Mall, Railway Road, Aligarh
- 📞 +91 8938077776 · 9690277776 · 9927026557
- 📧 raizadacompusoft@gmail.com

---

### `pricing.html` — Pricing Plans (5 Product Tabs)

URL: `http://localhost:8080/pricing.html`

#### Tab 1 — Marg ERP 9+ (Desktop Software)

**4 pricing cards** — Annual renewal license, 18% GST extra:

| Edition | Price/yr | Users | Notes |
|---|---|---|---|
| Marg ERP Nano | ₹5,550 | Max 2 users / 2 Company | Versions: 1.0, 2.0, 3.0, 4.0 · ₹3,000/extra user |
| Basic Edition *(Limited)* | ₹10,300 | 1 Full Rights · Max 2u/2c | ARC @ ₹1,050/user · ₹1,030/company |
| Silver Edition ⭐ | ₹13,900 | 1 Full Rights + 1 View | ARC @ ₹1,050/user · ₹1,030/company |
| Gold Edition | ₹26,000 | Unlimited Users + Company | All Silver features + multi-branch |

**Nano version comparison** (inline table, `id="nano-compare-table"`):

| | Nano 1.0 | Nano 2.0 | Nano 3.0 | Nano 4.0 |
|---|---|---|---|---|
| Bills Limit | 600/Month | Unlimited | 1000/Month | Unlimited |
| Sales Limit | ₹2.5L/Month | ₹40L/Year | ₹3.5L/Month | ₹80L/Year |
| Business Type | Pharma & General | Composition | Non-Pharma | Non-Pharma |

**"View Full Feature Comparison" button** → links to `table.html`

---

#### Tab 2 — MargCloud (Cloud Hosting)

**Base / Premium toggle** (`id="cloud-toggle"`, `aria-checked`) — replaces Monthly/Annual.
- Label IDs: `#lbl-base`, `#lbl-premium`
- Badge: `#cloud-badge`

**JS uses `el.dataset.base` / `el.dataset.premium`** (NOT `data-monthly` / `data-annual`)

**3 cloud plans:**

| Plan | Base Price | Premium Price |
|---|---|---|
| Marg Basic Cloud | ₹17,800/yr | ₹21,100/yr |
| Marg Silver Cloud ⭐ | ₹21,400/yr | ₹24,700/yr |
| Marg Enterprise Cloud | Custom | Custom |

**Spec differences Base vs Premium:**

| Spec | Base | Premium |
|---|---|---|
| CPU | Xeon 8-Core | Xeon 16-Core |
| RAM | 64 GB | 128 GB |
| Backup/day | 2 | 5 |
| Azure Backup | NA | Yes |
| Snapshots | 1/day | 4/day |
| Managed Services | Comprehensive | Extensive |
| DNS | Marg Domain | Customer / Marg Domain |

---

#### Tab 3 — Mobile Apps (5 sub-tabs)

Sub-tab buttons use `data-app="..."` → shows `#app-panel-{app}`:

| Sub-tab | Panel ID |
|---|---|
| eOrder / eBilling / eDelivery / eRetail | `app-panel-eorder` |
| eOwner | `app-panel-eowner` |
| SFAXpert | `app-panel-sfaxpert` |
| GPS Tracking | `app-panel-gps` |
| PharmaNXT | `app-panel-pharmanxt` |

**eOrder / eBilling / eDelivery / eRetail plans (all 4 apps share same tiers):**

| Plan | Price/yr | Salesmen | Retailers |
|---|---|---|---|
| Starter | ₹5,550 | 2 | Unlimited |
| Standard | ₹7,500 | 5 | Unlimited |
| Growth 🔥 New | ₹13,900 | 12 | Unlimited |
| Business | ₹25,000 | 25 | Unlimited |
| Enterprise | ₹46,500 | Unlimited | Unlimited |

**eOwner plans:**

| Plan | Price/yr | Owners |
|---|---|---|
| Solo Owner | ₹4,100 | 1 |
| Duo Owners ⭐ | ₹5,550 | 2 |
| Group Owners | ₹10,250 | 5 |

---

#### Tab 4 — Payroll (MargHRMS)
Redirects to `payroll.html` (MargHRMS dedicated pricing & HR matrix page).

*(Note: AMC & Support and GST Services tabs were removed per requirements).*

---

### `payroll.html` — MargHRMS Payroll & HRMS Pricing

- Dedicated pricing page for MargHRMS software tailored 100% for India (INR pricing, PF/ESI/TDS statutory compliance).
- **3 Plans**:
  - **Basic**: ₹7,200/yr (Up to 25 Employees &bull; Extra ₹20/emp/mo)
  - **Silver (⭐ Most Popular)**: ₹18,000/yr (Up to 50 Employees &bull; Extra ₹25/emp/mo)
  - **Gold**: ₹36,000/yr (Up to 50 Employees &bull; Extra ₹50/emp/mo)
- **Interactive Matrix**: Collapsible categories (Login & Access, Core Features, Attendance Tracking, Leave Management, Payroll & Compliance, Mobile ESS App, Hardware Integration).
- **Add-On Modules Selector**: Dynamic tabs (Basic/Silver/Gold) showing pricing for GPS tracking, Face/Selfie recognition, PMS, TMS, and Multi-Company support.
- **Booking Modal & CTA**: Integrated 10-digit mobile number validation and demo booking.
- URL: `http://localhost:8080/payroll.html`

---

### `table.html` — Software Feature Comparison

- 93 features compared across Basic / Silver / Gold
- Self-contained CSS (dark theme, Inter font, indigo gradient header, green/red FA icons)
- Sticky top bar with "← Back to Pricing" button → `pricing.html#panel-erp`
- Footer: `*Customisation extra · We do not sell through online portals`
- URL: `http://localhost:8080/table.html`

---

### `admin.html` — Admin Portal Placeholder

"Coming Soon / Under Development" — linked from index.html top bar.

---

## ⚙️ JavaScript (`js/app.js`)

| Function | Purpose |
|---|---|
| `initThemeToggle()` | Dark/light toggle, persists via `localStorage('rcs_theme')` |
| `initMobileMenu()` | Hamburger → `#mobile-drawer`, close button removes `.open` |
| `initMobileAppTabs()` | Homepage app switcher — `.app-tab-btn` → updates phone mockup |
| `initDemoModal()` | `.open-demo-modal` → `#demo-modal`, form submit shows `#toast` for 3s |

---

## 🔧 `pricing.html` Embedded Script (bottom of file)

| Function | Purpose |
|---|---|
| `switchTab(tabId)` | Switches 5 product tabs |
| App sub-tab listener | `data-app` → `#app-panel-{app}` show/hide |
| `updateCloudPrices()` | Reads `.dataset.base` / `.dataset.premium` on all cloud elements |
| Cloud toggle listeners | `#cloud-toggle`, `#lbl-base`, `#lbl-premium`, keyboard Enter/Space |

**Dynamic cloud classes:**
- `.cloud-price` — price amount spans
- `.cloud-period` / `.cloud-period-badge` — "(Base)" / "(Premium)" labels
- `.cloud-note` — user limit notes
- `.cloud-cost-user` — cost breakdown
- `[class^="cloud-feat-"]` — hardware, backup, snapshots, managed services, DNS
- `.cloud-feat-azure-icon` — ✓/✗ icon for Azure Backup in cards
- `.cloud-table-azure` — Azure Backup table cells

---

## 🚀 Running Locally

```powershell
python -m http.server 8080 --directory frontend
```

- Homepage → http://localhost:8080/
- Pricing → http://localhost:8080/pricing.html
- Feature Table → http://localhost:8080/table.html
- Admin → http://localhost:8080/admin.html

> No build step — pure HTML/CSS/JS.

---

## 📌 Key Conventions

1. **`data-base` / `data-premium`** for cloud toggle (NOT `data-monthly` / `data-annual`)
2. **No Tailwind** — Vanilla CSS with CSS custom properties only
3. **pricing.html** has its own large `<style>` block + imports `styles.css`
4. **table.html** is fully self-contained — does not import `styles.css`
5. **All ERP prices are annual renewal fees** — 18% GST extra on all
6. **eOrder/eBilling/eDelivery/eRetail share identical pricing tiers** — one combined sub-tab
7. **admin.html is a placeholder** — real admin panel not yet built
