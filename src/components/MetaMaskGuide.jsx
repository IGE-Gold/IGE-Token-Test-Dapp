import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Wallet } from 'lucide-react';

const MetaMaskGuide = () => {
  const [copied, setCopied] = useState(false);
  
  const contractAddress = '0x851419ea766ff99e79039637f14e0b71d545062d';
  const tokenSymbol = 'IGE';
  const tokenDecimals = 18;
  
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Errore nella copia:', err);
    }
  };

  return (
    <div className="gold-quote-container">
      <div className="gold-quote-header">
        <Wallet size={20} style={{ marginRight: '8px' }} />
        <h3>Come aggiungere IGE Token a MetaMask</h3>
      </div>
      
      <div className="gold-quote-content">
        <div className="metamask-steps">
          <div className="step-item">
            <span className="step-number">1</span>
            <span className="step-text">Apri MetaMask → Import tokens</span>
          </div>
          
          <div className="step-item">
            <span className="step-number">2</span>
            <span className="step-text">Inserisci i dati del token:</span>
          </div>
          
          <div className="token-data-compact">
            <div className="data-row">
              <span className="data-label">Indirizzo:</span>
              <div className="data-value">
                <code>{contractAddress}</code>
                <button 
                  onClick={() => copyToClipboard(contractAddress)}
                  className="copy-btn-small"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
            
            <div className="data-row">
              <span className="data-label">Simbolo:</span>
              <div className="data-value">
                <code>{tokenSymbol}</code>
                <button 
                  onClick={() => copyToClipboard(tokenSymbol)}
                  className="copy-btn-small"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
            
            <div className="data-row">
              <span className="data-label">Decimali:</span>
              <div className="data-value">
                <code>{tokenDecimals}</code>
                <button 
                  onClick={() => copyToClipboard(tokenDecimals.toString())}
                  className="copy-btn-small"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="step-item">
            <span className="step-number">3</span>
            <span className="step-text">Conferma l'importazione</span>
          </div>
        </div>
        
        <div className="metamask-links">
          <a 
            href="https://docs.polygon.technology/docs/develop/network-details/network/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="metamask-link"
          >
            🌐 Aggiungi Polygon Amoy
            <ExternalLink size={12} />
          </a>
          
          <a 
            href="https://faucet.polygon.technology/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="metamask-link"
          >
            💰 Ottieni MATIC gratuiti
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default MetaMaskGuide;
