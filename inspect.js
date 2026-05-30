require("dotenv").config();
const { Connection, PublicKey } = require("@solana/web3.js");

const connection = new Connection(
    process.env.RPC_URL,
    "confirmed"
);

const PUMPFUN_PROGRAM = new PublicKey(
    "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
);

console.log("Waiting for candidate tx...");

connection.onLogs(
    PUMPFUN_PROGRAM,
    async (logs) => {

        try {

            const tx =
                await connection.getTransaction(
                    logs.signature,
                    {
                        maxSupportedTransactionVersion: 0
                    }
                );

            if (!tx) return;

            console.log("\n====================");
console.log("Signature:", logs.signature);

console.log("\nRAW LOGS:");

logs.logs.forEach(log => {
    console.log(log);
});

           const keys = tx.transaction.message.staticAccountKeys;

tx.transaction.message.compiledInstructions.forEach((ix, i) => {

    console.log(`\n========== Instruction ${i} ==========`);

    console.log(
        "Program:",
        keys[ix.programIdIndex]?.toString()
    );

    console.log(
        "Accounts:"
    );

    ix.accountKeyIndexes.forEach(idx => {
        console.log(
            idx,
            keys[idx]?.toString()
        );
    });

    console.log(
        "Data:",
        ix.data
    );

});

process.exit(0);

        } catch (err) {
            console.error(err);
        }

    },
    "confirmed"
);