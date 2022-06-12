import React from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import SelectCharacter from './Components/SelectCharacter'; 
import EpicGame from './utils/EpicGame.json';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import { ethers } from 'ethers';
import Arena from './Components/Arena';


// Constants
const TWITTER_HANDLE = '0xManujaya';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  const [currentAcc, setCurrentAcc] = useState(null);
  const [characterNFT , setCharacterNFT] = useState(null);
  

  const checkIfWalletIsConnected = async () => {
    try{
      const {ethereum} = window;

     if(!ethereum){
       console.log("connect metamask");
       
     } else {
       console.log("we have the eth object", ethereum);
    } 
     
    const accounts  = await ethereum.request( {method:'eth_accounts'});
    
    if(accounts.length !== 0){
      const account = accounts[0];

    }else {
      console.log("you have no fucking accs") 
    }
  
  } catch(err){
    console.log(err);
  }

  
  };

  const connectWalletAction = async() =>{
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
      setCurrentAcc(accounts[0]);

    } catch (error) {
      console.log(error);
    }
    
  };
  const checkNetwork = async () => {
        try{
          if (window.ethereum.networkVersion !== "4") 
          alert("pls connect to rinkeby")
        }catch(err){
         console.log(err)
        }
  }
  
  useEffect(() => {
    checkIfWalletIsConnected();
    checkNetwork();
    
  }, []);

  useEffect(() => {
    /*
     * The function we will call that interacts with out smart contract
     */
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAcc);
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        EpicGame.abi,
        signer
      );
  
      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
        
      } else {
        console.log('No character NFT found');
      }
    };
    
     
    /*
     * We only want to run this, if we have a connected wallet
     */
    if (currentAcc) {
      console.log('CurrentAccount:', currentAcc);
      fetchNFTMetadata();
    }
  }, [currentAcc]);

  const renderContent = () =>{
    
    
  
    if(!currentAcc){
       return(

        <div className="connect-wallet-container">
            <img
              src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
              alt="Monty Python Gif"
            />
              <button
              className="cta-button connect-wallet-button"
              onClick={connectWalletAction}
            >
              Connect Wallet To Get Started
            </button>
          </div>
       )   
    } else if(currentAcc && !characterNFT){
      return <SelectCharacter setCharacterNFT = {setCharacterNFT}/>
    } else if(currentAcc && characterNFT){
      return <Arena characterNFT ={characterNFT} setCharacterNFT={setCharacterNFT}/>
    }
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Metaverse Slayer ⚔️</p>
          <p className="sub-text">Team up to protect the Metaverse!</p>
          
        </div>
        {renderContent()}
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
