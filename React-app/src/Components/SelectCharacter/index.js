import React from 'react';
import { useEffect, useState } from 'react';  
import "./SelectCharacter.css"; 
import EpicGame from '../../utils/EpicGame.json';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import { ethers } from 'ethers';

const SelectCharacter = ({ setCharacterNFT }) =>{
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);

  const mintCharacterNFTAction = (characterId) => async() =>{
    try{
      if(gameContract){
        console.log('Minting character in progress...');

        const  mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();
        console.log('mintTxn:', mintTxn);
      }

    }catch(err){
      console.warn('MintCharacterAction Error:', err);
    }
  }
 
   useEffect(()=>{
     const {ethereum} = window;
      
     if(ethereum){
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        EpicGame.abi,
        signer
      );
      setGameContract(gameContract);
     }else{
       console.log("eth object not found")
     }
    
   },[])

   useEffect(() => {
    const getCharacters = async () => {
      try {
        console.log('Getting contract characters to mint');
  
        const charactersTxn = await gameContract.getAllDefaultCharacters();
        console.log('charactersTxn:', charactersTxn);
  
        const characters = charactersTxn.map((characterData) =>
          transformCharacterData(characterData)
        );
  
        setCharacters(characters);
      } catch (error) {
        console.error('Something went wrong fetching characters:', error);
      }
    };
  
    /*
     * Add a callback method that will fire when this event is received
     */
    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      );
      alert(`Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${gameContract}/${tokenId.toNumber()}`)
      /*
       * Once our character NFT is minted we can fetch the metadata from our contract
       * and set it in state to move onto the Arena
       */
      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT();
        console.log('CharacterNFT: ', characterNFT);
        setCharacterNFT(transformCharacterData(characterNFT));
      }
    };
  
    if (gameContract) {
      getCharacters();
  
      /*
       * Setup NFT Minted Listener
       */
      gameContract.on('CharacterMinted', onCharacterMint);
    }
  
    return () => {
      /*
       * When your component unmounts, let;s make sure to clean up this listener
       */
      if (gameContract) {
        gameContract.off('CharacterMinted', onCharacterMint);
      }
    };
  }, [gameContract]);

   const renderCharacters = () =>
   characters.map((character, index) => (
       <div className="character-item" key={character.name}>
        <div className="name-container">
         <p>{character.name}</p>
      </div>
      <img src={character.imageURI} alt={character.name} />
   <button
     type="button"
     className="character-mint-button"
     onClick={mintCharacterNFTAction(index)}
     >{`Mint ${character.name}`}</button>
  </div>
));
    
 return(
    <div className="select-character-container">
    <h2>Mint Your Hero. Choose wisely.</h2>
    {characters.length > 0 && (
      <div className="character-grid">{renderCharacters()}</div>
    )}
   
  </div>
 );
}

export default SelectCharacter;