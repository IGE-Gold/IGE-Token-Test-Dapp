import React, { useState, useEffect } from 'react';
import { Download, Trash2, Eye, EyeOff } from 'lucide-react';
import { logger } from '../utils/logger';

const TransactionLogger = () => {
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const updateLogs = () => {
      setLogs(logger.getLogs());
    };

    // Aggiorna i log ogni secondo
    const interval = setInterval(updateLogs, 1000);
    updateLogs(); // Aggiorna immediatamente

    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => 
    filter === 'all' || log.level === filter
  );

  const exportLogs = () => {
    const dataStr = JSON.stringify(logger.exportLogs(), null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transaction-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return '#ef4444';
      case 'warn': return '#f59e0b';
      case 'info': return '#3b82f6';
      case 'debug': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'var(--ige-gold)',
          color: 'var(--ige-black)',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
        title="Mostra Log Transazioni"
      >
        📊
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '500px',
      background: 'var(--ige-black)',
      border: '2px solid var(--ige-gold)',
      borderRadius: '8px',
      padding: '16px',
      zIndex: 1000,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        borderBottom: '1px solid var(--ige-border)',
        paddingBottom: '8px'
      }}>
        <h4 style={{ 
          color: 'var(--ige-gold)', 
          margin: 0, 
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          📊 Log Transazioni
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              background: 'var(--ige-dark-gray)',
              color: 'var(--ige-white)',
              border: '1px solid var(--ige-border)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '10px'
            }}
          >
            <option value="all">Tutti</option>
            <option value="error">Errori</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
          <button
            onClick={exportLogs}
            style={{
              background: 'var(--ige-gold)',
              color: 'var(--ige-black)',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
            title="Esporta Log"
          >
            <Download size={12} />
          </button>
          <button
            onClick={clearLogs}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
            title="Cancella Log"
          >
            <Trash2 size={12} />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              background: 'var(--ige-gray)',
              color: 'var(--ige-white)',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
            title="Chiudi"
          >
            <EyeOff size={12} />
          </button>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        fontSize: '10px',
        fontFamily: 'Courier New, monospace'
      }}>
        {filteredLogs.length === 0 ? (
          <div style={{ 
            color: 'var(--ige-gray)', 
            textAlign: 'center',
            padding: '20px'
          }}>
            Nessun log disponibile
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={index}
              style={{
                marginBottom: '8px',
                padding: '8px',
                background: 'var(--ige-dark-gray)',
                borderRadius: '4px',
                borderLeft: `3px solid ${getLevelColor(log.level)}`
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <span style={{ 
                  color: getLevelColor(log.level),
                  fontWeight: 'bold',
                  fontSize: '9px'
                }}>
                  [{log.level.toUpperCase()}]
                </span>
                <span style={{ 
                  color: 'var(--ige-gray)',
                  fontSize: '8px'
                }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div style={{ 
                color: 'var(--ige-white)',
                marginBottom: '4px'
              }}>
                {log.message}
              </div>
              {log.data && (
                <details style={{ color: 'var(--ige-gray)' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '8px' }}>
                    Dettagli
                  </summary>
                  <pre style={{ 
                    marginTop: '4px',
                    fontSize: '8px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}>
                    {log.data}
                  </pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionLogger;
