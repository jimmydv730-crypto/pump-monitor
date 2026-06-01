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
        timeout: 30000
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
        timeout: 30000
    }
);

        return response.data.result || [];

    } catch (err) {
        console.error(err.response?.data || err.message);
        return [];
    }
}

async function processCoins() {
  console.log(
    "Checking graduations:",
    new Date().toLocaleTimeString()
);

    const coins = await getGraduatedCoins();
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
        const row = await dbGet(
    "SELECT mint FROM coins WHERE mint = ?",
    [mint]
);

if (row) {
    continue;
}
const tokenData =
    await getTokenMetadata(mint);
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

🪙 Name:
\`${coin.name}\`

🏷 Symbol:
\`${coin.symbol}\`

📍 Mint:
\`${coin.tokenAddress}\`

👤 Creator:
\`UNKNOWN\`

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

🔗 https://pump.fun/coin/${coin.tokenAddress}
`;
await sendAlert(msg);
console.log(
    "Alert sent:",
    coin.symbol
);
    }
}

console.log("Monitoring graduations...");

let isRunning = false;

async function runMonitor() {

    if (isRunning) {
        console.log(
            "Previous run still active"
        );
        return;
    }

    isRunning = true;

    try {
        await processCoins();

    } catch (err) {

        console.error(
            "Monitor error:",
            err
        );

    } finally {

        isRunning = false;

    }
}

runMonitor();

setInterval(
    runMonitor,
    150000
);
setInterval(() => {
    console.log(
        "HEARTBEAT",
        new Date().toLocaleTimeString()
    );
}, 60000);