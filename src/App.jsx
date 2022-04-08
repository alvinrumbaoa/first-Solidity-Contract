import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";
import MessageForm from "./components/Form";
import  './App.css'

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [waveCount, setWaveCount] = useState(0);
  const [allWaves, setAllWaves] = useState([]);

  const contractAddress = "0x3D25526af673Cae1854C6fc5e42104d7baBa00aa";
  const contractABI = abi.abi;

  const buttonClassNames = [
    'cursor-pointer',
    'p-2',
    'mt-4',
    'border-0',
    'rounded',
    'bg-cyan-400',
    'text-slate-900',
    'font-semibold',
    'hover:bg-cyan-500'
  ].join(' ');

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const wavePortalContract = getContract();

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          };
        });

        setAllWaves(wavesCleaned.reverse());
      } else {
        console.log("Ethereum object not found");
      }
    } catch (error) {
      console.error(error);
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have Metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      // Check if we're authorized to access the user's wallet
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);

        let count = await getWaves();
        setWaveCount(count);

        await getAllWaves();

        const wavePortalContract = getContract();
        wavePortalContract.on("NewWave", onNewWave);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.error(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  }

  const getContract = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
  }

  const getWaves = async () => {
    const wavePortalContract = getContract();
    const waves = await wavePortalContract.getTotalWaves();
    return waves.toNumber();
  }

  const wave = async (message) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const wavePortalContract = getContract();

        const waveTxn = await wavePortalContract.wave(message,);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        let count = await getWaves();
        setWaveCount(count);

        await getAllWaves();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.error(error);
    }
  }

  const onNewWave = (from, timestamp, message) => {
    console.log("New wave: ", from, timestamp, message);
    setAllWaves(prevState => [
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message
      }, ...prevState
    ]);
  }

  useEffect(() => {
    checkIfWalletIsConnected();

    return () => {
      const contract = getContract();
      if (contract) contract.off('NewWave', onNewWave);
    }
  }, []);

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div  className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          My Name is Alvin, Designer, Developer and Creator of NFT Rizal Nice to meet you! Feel free to connect with me, i'm building a little app c/o @buildspace as Introduction and Entering on Web3 world
        </div>

        <div className="noOfWaves">
          <h1>Total waves: {waveCount}</h1>  
        </div>

        <MessageForm btnStyle={buttonClassNames} comment={wave} />

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{  textAlign: "center",justifyContent: "center" ,backgroundColor: "OldLace", marginTop: "16px", padding: "8px" , borderRadius: "20px"}}>
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