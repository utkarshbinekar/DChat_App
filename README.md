# 🌐 Offline Consumer-Grade Web3 Chat DApp

Welcome to the **Fully Offline End-to-End Encrypted (E2EE) Chat DApp**. 

This application has been heavily overhauled into a fully-functional, highly secure, and visually stunning chat platform designed to run 100% locally on your machine without relying on *any* external cloud architecture.

A modern Gasless Web3 Architecture allows seamless account registration and lightning-fast chat messaging natively using a Local Ethereum Node, zero gas fees for the user, and an ultra-secure client-side encryption flow.

---

## ✨ Premium Features

- **🔒 Military-Grade E2EE (End-to-End Encryption)**
  Chat rooms possess a built-in "Secure Session" Lock. Entering a shared passphrase converts all outbound chat messages and Image Attachments into scrambled AES (Base64) cipher text *before* traversing the network. It completely shields your message data natively on the blockchain.
- **⚡ 100% Gasless User Experience (MetaMask Integration)**
  Users interact directly via MetaMask signatures. A highly concurrent Node.js backend acting as a **Relayer** catches these signed intents and covers every fraction of gas fees behind the scenes!
- **👀 Live Read Receipts & Sockets**
  Instant "Read" checkmarks (`✓✓`) visually react across clients the exact second the recipient enters the chat room! Messages sync beautifully leveraging local `socket.io` broadcasting.
- **🙂 Offline Reaction Databases**
  Hover over any chat bubble to reveal an integrated Emoji popover! Reactions are intelligently resolved and persisted using ultra-fast local JSON storage.
- **🎨 Stunning UI / UX Overhauls**
  Complete frontend rewrite utilizing React **Glassmorphism**, ambient background glows, floating translucent text tools, edge-to-edge transparent containers, and deep modern gradients utilizing Tailwind CSS & Lucide icons.
- **🔌 Fully Localized Network & Images**
  No Pinata. No IPFS limits. Both Profile Pictures and massive Shared Images are auto-intercepted via intelligent backend middleware and hosted securely locally on standard Express URLs (`http://localhost...`). It prevents EVM "Out-of-Gas" logic crashes.

---

## 🏗️ Architecture

1. **`contract/`**
   Contains the Hardhat testing suite and Smart Contracts (`Chatzone.sol` & `ENService.sol`). This represents the immutable data layer of the application storing the underlying raw chat payloads and ENS registrations.
2. **`backend/`** (Formerly `myRelayer`)
   A Node.js Express server acting as the Meta-Transaction Relayer.
   - Bootstraps real-time Sockets and Web-Socket broadcasting.
   - Connects an Ethereum owner wallet to sign EIP-191 frontend messages and pay the native gas.
   - Auto-hosts Base64 images directly to local storage to optimize the EVM state limits.
3. **`frontend/`**
   The React Vite interface housing the Glassmorphic UI, MetaMask connection contexts, and native `crypto-js` lock functionality.

---

## 🚀 One-Command Setup

Because this DApp relies on perfectly aligned environment configurations across three distinct sub-projects, we wrote an automated deployment pipeline to make initialization completely seamless.

### Prerequisites
- Node.js (v18+)
- Local MetaMask Extension
- Windows PowerShell

### Quick Start Pipeline
Open a new **PowerShell** window at the absolute root of this workspace and execute:
```powershell
powershell -File setup-local.ps1
```

**What this automatically does behind the scenes:**
1. Installs all specific node library dependencies (`npm install`) across the `contract`, `frontend`, and `backend` folders.
2. Silently boots up the `npx hardhat node` inside a background window (`http://127.0.0.1:8545`).
3. Deploys both Smart Contracts locally to your new test node.
4. Auto-generates fully synchronized `.env` files universally in both your `/frontend` and `/backend` directories avoiding manual copy-pasting.
5. Silently boots the backend Relayer on `http://localhost:5000`.
6. Launches your React Vite Frontend `http://localhost:5173`. 

### Clean Teardown
If you ever want to reset your local chain, simply press `Ctrl + C` inside your terminal to kill the execution list, close out all the hidden NodeJS windows, and restart the `.ps1` script!

---

### E2EE Guide
1. Create two accounts on different browsers.
2. Navigate to your friend. 
3. Both users type same phrase into the Top-Header input `Secure E2EE Key...` and hit the **Padlock**.
4. Both users can safely share heavy image files and text messages fully encrypted! To test this, disable the lock to see exactly what external network layers truly capture on the backend!
