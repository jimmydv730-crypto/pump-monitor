const express = require("express");
const WebSocket = require("ws");
require("dotenv").config();

const sendAlert = require("./alert");

const app = express();

app.get("/", (req, res) => {
    res.send("PumpAPI Graduation Monitor Running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const seen = new Set();


console.log("Monitoring graduations via PumpAPI...");

const ws = new WebSocket(
    "wss://stream.pumpapi.io/"
);

ws.on("open", () => {

    console.log(
        "Connected to PumpAPI"
    );

});

ws.on("message", async (data) => {

    try {

        const event =
            JSON.parse(data);

        if (
            event.pool !== "pump" ||
            event.tokensInPool !== 0
        ) {
            return;
        }

        if (seen.has(event.mint)) {
            return;
        }

        seen.add(event.mint);

        const msg = `
🎓 NEW PUMP.FUN GRADUATION

🪙 Name:
\`${event.name}\`

🏷 Symbol:
\`${event.symbol}\`

📍 Mint:
\`${event.mint}\`

👤 Creator:
\`${event.creatorFeeAddress || "UNKNOWN"}\`

💰 Market Cap:
${Number(event.marketCapSol).toFixed(2)} SOL

💵 Price:
${Number(event.price).toFixed(12)}

⏰ Graduated:
${new Date(event.timestamp).toISOString()}

🔗 https://pump.fun/coin/${event.mint}
`;

console.log(
    "Graduation detected:",
    event.symbol,
    event.mint
);
        await sendAlert(msg);



        console.log(
            "Graduated:",
            event.symbol
        );

    } catch (err) {

        console.error(
            "PumpAPI error:",
            err
        );

    }

});

ws.on("close", () => {

    console.log(
        "WebSocket closed - restarting"
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

setInterval(() => {
    console.log(
        "HEARTBEAT",
        new Date().toLocaleTimeString()
    );
}, 60000);