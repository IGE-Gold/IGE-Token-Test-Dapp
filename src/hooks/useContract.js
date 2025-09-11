import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// ABI esteso per includere le funzioni di pausa e ruoli
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

export const useContract = (contractAddress, signer) => {
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

  useEffect(() => {
    if (contractAddress && signer) {
      try {
        const contractInstance = new ethers.Contract(contractAddress, ERC20_ABI, signer);
        setContract(contractInstance);
        setError(null);
      } catch (err) {
        setError('Indirizzo contratto non valido');
        console.error('Errore nella creazione del contratto:', err);
      }
    } else {
      setContract(null);
    }
  }, [contractAddress, signer]);

  // Funzione per controllare e rimuovere la pausa
  const checkAndUnpause = async () => {
    if (!contract) return false;

    try {
      const isPaused = await contract.paused();
      console.log("Token paused:", isPaused);
      
      if (isPaused) {
        console.log("Tentativo di rimuovere la pausa...");
        const tx = await contract.unpause();
        await tx.wait();
        console.log("Token unpaused!");
        return true;
      }
      return false;
    } catch (err) {
      console.error('Errore nel controllo della pausa:', err);
      return false;
    }
  };

  // Funzione per verificare i ruoli dell'utente
  const checkUserRoles = async () => {
    if (!contract || !signer) return { hasAdminRole: false, hasMinterRole: false };

    try {
      const userAddress = await signer.getAddress();
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      const hasAdminRole = await contract.hasRole(adminRole, userAddress);
      
      // Per ora assumiamo che se ha il ruolo admin può fare tutto
      // In un contratto reale potrebbero esserci ruoli specifici per mint/burn
      console.log("User has admin role:", hasAdminRole);
      
      return { hasAdminRole, hasMinterRole: hasAdminRole };
    } catch (err) {
      console.error('Errore nel controllo dei ruoli:', err);
      return { hasAdminRole: false, hasMinterRole: false };
    }
  };

  const loadContractData = async () => {
    if (!contract || !signer) return;

    setIsLoading(true);
    setError(null);

    try {
      // Prima controlla e rimuovi la pausa se necessario
      await checkAndUnpause();

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
    } catch (err) {
      let errorMessage = 'Errore nel caricamento dei dati del contratto: ';
      
      if (err.message.includes('network')) {
        errorMessage = '❌ Errore di rete: Verifica di essere connesso alla rete Polygon Amoy.';
      } else if (err.message.includes('contract')) {
        errorMessage = '❌ Contratto non valido: Verifica l\'indirizzo del contratto.';
      } else if (err.message.includes('permission')) {
        errorMessage = '❌ Permessi insufficienti: Non puoi accedere a questo contratto.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      console.error('Errore nel caricamento:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const mintTokens = async (amount, toAddress) => {
    if (!contract || !signer) {
      throw new Error('Contratto o wallet non connesso');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Controlla i ruoli dell'utente
      const { hasMinterRole } = await checkUserRoles();
      if (!hasMinterRole) {
        throw new Error('Non hai i permessi per fare il mint. Contatta l\'amministratore del contratto.');
      }

      // Controlla e rimuovi la pausa prima del mint
      await checkAndUnpause();

      const amountWei = ethers.parseUnits(amount.toString(), tokenInfo.decimals);
      
      // Stima il gas prima della transazione
      try {
        const gasEstimate = await contract.mint.estimateGas(toAddress, amountWei);
        const gasLimit = gasEstimate * 120n / 100n; // Aggiungi 20% di buffer
        
        console.log(`Gas stimato: ${gasEstimate.toString()}, Gas limit: ${gasLimit.toString()}`);
        
        const tx = await contract.mint(toAddress, amountWei, {
          gasLimit: gasLimit
        });
        
        await tx.wait();
        await loadContractData(); // Ricarica i dati dopo il mint
        
        return tx;
      } catch (gasError) {
        console.log('Errore nella stima del gas, provo con gas limit fisso:', gasError);
        
        // Fallback: usa un gas limit fisso più alto per piccole quantità
        const gasLimit = amount <= 1 ? 500000n : 300000n; // Gas più alto per 1 token o meno
        
        const tx = await contract.mint(toAddress, amountWei, {
          gasLimit: gasLimit
        });
        
        await tx.wait();
        await loadContractData();
        
        return tx;
      }
    } catch (err) {
      let errorMessage = 'Errore nel mint: ';
      
      if (err.code === 'ACTION_REJECTED' || err.message.includes('user rejected')) {
        errorMessage = '❌ Transazione rifiutata: Hai annullato la transazione in MetaMask.';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = '❌ Fondi insufficienti: Non hai abbastanza MATIC per pagare il gas.';
      } else if (err.message.includes('gas')) {
        errorMessage = '❌ Errore gas: Problema con il calcolo del gas. Riprova.';
      } else if (err.message.includes('nonce')) {
        errorMessage = '❌ Errore nonce: Transazione non valida. Riprova.';
      } else if (err.message.includes('network')) {
        errorMessage = '❌ Errore di rete: Verifica di essere connesso alla rete Polygon Amoy.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const burnTokens = async (amount, fromAddress) => {
    if (!contract || !signer) {
      throw new Error('Contratto o wallet non connesso');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Controlla i ruoli dell'utente
      const { hasMinterRole } = await checkUserRoles();
      if (!hasMinterRole) {
        throw new Error('Non hai i permessi per fare il burn. Contatta l\'amministratore del contratto.');
      }

      // Controlla e rimuovi la pausa prima del burn
      await checkAndUnpause();

      const amountWei = ethers.parseUnits(amount.toString(), tokenInfo.decimals);
      
      // Stima il gas prima della transazione
      try {
        const gasEstimate = await contract.burn.estimateGas(fromAddress, amountWei);
        const gasLimit = gasEstimate * 120n / 100n; // Aggiungi 20% di buffer
        
        console.log(`Gas stimato: ${gasEstimate.toString()}, Gas limit: ${gasLimit.toString()}`);
        
        const tx = await contract.burn(fromAddress, amountWei, {
          gasLimit: gasLimit
        });
        
        await tx.wait();
        await loadContractData(); // Ricarica i dati dopo il burn
        
        return tx;
      } catch (gasError) {
        console.log('Errore nella stima del gas, provo con gas limit fisso:', gasError);
        
        // Fallback: usa un gas limit fisso più alto per piccole quantità
        const gasLimit = amount <= 1 ? 500000n : 300000n; // Gas più alto per 1 token o meno
        
        const tx = await contract.burn(fromAddress, amountWei, {
          gasLimit: gasLimit
        });
        
        await tx.wait();
        await loadContractData();
        
        return tx;
      }
    } catch (err) {
      let errorMessage = 'Errore nel burn: ';
      
      if (err.code === 'ACTION_REJECTED' || err.message.includes('user rejected')) {
        errorMessage = '❌ Transazione rifiutata: Hai annullato la transazione in MetaMask.';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = '❌ Fondi insufficienti: Non hai abbastanza MATIC per pagare il gas.';
      } else if (err.message.includes('gas')) {
        errorMessage = '❌ Errore gas: Problema con il calcolo del gas. Riprova.';
      } else if (err.message.includes('nonce')) {
        errorMessage = '❌ Errore nonce: Transazione non valida. Riprova.';
      } else if (err.message.includes('network')) {
        errorMessage = '❌ Errore di rete: Verifica di essere connesso alla rete Polygon Amoy.';
      } else if (err.message.includes('insufficient balance')) {
        errorMessage = '❌ Saldo insufficiente: Non hai abbastanza token da bruciare.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contract && signer) {
      loadContractData();
    }
  }, [contract, signer]);

  return {
    contract,
    totalSupply,
    userBalance,
    tokenInfo,
    isLoading,
    error,
    loadContractData,
    mintTokens,
    burnTokens,
    checkAndUnpause,
    checkUserRoles
  };
};
