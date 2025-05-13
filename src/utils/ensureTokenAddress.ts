import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

/**
 * Belirtilen cüzdan için ATA varsa döner, yoksa oluşturur
 */
export async function ensureTokenAccount({
  connection,
  mint,
  owner,
  payer,
  signer,
}: {
  connection: Connection;
  mint: PublicKey;
  owner: PublicKey;
  payer: PublicKey;
  signer: Keypair;
}): Promise<PublicKey> {
  const ata = await getAssociatedTokenAddress(mint, owner);
  const accountInfo = await connection.getAccountInfo(ata);

  if (accountInfo === null) {
    console.warn(`[⚙️] Creating ATA for ${mint.toBase58()}`);

    const TOKEN_PROGRAM_ID = new PublicKey(
      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    );
    const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
      "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
    );

    const ix = createAssociatedTokenAccountInstruction(
      payer,
      ata,
      owner,
      mint,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const tx = new Transaction().add(ix);
    await sendAndConfirmTransaction(connection, tx, [signer]);
  } else {
    console.log(`[✅] ATA already exists for ${mint.toBase58()}`);
  }

  return ata;
}
