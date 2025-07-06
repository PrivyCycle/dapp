# PrivyCycle

Your cycle, your data—securely yours.

A Web3-native, end-to-end encrypted period-tracking app with end-to-end encryption, seamless social-login UX, and user-controlled sharing.

![Image](https://github.com/user-attachments/assets/0f288780-dfe3-4582-b77d-f7d68ad50f2f)
---

## Problem Statement

Most period-tracking apps expose or sell intimate cycle data, putting users at risk. Once you log your history, there’s no guarantee you can ever retrieve it—or keep it private if the company folds. Doctors, partners, and future family members have no easy, secure way to access the insights they need, and critical health patterns may be lost forever.

PrivyCycle provides a private vault for your cycle data, encrypts everything on-device, and gives you simple tools to share it only with people you trust.

---

## Key Features

- **End-to-End Encryption**  
  All cycle logs—period dates, symptoms, moods, lifestyle entries—are encrypted locally before leaving your device.

- **Seamless Social-Login UX**  
  Sign in with Google, Apple, or email via Privy SDK; no crypto jargon required.

- **On-Device Encryption**  
  Zircuit’s SDK secures all data on your phone; you and only you hold the keys.

- **Anonymized AI Insights**  
  0G powers fully anonymized suggestions for users, doctors, and partners—without exposing personal data.

- **IPFS-Backed Portability**  
  Encrypted logs stored on IPFS. Grant or revoke access to doctors, partners, or family members at any time.

- **“Gift to Daughter” Archive**  
  Export an encrypted snapshot of your full cycle history for your daughter’s future reference.

- **Open Source & Auditable**  
  MIT-licensed code, reproducible builds, and community-driven security reviews.

![Image](https://github.com/user-attachments/assets/19a7bb59-7ed5-463b-a754-fab59ef98409)

---

## Demo & Screenshots

> *Replace these with real assets*  
> - Onboarding & Login Flow: `docs/onboarding.gif`  
> - Cycle Calendar & Insights: `docs/calendar.png`  
> - Doctor & Family Sharing Dashboards: `docs/dashboard.png`  
> - Gift to Daughter Workflow: `docs/heirloom.gif`  

---

## Architecture Overview

![Architecture Diagram](docs/architecture.png)

1. **Sign In** via social-login (Privy SDK)  
2. **Log Data** in the mobile UI  
3. **Encrypt Locally** (Zircuit SDK)  
4. **Store on IPFS** as encrypted blobs  
5. **Anonymized AI** (0G Compute) generates insights  
6. **Share & Revoke** secure access links  

![Image](https://github.com/user-attachments/assets/f987f484-cd9d-4319-9a80-8bb01e30ca8c)

---

## Tech Stack

- **Privy SDK** — Embedded social-login and key management  
- **Zircuit Encryption** — On-device data protection  
- **0G** — Privacy-preserving AI compute and data availability  
- **IPFS** — Decentralized encrypted storage  
- **React Native** — Cross-platform mobile app  
- **Node.js / Express** — Metadata API and notification backend  

---

## Roadmap

**Phase I (Hackathon MVP)**  
- Core cycle calendar & symptom tracking  
- End-to-end encryption & social-login  
- Doctor, family, partner share flows  / Dashboard
- “Gift to Daughter” encrypted archive
- Local Data Storage
- Open Source

**Future Milestones**  
- Web2-style mode with hidden Web3 plumbing  
- Continuous penetration testing and security audits  
- Full AI suggestion engine for users, doctors, and partners  
- Token-based rewards marketplace for anonymized data  
- One-tap decryption and biometric unlock  
- Enhanced analytics dashboards for healthcare professionals  

---

## Hackathon Bounties

### Privy — Best Consumer App Built on Privy 
- Embedded social-login and key management  
- Seamless, non-crypto UX via Privy SDK  
- Encrypted user vaults by default  

### Zircuit — Best App Idea 
- On-device encryption with Zircuit SDK  
- Account abstraction to hide blockchain complexity  
- Vision for tokenized incentives on anonymized data  

### 0G — Most Innovative Use of 0G Ecosystem
- Privacy-preserving AI inference on 0G Compute Network  
- Decentralized data-availability for encrypted logs  
- Anonymized insights for three personas: user, doctor, partner  

---

## Team

- **Migle** — Idea, PM, UX/UI Design  
- **Atlas** — Backend & API Development  
- **Dashen** — Encryption Integration
- **Rayan** — Pitch 

---

## Links

- **Repository**: https://github.com/your-org/privycycle *(placeholder)*  
- **Live Demo**: https://privycycle.app/demo *(placeholder)*  
- **Architecture Diagram**: `docs/architecture.png`  
- **Pitch Deck**: `docs/pitch.pdf`  

---

Built at EthGlobal Cannes 2025 — empowering women with true data ownership, privacy, and intergenerational health insights. Dedicated to all Activists fighting for Privacy And Security as a Human Right. 
