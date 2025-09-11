import { useState, useEffect } from 'react';
import axios from 'axios';

export const useGoldPrice = () => {
  const [goldPrices, setGoldPrices] = useState({
    usdPerOunce: 0,
    usdPerGram: 0,
    eurPerGram: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGoldPrices = async () => {
    setIsLoading(true);
    setError(null);

    // Timeout di 3 secondi per l'alert
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        alert('⚠️ Errore: Impossibile aggiornare i prezzi dell\'oro. Verifica la connessione internet.');
      }
    }, 3000);

    try {
      // Prova prima con un'API più semplice e affidabile
      const response = await axios.get('https://api.coinbase.com/v2/exchange-rates?currency=XAU', {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'IGE-Token-Lab/1.0'
        }
      });
      
      if (response.data && response.data.data && response.data.data.rates && response.data.data.rates.USD) {
        const usdPerOunce = parseFloat(response.data.data.rates.USD);
        const usdPerGram = usdPerOunce / 31.1035; // Conversione da once a grammi
        const eurPerGram = usdPerGram * 0.85; // Conversione approssimativa USD to EUR
        
        setGoldPrices({
          usdPerOunce: usdPerOunce.toFixed(2),
          usdPerGram: usdPerGram.toFixed(2),
          eurPerGram: eurPerGram.toFixed(2)
        });
        
        console.log('Prezzi oro caricati con successo da Coinbase');
        clearTimeout(timeoutId);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('API Coinbase fallita:', err.message);
    }

    // Fallback: usa dati di esempio realistici
    console.warn('API non disponibile, usando dati di esempio');
    setGoldPrices({
      usdPerOunce: '2000.00',
      usdPerGram: '64.37',
      eurPerGram: '54.72'
    });
    
    setError('API non disponibile. Mostrando dati di esempio.');
    clearTimeout(timeoutId);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchGoldPrices();
    
    // Aggiorna i prezzi ogni 30 secondi
    const interval = setInterval(fetchGoldPrices, 30 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    goldPrices,
    isLoading,
    error,
    refreshPrices: fetchGoldPrices
  };
};
