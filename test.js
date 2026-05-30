require("dotenv").config();

const { Connection } = require("@solana/web3.js");

const connection = new Connection(process.env.RPC_URL);

async function test() {
    try {
        const slot = await connection.getSlot();
        console.log("Connected!");
        console.log("Current Slot:", slot);
    } catch (err) {
        console.error(err);
    }
}

test();