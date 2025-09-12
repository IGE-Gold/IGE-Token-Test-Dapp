import React from 'react';
import { Wallet, LogOut } from 'lucide-react';

const WalletConnection = ({ 
  isConnected, 
  isConnecting, 
  account, 
  connectWallet, 
  disconnectWallet, 
  switchToAmoy 
}) => {
  const [isSwitching, setIsSwitching] = React.useState(false);
  const formatAddress = (address) => {
    if (!address) return '';
    return address; // Mostra l'indirizzo completo
  };

  const handleSwitchToAmoy = async () => {
    setIsSwitching(true);
    try {
      await switchToAmoy();
    } catch (error) {
      console.error('Errore nel passaggio alla rete:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="card">
      <h2>
        <Wallet size={16} style={{ display: 'inline', marginRight: '6px' }} />
        Wallet Connection
      </h2>
      
      {/* Status del wallet */}
      <div className={`wallet-status ${isConnected ? 'connected' : 'disconnected'}`}>
        <div className="status-indicator"></div>
        <span>
          {isConnected ? 'Wallet Connesso' : 'Wallet Disconnesso'}
        </span>
      </div>
      
      {!isConnected ? (
        <div>
          <p style={{ marginBottom: '12px', fontSize: '11px', color: 'var(--ige-gray)' }}>
            Connetti il tuo wallet MetaMask per iniziare
          </p>
          
          {/* Istruzioni per mobile */}
          {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
            <div style={{
              marginBottom: '12px',
              padding: '8px 12px',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '4px',
              fontSize: '10px',
              color: 'var(--ige-gold)'
            }}>
              📱 <strong>Su Mobile:</strong> Apri MetaMask → Menu (☰) → Browser → Naviga qui → Connetti
            </div>
          )}
          
          <button 
            className="button" 
            onClick={connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <span className="loading" style={{ marginRight: '4px' }}></span>
                Connessione...
              </>
            ) : (
              'Connetti MetaMask'
            )}
          </button>
        </div>
      ) : (
        <div>
          <p style={{ marginBottom: '8px', fontSize: '11px', color: 'var(--ige-gray)' }}>
            Wallet connesso:
          </p>
          <div className="wallet-address" style={{ 
            wordBreak: 'break-all',
            fontFamily: 'Courier New, monospace',
            fontSize: '11px',
            lineHeight: '1.4'
          }}>
            {formatAddress(account)}
          </div>
          <div style={{ marginTop: '12px' }}>
            <button 
              className="button secondary" 
              onClick={handleSwitchToAmoy}
              disabled={isSwitching}
              style={{ marginRight: '8px' }}
            >
              {isSwitching ? (
                <>
                  <span className="loading" style={{ marginRight: '4px' }}></span>
                  Passaggio...
                </>
              ) : (
                'Passa a Amoy Testnet'
              )}
            </button>
            <button 
              className="button danger" 
              onClick={disconnectWallet}
            >
              <LogOut size={12} style={{ marginRight: '4px' }} />
              Disconnetti Metamask
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;
