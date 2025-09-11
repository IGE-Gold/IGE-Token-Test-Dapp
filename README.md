# IGE GOLD - Token Lab | Testnet Demo

Una webapp moderna per testare e gestire il token IGE sulla testnet Amoy di Polygon, con integrazione MetaMask e monitoraggio prezzi oro in tempo reale. Design ispirato al brand IGE GOLD con interfaccia elegante e responsive.

## 🚀 Funzionalità

- **🎨 Design IGE GOLD**: Interfaccia elegante ispirata al brand IGE GOLD
- **🔗 Connessione MetaMask**: Collegamento sicuro al wallet MetaMask con stato visivo
- **💰 Gestione Token IGE**: Visualizzazione balance, mint e burn di token
- **📝 Input Contratto Dinamico**: Inserisci l'indirizzo del contratto senza modificare il codice
- **📈 Prezzi Oro in Tempo Reale**: Monitoraggio prezzi oro in USD ed EUR
- **🌐 Testnet Amoy**: Configurazione automatica per la rete Polygon Amoy
- **📱 Mobile First**: Interfaccia completamente responsive e ottimizzata per mobile
- **✨ Animazioni**: Transizioni fluide e feedback visivo moderno

## 📋 Prerequisiti

- Node.js (versione 16 o superiore)
- MetaMask installato nel browser
- Token MATIC sulla testnet Amoy per le transazioni

## 🛠️ Installazione

1. **Clona il repository**
   ```bash
   git clone <repository-url>
   cd ige-token-lab
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Avvia l'applicazione in modalità sviluppo**
   ```bash
   npm run dev
   ```

4. **Apri il browser**
   - Vai su `http://localhost:3000`
   - L'applicazione si aprirà automaticamente

## 🔧 Configurazione MetaMask

### Aggiunta della Rete Amoy

L'applicazione aggiungerà automaticamente la rete Amoy, ma puoi configurarla manualmente:

- **Nome Rete**: Polygon Amoy Testnet
- **RPC URL**: `https://rpc-amoy.polygon.technology/`
- **Chain ID**: `80002`
- **Simbolo**: `MATIC`
- **Explorer**: `https://amoy.polygonscan.com/`

### Ottenere MATIC di Test

1. Vai su [Polygon Faucet](https://faucet.polygon.technology/)
2. Seleziona "Amoy Testnet"
3. Inserisci il tuo indirizzo wallet
4. Richiedi MATIC di test

## 📱 Utilizzo

### 1. Connessione Wallet

1. Clicca su "Connetti MetaMask"
2. Autorizza la connessione nel popup MetaMask
3. L'app passerà automaticamente alla rete Amoy

### 2. Gestione Token

1. **Inserisci l'indirizzo del contratto** nel campo dedicato
2. **Visualizza le statistiche**:
   - Token totali mintati
   - Il tuo balance personale
   - Nome e simbolo del token

3. **Mint Token**:
   - Inserisci la quantità da mintare
   - Clicca su "Mint Token"
   - Conferma la transazione in MetaMask

4. **Burn Token**:
   - Inserisci la quantità da burnare
   - Clicca su "Burn Token"
   - Conferma la transazione in MetaMask

### 3. Monitoraggio Prezzi Oro

- I prezzi vengono aggiornati automaticamente ogni 5 minuti
- Clicca su "Aggiorna" per un refresh manuale
- Visualizza prezzi in USD per oncia, USD per grammo, EUR per grammo

## 🏗️ Struttura del Progetto

```
src/
├── components/
│   ├── WalletConnection.jsx    # Componente connessione wallet
│   ├── GoldPriceDisplay.jsx    # Display prezzi oro
│   └── TokenManager.jsx        # Gestione token IGE
├── hooks/
│   ├── useWallet.js           # Hook per gestione wallet
│   ├── useContract.js         # Hook per interazione contratto
│   └── useGoldPrice.js        # Hook per prezzi oro
├── App.jsx                    # Componente principale
├── main.jsx                   # Entry point
└── index.css                  # Stili globali
```

## 🔒 Sicurezza

- **Testnet Only**: L'app è configurata per funzionare solo sulla testnet Amoy
- **Validazione Input**: Tutti gli input vengono validati prima dell'invio
- **Gestione Errori**: Errori dettagliati per debugging sicuro
- **Non-Custodial**: Le chiavi private rimangono sempre nel tuo wallet

## 🐛 Risoluzione Problemi

### MetaMask non si connette
- Assicurati che MetaMask sia installato e sbloccato
- Controlla che la rete sia impostata su Amoy Testnet
- Ricarica la pagina e riprova

### Transazioni falliscono
- Verifica di avere abbastanza MATIC per le gas fees
- Controlla che l'indirizzo del contratto sia corretto
- Assicurati che il contratto supporti le funzioni mint/burn

### Prezzi oro non si aggiornano
- Controlla la connessione internet
- Clicca su "Aggiorna" per un refresh manuale
- L'app mostrerà prezzi di esempio in caso di errore API

## 📝 Note Tecniche

- **Framework**: React 18 con Vite
- **Blockchain**: Polygon Amoy Testnet
- **Wallet**: MetaMask (ethers.js v6)
- **API Prezzi**: metals.live (con fallback)
- **Styling**: CSS moderno con gradienti e animazioni

## 🤝 Contributi

I contributi sono benvenuti! Per favore:

1. Fork del repository
2. Crea un branch per la tua feature
3. Commit delle modifiche
4. Push al branch
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.

## 🆘 Supporto

Per supporto o domande:
- Apri una issue su GitHub
- Contatta il team di sviluppo

---

**⚠️ Disclaimer**: Questa applicazione è per scopi educativi e di test. Usa sempre la testnet per i test e non inviare mai fondi reali a indirizzi di test.
