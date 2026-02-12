# CertChain — Blockchain Certificate Verification (PoC)

Proof of Concept untuk menyimpan hash sertifikat digital di blockchain, sehingga keaslian sertifikat dapat diverifikasi secara transparan dan tidak dapat dipalsukan.

## Cara Kerja

1. User mengisi **nama** dan **email** di form
2. Sistem generate **PDF sertifikat** dan menghitung **SHA-256 hash** dari file tersebut
3. Hash disimpan ke **smart contract** di blockchain melalui MetaMask
4. Siapapun bisa memverifikasi keaslian sertifikat dengan memasukkan hash atau upload ulang file PDF

## Tech Stack

| Komponen | Teknologi |
|---|---|
| Frontend | Next.js, React, Shadcn/UI, Tailwind CSS |
| PDF Generation | jsPDF |
| Hashing | crypto-js (SHA-256) |
| Blockchain Library | **ethers.js** — library untuk berkomunikasi dengan blockchain (mengirim transaksi, membaca data contract, query event logs) |
| Smart Contract | Solidity, di-compile & deploy via **Hardhat** |
| Wallet | **MetaMask** (browser extension) |

## Network & Token

| Item | Detail |
|---|---|
| Network | **Arbitrum Sepolia Testnet** |
| Chain ID | 421614 |
| Token (gas fee) | **ETH** (testnet) |
| RPC | `https://sepolia-rollup.arbitrum.io/rpc` |
| Block Explorer | https://sepolia.arbiscan.io |
| Contract Address | `0x10db2F7Bf11622D6C8bE6e6073Df0755D3b2F090` |

## Cara Top Up Token Testnet

MetaMask wallet membutuhkan **ETH testnet** di Arbitrum Sepolia untuk membayar gas fee transaksi.

**Langkah-langkah:**

1. Install **MetaMask** di browser → buat akun → catat wallet address
2. Buka **Google Cloud Faucet**: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
3. Login dengan akun Google
4. Pilih **"Ethereum Sepolia"** → paste wallet address → klik claim
5. ETH Sepolia akan masuk ke wallet
6. **Bridge** ETH Sepolia ke Arbitrum Sepolia menggunakan [Arbitrum Bridge](https://bridge.arbitrum.io/)
7. Setelah bridge selesai, ETH akan tersedia di Arbitrum Sepolia untuk membayar gas fee

> **Catatan:** Google Cloud faucet memberikan ETH di **Ethereum Sepolia**, yang perlu di-bridge ke **Arbitrum Sepolia** agar bisa digunakan untuk deploy dan transaksi.

## Smart Contract

File: `contracts/SimpleCert.sol`

Contract sederhana dengan 2 fungsi utama:

**`storeHash(string _hash)`** — Menyimpan hash sertifikat ke blockchain. Setiap hash hanya bisa disimpan sekali. Ketika dipanggil, contract mencatat hash beserta timestamp dan emit event `CertificateMinted`.

**`verifyHash(string _hash)`** — Mengecek apakah hash sudah tersimpan di blockchain. Mengembalikan status valid (`true`/`false`) dan timestamp kapan hash tersebut disimpan.

```solidity
mapping(string => uint256) public certificates;  // hash => timestamp

event CertificateMinted(string indexed certificateHash, uint256 timestamp);
```

## Setup & Development

```bash
# Install dependencies
npm install

# Jalankan dev server
npm run dev

# Compile smart contract
npx hardhat --config hardhat.config.cjs compile

# Deploy smart contract (pastikan .env sudah terisi PRIVATE_KEY)
npx hardhat --config hardhat.config.cjs run scripts/deploy.cjs --network arbitrum-sepolia
```

### Environment Variables

Buat file `.env` di root project:

```
PRIVATE_KEY=private_key_metamask_anda
```

> **Penting:** Jangan gunakan wallet utama. Gunakan wallet khusus development.
