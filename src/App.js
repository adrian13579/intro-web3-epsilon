import * as React from 'react';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/WavePortal.json';
//import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  const [currentAccount, setCurrentAccount] = useState('');

  const [message, setMessage] = useState('');

  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = '0x384DDc2523f60eAffa04c70CfBad898758cF54ca';
  const contractABI = abi.abi;

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const waves = await wavePortalContract.getAllWaves();
        console.log('aaaaaaa');
        console.log(waves);

        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        setAllWaves(wavesCleaned);
        wavePortalContract.on('NewWave', (from, timestamp, message) => {
          console.log('NewWave', from, timestamp, message);

          setAllWaves((prevState) => [
            ...prevState,
            {
              address: from,
              timestamp: new Date(timestamp * 1000),
              message: message,
            },
          ]);
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have metamask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);

        await getAllWaves();
      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async (event) => {
    event.preventDefault();
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();

        console.log(message);
        const waveTxn = await wavePortalContract.wave(message, {
          gasLimit: 300000,
        });
        console.log('Mining...', waveTxn.hash);

        await waveTxn.wait();
        console.log('Mined -- ', waveTxn.hash);

        console.log('Retrieved total wave count ...', count.toNumber());
        console.log(allWaves);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleTextAreaChange = async (event) => {
    setMessage(event.target.value);
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    console.log(allWaves);
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Hey there!</div>

        <div className="bio">
          I am Adrian and I think Buildspace is awesome!!!
        </div>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {currentAccount && (
          <form onSubmit={wave}>
            <div>
              <div>
                <label className="label">Message:</label>
              </div>
              <textarea
                className="textArea"
                value={message}
                onChange={handleTextAreaChange}
              />
              <div>
                <button type="submit" className="waveButton">
                  Wave at Me
                </button>
              </div>
            </div>
          </form>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: 'black',
                marginTop: '16px',
                padding: '8px',
                color: 'white',
                textAlign: 'center',
              }}
            >
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
