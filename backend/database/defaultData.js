// ── database/defaultData.js ──
// Embedded starter seed data so the backend is 100% self-contained
// and does NOT require external JSON files on disk.

module.exports = {
  downloads: [
    {
      name: "Marg ERP 9+",
      subtitle: "Billing & Accounting Software",
      category: "erp",
      platform: "Windows",
      version: "v9.9.x",
      size: "~85 MB",
      url: "https://www.margbooks.com/downloads.asp",
      visible: true
    },
    {
      name: "MargCloud Agent",
      subtitle: "Cloud Access Client",
      category: "erp",
      platform: "Windows",
      version: "Latest",
      size: "~12 MB",
      url: "https://www.margbooks.com/downloads.asp",
      visible: true
    },
    {
      name: "Marg eRetail",
      subtitle: "For Retailers & Chemists",
      category: "mobile",
      platform: "Android / iOS",
      version: "Latest",
      size: "App Store",
      url: "https://play.google.com/store/search?q=marg+eretail&c=apps",
      visible: true
    },
    {
      name: "Marg eOrder",
      subtitle: "For Field Salesmen",
      category: "mobile",
      platform: "Android / iOS",
      version: "Latest",
      size: "App Store",
      url: "https://play.google.com/store/search?q=marg+eorder&c=apps",
      visible: true
    },
    {
      name: "Marg eOwner",
      subtitle: "For Business Owners",
      category: "mobile",
      platform: "Android / iOS",
      version: "Latest",
      size: "App Store",
      url: "https://play.google.com/store/search?q=marg+eowner&c=apps",
      visible: true
    },
    {
      name: "SFAXpert",
      subtitle: "Sales Force Automation",
      category: "mobile",
      platform: "Android / iOS",
      version: "Latest",
      size: "App Store",
      url: "https://play.google.com/store/search?q=sfaxpert+marg&c=apps",
      visible: true
    },
    {
      name: "PharmaNXT",
      subtitle: "Medicine & Salt Info",
      category: "mobile",
      platform: "Android / iOS",
      version: "Latest",
      size: "App Store",
      url: "https://play.google.com/store/search?q=pharmanxt&c=apps",
      visible: true
    },
    {
      name: "GPS Tracking",
      subtitle: "Field Force Tracking",
      category: "mobile",
      platform: "Android / iOS",
      version: "Latest",
      size: "App Store",
      url: "https://play.google.com/store/search?q=marg+gps+tracking&c=apps",
      visible: true
    },
    {
      name: "MargHRMS",
      subtitle: "Payroll & HR Management",
      category: "hrms",
      platform: "Windows",
      version: "Latest",
      size: "~60 MB",
      url: "https://www.margbooks.com/downloads.asp",
      visible: true
    },
    {
      name: "AnyDesk",
      subtitle: "Remote Desktop Support",
      category: "support",
      platform: "Windows / Android",
      version: "Latest",
      size: "~5 MB",
      url: "https://anydesk.com/en/downloads/windows",
      visible: true
    },
    {
      name: "TeamViewer",
      subtitle: "Remote Desktop Support",
      category: "support",
      platform: "All Platforms",
      version: "Latest",
      size: "~50 MB",
      url: "https://www.teamviewer.com/en-in/download/windows/",
      visible: true
    }
  ],

  pricing: {
    erp: [
      { key: "nano", label: "Marg ERP Nano", price: 5550, unit: "/yr", note: "Max 2 users · 2 Company" },
      { key: "basic", label: "Basic Edition", price: 10300, unit: "/yr", note: "1 Full Rights · Max 2u/2c" },
      { key: "silver", label: "Silver Edition ⭐", price: 13900, unit: "/yr", note: "1 Full Rights + 1 View" },
      { key: "gold", label: "Gold Edition", price: 26000, unit: "/yr", note: "Unlimited Users + Company" },
      { key: "extra_user_nano", label: "Extra User License (Nano)", price: 3000, unit: "/user", note: "One-time per additional user" },
      { key: "extra_co_nano", label: "Extra Company License (Nano)", price: 3000, unit: "/co", note: "One-time per additional company" },
      { key: "arc_extra_user", label: "ARC per Extra User (Basic/Silver)", price: 1050, unit: "/user/yr", note: "Annual renewal charge" },
      { key: "arc_extra_co", label: "ARC per Extra Company (Basic/Silver)", price: 1030, unit: "/co/yr", note: "Annual renewal charge" }
    ],
    cloud: [
      { key: "basic_base", label: "Marg Basic Cloud (Base)", price: 17800, unit: "/yr", note: "Xeon 8-Core · 64GB RAM · 2 Backups/day" },
      { key: "basic_premium", label: "Marg Basic Cloud (Premium)", price: 21100, unit: "/yr", note: "Xeon 16-Core · 128GB RAM · 5 Backups + Azure" },
      { key: "silver_base", label: "Marg Silver Cloud (Base) ⭐", price: 21400, unit: "/yr", note: "Multi-User Ready · 8-Core Xeon" },
      { key: "silver_premium", label: "Marg Silver Cloud (Premium)", price: 24700, unit: "/yr", note: "Multi-User Ready · 16-Core Xeon + Azure" },
      { key: "cloud_user_base", label: "Cloud Cost / Extra User (Base)", price: 7500, unit: "/user/yr", note: "Per additional user per year" },
      { key: "cloud_user_prem", label: "Cloud Cost / Extra User (Premium)", price: 10800, unit: "/user/yr", note: "Per additional user per year" }
    ],
    mobile_eorder: [
      { key: "eorder_starter", label: "Starter Plan (2 Salesmen)", price: 5550 },
      { key: "eorder_standard", label: "Standard Plan (5 Salesmen)", price: 7500 },
      { key: "eorder_growth", label: "Growth Plan (12 Salesmen) 🔥", price: 13900 },
      { key: "eorder_business", label: "Business Plan (25 Salesmen)", price: 25000 },
      { key: "eorder_enterprise", label: "Enterprise Plan (Unlimited Salesmen)", price: 46500 }
    ],
    mobile_eowner: [
      { key: "eowner_solo", label: "Solo Owner (1 Owner)", price: 4100 },
      { key: "eowner_duo", label: "Duo Owners (2 Owners) ⭐", price: 5550 },
      { key: "eowner_group", label: "Group Owners (5 Owners)", price: 10250 }
    ],
    mobile_other: [
      { key: "sfaxpert_std", label: "SFAXpert – Standard", price: 3500, unit: "/user/yr", note: "Daily Call Reporting · Route beat · Visits" },
      { key: "gps_std", label: "GPS Tracking App", price: 1200, unit: "/user/yr", note: "Live map · Geo-fence · Travel history" },
      { key: "pharmanxt_pro", label: "PharmaNXT App", price: 1500, unit: "/yr", note: "3 Lakh+ Medicine & Salt Database" }
    ],
    hrms: [
      { key: "hrms_basic", label: "MargHRMS Basic", price: 7200, unit: "/yr", note: "Up to 25 Employees" },
      { key: "hrms_silver", label: "MargHRMS Silver ⭐", price: 18000, unit: "/yr", note: "Up to 50 Employees · Best Seller" },
      { key: "hrms_gold", label: "MargHRMS Gold", price: 36000, unit: "/yr", note: "Up to 50 Employees · Enterprise" },
      { key: "hrms_extra_emp_basic", label: "Extra Employee (Basic)", price: 20, unit: "/emp/mo", note: "Per employee monthly" },
      { key: "hrms_extra_emp_silver", label: "Extra Employee (Silver)", price: 25, unit: "/emp/mo", note: "Per employee monthly" },
      { key: "hrms_extra_emp_gold", label: "Extra Employee (Gold)", price: 50, unit: "/emp/mo", note: "Per employee monthly" },
      { key: "hrms_addon_gps", label: "Add-on: GPS Tracking", price: 150, unit: "/emp/mo", note: "Field attendance & live tracking" },
      { key: "hrms_addon_face", label: "Add-on: Face Recognition", price: 20, unit: "/emp/mo", note: "Selfie attendance with geo-tag" },
      { key: "hrms_addon_pms", label: "Add-on: Performance Management", price: 30, unit: "/emp/mo", note: "PMS / Appraisals & KPI tracking" },
      { key: "hrms_addon_tms", label: "Add-on: Travel Management", price: 15, unit: "/emp/mo", note: "TMS / Expense & travel claims" },
      { key: "hrms_addon_multi", label: "Add-on: Multi-Company", price: 3600, unit: "/co/yr", note: "Per additional company license" }
    ]
  },

  settings: {
    siteName: "Raizada CompuSoft",
    tagline: "Authorized Marg® ERP Solution Partner",
    address: "Shop No. 16, 1st Floor, C.M. Mall, Railway Road, Aligarh",
    phone1: "+91 8938077776",
    phone2: "+91 9690277776",
    phone3: "+91 9927026557",
    email: "raizadacompusoft@gmail.com",
    whatsapp: "918938077776",
    googleMapsUrl: "",
    logoFile: null
  }
};
