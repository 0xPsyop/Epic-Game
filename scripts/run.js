

const main = async() =>{

    const gameContractFactory = await hre.ethers.getContractFactory('EpicGame');
    const gameContract = await gameContractFactory.deploy(
        ["Doge", "Pepe", "Pikachu"],       // Names
        ["https://i.imgur.com/LjjNk4i.jpeg", // Images
        "https://i.imgur.com/8nLFCVP.png", 
        "https://i.imgur.com/WMB6g9u.png"],
        [250,400,150],                    // HP values
        [100, 25, 50] ,          //Attack values
        "Giga Chad",
        "https://i.imgur.com/5BQHDzh.jpeg",
        6900,
        42
    );
    await gameContract.deployed();

    console.log("Deployed too", gameContract.address);

  let txn;
  txn = await gameContract.mintCharacterNFT(0);
  await txn.wait();
  console.log("Minted NFT #1");

  txn = await gameContract.attackBoss();
  await txn.wait();

  txn = await gameContract.attackBoss();
  await txn.wait();
    
    let returnedTokenUri = await gameContract.tokenURI(1);
    console.log("Token URI:", returnedTokenUri);


}

const runMain = async() => {
  
    try{
        await main();
        process.exit(0);

    }catch(err){
        console.log(err);
        process.exit(1);
    }
}

runMain();