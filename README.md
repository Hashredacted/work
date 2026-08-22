# Raizada CompuSoft – Marg® ERP Partner Website

Full-stack website for **Raizada CompuSoft**, the authorized Marg® ERP sales & service partner in Aligarh, UP.
Built with a **Node.js/Express backend** that serves the frontend, manages admin data (downloads, pricing, logo, settings) via REST API, and handles logo file uploads.

---

## 🚀 Quick Start

### 1 — Install dependencies (first time only)

```bash
cd backend
npm install
```

### 2 — Start the server

```bash
cd backend
npm start
```

> The Express server serves **both** the frontend and the API from a single process.

| URL | Description |
|---|---|
| http://localhost:3001 | Homepage |
| http://localhost:3001/pricing.html | Pricing Plans |
| http://localhost:3001/payroll.html | MargHRMS Payroll |
| http://localhost:3001/downloads.html | Software Downloads |
| http://localhost:3001/table.html | Feature Comparison |
| http://localhost:3001/admin.html | Admin Portal 🔒 |
| http://localhost:3001/api/health | API Health Check |

**Admin credentials:** Password `RCS@2026` (change in `backend/config.js`)

### 3 — Stop & restart

If you see `EADDRINUSE: address already in use :::3001`, a server is already running.
Kill it first, then restart:

```powershell
# Find and kill the process using port 3001
netstat -ano | findstr :3001
# Note the PID from the last column, then:
taskkill /PID <PID> /F

# Now start fresh
cd backend && npm start
```

---

## 📁 Project Structure

```
work/
├── README.md
├── backend/                        # Node.js / Express server
│   ├── server.js                   # Entry point — serves frontend + /api on port 3001
│   ├── config.js                   # Port, password, JWT secret (env-var overridable)
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js                 # JWT Bearer token verification middleware
│   ├── routes/
│   │   ├── auth.js                 # POST /api/auth/login · GET /api/auth/me
│   │   ├── downloads.js            # Full CRUD  /api/downloads
│   │   ├── pricing.js              # Read/Update /api/pricing/:group
│   │   ├── logo.js                 # Upload/reset /api/logo  (Multer)
│   │   └── settings.js             # Read/Update /api/settings
│   ├── data/                       # Flat-file JSON persistence (no database needed)
│   │   ├── downloads.json          # 11 seed download entries
│   │   ├── pricing.json            # ERP / Cloud / HRMS price tables
│   │   └── settings.json           # Site contact info, address, etc.
│   └── uploads/
│       └── logo/                   # Logo files uploaded via admin panel
└── frontend/
    ├── index.html                  # Homepage
    ├── pricing.html                # Pricing page (ERP, Cloud, Mobile Apps, Payroll & Downloads tabs)
    ├── payroll.html                # MargHRMS Payroll & HRMS pricing (Basic / Silver / Gold)
    ├── table.html                  # 93-feature software comparison chart
    ├── downloads.html              # Download centre (ERP, Mobile Apps, HRMS, Remote Support)
    ├── admin.html                  # Admin portal (login → dashboard → CRUD panels)
    ├── css/
    │   ├── styles.css              # Global design system & typography (dark/light theme tokens)
    │   ├── pricing.css             # Pricing page cards, cloud toggle, FAQ accordion
    │   ├── payroll.css             # MargHRMS comparison matrix, add-on cards, modal
    │   ├── table.css               # 93-feature comparison table (dark & light modes)
    │   ├── downloads.css           # Download centre cards, filter tabs, search, QR modal
    │   └── admin.css               # Admin panel sidebar, forms, CRUD table, modal, toast
    ├── js/
    │   ├── app.js                  # Global: theme toggle (rcs_theme), mobile drawer, demo modal
    │   ├── pricing.js              # Tab switcher, cloud pricing calculator, app sub-tabs
    │   ├── payroll.js              # Category expand/collapse, add-on selector, lead forms
    │   ├── table.js                # Feature matrix theme toggle & sticky header
    │   ├── downloads.js            # Search filter, category tabs, download toast, QR modal
    │   ├── admin.js                # Admin panel: API fetch, CRUD, logo upload, pricing editor
    │   └── hsn-data.js             # HSN/SAC code reference data
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

## 🔌 REST API Reference

All write routes require `Authorization: Bearer <token>` (obtained from `POST /api/auth/login`).

### Auth

| Method | Route | Auth | Body / Response |
|---|---|---|---|
| `POST` | `/api/auth/login` | No | `{ password }` → `{ token, expiresIn }` |
| `GET` | `/api/auth/me` | Yes | → `{ role, ok }` |

### Downloads

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/downloads` | No | Visible entries only |
| `GET` | `/api/downloads/all` | Yes | All entries (including hidden) |
| `POST` | `/api/downloads` | Yes | Create entry |
| `PUT` | `/api/downloads/:id` | Yes | Update entry |
| `DELETE` | `/api/downloads/:id` | Yes | Delete entry |

