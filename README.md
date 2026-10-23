# ⚡ Demo Antigravity (Web3 Vibecoding Bootcamp)

A decentralized Web3 Sepolia tip jar and live Wall of Fame built during a 2-hour vibecoding bootcamp using **Google Antigravity**, **Ethereum Sepolia**, and **Firebase Hosting**.

---

## 🚀 Quickstart

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Locally:**
   ```bash
   npm run dev
   ```

3. **Build & Deploy:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 🛠️ Project Structure

- `contracts/TipJar.sol`: Solidity 0.8.20 contract for tips, events, and withdraw mechanics.
- `src/App.jsx`: Full responsive UI with MetaMask wallet connection, balance check, network detection, tip form, and real-time vibe wall.
- `src/contractInfo.js`: Contract ABI, Sepolia chain definitions, and demo fallback vibes.
- `firebase.json`: Firebase Hosting static SPA routing configuration.
