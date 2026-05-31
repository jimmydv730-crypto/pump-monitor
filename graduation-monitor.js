process.on("uncaughtException", (err) => {
    console.error(
        "UNCAUGHT EXCEPTION:",
        err
    );
});

process.on("unhandledRejection", (err) => {
    console.error(
        "UNHANDLED REJECTION:",
        err
    );
});
const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Pump Monitor Running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
require("dotenv").config();

const axios = require("axios");
const { db, dbGet } = require("./db");
const sendAlert = require("./alert");

const API_KEY = process.env.MORALIS_API_KEY;

async function getTokenMetadata(mint) {
      console.log(
        "Calling metadata API:",
        mint
    );
    try {
        const response = await axios.get(
    `https://solana-gateway.moralis.io/token/mainnet/${mint}/metadata`,
    {
        headers: {
            "X-API-Key": API_KEY
        },
        timeout: 10000
    }
);

        return response.data;
    } catch (err) {
        console.error(
    "Metadata error:",
    mint,
    err.message
);

return {
    marketCap: 0,
    fullyDilutedValue: 0
};
    }
}

async function getGraduatedCoins() {
    try {

        const response = await axios.get(
    "https://solana-gateway.moralis.io/token/mainnet/exchange/pumpfun/graduated",
    {
        headers: {
            "X-API-Key": API_KEY
        },
        timeout: 10000
    }
);

        return response.data.result || [];

    } catch (err) {
        console.error(err.response?.data || err.message);
        return [];
    }
}

async function processCoins() {
    console.log("START processCoins");
  console.log(
    "Checking graduations:",
    new Date().toLocaleTimeString()
);

    const coins = await getGraduatedCoins();
    

console.log("END getGraduatedCoins");
    console.log("Coins returned:", coins.length);
    const recentCoins = coins.slice(0, 10);

    for (const coin of recentCoins)  {
      

        const mint = coin.tokenAddress;
        const graduatedTime = new Date(coin.graduatedAt);
        const now = new Date();

        const ageMinutes =
        (now - graduatedTime) / 60000;

        if (ageMinutes > 60) {
            continue;
        }
            
        console.log("Before db.get:", mint);
        const row = await dbGet(
    "SELECT mint FROM coins WHERE mint = ?",
    [mint]
);

if (row) {
    console.log(
        "Already exists:",
        mint
    );
    continue;
}

console.log(
    "Getting metadata:",
    mint
);

const tokenData =
    await getTokenMetadata(mint);

console.log(
    "Metadata received:",
    mint
);
await new Promise((resolve, reject) => {
    db.run(
        `INSERT INTO coins (mint, creator, status)
         VALUES (?, ?, ?)`,
        [
            mint,
            "UNKNOWN",
            "GRADUATED"
        ],
        (err) => {
            if (err) reject(err);
            else resolve();
        }
    );
});

const msg = `
🎓 NEW PUMP.FUN GRADUATION

🪙 Name: ${coin.name}
🏷 Symbol: ${coin.symbol}

📍 Mint:
${coin.tokenAddress}

💰 Market Cap:
$${Number(tokenData?.marketCap || 0).toLocaleString()}

💰 FDV:
$${Number(tokenData?.fullyDilutedValue || 0).toLocaleString()}

💵 Price:
$${Number(coin.priceUsd).toFixed(8)}

💧 Liquidity:
$${Number(coin.liquidity).toFixed(2)}

⏰ Graduated:
${coin.graduatedAt}
`;

console.log("Sending Telegram...");

await sendAlert(msg);

console.log("Telegram sent");

console.log(
    "Alert sent:",
    coin.symbol
);
    }
    console.log("END processCoins");
}

console.log("Monitoring graduations...");

async function loop() {

    console.log("LOOP START");

    try {
        await processCoins();

        console.log("processCoins finished");

    } catch (err) {

        console.error(
            "Loop error:",
            err
        );
    }

    console.log("Scheduling next loop");

    setTimeout(
        loop,
        150000
    );
}

loop();

setInterval(() => {
    console.log(
        "HEARTBEAT",
        new Date().toLocaleTimeString()
    );
}, 60000);