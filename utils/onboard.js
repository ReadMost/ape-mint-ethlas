import { init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import coinbaseModule from '@web3-onboard/coinbase'


const RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL


const injected = injectedModule()
// const walletConnect = walletConnectModule()
const coinbaseWallet = coinbaseModule()

const initOnboard = init({
  wallets: [coinbaseWallet, injected],
  chains: [
    {
      id: '0x5',
      token: 'gETH',
      label: 'Ethereum Goerli Testnet',
      rpcUrl: RPC_URL
    }
  ],
  appMetadata: {
    name: 'BoredApes',
    description: 'We are some bored apes',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io' },
      { name: 'Coinbase', url: 'https://wallet.coinbase.com/' }
    ],

  }
})

export { initOnboard }
