import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import './App.css'
import { TokenLaunchpad } from './components/TokenLaunchpad'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import "@solana/wallet-adapter-react-ui/styles.css";


function App() {
    return (
      <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
        <WalletProvider wallets={[]}>
          <WalletModalProvider>
            <WalletMultiButton />
            <TokenLaunchpad></TokenLaunchpad>
            </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    )
}

export default App
