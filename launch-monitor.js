const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Launch monitor running");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Health server started");
});
const trackedTokens = new Map();
const alertedTokens = new Set();
const buyers = new Map();


const seen = new Set();

require("dotenv").config();

const sendAlert = require("./alert");
const WebSocket = require("ws");

const ws = new WebSocket(
    "wss://pumpportal.fun/api/data"
);

const tradeWs = new WebSocket(
     `wss://pumpportal.fun/api/data?api-key=${process.env.PUMPPORTAL_API_KEY}`
);
tradeWs.on("open", () => {
    console.log("Trade websocket connected");
});

ws.on("open", () => {

    console.log(
        "Connected to PumpPortal"
    );
    ws.send(
        JSON.stringify({
            method: "subscribeNewToken"
        })
    );

    console.log("Sent subscribeNewToken");
});

ws.on("message", async (data) => {
     console.log(
        "LAUNCH MSG:",
        data.toString()
    );

    try {

        const token =
            JSON.parse(data);
            console.log(JSON.stringify(token, null, 2));
            

       if (
              !token.mint ||
              !token.name ||
              !token.symbol
          ) {
              return;
          }

        if (seen.has(token.mint)) {
            return;
        }

        seen.add(token.mint);
        trackedTokens.set(token.mint, {
    name: token.name,
    symbol: token.symbol
});
tradeWs.send(
    JSON.stringify({
        method: "subscribeTokenTrade",
        keys: [token.mint]
    })
);
console.log(
    "Subscribed to trades:",
    token.symbol,
    token.mint
);

buyers.set(token.mint, new Set());
console.log(
    "Tracking:",
    token.symbol
);
        trackedTokens.set(token.mint, {
    name: token.name,
    symbol: token.symbol,
    creator: token.traderPublicKey,
    launchMc: token.marketCapSol,
    launchTime: Date.now()
});
setTimeout(() => {

    tradeWs.send(
        JSON.stringify({
            method: "unsubscribeTokenTrade",
            keys: [token.mint]
        })
    );

    trackedTokens.delete(
        token.mint
    );

    buyers.delete(
        token.mint
    );

    console.log(
        "Expired:",
        token.symbol
    );

}, 10 * 60 * 1000);


    } catch (err) {

        console.error(err);

    }
});

ws.on("close", () => {

    console.log(
        "WebSocket closed - reconnecting in 5s"
    );

    setTimeout(() => {
        process.exit(1);
    }, 5000);

});

ws.on("error", (err) => {

    console.error(
        "WebSocket error:",
        err.message
    );
    

});
ws.on("close", (code, reason) => {
    console.log(
        "LAUNCH WS CLOSED:",
        code,
        reason.toString()
    );
});
tradeWs.on("message", async (data) => {

    try {

        const trade =
            JSON.parse(data);
        if (!trade.mint) {
            return;
        }
        if (trade.txType === "buy") {

    buyers
        .get(trade.mint)
        ?.add(trade.traderPublicKey);

}
        console.log(
    "MC SOL:",
    trade.marketCapSol.toFixed(2),
    trade.mint
);
console.log(
    "CHECKING:",
    trade.marketCapSol,
    alertedTokens.has(trade.mint)
);
const buyerCount =
    buyers.get(trade.mint)?.size || 0;

console.log(
    "BUYERS:",
    buyerCount
);
       if (
    trade.marketCapSol >= 60 &&
    buyerCount >= 20 &&
    !alertedTokens.has(trade.mint)
) {
     console.log("INSIDE ALERT BLOCK");

    alertedTokens.add(
        trade.mint
    );
    const info =
    trackedTokens.get(trade.mint);

   await sendAlert(`
🚀 TOKEN REACHED TARGET

🪙 Name:
${info?.name || "Unknown"}

🏷 Symbol:
${info?.symbol || "Unknown"}

👤 Creator:
\`${info?.creator || "Unknown"}\`

📍 Mint:
\`${trade.mint}\`

📈 Launch MC:
${info?.launchMc?.toFixed(2) || "0"} SOL

🚀 Current MC:
${trade.marketCapSol.toFixed(2)} SOL

🔗 https://pump.fun/coin/${trade.mint}
`);
    tradeWs.send(
        JSON.stringify({
            method: "unsubscribeTokenTrade",
            keys: [trade.mint]
        })
    );

    console.log(
        "Stopped tracking:",
        trade.mint
    );

    console.log(
        "10K ALERT:",
        trade.mint
    );
}

    } catch (err) {

        console.error(err);

    }

});