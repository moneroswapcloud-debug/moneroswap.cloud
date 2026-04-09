<p align="center">
  <img src="logo_moneroswap_final.png" alt="MoneroSwap Logo" width="250">
</p>

<h1 align="center">MoneroSwap.cloud</h1>

<p align="center">
  <strong>Anonymous, Non-Custodial Cryptocurrency Exchange</strong><br>
  The safest way to move your assets. No records, no tracking, no KYC.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Privacy-Absolute-orange?style=for-the-badge" alt="Privacy">
  <img src="https://img.shields.io/badge/KYC-FREE-green?style=for-the-badge" alt="No KYC">
  <img src="https://img.shields.io/badge/Network-Tor%20Ready-blueviolet?style=for-the-badge" alt="Tor Ready">
  <img src="https://img.shields.io/badge/Open--Source-GPLv3-blue?style=for-the-badge" alt="GPLv3">
</p>

---

MoneroSwap is a privacy-first, single-page application (SPA) that facilitates instant cryptocurrency swaps focusing on **Monero (XMR)**. Leveraging a private Node.js proxy and the ChangeNOW liquidity network, it ensures total anonymity for users across the globe.

## 🚀 Key Features

- 🕵️ **Total Anonymity**: No registration, no email, and no account required.
- 🛡️ **No KYC**: We never request identity verification or personal documents.
- 🔄 **Non-Custodial**: Your funds are never held by us; swaps happen wallet-to-wallet.
- 🧅 **Tor Native**: Full support for Tor Hidden Services via a dedicated `.onion` address.
- 💬 **Community Centric**: Integrated Matrix support for anonymous communication.

## 🌐 Community & Support

- **Matrix Space**: [Join our Matrix Channel](https://matrix.to/#/#moneroswap.cloud:matrix.org)
- **Tor Hidden Service**: `http://hhnaholwijsz5puw3gzvrhipzmcpiyinmjw725rqymq7sfj7pfyetryd.onion`
- **GitHub**: [richardvzla888/moneroswap.cloud](https://github.com/richardvzla888/moneroswap.cloud)

## 🛠️ Technical Overview

### 1. The Frontend
A high-performance, responsive Single Page Application built with Vanilla JS and CSS, featuring:
- Real-time rate estimation and min-amount validation.
- Live bridge tracking and status updates.
- Glassmorphism "Cyber-Dark" design.

### 2. The Backend (Proxy)
A minimalist Node.js proxy handles all API interactions to protect the platform's API Keys and ensure user IP addresses are never exposed to third-party liquidity providers.

## 💻 Deployment

To deploy your own instance of MoneroSwap:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/richardvzla888/moneroswap.cloud.git
   ```

2. **Configure the Proxy**:
   Update `changenow-proxy.js` with your affiliate API key.

3. **Run with PM2**:
   ```bash
   pm2 start changenow-proxy.js --name moneroswap-proxy
   ```

4. **Serve are Static Files**:
   Point your web server (Apache/Nginx) to `index.html`.

## 📄 License

This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](LICENSE) file for more details.

---
<p align="center">
  <em>Developed for financial sovereignty. Privacy by Default.</em>
</p>
