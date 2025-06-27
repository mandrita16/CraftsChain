# CraftsChain
<div align="center">
  <h1>🧵 CraftsChain</h1>
  <p><strong>Empowering Artisans Through Decentralized Identity and Eco Tokens</strong></p>
  <img src="https://img.shields.io/badge/status-active-brightgreen" alt="Status"/>
  <img src="https://img.shields.io/github/languages/top/mandrita16/CraftsChain" alt="Top language"/>
  <img src="https://img.shields.io/github/license/mandrita16/CraftsChain" alt="License"/>
</div>

---

## 📚 Overview

**CraftsChain** is a Next.js-based decentralized platform designed to support and empower local artisans by leveraging eco-token-based rewards and identity verification via DAOs. It aims to:

- 🎨 Showcase handmade crafts
- 🔗 Provide blockchain-based identity for artisans
- 💰 Incentivize eco-friendly practices via token rewards
- 🧑‍🤝‍🧑 Build artisan communities through DAO governance

---

## 🧰 Tech Stack

- ⚛️ **Next.js 14 (App Router)**
- 🐱 **TypeScript**
- 💨 **Tailwind CSS**
- 🧠 **ShadCN/UI** – Component Library
- ⛓️ **Modular architecture** for DAO, Identity, Eco Token, and Craft Item management

---

## 📁 Project Structure

```bash
CraftsChain/
├── app/                      # Next.js app directory (App Router structure)
│   └── ...                   # Layouts, pages, providers
├── components/              # Reusable React components
├── contracts/               # Smart contracts or related ABIs (for future integration)
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and helpers
├── metadata_sample/         # Example metadata (likely for NFTs or tokens)
├── public/                  # Static files like images, favicons
├── styles/                  # Tailwind and global styles
├── types/                   # TypeScript type declarations
│
├── .gitignore               # Git ignored files
├── .gitmodules              # Git submodules (if any)
├── components.json          # ShadCN component registration
├── next.config.mjs          # Next.js configuration
├── package.json             # Project manifest
├── package-lock.json        # Dependency lock file (if using npm)
├── pnpm-lock.yaml           # Lock file for pnpm
├── postcss.config.mjs       # PostCSS config (used by Tailwind)
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation (You’re reading it!)

```

⚙️ Installation

⚠️ Make sure you have Node.js >= 18.x and pnpm installed.

1. Clone the repository
```bash
git clone https://github.com/mandrita16/CraftsChain.git
cd CraftsChain
```

2. Install dependencies

Using pnpm (recommended):
```bash
pnpm install
```
🚀 Running the Development Server

Start the local development server:
```bash
pnpm dev
```
Now navigate to: http://localhost:3000

🛠️ Customization
To modify styling, edit app/globals.css or tailwind.config.ts

To extend the dashboard, use modular components under:
```bash
app/artisan-dashboard/(components)/
```

🌱 Coming Soon
Smart contract integration for DAO and token

Decentralized identity using Ceramic or Lens

Real-world artisan onboarding flow

🤝 Contributing
Pull requests are welcome! For major changes, open an issue first to discuss what you would like to change.


<div align="center"> Built with ❤️ by Ritesh Das, Mandrita Dasgupta and Abhirup Das for <strong>Hack4Bengal</strong> </div> 

