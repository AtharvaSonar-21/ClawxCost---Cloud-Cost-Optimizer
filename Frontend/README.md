# 👾 CLAWXCOST — Frontend Interface & Feature Showcases

> **ClawxCost** is a handcrafted, full-stack visual cost intelligence platform built using modern React, Vite, and custom HSL pixel-art styling. This README highlights the key client-side pages and dashboard features alongside corresponding visual interfaces.

---

## 📸 Core Features & Interface Showcases

### 1 — Interactive Retro Landing Page
A custom retro landing page designed with neon telemetry lines, pixel-grid dot animations, and interactive CTA cartridges to capture early access signups.
* **Featured Components**: Hero mascots, scrolling news ticker, pricing matrix cards, and FAQ accordion.

![Landing Page Interface](../docs/landing_page_demo.png)

---

### 2 — Secure Authentication Ingress
Retro-styled, CRT-effect access gateways providing secure authentication with custom password strength validators.
* **Featured Components**: Login terminal and registration forms.

| User Access Portal | Registration & Credentials Creation |
| :---: | :---: |
| ![Login Screen](../docs/Screenshot%202026-06-08%20201748.png) | ![Signup Screen](../docs/Screenshot%202026-06-08%20201756.png) |

---

### 3 — User Dashboard Overview & Cost Trends
The central command cockpit for standard users displaying high-level cost scorecards and custom trend visualization charts.
* **Featured Components**: Total cost metric cards, active anomalies indicators, and interactive analytics filters.

| Costs Cockpit Home | Analytics & Billing Trend Lines |
| :---: | :---: |
| ![Dashboard Home](../docs/Screenshot%202026-06-08%20201811.png) | ![Trends Chart](../docs/Screenshot%202026-06-08%20201824.png) |

---

### 4 — Infrastructure Integration & CSV Ingestion
Cloud connection configuration manager allowing users to connect AWS, Azure, or GCP accounts, plus a CSV billing uploader supporting legacy file ingestion.
* **Featured Components**: Multi-cloud credential cards and file drag-and-drop terminal boxes.

| Multi-Cloud Integrations | CSV Data Ingestion Terminal |
| :---: | :---: |
| ![Cloud Connections](../docs/Screenshot%202026-06-08%20201834.png) | ![Billing File Uploader](../docs/Screenshot%202026-06-08%20201841.png) |

---

### 5 — Cost Anomalies & Budget Controls
Real-time cost anomaly alarms and budget threshold management. Standard users can monitor active incidents, acknowledge events, and configure alerts.
* **Featured Components**: Cost spikes table, warning limits, and budget meters.

| Anomaly Incidents List | Budget Alerts Configuration |
| :---: | :---: |
| ![Incidents Panel](../docs/Screenshot%202026-06-08%20201850.png) | ![Budget Alert Setup](../docs/Screenshot%202026-06-08%20201857.png) |

---

### 6 — AI-Powered FinOps Recommendations & Chat
A conversational cost optimizer driven by Google Gemini AI, combined with rightsizing recommendation tables to help users apply instant cloud waste fixes.
* **Featured Components**: Chat bubble console and recommendation apply buttons.

| Recommendation Rightsizing Table | AI Cost Insights Terminal |
| :---: | :---: |
| ![Recommendations List](../docs/Screenshot%202026-06-08%20201920.png) | ![Gemini Chat Screen](../docs/Screenshot%202026-06-08%20201928.png) |

---

### 7 — Super Admin Panel & Auto-Provisioning
The central operations deck for platform owners featuring a dual-view toggle (Business Insights vs System Telemetry), a 12-second real-time lead notification toast, and a copyable auto-provisioned password modal overlay.
* **Featured Components**: Ingress warnings, 8-bit retro sound alert generators, and click-to-copy credentials.

| Platform Administration Dashboard | Business Insights Executive view |
| :---: | :---: |
| ![Admin Ingress Overview](../docs/Screenshot%202026-06-08%20201940.png) | ![Business Insights Toggle](../docs/Screenshot%202026-06-08%20201947.png) |

| Ingress Lead Toast Warning | Auto-Credentials Generation Overlay | System Telemetry Graph Panel |
| :---: | :---: | :---: |
| ![Real-Time Notification Toast](../docs/Screenshot%202026-06-08%20201953.png) | ![Provisioned Credentials Modal](../docs/Screenshot%202026-06-08%20201959.png) | ![Raw Gateway Telemetry](../docs/Screenshot%202026-06-08%20202012.png) |

