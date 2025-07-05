# ConsentCycle

A privacy-focused cycle tracking application with blockchain-based consent management.

## Monorepo Structure

This project is organized as a monorepo with the following packages:

- **`packages/web`** - React TypeScript web application
- **`packages/contracts`** - Smart contracts built with Foundry

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) (v7 or higher)
- [Foundry](https://getfoundry.sh/) (for contract development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd consentcycle
```

2. Install dependencies:
```bash
npm install
```

3. Initialize git submodules (for contracts):
```bash
git submodule update --init --recursive
```

## Development

### Web Application

Start the development server:
```bash
npm run dev
# or
npm run dev:web
```

Build for production:
```bash
npm run build
# or
npm run build:web
```

### Smart Contracts

Build contracts:
```bash
npm run build:contracts
```

Run tests:
```bash
npm run test:contracts
```

Clean build artifacts:
```bash
npm run clean:contracts
```

## Project Structure

```
consentcycle/
├── packages/
│   ├── web/          # React web application
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── contracts/    # Smart contracts
│       ├── src/
│       ├── test/
│       ├── script/
│       └── package.json
├── package.json      # Root package.json with workspace configuration
└── README.md
```

## Features

- **Privacy-focused**: Secure cycle tracking with user consent management
- **Blockchain integration**: Smart contracts for consent handling
- **Modern web app**: Built with React, TypeScript, and Vite
- **Responsive design**: Works on desktop and mobile devices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
