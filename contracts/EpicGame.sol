// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./libraries/Base64.sol";

contract EpicGame is ERC721 {

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  struct TheBoss {
     string name;
     string imageURI;
     uint hp;
     uint maxHp;
    uint attackDamage;
  }

  TheBoss public theBoss;

  mapping(uint256 => CharacterAttributes) public nftHolderAttributes;
  mapping(address => uint256)public nftOwners;

  event CharacterMinted(address sender, uint256 _tokenId, uint256 characterIndex);
  event AttackComplete(uint newBossHp, uint newPlayerHp);
  
  struct CharacterAttributes {
      uint characterIndex;
      string name;
      string imageURI;
      uint hp;
      uint maxHp;
      uint attackDamage;
      

  }

CharacterAttributes[] defaultCharacters;

  constructor(
    string[] memory characterNames,
    string[] memory characterImageURIs,
    uint[] memory characterHp,
    uint[] memory characterAttackDmg,
    string memory bossName,
    string memory bossImageURI,
    uint bossHp,
    uint bossAttackDmg
  ) 
  ERC721("Heroes","HERO")
  {
     theBoss = TheBoss({
         name:bossName,
         imageURI: bossImageURI,
         hp: bossHp,
         maxHp:bossHp,
         attackDamage: bossAttackDmg

     });
     console.log("Done initializing boss %s w/ HP %s, img %s", theBoss.name, theBoss.hp, theBoss.imageURI);

    for(uint i = 0; i< characterNames.length; i+=1){

        defaultCharacters.push(CharacterAttributes({
           characterIndex:i,
           name : characterNames[i],
           imageURI:characterImageURIs[i],
           hp: characterHp[i],
           maxHp: characterHp[i],
           attackDamage : characterAttackDmg[i]


        }));
      
       CharacterAttributes memory c = defaultCharacters[i];
       
       console.log("Done initializing %s w/ HP %s, img %s", c.name, c.hp, c.imageURI);

    }
    _tokenIds.increment();
  }

  function mintCharacterNFT(uint _characterIndex) external {
    
    uint256 newItemId = _tokenIds.current();

    _safeMint(msg.sender, newItemId); 

    nftHolderAttributes[newItemId] = CharacterAttributes({

      characterIndex:_characterIndex,
      name :    defaultCharacters[_characterIndex].name,
      imageURI: defaultCharacters[_characterIndex].imageURI,
      hp:       defaultCharacters[_characterIndex].hp,
      maxHp:    defaultCharacters[_characterIndex].maxHp,
      attackDamage : defaultCharacters[_characterIndex].attackDamage
    });
  
    console.log("Minted NFT w/ tokenId %s and characterIndex %s", newItemId, _characterIndex);
    
    nftOwners[msg.sender] = newItemId;

    _tokenIds.increment();

    emit CharacterMinted(msg.sender, newItemId, _characterIndex);
  }

  function tokenURI(uint256 _tokenId) public view override returns(string memory) {

     CharacterAttributes memory charAttributes = nftHolderAttributes[_tokenId];

     string memory strHp = Strings.toString(charAttributes.hp);
     string memory strMaxHp = Strings.toString(charAttributes.maxHp);
     string memory strAttackDamage = Strings.toString(charAttributes.attackDamage);

     string memory json = Base64.encode(
    abi.encodePacked(
      '{"name": "',
      charAttributes.name,
      ' -- NFT #: ',
      Strings.toString(_tokenId),
      '", "description": "This is an NFT that lets people play in the game Metaverse Slayer!", "image": "',
      charAttributes.imageURI,
      '", "attributes": [ { "trait_type": "Health Points", "value": ',strHp,', "max_value":',strMaxHp,'}, { "trait_type": "Attack Damage", "value": ',
      strAttackDamage,'} ]}'
    )
  );

  string memory output = string(
    abi.encodePacked("data:application/json;base64,", json)
  );
  
  return output;

  }

  function attackBoss() public {
    uint256 tokenIdOfPlayer = nftOwners[msg.sender];

    CharacterAttributes storage player = nftHolderAttributes[tokenIdOfPlayer];

    console.log("\nPlayer w/ character %s about to attack. Has %s HP and %s AD", player.name, player.hp, player.attackDamage);
    console.log("Boss %s has %s HP and %s AD", theBoss.name, theBoss.hp, theBoss.attackDamage);

    require(
     player.hp > 0,
     "Error: Hero is history"

    );

    require(
      theBoss.hp> 0,
      "Error: Boss is History."
    );

    if(theBoss.hp < player.attackDamage){
      theBoss.hp = 0;
    } else{
      theBoss.hp = theBoss.hp - player.attackDamage;
    }

    if(theBoss.attackDamage > player.hp){

      player.hp = 0;

    }else{
      player.hp = player.hp - theBoss.attackDamage;
    }

  console.log("Player attacked boss. New boss hp: %s", theBoss.hp);
  console.log("Boss attacked player. New player hp: %s\n", player.hp);

  emit AttackComplete(theBoss.hp, player.hp);
  }

  function checkIfUserHasNFT() public view returns(CharacterAttributes memory) {

    uint256 userNftTokenId = nftOwners[msg.sender];

    if(userNftTokenId >0) {
      return nftHolderAttributes[userNftTokenId];
    } else{
      CharacterAttributes memory emptyStruct;
      return emptyStruct;
    }
  }

  function getAllDefaultCharacters() public view returns(CharacterAttributes[] memory) {
    return defaultCharacters;
  }

  function getTheBoss() public view returns(TheBoss memory) {
    return theBoss;
  }
}