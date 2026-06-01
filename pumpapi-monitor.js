require("dotenv").config({
    path: ".env.launch"
});

const WebSocket = require("ws");
const sendAlert = require("./alert");

const tracked = new Set();
const alerted = new Set();

const TARGET_MC = 56;

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
            event.pool !== "pump"
        ) {
            return;
        }

        if (
            event.action === "create"
        ) {

            tracked.add(
                event.mint
            );

            console.log(
                "TRACKING:",
                event.symbol,
                event.marketCapQuote
            );

            return;
        }

        if (
            event.action !== "buy" &&
            event.action !== "sell"
        ) {
            return;
        }

        if (
            !tracked.has(
                event.mint
            )
        ) {
            return;
        }

        console.log(
            event.action,
            event.symbol,
            event.marketCapQuote
        );

        if (
            event.marketCapQuote >=
                TARGET_MC &&
            !alerted.has(
                event.mint
            )
        ) {

            alerted.add(
                event.mint
            );

            await sendAlert(`
🚀 TOKEN REACHED TARGET MC

🪙 Name:
${event.name}

🏷 Symbol:
${event.symbol}

📈 Market Cap:
${event.marketCapQuote.toFixed(2)} SOL

📍 Mint:
\`${event.mint}\`

👤 Creator:
\`${event.txSigner}\`

🔗 https://pump.fun/coin/${event.mint}
`);

            console.log(
                "ALERT:",
                event.symbol
            );

        }

    } catch (err) {

        console.error(err);

    }

});

ws.on("close", () => {

    console.log(
        "WebSocket closed"
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