import React, { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import './MetaMaskGuide.css';

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
    <div className="metamask-guide">
      <h3>🔗 Come aggiungere il token IGE a MetaMask</h3>
      
      <div className="guide-steps">
        <div className="step">
          <div className="step-number">1</div>
          <div className="step-content">
            <h4>Apri MetaMask</h4>
            <p>Clicca sull'icona MetaMask nel browser</p>
          </div>
        </div>
        
        <div className="step">
          <div className="step-number">2</div>
          <div className="step-content">
            <h4>Vai alla sezione Token</h4>
            <p>Scorri in basso e clicca su "Import tokens"</p>
          </div>
        </div>
        
        <div className="step">
          <div className="step-number">3</div>
          <div className="step-content">
            <h4>Inserisci i dati del token</h4>
            <div className="token-data">
              <div className="data-field">
                <label>Indirizzo contratto:</label>
                <div className="copy-field">
                  <code>{contractAddress}</code>
                  <button 
                    onClick={() => copyToClipboard(contractAddress)}
                    className="copy-btn"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="data-field">
                <label>Simbolo token:</label>
                <div className="copy-field">
                  <code>{tokenSymbol}</code>
                  <button 
                    onClick={() => copyToClipboard(tokenSymbol)}
                    className="copy-btn"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="data-field">
                <label>Decimali:</label>
                <div className="copy-field">
                  <code>{tokenDecimals}</code>
                  <button 
                    onClick={() => copyToClipboard(tokenDecimals.toString())}
                    className="copy-btn"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="step">
          <div className="step-number">4</div>
          <div className="step-content">
            <h4>Conferma l'importazione</h4>
            <p>Clicca su "Add Custom Token" e poi "Import Tokens"</p>
          </div>
        </div>
      </div>
      
      <div className="network-info">
        <h4>🌐 Rete richiesta: Polygon Amoy Testnet</h4>
        <p>
          Assicurati di essere connesso alla rete Polygon Amoy Testnet.
          <br />
          <a 
            href="https://docs.polygon.technology/docs/develop/network-details/network/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="network-link"
          >
            Guida per aggiungere Polygon Amoy a MetaMask
            <ExternalLink size={14} />
          </a>
        </p>
      </div>
      
      <div className="faucet-info">
        <h4>💰 Hai bisogno di MATIC per il gas?</h4>
        <p>
          Ottieni MATIC gratuiti per le transazioni:
          <br />
          <a 
            href="https://faucet.polygon.technology/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="faucet-link"
          >
            Polygon Faucet
            <ExternalLink size={14} />
          </a>
        </p>
      </div>
    </div>
  );
};

export default MetaMaskGuide;
