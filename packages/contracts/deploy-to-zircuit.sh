#!/bin/bash

# Deploy and test CycleDataStorage on Zircuit Testnet
# Make sure you have PRIVATE_KEY set in your environment

echo "🚀 Deploying CycleDataStorage to Zircuit Testnet..."
echo ""

# Load .env file if it exists
if [ -f ".env" ]; then
    echo "📄 Loading .env file..."
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "⚠️  No .env file found"
fi

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable is not set"
    echo "Please set your private key:"
    echo "export PRIVATE_KEY=0x..."
    echo "Or create a .env file with PRIVATE_KEY=0x..."
    exit 1
fi

echo "🔑 Using wallet: $(cast wallet address $PRIVATE_KEY)"

# Check if we have enough ETH
echo "📋 Pre-deployment checks..."
echo "Testing basic functionality..."
forge script script/TestOnZircuit.s.sol:TestOnZircuitScript \
    --rpc-url zircuit_testnet \
    --private-key $PRIVATE_KEY

echo ""
echo "Testing gas sponsorship functionality..."
forge script script/TestGasSponsorship.s.sol:TestGasSponsorshipScript \
    --rpc-url zircuit_testnet \
    --private-key $PRIVATE_KEY

echo ""
echo "💰 Make sure you have Zircuit testnet ETH!"
echo "Get testnet ETH from: https://faucet.testnet.zircuit.com/"
echo ""
read -p "Do you want to proceed with deployment? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔥 Deploying to Zircuit Testnet..."
    
    forge script script/TestOnZircuit.s.sol:TestOnZircuitScript \
        --rpc-url zircuit_testnet \
        --private-key $PRIVATE_KEY \
        --broadcast \
        --verify \
        --etherscan-api-key $ETHERSCAN_API_KEY \
        -vvvv
    
    echo ""
    echo "✅ Deployment complete!"
    echo "📝 Don't forget to update your .env file with the contract address"
    echo "🔍 Check the transaction on: https://explorer.testnet.zircuit.com/"
else
    echo "❌ Deployment cancelled"
fi
