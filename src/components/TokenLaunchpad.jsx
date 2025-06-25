
import { MINT_SIZE, TOKEN_PROGRAM_ID, createInitializeMint2Instruction, getMinimumBalanceForRentExemptMint } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";


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