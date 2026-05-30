require("dotenv").config();
const { Connection, PublicKey } = require("@solana/web3.js");

const connection = new Connection(process.env.RPC_URL, "confirmed");

const PUMPFUN_PROGRAM = new PublicKey(
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
);

console.log("Waiting for transaction...");

connection.onLogs(
  PUMPFUN_PROGRAM,
  async (logs) => {
    try {
      const tx = await connection.getParsedTransaction(
        logs.signature,
        {
          maxSupportedTransactionVersion: 0
        }
      );

      if (!tx) return;

      console.log("\n====================");
console.log("Signature:", logs.signature);

tx.transaction.message.instructions.forEach((ix, index) => {
  console.log(`\nInstruction ${index}:`);
  console.log(ix);
});

process.exit(0);

    } catch (e) {
      console.error(e);
    }
  },
  "confirmed"
);