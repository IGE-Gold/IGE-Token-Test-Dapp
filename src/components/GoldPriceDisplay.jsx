import React from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';

const GoldPriceDisplay = ({ goldPrices, isLoading, error, refreshPrices, isConnected }) => {
  const [lastUpdate, setLastUpdate] = React.useState(null);

  React.useEffect(() => {
    if (!isLoading && !error && goldPrices.usdPerOunce !== 0) {
      setLastUpdate(new Date());
    }
  }, [goldPrices, isLoading, error]);

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Non mostrare la sezione se il wallet non è connesso
  if (!isConnected) {
    return null;
  }

  return (
    <div className="card">
      <h2>
        <TrendingUp size={16} style={{ display: 'inline', marginRight: '6px' }} />
        Quotazione Oro
        <button 
          className="button" 
          onClick={refreshPrices}
          style={{ 
            float: 'right', 
            padding: '4px 8px', 
            fontSize: '10px',
            background: isLoading ? 'var(--ige-gray)' : 'var(--ige-gold)',
            color: 'var(--ige-white)',
            border: '1px solid var(--ige-gold-dark)',
            cursor: 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          <RefreshCw size={10} style={{ marginRight: '2px' }} />
          {isLoading ? 'Aggiornamento...' : 'Aggiorna'}
        </button>
      </h2>
      
      {/* Fonte dati */}
      <div style={{
        textAlign: 'left',
        marginBottom: '8px',
        fontSize: '9px',
        color: 'var(--ige-gray)',
        opacity: 0.7,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>COINBASE</span>
        {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
          <span style={{ color: 'var(--ige-gold)', fontSize: '8px' }}>
            📱 Mobile
          </span>
        )}
      </div>
      
      {lastUpdate && (
        <div className="price-timestamp">
          Ultimo aggiornamento: {formatTime(lastUpdate)}
        </div>
      )}
      
      {error && (
        <div className="error" style={{
          fontSize: '10px',
          padding: '8px',
          background: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: '4px',
          color: '#ef4444'
        }}>
          ⚠️ {error}
          <div style={{ marginTop: '4px', fontSize: '9px', opacity: 0.8 }}>
            Su mobile: verifica la connessione internet e riprova
          </div>
        </div>
      )}
      
      <div className="price-grid" style={{
        opacity: isLoading ? 0.6 : 1,
        transition: 'opacity 0.3s ease'
      }}>
        <div className="price-item" style={{
          background: isLoading ? 'var(--ige-gray)' : 'var(--ige-light-gray)',
          transition: 'background 0.3s ease'
        }}>
          <div className="label">USD per Oncia</div>
          <div className="value">${goldPrices.usdPerOunce}</div>
        </div>
        <div className="price-item" style={{
          background: isLoading ? 'var(--ige-gray)' : 'var(--ige-light-gray)',
          transition: 'background 0.3s ease'
        }}>
          <div className="label">USD per Grammo</div>
          <div className="value">${goldPrices.usdPerGram}</div>
        </div>
        <div className="price-item" style={{
          background: isLoading ? 'var(--ige-gray)' : 'var(--ige-light-gray)',
          transition: 'background 0.3s ease'
        }}>
          <div className="label">EUR per Grammo</div>
          <div className="value">€{goldPrices.eurPerGram}</div>
        </div>
      </div>
    </div>
  );
};

export default GoldPriceDisplay;
