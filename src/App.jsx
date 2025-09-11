import React, { useState } from 'react';
import { useWallet } from './hooks/useWallet';
import { useContract } from './hooks/useContract';
import { useGoldPrice } from './hooks/useGoldPrice';
import WalletConnection from './components/WalletConnection';
import GoldPriceDisplay from './components/GoldPriceDisplay';
import TokenManager from './components/TokenManager';
import IGELogo from './components/IGELogo';

function App() {
  const [contractAddress, setContractAddress] = useState('0x851419eA766fF99E79039637F14e0B71D545062d');
  
  const {
    account,
    provider,
    signer,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchToAmoy
  } = useWallet();

  const {
    totalSupply,
    userBalance,
    tokenInfo,
    isLoading: contractLoading,
    error: contractError,
    loadContractData,
    mintTokens,
    burnTokens
  } = useContract(contractAddress, signer);

  const {
    goldPrices,
    isLoading: priceLoading,
    error: priceError,
    refreshPrices
  } = useGoldPrice();

  return (
    <div className="container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <IGELogo size={window.innerWidth <= 768 ? (window.innerWidth <= 480 ? 84 : 96) : 120} />
            <div>
              <div className="logo-subtitle">Smart Contract Lab - Testnet Demo</div>
              <div style={{
                fontSize: '11px',
                color: 'var(--ige-gray)',
                marginTop: '4px',
                fontStyle: 'italic'
              }}>
                Assicurati di essere connesso alla Blockchain Polygon Amoy con il Wallet Crypto Metamask
              </div>
            </div>
          </div>
        </div>
        
        {/* Disclaimer in alto */}
        <div style={{ 
          marginTop: '12px', 
          padding: '8px 20px', 
          background: 'rgba(212, 175, 55, 0.1)', 
          borderRadius: '4px',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          fontSize: '10px',
          color: 'var(--ige-gold)',
          textAlign: 'center'
        }}>
          ⚠️ Disclaimer: Questa WebApp è destinata esclusivamente a scopi di test interno per IGE Gold S.r.l. 
          Non utilizzare per transazioni reali o investimenti.
        </div>
      </header>

      <div className="main-content">
        <div className="left-column">
          <WalletConnection
            isConnected={isConnected}
            isConnecting={isConnecting}
            account={account}
            connectWallet={connectWallet}
            disconnectWallet={disconnectWallet}
            switchToAmoy={switchToAmoy}
          />

          <GoldPriceDisplay
            goldPrices={goldPrices}
            isLoading={priceLoading}
            error={priceError}
            refreshPrices={refreshPrices}
            isConnected={isConnected}
          />
        </div>

        <div className="right-column">
          {isConnected ? (
            <TokenManager
              contractAddress={contractAddress}
              setContractAddress={setContractAddress}
              totalSupply={totalSupply}
              userBalance={userBalance}
              tokenInfo={tokenInfo}
              isLoading={contractLoading}
              error={contractError}
              mintTokens={mintTokens}
              burnTokens={burnTokens}
              loadContractData={loadContractData}
              account={account}
            />
          ) : (
            <div className="card" style={{ textAlign: 'center' }}>
              <h2>Connessione Richiesta</h2>
              <p style={{ color: 'var(--ige-gray)', fontSize: '12px' }}>
                Connetti il tuo wallet MetaMask per accedere alle funzionalità di gestione del token.
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="footer">
        <p>IGE Smart Contract Lab - Testnet Amoy (Polygon)</p>
      </footer>
    </div>
  );
}

export default App;
