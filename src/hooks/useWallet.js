import { useState, useEffect } from 'react';
import { ethers } from 'ethers';


// Amoy setup: switch to Amoy and, if the RPC saved in MetaMask is broken, propose a working one
const AMOY = {
  chainId: '0x13882',
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrls: ['https://polygon-amoy-bor-rpc.publicnode.com', 'https://polygon-amoy.drpc.org'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/'],
};
const walletRpcWorks = async () => {
  try {
    await Promise.race([
      window.ethereum.request({ method: 'eth_blockNumber' }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000)),
    ]);
    return true;
  } catch { return false; }
};
// MetaMask rejects addEthereumChain if the symbol differs from the one already saved (POL vs MATIC)
const addAmoy = async () => {
  let lastErr;
  for (const sym of ['POL', 'MATIC']) {
    try {
      await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [{ ...AMOY, nativeCurrency: { name: sym, symbol: sym, decimals: 18 } }] });
      return;
    } catch (e) {
      lastErr = e;
      if (!/symbol/i.test(e?.message || '')) throw e;
    }
  }
  throw lastErr;
};
export const ensureAmoy = async () => {
  if (!window.ethereum) return false;
  let chainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (chainId !== AMOY.chainId) {
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: AMOY.chainId }] });
    } catch (e) {
      const code = e?.data?.originalError?.code ?? e?.code;
      if (code === 4001) return false;
      await addAmoy();
    }
    chainId = await window.ethereum.request({ method: 'eth_chainId' });
  }
  if (chainId === AMOY.chainId && !(await walletRpcWorks())) {
    // Same chainId with a working RPC: MetaMask asks to add/use the new endpoint
    await addAmoy();
  }
  return (await window.ethereum.request({ method: 'eth_chainId' })) === AMOY.chainId && (await walletRpcWorks());
};

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    // Rilevazione più robusta per mobile e desktop
    const isMetaMaskInstalled = () => {
      return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
    };

    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    if (isMetaMaskInstalled()) {
      try {
        setIsConnecting(true);
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          try { await ensureAmoy(); } catch (e) { console.warn('ensureAmoy:', e?.message || e); }
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          
          setAccount(accounts[0]);
          setProvider(provider);
          setSigner(signer);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Errore nella connessione del wallet:', error);
        alert('Errore nella connessione del wallet: ' + error.message);
      } finally {
        setIsConnecting(false);
      }
    } else {
      // Messaggio più dettagliato per mobile
      if (isMobile()) {
        alert('MetaMask non rilevato!\n\nSu mobile:\n1. Apri l\'app MetaMask\n2. Tocca il menu (☰)\n3. Tocca "Browser"\n4. Naviga a questa pagina\n5. Tocca "Connetti"');
      } else {
        alert('MetaMask non è installato!\n\nInstalla MetaMask dal sito ufficiale: https://metamask.io');
      }
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
  };

  const switchToAmoy = async () => {
    try {
      const ok = await ensureAmoy();
      if (!ok) alert('Rete Amoy non attiva o nodo non raggiungibile. Approva le richieste di MetaMask e riprova.');
    } catch (e) {
      const code = e?.data?.originalError?.code ?? e?.code;
      if (code !== 4001) alert('Cambio rete non riuscito: ' + (e?.message || e));
    }
  };

  const addTokenToWallet = async (tokenAddress, tokenSymbol, tokenDecimals, tokenImage) => {
    if (window.ethereum) {
      try {
        // Se il simbolo è "UNK", prova a recuperare il simbolo reale dal contratto
        let actualSymbol = tokenSymbol;
        if (tokenSymbol === 'UNK' && tokenAddress) {
          try {
            console.log('Tentativo di recuperare simbolo reale dal contratto...');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(tokenAddress, ['function symbol() view returns (string)'], provider);
            const realSymbol = await contract.symbol();
            if (realSymbol && realSymbol !== '') {
              actualSymbol = realSymbol;
              console.log('Simbolo reale recuperato:', actualSymbol);
            }
          } catch (err) {
            console.warn('Impossibile recuperare simbolo reale, uso fallback:', err.message);
          }
        }

        const wasAdded = await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: tokenAddress,
              symbol: actualSymbol,
              decimals: tokenDecimals,
              image: tokenImage,
            },
          },
        });

        if (wasAdded) {
          alert(`Token ${actualSymbol} aggiunto con successo al wallet!`);
        } else {
          alert('Token non aggiunto. Riprova.');
        }
      } catch (error) {
        console.error('Errore nell\'aggiunta del token:', error);
        alert('Errore nell\'aggiunta del token: ' + error.message);
      }
    } else {
      alert('MetaMask non è disponibile!');
    }
  };

  useEffect(() => {
    // Inizializza sempre disconnesso
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);

    if (window.ethereum) {
      // Listener per i cambiamenti di account
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            setAccount(accounts[0]);
            setProvider(provider);
            setSigner(signer);
          } catch (error) {
            console.error('Errore nel cambio account:', error);
            disconnectWallet();
          }
        }
      };

      // Listener per i cambiamenti di rete
      const handleChainChanged = (chainId) => {
        console.log('🔄 Rete cambiata:', chainId);
        // Ricarica la pagina per aggiornare tutto
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      // Al caricamento: collega MetaMask e sistema la rete Amoy da solo
      connectWallet();
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return {
    account,
    provider,
    signer,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchToAmoy,
    addTokenToWallet
  };
};
