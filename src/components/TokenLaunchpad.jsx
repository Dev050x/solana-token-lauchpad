
import { MINT_SIZE, TOKEN_PROGRAM_ID, createInitializeMint2Instruction, getMinimumBalanceForRentExemptMint , createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, createMintToInstruction } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";


export function TokenLaunchpad() {
    const wallet = useWallet();
    const {connection} = useConnection();

    async function creteToken(){
        console.log("creating a token");
        if(!wallet.publicKey || !connection){
            alert("connect wallet first");
        }
        

        const lamports = await getMinimumBalanceForRentExemptMint(connection);
        const keyPair = Keypair.generate();
        const programId = TOKEN_PROGRAM_ID;
        const decimals = 9;
        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: keyPair.publicKey,
                space: MINT_SIZE,
                lamports,
                programId,
            }),
            createInitializeMint2Instruction(keyPair.publicKey, decimals, wallet.publicKey, wallet.publicKey, programId),
        );
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(keyPair);

        const sign = await wallet.sendTransaction(transaction,connection);
        console.log("token created succesfully...",sign);
        
        const asscociatedToken = getAssociatedTokenAddressSync(keyPair.publicKey,wallet.publicKey,TOKEN_PROGRAM_ID);
        const transaction2 = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                asscociatedToken,
                wallet.publicKey,
                keyPair.publicKey,
                TOKEN_PROGRAM_ID
            )
        )
        const sig2 = await wallet.sendTransaction(transaction2,connection);
        console.log("creating accont for the token mint (ast): ,",sig2);

        const transaction3 = new Transaction().add(
            createMintToInstruction(keyPair.publicKey,asscociatedToken,wallet.publicKey,1*LAMPORTS_PER_SOL,[],TOKEN_PROGRAM_ID),
        )
        const sig3 = await wallet.sendTransaction(transaction3,connection);
        console.log("minting token to your account",sig3);

    }

    return  <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    }}>
        <h1>Solana Token Launchpad</h1>
        <input className='inputText' type='text' placeholder='Name' id="name"></input> <br />
        <input className='inputText' type='text' placeholder='Symbol' id="symbol"></input> <br />
        <input className='inputText' type='text' placeholder='Image URL' id="imageUrl"></input> <br />
        <input className='inputText' type='text' placeholder='Initial Supply' id="supply"></input> <br />
        <button className='btn' onClick={creteToken}>Create a token</button>
    </div>
}