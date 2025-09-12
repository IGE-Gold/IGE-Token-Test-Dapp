import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { logger, logTransaction, logError } from '../utils/logger';

// ABI semplificato e ottimizzato
const ERC20_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function mint(address to, uint256 amount) external",
  "function burn(address from, uint256 amount) external",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function paused() view returns (bool)",
  "function unpause() external",
  "function pause() external",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function grantRole(bytes32 role, address account) external",
  "function revokeRole(bytes32 role, address account) external",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Mint(address indexed to, uint256 amount)",
  "event Burn(address indexed from, uint256 amount)"
];

export const useContractV2 = (contractAddress, signer) => {
  const [contract, setContract] = useState(null);
  const [totalSupply, setTotalSupply] = useState('0');
  const [userBalance, setUserBalance] = useState('0');
  const [tokenInfo, setTokenInfo] = useState({
    name: '',
    symbol: '',
    decimals: 18
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTransactionPending, setIsTransactionPending] = useState(false);

  // Inizializza il contratto
  useEffect(() => {
    if (contractAddress && signer) {
      try {
        logger.info('Inizializzazione contratto', { contractAddress });
        const contractInstance = new ethers.Contract(contractAddress, ERC20_ABI, signer);
        setContract(contractInstance);
        setError(null);
        logger.info('Contratto inizializzato con successo');
        
        // Testa se il contratto risponde
        contractInstance.name().then(name => {
          logger.info('Contratto inizializzato correttamente', { name });
        }).catch(err => {
          logger.error('Contratto non risponde', { error: err.message });
        });
      } catch (err) {
        const errorMsg = 'Indirizzo contratto non valido';
        setError(errorMsg);
        logError('contract_init', err, { contractAddress });
      }
    } else {
      setContract(null);
    }
  }, [contractAddress, signer]);

  // Verifica che il contratto abbia le funzioni necessarie
  const verifyContractFunctions = useCallback(async () => {
    if (!contract) return false;
    
    try {
      // Verifica che le funzioni esistano
      const hasMint = typeof contract.mint === 'function';
      const hasBurn = typeof contract.burn === 'function';
      const hasTotalSupply = typeof contract.totalSupply === 'function';
      const hasBalanceOf = typeof contract.balanceOf === 'function';
      
      logger.info('Verifica funzioni contratto', {
        hasMint,
        hasBurn,
        hasTotalSupply,
        hasBalanceOf
      });
      
      // Prova a chiamare le funzioni per verificare che funzionino
      if (hasMint) {
        try {
          await contract.mint.staticCall('0x0000000000000000000000000000000000000000', 0);
          logger.info('Funzione mint verificata');
        } catch (err) {
          logger.warn('Funzione mint non funzionante', { error: err.message });
        }
      }
      
      if (hasBurn) {
        try {
          await contract.burn.staticCall('0x0000000000000000000000000000000000000000', 0);
          logger.info('Funzione burn verificata');
        } catch (err) {
          logger.warn('Funzione burn non funzionante', { error: err.message });
        }
      }
      
      if (!hasMint || !hasBurn || !hasTotalSupply || !hasBalanceOf) {
        throw new Error('Contratto non supporta le funzioni richieste');
      }
      
      return true;
    } catch (err) {
      logger.error('Errore nella verifica del contratto', err);
      return false;
    }
  }, [contract]);

  // Carica i dati del contratto
  const loadContractData = useCallback(async () => {
    if (!contract || !signer) {
      logger.warn('Tentativo di caricamento dati senza contratto o signer');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.info('Inizio caricamento dati contratto');
      
      // Verifica le funzioni del contratto
      const contractValid = await verifyContractFunctions();
      if (!contractValid) {
        throw new Error('Contratto non valido o non supporta le funzioni richieste');
      }
      
      const [name, symbol, decimals, totalSupplyValue, userAddress] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply(),
        signer.getAddress()
      ]);

      const userBalanceValue = await contract.balanceOf(userAddress);

      setTokenInfo({ name, symbol, decimals: Number(decimals) });
      setTotalSupply(ethers.formatUnits(totalSupplyValue, decimals));
      setUserBalance(ethers.formatUnits(userBalanceValue, decimals));

      logger.info('Dati contratto caricati con successo', {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatUnits(totalSupplyValue, decimals),
        userBalance: ethers.formatUnits(userBalanceValue, decimals)
      });
    } catch (err) {
      const errorMessage = 'Errore nel caricamento dei dati del contratto';
      setError(errorMessage);
      logError('load_contract_data', err, { contractAddress });
    } finally {
      setIsLoading(false);
    }
  }, [contract, signer, contractAddress, verifyContractFunctions]);

  // Funzione per stimare il gas in modo sicuro
  const estimateGasSafely = useCallback(async (method, ...args) => {
    // NON usare mai la stima gas - usa sempre gas limit fissi alti
    logger.info('Usando gas limit fisso per evitare errori RPC');
    
    const amount = args[1] ? ethers.formatUnits(args[1], tokenInfo.decimals) : 0;
    let gasLimit;
    
    if (parseFloat(amount) <= 1) {
      gasLimit = 1000000n; // 1M gas per 1 token - molto sicuro
    } else if (parseFloat(amount) <= 100) {
      gasLimit = 800000n; // 800k gas per quantità medie
    } else {
      gasLimit = 600000n; // 600k gas per quantità grandi
    }
    
    logger.info('Gas limit fisso applicato', { 
      amount: parseFloat(amount),
      gasLimit: gasLimit.toString() 
    });
    return gasLimit;
  }, [tokenInfo.decimals]);

  // Funzione per eseguire transazioni in modo semplice
  const executeTransaction = useCallback(async (method, args, transactionName) => {
    if (isTransactionPending) {
      throw new Error('Transazione già in corso, attendere il completamento');
    }

    setIsTransactionPending(true);
    setError(null);

    try {
      logger.info(`Inizio transazione ${transactionName}`, { args });
      
      // Verifica che il contratto sia valido
      if (!contract) {
        throw new Error('Contratto non inizializzato');
      }
      
      // Verifica che il signer sia valido
      if (!signer) {
        throw new Error('Wallet non connesso');
      }
      
      // Stima il gas
      const gasLimit = await estimateGasSafely(method, ...args);
      
      // Verifica che il gas limit sia ragionevole
      if (gasLimit < 21000n) {
        throw new Error('Gas limit troppo basso per la transazione');
      }
      
      logger.info(`Gas limit finale: ${gasLimit.toString()}`);
      
      // Esegui la transazione
      const tx = await method(...args, { gasLimit });
      logger.info(`Transazione ${transactionName} inviata`, { txHash: tx.hash });
      
      // Attendi conferma
      const receipt = await tx.wait();
      logger.info(`Transazione ${transactionName} confermata`, { 
        txHash: tx.hash,
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString()
      });

      // Ricarica i dati
      await loadContractData();
      
      logTransaction(transactionName, {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
        args: args.map(arg => typeof arg === 'bigint' ? arg.toString() : arg)
      });

      return tx;
    } catch (err) {
      logError(transactionName, err, { args });
      throw err;
    } finally {
      setIsTransactionPending(false);
    }
  }, [isTransactionPending, estimateGasSafely, loadContractData]);

  // Testa la connessione al contratto
  const testContractConnection = useCallback(async () => {
    if (!contract || !signer) {
      throw new Error('Contratto o wallet non connesso');
    }

    try {
      logger.info('Test connessione contratto');
      
      // Prova a chiamare una funzione view (non costa gas)
      const name = await contract.name();
      const symbol = await contract.symbol();
      
      // Verifica se il contratto è in pausa
      let isPaused = false;
      try {
        isPaused = await contract.paused();
        logger.info('Stato pausa contratto', { isPaused });
      } catch (err) {
        logger.warn('Impossibile verificare stato pausa', { error: err.message });
      }
      
      // Verifica i ruoli dell'utente
      try {
        const userAddress = await signer.getAddress();
        const adminRole = await contract.DEFAULT_ADMIN_ROLE();
        const hasAdminRole = await contract.hasRole(adminRole, userAddress);
        logger.info('Ruoli utente', { userAddress, hasAdminRole });
      } catch (err) {
        logger.warn('Impossibile verificare ruoli', { error: err.message });
      }
      
      logger.info('Connessione contratto OK', { name, symbol, isPaused });
      return true;
    } catch (err) {
      logger.error('Errore connessione contratto', err);
      throw new Error(`Contratto non raggiungibile: ${err.message}`);
    }
  }, [contract, signer]);

  // Mint tokens
  const mintTokens = useCallback(async (amount, toAddress) => {
    if (!contract || !signer) {
      throw new Error('Contratto o wallet non connesso');
    }

    if (isTransactionPending) {
      throw new Error('Transazione già in corso');
    }

    try {
      logger.info('Inizio mint tokens', { amount, toAddress });
      
      const amountWei = ethers.parseUnits(amount.toString(), tokenInfo.decimals);
      
      // Verifica che l'importo sia valido
      if (amountWei <= 0n) {
        throw new Error('Importo deve essere maggiore di zero');
      }

      const tx = await executeTransaction(
        contract.mint,
        [toAddress, amountWei],
        'mint'
      );

      logger.info('Mint completato con successo', { amount, toAddress });
      return tx;
    } catch (err) {
      const errorMessage = `Errore nel mint: ${err.message}`;
      setError(errorMessage);
      throw err;
    }
  }, [contract, signer, tokenInfo.decimals, isTransactionPending, executeTransaction]);

  // Burn tokens
  const burnTokens = useCallback(async (amount, fromAddress) => {
    if (!contract || !signer) {
      throw new Error('Contratto o wallet non connesso');
    }

    if (isTransactionPending) {
      throw new Error('Transazione già in corso');
    }

    try {
      logger.info('Inizio burn tokens', { amount, fromAddress });
      
      const amountWei = ethers.parseUnits(amount.toString(), tokenInfo.decimals);
      
      // Verifica che l'importo sia valido
      if (amountWei <= 0n) {
        throw new Error('Importo deve essere maggiore di zero');
      }

      // Verifica saldo
      const userAddress = await signer.getAddress();
      const userBalance = await contract.balanceOf(userAddress);
      if (userBalance < amountWei) {
        throw new Error(`Saldo insufficiente: ${ethers.formatUnits(userBalance, tokenInfo.decimals)} token disponibili`);
      }

      // Esegui burn diretto
      const tx = await executeTransaction(
        contract.burn,
        [fromAddress, amountWei],
        'burn'
      );

      logger.info('Burn completato con successo', { amount, fromAddress });
      return tx;
    } catch (err) {
      const errorMessage = `Errore nel burn: ${err.message}`;
      setError(errorMessage);
      throw err;
    }
  }, [contract, signer, tokenInfo.decimals, isTransactionPending, executeTransaction]);

  // Carica i dati quando il contratto è pronto
  useEffect(() => {
    if (contract && signer) {
      loadContractData();
    }
  }, [contract, signer, loadContractData]);

  return {
    contract,
    totalSupply,
    userBalance,
    tokenInfo,
    isLoading,
    error,
    isTransactionPending,
    loadContractData,
    mintTokens,
    burnTokens
  };
};
