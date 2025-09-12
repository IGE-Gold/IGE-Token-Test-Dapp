import React, { useState } from 'react';
import { Coins, Plus, Minus, RefreshCw } from 'lucide-react';
import TransactionLogger from './TransactionLogger';
import TransactionOverlay from './TransactionOverlay';
import MetaMaskGuide from './MetaMaskGuide';

const TokenManager = ({ 
  contractAddress,
  setContractAddress,
  totalSupply,
  userBalance,
  tokenInfo,
  isLoading,
  error,
  isTransactionPending,
  mintTokens,
  burnTokens,
  loadContractData,
  account // Aggiungo l'account del wallet connesso
}) => {
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [mintToAddress, setMintToAddress] = useState('');
  const [burnFromAddress, setBurnFromAddress] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [transactionDetails, setTransactionDetails] = useState(null);

  // Imposta l'indirizzo predefinito quando l'account cambia
  React.useEffect(() => {
    if (account) {
      setMintToAddress(account);
      setBurnFromAddress(account);
    }
  }, [account]);

  const handleMint = async (e) => {
    e.preventDefault();
    if (!mintAmount || parseFloat(mintAmount) <= 0 || !mintToAddress) return;

    try {
      setSuccessMessage('');
      setTransactionDetails(null);
      
      const tx = await mintTokens(mintAmount, mintToAddress);
      
      // Cattura i dettagli della transazione
      const receipt = await tx.wait();
      const blockNumber = receipt.blockNumber;
      const gasUsed = receipt.gasUsed.toString();
      
      setTransactionDetails({
        type: 'mint',
        amount: mintAmount,
        toAddress: mintToAddress,
        txHash: tx.hash,
        blockNumber: blockNumber,
        gasUsed: gasUsed
      });
      
      setMintAmount('');
    } catch (err) {
      console.error('Errore nel mint:', err);
    }
  };

  const handleBurn = async (e) => {
    e.preventDefault();
    if (!burnAmount || parseFloat(burnAmount) <= 0 || !burnFromAddress) return;

    try {
      setSuccessMessage('');
      setTransactionDetails(null);
      
      const tx = await burnTokens(burnAmount, burnFromAddress);
      
      // Cattura i dettagli della transazione
      const receipt = await tx.wait();
      const blockNumber = receipt.blockNumber;
      const gasUsed = receipt.gasUsed.toString();
      
      setTransactionDetails({
        type: 'burn',
        amount: burnAmount,
        fromAddress: burnFromAddress,
        txHash: tx.hash,
        blockNumber: blockNumber,
        gasUsed: gasUsed
      });
      
      setBurnAmount('');
    } catch (err) {
      console.error('Errore nel burn:', err);
    }
  };

  return (
    <div className="card">
      <h2>
        <Coins size={16} style={{ display: 'inline', marginRight: '6px' }} />
        Dashboard Blockchain Testnet Polygon
      </h2>
      
      {/* Logger delle transazioni */}
      <TransactionLogger />

      {/* Input per l'indirizzo del contratto */}
      <div className="input-group">
        <label htmlFor="contractAddress">Indirizzo Contratto Token IGE:</label>
        <input
          id="contractAddress"
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="0x..."
          style={{ fontFamily: 'Courier New, monospace' }}
        />
      </div>

      {/* Nome Token - subito dopo l'indirizzo */}
      {tokenInfo.name && (
        <div style={{ 
          marginBottom: '16px',
          padding: '8px 12px',
          background: 'var(--ige-light-gray)',
          borderRadius: '4px',
          border: '1px solid var(--ige-border)',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '11px', 
            color: 'var(--ige-gray)', 
            marginBottom: '4px',
            fontWeight: '500'
          }}>
            Nome Token
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            color: 'var(--ige-white)',
            wordBreak: 'break-all'
          }}>
            {tokenInfo.name}
          </div>
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {transactionDetails && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(184, 134, 11, 0.1))',
          border: '2px solid var(--ige-gold)',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '16px',
          color: 'var(--ige-white)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'var(--ige-gold)'
          }}>
            ✅ {transactionDetails.type === 'mint' ? 'Mint Completato con Successo!' : 'Burn Completato con Successo!'}
          </div>
          
          <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Indirizzo del contratto:</strong>{' '}
              <a 
                href={`https://amoy.polygonscan.com/address/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--ige-gold)', textDecoration: 'underline' }}
              >
                {contractAddress}
              </a>
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <strong>Il tuo indirizzo:</strong> {account}
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <strong>Token {transactionDetails.type === 'mint' ? 'mintati' : 'burnati'}:</strong> {transactionDetails.amount} {tokenInfo.symbol}
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <strong>Nuovo saldo:</strong> {userBalance} {tokenInfo.symbol}
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <strong>Hash transazione:</strong>{' '}
              <a 
                href={`https://amoy.polygonscan.com/tx/${transactionDetails.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--ige-gold)', textDecoration: 'underline', fontFamily: 'Courier New, monospace' }}
              >
                {transactionDetails.txHash}
              </a>
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <strong>Block number:</strong> {transactionDetails.blockNumber.toLocaleString()}
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <strong>Gas utilizzato:</strong> {parseInt(transactionDetails.gasUsed).toLocaleString()}
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              marginBottom: '12px'
            }}>
              <div style={{ color: '#4ade80', fontSize: '10px' }}>
                ✅ Smart Contract attivo
              </div>
              <div style={{ color: '#4ade80', fontSize: '10px' }}>
                ✅ Ruolo MINTER confermato - Il tuo indirizzo ha i permessi necessari
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <a 
                href={`https://amoy.polygonscan.com/tx/${transactionDetails.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'var(--ige-gold)',
                  color: 'var(--ige-black)',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}
              >
                🔍 Verifica su PolygonScan
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Statistiche del token */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Riserva Aurea Tokenizzata</h3>
          <div className="value">
            {isLoading ? (
              <span className="loading"></span>
            ) : (
              `${parseFloat(totalSupply).toLocaleString()} grammi`
            )}
          </div>
        </div>
        
        <div className="stat-card">
          <h3>I Token nel Tuo Wallet</h3>
          <div className="value">
            {isLoading ? (
              <span className="loading"></span>
            ) : (
              `${parseFloat(userBalance).toLocaleString()} ${tokenInfo.symbol || 'TOKEN'}`
            )}
          </div>
        </div>
      </div>

      {/* Pulsante per ricaricare i dati */}
      <div style={{ marginBottom: '12px' }}>
        <button 
          className="button secondary" 
          onClick={loadContractData}
          disabled={isLoading || !contractAddress}
        >
          <RefreshCw size={10} style={{ marginRight: '4px' }} />
          {isLoading ? 'Caricamento...' : 'Ricarica Dati'}
        </button>
      </div>

      {/* Sezione Test Funzioni Base */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          color: 'var(--ige-gold)', 
          borderBottom: '1px solid var(--ige-border)', 
          paddingBottom: '8px',
          marginBottom: '16px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          Test Funzioni Base
        </h3>
        
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '12px', color: 'var(--ige-gray)', marginBottom: '8px' }}>Mint Token</h4>
        <form onSubmit={handleMint}>
          <div className="input-group">
            <label htmlFor="mintToAddress">Wallet di Destinazione:</label>
            <input
              id="mintToAddress"
              type="text"
              value={mintToAddress}
              onChange={(e) => setMintToAddress(e.target.value)}
              placeholder="0x..."
              disabled={isTransactionPending || !contractAddress}
              style={{ fontFamily: 'Courier New, monospace', fontSize: '11px' }}
            />
          </div>
          <div className="input-group">
            <label htmlFor="mintAmount">Quantità da Mintare:</label>
            <input
              id="mintAmount"
              type="number"
              step="0.000001"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              placeholder="Inserisci la quantità"
              disabled={isTransactionPending || !contractAddress}
            />
            <div style={{ 
              fontSize: '10px', 
              color: 'var(--ige-gray)', 
              marginTop: '4px',
              fontStyle: 'italic'
            }}>
              💡 Per 1 token, il sistema usa automaticamente gas limit ottimizzato (500,000). Per quantità maggiori, il gas è stimato dinamicamente.
            </div>
          </div>
          <button 
            type="submit" 
            className="button success"
            disabled={isTransactionPending || !contractAddress || !mintAmount || !mintToAddress}
          >
            <Plus size={10} style={{ marginRight: '4px' }} />
            {isTransactionPending ? 'Transazione in corso...' : 'Mint Token'}
          </button>
        </form>
        </div>
        
        <div>
          <h4 style={{ fontSize: '12px', color: 'var(--ige-gray)', marginBottom: '8px' }}>Burn Token</h4>
        <form onSubmit={handleBurn}>
          <div className="input-group">
            <label htmlFor="burnFromAddress">Wallet da cui Burnare:</label>
            <input
              id="burnFromAddress"
              type="text"
              value={burnFromAddress}
              onChange={(e) => setBurnFromAddress(e.target.value)}
              placeholder="0x..."
              disabled={isTransactionPending || !contractAddress}
              style={{ fontFamily: 'Courier New, monospace', fontSize: '11px' }}
            />
          </div>
          <div className="input-group">
            <label htmlFor="burnAmount">Quantità da Burnare:</label>
            <input
              id="burnAmount"
              type="number"
              step="0.000001"
              value={burnAmount}
              onChange={(e) => setBurnAmount(e.target.value)}
              placeholder="Inserisci la quantità"
              disabled={isTransactionPending || !contractAddress}
            />
            <div style={{ 
              fontSize: '10px', 
              color: 'var(--ige-gray)', 
              marginTop: '4px',
              fontStyle: 'italic'
            }}>
              💡 Per 1 token, il sistema usa automaticamente gas limit ottimizzato (500,000). Per quantità maggiori, il gas è stimato dinamicamente.
            </div>
          </div>
          <button 
            type="submit" 
            className="button danger"
            disabled={isTransactionPending || !contractAddress || !burnAmount || !burnFromAddress}
          >
            <Minus size={10} style={{ marginRight: '4px' }} />
            {isTransactionPending ? 'Transazione in corso...' : 'Burn Token'}
          </button>
        </form>
        </div>
      </div>
      
      {/* Sovraimpressione per transazione in corso */}
      <TransactionOverlay isVisible={isTransactionPending} />
      
      {/* Guida per aggiungere token IGE a MetaMask */}
      <MetaMaskGuide />
    </div>
  );
};

export default TokenManager;
