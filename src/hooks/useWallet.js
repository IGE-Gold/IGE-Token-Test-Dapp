import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
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
      alert('MetaMask non è installato!');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
  };

  const switchToAmoy = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13882' }], // Amoy Testnet
        });
      } catch (switchError) {
        // Se la rete non è aggiunta, aggiungila
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x13882',
                chainName: 'Polygon Amoy Testnet',
                rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://amoy.polygonscan.com/'],
              }],
            });
          } catch (addError) {
            console.error('Errore nell\'aggiunta della rete:', addError);
          }
        }
      }
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

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
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
    switchToAmoy
  };
};
