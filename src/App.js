import React, { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import './App.css';

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState(0);
  const [donationAmount, setDonationAmount] = useState('0.1');

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(acc => setAccounts(acc))
        .catch(error => console.error("Error requesting accounts:", error));
    } else {
      console.log('Please install MetaMask!');
    }
  }, []);

  const updateBalance = useCallback(() => {
    if (web3 && contract) {
      contract.methods.getBalance().call()
        .then(balance => setBalance(web3.utils.fromWei(balance, 'ether')))
        .catch(error => console.error("Error getting balance:", error));
    }
  }, [web3, contract]);

  useEffect(() => {
    if (web3 && accounts.length > 0) {
      const contractInstance = new web3.eth.Contract(
        // Corrected ABI array
        [
          {
            "inputs": [],
            "name": "donate",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
          },
          {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
          },
          {
            "stateMutability": "payable",
            "type": "fallback"
          },
          {
            "stateMutability": "payable",
            "type": "receive"
          },
          {
            "inputs": [],
            "name": "getBalance",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "owner",
            "outputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          } 
        ],
        '0x86c14A592239922f2faC538D287453F33E1eAF7A'
      );
      setContract(contractInstance);
      updateBalance();
    }
  }, [web3, accounts, updateBalance]);

  function handleDonate() {
    if (contract && web3) {
      contract.methods.donate().send({
        from: accounts[0],
        value: web3.utils.toWei(donationAmount, 'ether')
      })
      .then(() => updateBalance())
      .catch(error => console.error("Error making donation:", error));
    }
  }

  return (
    <div>
      <h1>Make Donation!!</h1>
      <p>Total Donated: {balance} ETH</p>
      <input
        type="text"
        value={donationAmount}
        onChange={(e) => setDonationAmount(e.target.value)}
      />
      <button onClick={handleDonate}>Donate</button>
    </div>
  );
}

export default App;
