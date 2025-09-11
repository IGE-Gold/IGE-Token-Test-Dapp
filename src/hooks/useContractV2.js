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
        
        // Testa immediatamente se il contratto risponde
        contractInstance.name().then(name => {
          logger.info('Contratto risponde correttamente', { name });
          
          // Testa se le funzioni mint/burn esistono realmente
          return Promise.all([
            contractInstance.mint.staticCall('0x0000000000000000000000000000000000000000', 0).catch(() => null),
            contractInstance.burn.staticCall('0x0000000000000000000000000000000000000000', 0).catch(() => null)
          ]);
        }).then(([mintResult, burnResult]) => {
          logger.info('Test funzioni contratto', { 
            mintAvailable: mintResult !== null,
            burnAvailable: burnResult !== null
          });
        }).catch(err => {
          logger.error('Contratto non risponde alle chiamate', { error: err.message });
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

  // Funzione per eseguire transazioni in modo sicuro con retry
  const executeTransaction = useCallback(async (method, args, transactionName, retryCount = 0) => {
    if (isTransactionPending) {
      throw new Error('Transazione già in corso, attendere il completamento');
    }

    setIsTransactionPending(true);
    setError(null);

    try {
      logger.info(`Inizio transazione ${transactionName} (tentativo ${retryCount + 1})`, { args });
      
      // Verifica che il contratto sia valido
      if (!contract) {
        throw new Error('Contratto non inizializzato');
      }
      
      // Verifica che il signer sia valido
      if (!signer) {
        throw new Error('Wallet non connesso');
      }
      
      // Verifica la rete
      const network = await signer.provider.getNetwork();
      logger.info('Rete corrente', { chainId: network.chainId.toString(), name: network.name });
      
      // Verifica se la rete è corretta (Polygon Amoy = 80002)
      if (network.chainId !== 80002n) {
        logger.warn('Rete non corretta per il contratto', { 
          expected: '80002 (Polygon Amoy)', 
          actual: network.chainId.toString() 
        });
      }
      
      // Verifica il gas price della rete
      try {
        const feeData = await signer.provider.getFeeData();
        logger.info('Dati gas rete', {
          gasPrice: feeData.gasPrice?.toString(),
          maxFeePerGas: feeData.maxFeePerGas?.toString(),
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString()
        });
      } catch (feeErr) {
        logger.warn('Impossibile ottenere dati gas', { error: feeErr.message });
      }
      
      // Stima il gas
      const gasLimit = await estimateGasSafely(method, ...args);
      
      // Verifica che il gas limit sia ragionevole
      if (gasLimit < 21000n) {
        throw new Error('Gas limit troppo basso per la transazione');
      }
      
      logger.info(`Gas limit finale: ${gasLimit.toString()}`);
      
      // Esegui la transazione con parametri ottimizzati
      const tx = await method(...args, { 
        gasLimit,
        gasPrice: undefined, // Lascia che MetaMask calcoli il gas price
        timeout: 120000, // 2 minuti timeout
        maxFeePerGas: undefined, // Usa EIP-1559 se supportato
        maxPriorityFeePerGas: undefined // Usa EIP-1559 se supportato
      });
      logger.info(`Transazione ${transactionName} inviata`, { txHash: tx.hash });
      
      // Attendi conferma con timeout
      const receipt = await tx.wait(1); // Attendi almeno 1 conferma
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
      // Se è un errore RPC e non abbiamo fatto troppi tentativi, riprova
      if (err.message.includes('Internal JSON-RPC error') && retryCount < 2) {
        logger.warn(`Errore RPC, riprovo (tentativo ${retryCount + 1})`, { error: err.message });
        await new Promise(resolve => setTimeout(resolve, 2000)); // Aspetta 2 secondi
        return executeTransaction(method, args, transactionName, retryCount + 1);
      }
      
      logError(transactionName, err, { args, retryCount });
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
      
      // Testa la connessione prima di procedere
      await testContractConnection();
      
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
  }, [contract, signer, tokenInfo.decimals, isTransactionPending, executeTransaction, testContractConnection]);

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
      
      // Testa la connessione prima di procedere
      await testContractConnection();
      
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

      // CONTROLLO SPECIFICO: Verifica permessi e stato del contratto
      let canBurn = false;
      try {
        // Verifica se il contratto è in pausa
        const isPaused = await contract.paused();
        logger.info('Stato pausa contratto per burn', { isPaused });
        
        if (isPaused) {
          logger.warn('Contratto in pausa, tentativo di unpause');
          try {
            // Prova a fare unpause se l'utente ha i permessi
            const unpauseTx = await contract.unpause();
            await unpauseTx.wait();
            logger.info('Contratto unpaused con successo');
          } catch (unpauseErr) {
            logger.error('Impossibile fare unpause', { error: unpauseErr.message });
            throw new Error('Contratto in pausa e impossibile fare unpause - burn non disponibile');
          }
        }
        
        // Verifica i ruoli dell'utente
        const userAddress = await signer.getAddress();
        const adminRole = await contract.DEFAULT_ADMIN_ROLE();
        const hasAdminRole = await contract.hasRole(adminRole, userAddress);
        logger.info('Ruoli utente per burn', { userAddress, hasAdminRole });
        
        // Prova a fare una chiamata statica per vedere se la funzione funziona
        await contract.burn.staticCall(fromAddress, 0);
        canBurn = true;
        logger.info('Funzione burn verificata e permessi OK');
      } catch (err) {
        logger.error('Problema con funzione burn', { 
          error: err.message,
          isPaused: err.message.includes('paused'),
          noPermission: err.message.includes('role') || err.message.includes('permission')
        });
        canBurn = false;
      }

      if (canBurn) {
        try {
          logger.info('Tentativo burn diretto con gas limit alto');
          
          // Prova prima con i parametri standard
          let tx;
          try {
            tx = await executeTransaction(
              contract.burn,
              [fromAddress, amountWei],
              'burn'
            );
          } catch (firstError) {
            logger.warn('Primo tentativo burn fallito, provo con parametri diversi', { error: firstError.message });
            
            // Prova con solo l'amount (alcuni contratti burn solo dal msg.sender)
            tx = await executeTransaction(
              contract.burn,
              [amountWei],
              'burn_amount_only'
            );
          }
          
          logger.info('Burn completato con successo', { amount, fromAddress });
          return tx;
        } catch (burnError) {
          logger.error('Burn diretto fallito nonostante verifica', { error: burnError.message });
          throw burnError;
        }
      } else {
        logger.info('Funzione burn non disponibile, uso transfer a address(0)');
        
        // Fallback: usa transfer a address(0) per simulare burn
        const zeroAddress = '0x0000000000000000000000000000000000000000';
        const tx = await executeTransaction(
          contract.transfer,
          [zeroAddress, amountWei],
          'burn_via_transfer'
        );
        
        logger.info('Burn completato via transfer a address(0)', { amount, fromAddress });
        return tx;
      }
    } catch (err) {
      let errorMessage = `Errore nel burn: ${err.message}`;
      
      // Messaggi di errore più specifici
      if (err.message.includes('Internal JSON-RPC error')) {
        errorMessage = '❌ Errore del contratto: Il contratto potrebbe non supportare la funzione burn o essere in pausa. Prova a usare transfer a address(0) come alternativa.';
      } else if (err.message.includes('execution reverted')) {
        errorMessage = '❌ Transazione rifiutata: Il contratto ha rifiutato la transazione. Verifica i permessi e lo stato del contratto.';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = '❌ Fondi insufficienti: Non hai abbastanza MATIC per pagare il gas.';
      }
      
      setError(errorMessage);
      throw err;
    }
  }, [contract, signer, tokenInfo.decimals, isTransactionPending, executeTransaction, testContractConnection]);

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