### Pricing

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/pricing` | No | All groups (erp, cloud, hrms) |
| `GET` | `/api/pricing/:group` | No | Single group |
| `PUT` | `/api/pricing/:group` | Yes | Update group (array of `{key, label, price}`) |

### Logo

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/logo` | No | Active logo URL |
| `POST` | `/api/logo` | Yes | Upload new logo (`multipart/form-data`, field: `logo`) |
| `DELETE` | `/api/logo` | Yes | Reset to default (`assets/logo.png`) |

### Settings

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/settings` | No | All site settings |
| `PUT` | `/api/settings` | Yes | Update fields (siteName, address, phone1–3, email, whatsapp, googleMapsUrl) |

---

## 🔒 Admin Portal (`/admin.html`)

| Section | Capability |
|---|---|
| **Dashboard** | Stats overview, quick actions, links to all site pages |
| **Logo Manager** | Drag & drop upload → saved to `backend/uploads/logo/`; reset to default |
| **Downloads Manager** | Full CRUD table — add/edit/delete any download entry; toggle visibility |
| **Pricing Manager** | Edit ₹ values for ERP, MargCloud, and MargHRMS plans |
| **Settings** | Edit business name, address, phone numbers, email, WhatsApp, Google Maps URL |

---

## ⚙️ Configuration

Edit `backend/config.js` or set environment variables before running:

```bash
PORT=3001                              # Server port (default: 3001)
ADMIN_PASSWORD=YourPassword            # Admin login password (default: RCS@2026)
JWT_SECRET=your-long-random-secret    # JWT signing secret (change in production!)
```

Example with environment variables:

```powershell
$env:ADMIN_PASSWORD="MyNewPassword"; $env:PORT=8080; node server.js
```

---

## 🎨 Design System

- **Font**: Inter (Google Fonts — 400/500/600/700/800/900)
- **Theme**: Dark by default (`data-theme="dark"` on `<html>`), user-toggleable via localStorage key `rcs_theme` — zero flash on load via inline `<script>` in `<head>`.
- **CSS Variables** (defined in `styles.css`):
  - `--bg-primary` / `--bg`, `--bg-secondary`, `--bg-card`, `--bg-surface`, `--bg-glass`
  - `--text-primary`, `--text-secondary`, `--text-muted`
  - `--accent-primary` (indigo `#6366f1`), `--accent-secondary` (cyan)
  - `--border-color`, `--shadow-*`
- **Natural Logo Scaling**: `.logo-img` preserves the original aspect ratio with transparent backgrounds.

---

## 🖥️ Pages

### `index.html` — Homepage

