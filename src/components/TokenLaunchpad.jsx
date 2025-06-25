
import { MINT_SIZE, getMinimumBalanceForRentExemptMint , createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, createMintToInstruction, createInitializeMetadataPointerInstruction, TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, createInitializeInstruction, getMintLen, TYPE_SIZE, LENGTH_SIZE, ExtensionType, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { pack } from "@solana/spl-token-metadata";
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

        //for createmint
        const keyPair = Keypair.generate();
        const programId = TOKEN_2022_PROGRAM_ID;
        const decimals = 9;

        //input value
        const name = document.getElementById("name").value;
        const symbol = document.getElementById("symbol").value;
        const supply = document.getElementById("supply").value;
        const id = Math.floor(Math.random() * 1000) + 1;
        const uri = `https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/spl-token.json`;

        const metadata = {
            mint: keyPair.publicKey,
            name: name,
            symbol: symbol  ,
            uri: uri,
            additionalMetadata: [],
        };

        const mintLen = getMintLen([ExtensionType.MetadataPointer]);
        const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen+metadataLen); 

        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: keyPair.publicKey,
                space: mintLen,
                lamports,
                programId,
            }),
            createInitializeMetadataPointerInstruction(keyPair.publicKey , wallet.publicKey ,keyPair.publicKey, TOKEN_2022_PROGRAM_ID),
            createInitializeMintInstruction(keyPair.publicKey,decimals,wallet.publicKey,null,TOKEN_2022_PROGRAM_ID),
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
        );



        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(keyPair);
        console.log("instruction 1 created succefully now sending txn1");

        const sign = await wallet.sendTransaction(transaction,connection);
        console.log("token created succesfully...",sign);
        


        const asscociatedToken = getAssociatedTokenAddressSync(keyPair.publicKey,wallet.publicKey,false,TOKEN_2022_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID);
        const transaction2 = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                asscociatedToken,
                wallet.publicKey,
                keyPair.publicKey,
                TOKEN_2022_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )
        )
        const sig2 = await wallet.sendTransaction(transaction2,connection);
        console.log("creating accont for the token mint (ast): ,",sig2);

        const transaction3 = new Transaction().add(
            createMintToInstruction(keyPair.publicKey,asscociatedToken,wallet.publicKey,supply * LAMPORTS_PER_SOL,[],TOKEN_2022_PROGRAM_ID),
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
        <input className='inputText' type='text' placeholder='Initial Supply' id="supply"></input> <br />
        <button className='btn' onClick={creteToken}>Create a token</button>
    </div>
}