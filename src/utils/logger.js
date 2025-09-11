// Sistema di logging completo per debug delle transazioni
class TransactionLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100; // Limite per evitare overflow di memoria
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    
    // Funzione per convertire BigInt in stringhe prima della serializzazione
    const convertBigIntToString = (obj) => {
      if (obj === null || obj === undefined) return obj;
      if (typeof obj === 'bigint') return obj.toString();
      if (Array.isArray(obj)) return obj.map(convertBigIntToString);
      if (typeof obj === 'object') {
        const converted = {};
        for (const [key, value] of Object.entries(obj)) {
          converted[key] = convertBigIntToString(value);
        }
        return converted;
      }
      return obj;
    };
    
    const logEntry = {
      timestamp,
      level,
      message,
      data: data ? JSON.stringify(convertBigIntToString(data), null, 2) : null
    };
    
    this.logs.unshift(logEntry);
    
    // Mantieni solo gli ultimi maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    
    // Log anche nella console per debug immediato
    console.log(`[${level.toUpperCase()}] ${timestamp}: ${message}`, data || '');
  }

  info(message, data = null) {
    this.log('info', message, data);
  }

  warn(message, data = null) {
    this.log('warn', message, data);
  }

  error(message, data = null) {
    this.log('error', message, data);
  }

  debug(message, data = null) {
    this.log('debug', message, data);
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs() {
    return {
      timestamp: new Date().toISOString(),
      logs: this.logs
    };
  }
}

// Istanza globale del logger
export const logger = new TransactionLogger();

// Funzione helper per log delle transazioni
export const logTransaction = (action, data) => {
  // Converti BigInt in stringhe prima del log
  const convertBigInt = (obj) => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (Array.isArray(obj)) return obj.map(convertBigInt);
    if (typeof obj === 'object') {
      const converted = {};
      for (const [key, value] of Object.entries(obj)) {
        converted[key] = convertBigInt(value);
      }
      return converted;
    }
    return obj;
  };

  logger.info(`Transazione ${action}`, {
    action,
    timestamp: new Date().toISOString(),
    ...convertBigInt(data)
  });
};

// Funzione helper per log degli errori
export const logError = (action, error, context = {}) => {
  // Converti BigInt in stringhe prima del log
  const convertBigInt = (obj) => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (Array.isArray(obj)) return obj.map(convertBigInt);
    if (typeof obj === 'object') {
      const converted = {};
      for (const [key, value] of Object.entries(obj)) {
        converted[key] = convertBigInt(value);
      }
      return converted;
    }
    return obj;
  };

  logger.error(`Errore in ${action}`, {
    action,
    error: error.message,
    errorCode: error.code,
    errorData: error.data,
    stack: error.stack,
    context: convertBigInt(context)
  });
};