| Section | Details |
|---|---|
| Top bar | Address, 3 phone numbers, email, theme toggle, admin link |
| Hero | "Empower Your Business with Marg® ERP Software" + CTA |
| About | Raizada CompuSoft authorized partner description |
| Mobile Apps | Interactive 6-app tab switcher with phone mockup |
| GST & Compliance | e-Invoicing, e-Way Bill, GST Billing, HSN/SAC Finder |
| Contact CTA | Demo booking modal |
| Footer | Address, phones, quick links (incl. Downloads) |

**Contact Info:**
- 📍 Shop No. 16, 1st Floor, C.M. Mall, Railway Road, Aligarh
- 📞 +91 8938077776 · 9690277776 · 9927026557
- 📧 raizadacompusoft@gmail.com

---

### `pricing.html` — Pricing Plans

5 product tabs: **Marg ERP 9+** · **MargCloud** · **Mobile Apps** · **Payroll** · **Downloads**

#### Tab 1 — Marg ERP 9+ (Desktop Software)

| Edition | Price/yr | Notes |
|---|---|---|
| Nano | ₹5,550 | Max 2 users / 2 Company |
| Basic | ₹10,300 | 1 Full Rights |
| Silver ⭐ | ₹13,900 | 1 Full Rights + 1 View |
| Gold | ₹26,000 | Unlimited Users + Company |

#### Tab 2 — MargCloud (Hosted Plans)

| Plan | Base/yr | Premium/yr |
|---|---|---|
| Basic Cloud | ₹17,800 | ₹21,100 |
| Silver Cloud ⭐ | ₹21,400 | ₹24,700 |
| Enterprise | Custom | Custom |

#### Tab 3 — Mobile Apps (5 sub-tabs)
eOrder/eBilling/eDelivery/eRetail · eOwner · SFAXpert · GPS Tracking · PharmaNXT

#### Tabs 4 & 5 — Payroll / Downloads
Redirect to `payroll.html` and `downloads.html` respectively.

---

### `payroll.html` — MargHRMS Payroll & HRMS Pricing

| Plan | Price/yr | Employees |
|---|---|---|
| Basic | ₹7,200 | Up to 25 |
| Silver ⭐ | ₹18,000 | Up to 50 |
| Gold | ₹36,000 | Up to 50 |

Interactive feature matrix, add-on module selector (GPS / Face recognition / PMS / TMS / Multi-Company), and demo booking modal. Full dark/light mode support.

---

### `table.html` — 93-Feature Comparison

Sticky header comparison across Basic / Silver / Gold. Dark/light mode toggle. Links back to `pricing.html#panel-erp`.

---

### `downloads.html` — Download Centre

11 download cards across 4 categories:

| Category | Items |
|---|---|
| 🖥️ ERP | Marg ERP 9+, MargCloud Agent |
| 📱 Mobile | eRetail, eOrder, eOwner, SFAXpert, PharmaNXT, GPS |
| 👔 HRMS | MargHRMS |
| 🛠️ Support | AnyDesk, TeamViewer |

Live search, category filter tabs, mobile QR modal, download toast notifications.

---

### `admin.html` — Admin Portal

Password-protected (default: `RCS@2026`). Full CRUD admin panel — see [Admin Portal section](#-admin-portal-adminhtml) above.

---

## 📌 Key Conventions

1. **`data-base` / `data-premium`** for cloud pricing toggle (NOT `data-monthly` / `data-annual`)
2. **No Tailwind** — Modular Vanilla CSS with CSS custom properties
3. **Dedicated CSS & JS files** in `css/` and `js/` — no large inline `<style>` or `<script>` blocks
4. **Shared theme state** via `localStorage.getItem('rcs_theme')` with zero-flash `<script>` in `<head>`
5. **All ERP prices are annual renewal fees** — 18% GST extra on all plans
6. **eOrder/eBilling/eDelivery/eRetail share identical pricing tiers** (one combined sub-tab)
7. **Admin JWT tokens** are stored in `sessionStorage` (cleared on tab close)
8. **Data persistence** uses flat JSON files in `backend/data/` — no external database required