---

## 📁 Project Structure

```
clawxcost/
├── index.html                        ← Entry HTML (dark class default)
├── vite.config.js                    ← Vite + path aliases (@/)
├── tailwind.config.js                ← Extended design tokens
├── postcss.config.js
├── package.json
│
└── src/
    ├── main.jsx                      ← React root + dark-mode persistence
    ├── App.jsx                       ← Root component, section order
    ├── index.css                     ← Global CSS, pixel utilities, keyframes
    │
    ├── hooks/
    │   └── useReveal.js              ← IntersectionObserver scroll-reveal
    │
    ├── constants/
    │   ├── services.js               ← Service card data
    │   ├── phases.js                 ← Roadmap phase data
    │   └── cases.js                  ← Case studies + FAQ data
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.jsx            ← Fixed nav, mobile menu, scroll shadow
    │   │   └── Footer.jsx            ← Links, brand, legal badges
    │   │
    │   ├── ui/                       ← Reusable pixel UI atoms
    │   │   ├── PixelButton.jsx       ← Multi-variant button (teal/coral/purple/outline)
    │   │   └── PixelDivider.jsx      ← PixelDivider + SectionHeader + SectionTag + PixelBadge
    │   │
    │   ├── sprites/
    │   │   ├── RobotMascot.jsx       ← Animated FinOps robot SVG
    │   │   └── CloudIcons.jsx        ← AWS / Azure / GCP / Dollar / Chart sprites
    │   │
    │   └── sections/
    │       ├── Hero.jsx              ← Robot mascot, headline, stats
    │       ├── MarqueeStrip.jsx      ← Scrolling ticker
    │       ├── Providers.jsx         ← AWS / Azure / GCP chips
    │       ├── Services.jsx          ← 3×2 grid
    │       ├── HowItWorks.jsx        ← Pipeline steps + 6-phase roadmap
    │       ├── AnomalyDemo.jsx       ← Terminal mock + animated spike chart
    │       ├── CaseStudies.jsx       ← Filterable case cards
    │       ├── AISection.jsx         ← Gemini chat terminal mock
    │       ├── Architecture.jsx      ← Layered stack diagram
    │       ├── Pricing.jsx           ← Three cartridge pricing cards
    │       ├── FAQ.jsx               ← Accordion + CTA (dual export)
    │       └── CTA.jsx               ← Re-exports CTA from FAQ.jsx
```

---

## ⚡ Quick Start

### Prerequisites

| Tool    | Version  |
|---------|----------|
| Node.js | ≥ 18.x   |
| npm     | ≥ 9.x    |

### 1 — Install Dependencies
```bash
npm install
```

### 2 — Configure Environment Variables
Copy `.env.example` to create `.env` and set your backend target URL:
```bash
VITE_API_URL=http://localhost:5000
```

### 3 — Start the Dev Server
```bash
npm run dev
```
Open **http://localhost:3000** (or port `3001` / `3002` if shifted).

### 4 — Build for Production
```bash
npm run build
# Compiles output directly into /dist
```

---

## 🎨 Design System

All pixel-art colors are available as custom `pixel-*` Tailwind classes:

| Token | Hex | Usage |
|---|---|---|
| `pixel-dark` | `#1a0a2e` | Hero background |
| `pixel-darker` | `#0d0618` | Section backgrounds |
| `pixel-mid` | `#1a0a2e` | Card/panel backgrounds |
| `pixel-cyan` | `#22d3ee` | Primary accent, borders |
| `pixel-coral` | `#f43f5e` | Danger, CTA secondary |
| `pixel-violet` | `#7c3aed` | Auth/AI layer accent |
| `pixel-mint` | `#a7f3d0` | Service card (compute) |
| `pixel-pink` | `#fbcfe8` | Service card (trends) |
| `pixel-yellow` | `#fef08a` | Service card (anomaly) |
| `pixel-blue` | `#bae6fd` | Service card (cloud) |
| `pixel-lav` | `#c4b5fd` | Service card (AI) |
| `pixel-sage` | `#99f6e4` | Service card (optimize) |

*Built with ♥ and pixel-perfect obsession.*
