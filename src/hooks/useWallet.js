import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

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
    console.log('🔄 switchToAmoy chiamata');
    
    if (!window.ethereum) {
      console.error('❌ MetaMask non è installato');
      alert('MetaMask non è installato!');
      return;
    }

    const amoyChainId = '0x13882';
    const amoyNetwork = {
      chainId: amoyChainId,
      chainName: 'Polygon Amoy Testnet',
      nativeCurrency: {
        name: 'POL',
        symbol: 'POL',
        decimals: 18,
      },
      rpcUrls: ['https://rpc-amoy.polygon.technology/'],
      blockExplorerUrls: ['https://amoy.polygonscan.com/'],
    };

    try {
      // Prima controlla la rete corrente
      console.log('🔍 Controllo rete corrente...');
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('📍 Rete corrente:', currentChainId);
      
      // Mappa delle reti conosciute per debug
      const networkNames = {
        '0x1': 'Ethereum Mainnet',
        '0x2105': 'Base Mainnet', 
        '0x13882': 'Polygon Amoy Testnet',
        '0x89': 'Polygon Mainnet'
      };
      
      const currentNetworkName = networkNames[currentChainId] || `Rete sconosciuta (${currentChainId})`;
      console.log('🌐 Nome rete corrente:', currentNetworkName);
      
      if (currentChainId === amoyChainId) {
        console.log('✅ Sei già connesso alla rete Amoy');
        alert('Sei già connesso alla rete Amoy: per vedere il token seleziona su Metamask la rete Polygon Amoy Testnet su Custom Network');
        return;
      }
      
      // Mostra avviso se non sei su Amoy
      console.log(`⚠️ Sei su ${currentNetworkName}, devi passare a Polygon Amoy Testnet`);

      // Prova a passare alla rete Amoy
      console.log('🔄 Tentativo di passaggio alla rete Amoy...');
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: amoyChainId }],
      });
      console.log('✅ Passato con successo alla rete Amoy');
      alert('Passato con successo alla rete Amoy!');
      
    } catch (switchError) {
      console.log('❌ Errore nel passaggio alla rete:', switchError);
      
      // Se la rete non è configurata (codice 4902), aggiungila
      if (switchError.code === 4902) {
        try {
          console.log('➕ Rete Amoy non configurata, aggiungendo...');
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [amoyNetwork],
          });
          console.log('✅ Rete Amoy aggiunta con successo');
          
          // Aspetta un momento per assicurarsi che la rete sia stata aggiunta
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Dopo aver aggiunto la rete, passa ad essa con più tentativi
          let switchSuccess = false;
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              console.log(`🔄 Tentativo ${attempt}/3 di passaggio alla rete appena aggiunta...`);
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: amoyChainId }],
              });
              console.log('✅ Passato con successo alla rete Amoy dopo l\'aggiunta');
              alert('Rete Amoy aggiunta e passaggio completato! Ora puoi vedere il tuo saldo.');
              switchSuccess = true;
              break;
            } catch (retryError) {
              console.warn(`⚠️ Tentativo ${attempt} fallito:`, retryError.message);
              if (attempt < 3) {
                // Aspetta prima del prossimo tentativo
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            }
          }
          
          if (!switchSuccess) {
            console.error('❌ Tutti i tentativi di passaggio sono falliti');
            alert(`⚠️ RETE AGGIUNTA MA NON CAMBIATA!\n\nLa rete Polygon Amoy è stata aggiunta a MetaMask, ma il passaggio automatico è fallito.\n\n🔧 AZIONE RICHIESTA:\n1. Apri MetaMask\n2. Clicca sulla rete corrente (${currentNetworkName})\n3. Seleziona "Polygon Amoy Testnet"\n4. Torna qui per vedere il tuo saldo\n\nUna volta cambiata la rete, la pagina si aggiornerà automaticamente.`);
          }
        } catch (addError) {
          console.error('❌ Errore nell\'aggiunta della rete:', addError);
          alert('Errore nell\'aggiunta della rete Amoy: ' + addError.message);
        }
      } else if (switchError.code === 4001) {
        console.log('🚫 Operazione annullata dall\'utente');
        alert('Operazione annullata dall\'utente');
      } else {
        console.error('❌ Errore sconosciuto:', switchError);
        alert(`⚠️ IMPOSSIBILE CAMBIARE RETE AUTOMATICAMENTE!\n\nErrore: ${switchError.message}\n\n🔧 AZIONE RICHIESTA:\n1. Apri MetaMask\n2. Clicca sulla rete corrente (${currentNetworkName})\n3. Seleziona "Polygon Amoy Testnet"\n4. Torna qui per vedere il tuo saldo\n\nUna volta cambiata la rete, la pagina si aggiornerà automaticamente.`);
      }
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
