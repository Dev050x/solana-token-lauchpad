"use client"

import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  createMintToInstruction,
  createInitializeMetadataPointerInstruction,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  createInitializeInstruction,
  getMintLen,
  TYPE_SIZE,
  LENGTH_SIZE,
  ExtensionType,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token"
import { pack } from "@solana/spl-token-metadata"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js"

export function TokenLaunchpad() {
  const wallet = useWallet()
  const { connection } = useConnection()

  async function creteToken() {
    console.log("creating a token")
    if (!wallet.publicKey || !connection) {
      alert("connect wallet first")
      return;
    }

    const name = document.getElementById("name").value
    const symbol = document.getElementById("symbol").value
    const supply = document.getElementById("supply").value
    if(!name || !symbol || isNaN(supply) || supply <= 0){
        alert("Plese give name , symbol , supply Properly");
        return;
    }

    //for createmint
    const keyPair = Keypair.generate()
    const programId = TOKEN_2022_PROGRAM_ID
    const decimals = 9

    //input value
    
    const uri = `https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/spl-token.json`

    const metadata = {
      mint: keyPair.publicKey,
      name: name,
      symbol: symbol,
      uri: uri,
      additionalMetadata: [],
    }

    const mintLen = getMintLen([ExtensionType.MetadataPointer])
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen)

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: keyPair.publicKey,
        space: mintLen,
        lamports,
        programId,
      }),
      createInitializeMetadataPointerInstruction(
        keyPair.publicKey,
        wallet.publicKey,
        keyPair.publicKey,
        TOKEN_2022_PROGRAM_ID,
      ),
      createInitializeMintInstruction(keyPair.publicKey, decimals, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        metadata: keyPair.publicKey,
        updateAuthority: wallet.publicKey,
        mint: keyPair.publicKey,
        mintAuthority: wallet.publicKey,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
      }),
    )

    transaction.feePayer = wallet.publicKey
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    transaction.partialSign(keyPair)
    console.log("instruction 1 created succefully now sending txn1")

    const sign = await wallet.sendTransaction(transaction, connection)
    console.log("token created succesfully...", sign)

    const asscociatedToken = getAssociatedTokenAddressSync(
      keyPair.publicKey,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    )
    const transaction2 = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        asscociatedToken,
        wallet.publicKey,
        keyPair.publicKey,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    )
    const sig2 = await wallet.sendTransaction(transaction2, connection)
    console.log("creating accont for the token mint (ast): ,", sig2)

    const transaction3 = new Transaction().add(
      createMintToInstruction(
        keyPair.publicKey,
        asscociatedToken,
        wallet.publicKey,
        supply * LAMPORTS_PER_SOL,
        [],
        TOKEN_2022_PROGRAM_ID,
      ),
    )
    const sig3 = await wallet.sendTransaction(transaction3, connection)
    console.log("minting token to your account", sig3)
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="w-full max-w-2xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-6">
            <span className="text-white text-3xl">🚀</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Solana Token Launchpad
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Create and deploy your own SPL tokens on Solana with just a few clicks
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center space-x-3 mb-8">
            <span className="text-2xl">💰</span>
            <h2 className="text-2xl font-semibold text-white">Token Configuration</h2>
          </div>

          <div className="space-y-6">
            {/* Token Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Token Name</label>
              <input
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 inputText"
                type="text"
                placeholder="Name"
                id="name"
              />
            </div>

            {/* Token Symbol */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Token Symbol</label>
              <input
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 inputText"
                type="text"
                placeholder="Symbol"
                id="symbol"
              />
            </div>

            {/* Initial Supply */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Initial Supply</label>
              <input
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 inputText"
                type="text"
                placeholder="Initial Supply"
                id="supply"
              />
            </div>

            {/* Create Button */}
            <button
              className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2 btn"
              onClick={creteToken}
            >
              <span className="text-xl">⚡</span>
              <span>Create a token</span>
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-400 text-sm">Deploy tokens in seconds on Solana's blockchain</p>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">💰</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Low Cost</h3>
            <p className="text-gray-400 text-sm">Minimal fees thanks to Solana's efficiency</p>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">🚀</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Easy Launch</h3>
            <p className="text-gray-400 text-sm">No coding required - just fill and launch</p>
          </div>
        </div>
      </div>
    </div>
  )
}
