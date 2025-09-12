# IGE Token Test DApp

A React-based decentralized application (DApp) that allows users to connect their wallet and test the main functions of the IGE Token smart contract deployed on a blockchain testnet.

## 🌐 Live Demo

**🚀 Deployed Application**: [https://ige-token.vercel.app/](https://ige-token.vercel.app/)

The application is live and ready for testing on Polygon Amoy Testnet. Simply connect your MetaMask wallet and start interacting with IGE Token smart contracts.

## 🚀 Features

- **🔗 Wallet Connection**: Secure MetaMask integration with visual connection status
- **💰 Token Management**: View balance, mint and burn IGE tokens
- **📝 Dynamic Contract Input**: Enter contract address without modifying code
- **📈 Real-time Gold Prices**: Live gold price monitoring in USD and EUR
- **🌐 Testnet Ready**: Automatic configuration for blockchain testnet
- **📱 Mobile First**: Fully responsive interface optimized for mobile
- **✨ Smooth Animations**: Fluid transitions and modern visual feedback

## 🎯 Purpose

This project was developed to provide a user-friendly interface for testing the IGE Token smart contract before mainnet deployment. It is intended for development, learning, and demonstration purposes.

## 📋 Prerequisites

- Node.js (version 16 or higher)
- MetaMask installed in browser
- Test tokens for gas fees on the testnet

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/IGE-Gold/IGE-Token-Test-Dapp.git
   cd IGE-Token-Test-Dapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - The application will open automatically

## 🔧 MetaMask Configuration

### Adding the Testnet

The application will automatically add the testnet, but you can configure it manually:

- **Network Name**: [Your Testnet Name]
- **RPC URL**: `[Your Testnet RPC URL]`
- **Chain ID**: `[Your Chain ID]`
- **Symbol**: `[Your Token Symbol]`
- **Explorer**: `[Your Block Explorer URL]`

### Getting Test Tokens

1. Visit the testnet faucet
2. Select your testnet
3. Enter your wallet address
4. Request test tokens

## 📱 Usage

### 1. Wallet Connection

1. Click "Connect MetaMask"
2. Authorize the connection in the MetaMask popup
3. The app will automatically switch to the testnet

### 2. Token Management

1. **Enter the contract address** in the dedicated field
2. **View statistics**:
   - Total minted tokens
   - Your personal balance
   - Token name and symbol

3. **Mint Tokens**:
   - Enter the amount to mint
   - Click "Mint Token"
   - Confirm the transaction in MetaMask

4. **Burn Tokens**:
   - Enter the amount to burn
   - Click "Burn Token"
   - Confirm the transaction in MetaMask

### 3. Gold Price Monitoring

- Prices are automatically updated every 5 minutes
- Click "Refresh" for manual update
- View prices in USD per ounce, USD per gram, EUR per gram

## 🏗️ Project Structure

```
src/
├── components/
│   ├── WalletConnection.jsx    # Wallet connection component
│   ├── GoldPriceDisplay.jsx    # Gold price display
│   └── TokenManager.jsx        # IGE token management
├── hooks/
│   ├── useWallet.js           # Wallet management hook
│   ├── useContract.js         # Contract interaction hook
│   └── useGoldPrice.js        # Gold price hook
├── App.jsx                    # Main component
├── main.jsx                   # Entry point
└── index.css                  # Global styles
```

## 🔒 Security

- **Testnet Only**: App is configured to work only on testnet
- **Input Validation**: All inputs are validated before submission
- **Error Handling**: Detailed errors for safe debugging
- **Non-Custodial**: Private keys always remain in your wallet

## 🐛 Troubleshooting

### MetaMask won't connect
- Ensure MetaMask is installed and unlocked
- Check that the network is set to the correct testnet
- Reload the page and try again

### Transactions fail
- Verify you have enough test tokens for gas fees
- Check that the contract address is correct
- Ensure the contract supports mint/burn functions

### Gold prices not updating
- Check your internet connection
- Click "Refresh" for manual update
- App will show example prices if API fails

## 📝 Tech Stack

- **Framework**: React 18 with Vite
- **Blockchain**: Testnet (configurable)
- **Wallet**: MetaMask (ethers.js v6)
- **Price API**: metals.live (with fallback)
- **Styling**: Modern CSS with gradients and animations

## License

All rights reserved.
This project is proprietary and may not be copied, modified, or distributed without explicit permission.

---

**⚠️ Disclaimer**: This application is for educational and testing purposes. Always use testnet for testing and never send real funds to test addresses.
