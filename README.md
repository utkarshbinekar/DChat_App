# Decentralized Chat DApp — Fully Offline Local Version

Welcome to **ChatZone** — a decentralized chat application running entirely offline on a local Hardhat blockchain. No external services, no internet required.

![Decentralized Chat DApp](./Screenshot.png)

## Quick Start

```bash
npm run setup
```

That's it! This single command will:

1. ✅ Install all dependencies (contract, relayer, frontend)
2. ✅ Start a local Hardhat blockchain node
3. ✅ Deploy ENService + Chatzone contracts
4. ✅ **Auto-write `.env` files** for both frontend and relayer
5. ✅ Start the gasless relayer server
6. ✅ Launch the Vite frontend dev server

> **Note:** The `.env` files are automatically updated during the `npm run setup` process.

### Services

| Service  | URL                      |
|----------|--------------------------|
| Frontend | http://localhost:5173     |
| Relayer  | http://localhost:5000     |
| Hardhat  | http://127.0.0.1:8545    |

### MetaMask Setup

1. Open MetaMask → Add network manually
2. **Network Name:** Hardhat Local
3. **RPC URL:** `http://127.0.0.1:8545`
4. **Chain ID:** `1337`
5. **Currency Symbol:** `ETH`
6. Import a Hardhat test account (private key from Hardhat node output)

## Features

- **Real-Time Live Chat:** Zero-latency instantaneous messaging using WebSockets (`socket.io`).
- **Live Typing Indicators:** Real-time visual feedback when participants are typing.
- **File Attachments & Image Sharing:** Users can attach and seamlessly share image files securely inside the chat interface.
- **Decentralized Messaging:** Secure on-chain messaging via Ethereum smart contracts.
- **Gasless Transactions:** Custom relayer pays gas on behalf of users.
- **ENS Integration:** Human-readable usernames via local ENService contract.
- **Dynamic Search:** Quickly filter and search through the registered user list.
- **Fully Offline:** Zero external dependencies — runs entirely on localhost. Avatars and media attachments are saved seamlessly to local disk by the Relayer instead of IPFS, easily bypassing all EVM gas limits.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │◀───▶│   Relayer    │────▶│   Hardhat    │
│  (Vite/React)│ WSS │  (Express)   │     │  (Local EVM) │
│  :5173       │     │  :5000       │     │  :8545       │
└──────────────┘     └──────────────┘     └──────────────┘
       │                                        │
       └────── Read-only queries ───────────────┘
```

## Project Structure

- `contract/` — Solidity smart contracts + Hardhat config + deploy scripts
- `frontend/` — React/Vite frontend with direct MetaMask integration
- `myRelayer/` — Express.js gasless relayer service
- `setup-local.ps1` — One-command local setup script

## Tech Stack

- **Blockchain:** Hardhat (local EVM)
- **Smart Contracts:** Solidity 0.8.13
- **Frontend:** React 18 + Vite + TailwindCSS + ethers.js v6
- **Relayer:** Node.js + Express.js + ethers.js v6
- **Real-Time Network:** Socket.io (WebSockets)
- **Wallet:** MetaMask (direct injected provider, no WalletConnect)

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature-branch`
3. Make your changes and commit: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature-branch`
5. Submit a pull request

## License

This project is licensed under the [MIT License](LICENSE).
