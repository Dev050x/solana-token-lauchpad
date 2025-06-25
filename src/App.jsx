import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import "./App.css"
import { TokenLaunchpad } from "./components/TokenLaunchpad"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import "@solana/wallet-adapter-react-ui/styles.css"

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
        <WalletProvider wallets={[]}>
          <WalletModalProvider>
            <div className="container mx-auto px-4 py-8">
              <header className="flex justify-between items-center mb-12">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">S</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white">Solana LaunchPad</h1>
                </div>
                <div className="wallet-button">
                  <WalletMultiButton />
                </div>
              </header>
              <TokenLaunchpad />
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  )
}

export default App
