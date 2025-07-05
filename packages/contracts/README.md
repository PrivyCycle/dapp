# ConsentCycle Contracts

This package contains the smart contracts for the ConsentCycle application, built with Foundry.

## Prerequisites

Make sure you have [Foundry](https://getfoundry.sh/) installed:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Getting Started

1. Install dependencies:
```bash
git submodule update --init --recursive
```

2. Build the contracts:
```bash
npm run build
```

3. Run tests:
```bash
npm run test
```

4. Run tests with gas reporting:
```bash
npm run gas
```

5. Format code:
```bash
npm run fmt
```

## Contracts

### ConsentCycle.sol

The main contract that manages user consent for data handling. Features:

- **grantConsent(bytes32 _dataHash)**: Grant consent for specific data
- **revokeConsent(bytes32 _dataHash)**: Revoke previously granted consent
- **getUserConsents(address _user)**: Get all consents for a user
- **isConsentActive(bytes32 _dataHash)**: Check if consent is currently active

## Deployment

To deploy the contracts:

```bash
npm run deploy
```

## Directory Structure

- `src/` - Contract source files
- `test/` - Test files
- `script/` - Deployment scripts
- `lib/` - Dependencies (forge-std)
- `out/` - Compiled contracts (generated) 