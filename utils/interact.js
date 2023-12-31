const { createAlchemyWeb3 } = require('@alch/alchemy-web3')
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
const whitelist = require('../scripts/whitelist.js')

const web3 = createAlchemyWeb3(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL)
import { config } from '../dapp.config'

const contract = require('../artifacts/contracts/BoredApe.sol/BoredApe.json')
const nftContract = new web3.eth.Contract(contract.abi, config.contractAddress)

// Calculate merkle root from the whitelist array
const leafNodes = whitelist.map((addr) => keccak256(addr))
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
const root = merkleTree.getRoot()

export const getTotalMinted = async () => {
  const totalMinted = await nftContract.methods.totalSupply().call()
  return totalMinted
}

export const getMaxSupply = async () => {
  const maxSupply = await nftContract.methods.maxSupply().call()
  return maxSupply
}

export const isPausedState = async () => {
  const paused = await nftContract.methods.paused().call()
  return paused
}

export const isPublicSaleState = async () => {
  const publicSale = await nftContract.methods.publicM().call()
  return publicSale
}

export const isPreSaleState = async () => {
  const preSale = await nftContract.methods.presaleM().call()
  return preSale
}

export const getPrice = async () => {
  const price = await nftContract.methods.price().call()
  return price
}


export const publicMint = async (mintAmount) => {
  if (!window.ethereum.selectedAddress) {
    return {
      success: false,
      status: 'To be able to mint, you need to connect your wallet'
    }
  }

  const nonce = await web3.eth.getTransactionCount(
    window.ethereum.selectedAddress,
    'latest'
  )

  // Set up our Ethereum transaction
  const buyPrice = parseInt(
    web3.utils.toWei(String(config.price * mintAmount), 'ether')
  ).toString(16)
  const tx = {
    to: config.contractAddress,
    from: window.ethereum.selectedAddress,
    value: buyPrice, // hex
    data: nftContract.methods.publicSaleMint(mintAmount).encodeABI(),
    nonce: nonce.toString(16)
  }


  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })

    // save receipt
    const postData = {
      user: window.ethereum.selectedAddress,
      price: buyPrice,
      amount: mintAmount,
      token_id: "1",
      tx_hash: txHash
    };
    fetch("https://api.ethlas.readmost.kz/v1/receipt/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(postData)
    })
      .then(response => response.json())
      .then(data => {
        console.log("POST request successful:", data);
      })
      .catch(error => {
        console.error("Error sending POST request:", error);
      });

    return {
      success: true,
      status: (
        <a href={`https://goerli.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
          <p>✅ WOW, congrats with Ethlas mint. Check out your tx on Etherscan:</p>
          <p>{`https://goerli.etherscan.io/tx/${txHash}`}</p>
        </a>
      )
    }
  } catch (error) {
    return {
      success: false,
      status: '😞 Smth went wrong:' + error.message
    }
  }
}
