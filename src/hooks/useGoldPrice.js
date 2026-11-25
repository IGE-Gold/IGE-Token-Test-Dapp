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

    // Rileva se siamo su mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Timeout di 3 secondi per l'alert
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        alert('⚠️ Errore: Impossibile aggiornare i prezzi dell\'oro. Verifica la connessione internet.');
      }
    }, 3000);

    try {
      // Prova prima con un'API più semplice e affidabile
      const opts = { timeout: 10000, headers: { 'Accept': 'application/json' } };
      const [usdRes, eurRes] = await Promise.all([
        axios.get('https://api.coinbase.com/v2/prices/XAU-USD/spot', opts),
        axios.get('https://api.coinbase.com/v2/prices/XAU-EUR/spot', opts)
      ]);
      if (usdRes.data?.data?.amount && eurRes.data?.data?.amount) {
        const usdPerOunce = parseFloat(usdRes.data.data.amount);
        const usdPerGram = usdPerOunce / 31.1035; // Conversione da once a grammi
        const eurPerGram = parseFloat(eurRes.data.data.amount) / 31.1035;
        
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
      
      // Su mobile, prova un approccio diverso se l'API principale fallisce
      if (isMobile) {
        try {
          console.log('Tentativo con approccio mobile...');
          // Usa un'API diversa che funziona meglio su mobile
          const mobileResponse = await axios.get('https://api.metals.live/v1/spot/gold', {
            timeout: 15000,
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (mobileResponse.data && mobileResponse.data.price) {
            const usdPerOunce = parseFloat(mobileResponse.data.price);
            const usdPerGram = usdPerOunce / 31.1035;
            const eurPerGram = usdPerGram * 0.85;
            
            setGoldPrices({
              usdPerOunce: usdPerOunce.toFixed(2),
              usdPerGram: usdPerGram.toFixed(2),
              eurPerGram: eurPerGram.toFixed(2)
            });
            
            console.log('Prezzi oro caricati con successo su mobile');
            clearTimeout(timeoutId);
            setIsLoading(false);
            return;
          }
        } catch (mobileErr) {
          console.warn('Approccio mobile fallito:', mobileErr.message);
        }
      }
    }

    // Fallback: usa dati di esempio realistici
    console.warn('API non disponibile, usando dati di esempio');
    setGoldPrices({
      usdPerOunce: '3652.00',
      usdPerGram: '117.41',
      eurPerGram: '99.80'
    });
    
    setError('API non disponibile. Mostro dati di esempio.');
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
