const WebSocket = require("ws");

const ws = new WebSocket(
    "wss://stream.pumpapi.io/"
);

ws.on("open", () => {
    console.log("Connected");
});

ws.on("message", (data) => {
    const event = JSON.parse(data);

    if (
        event.pool === "pump" &&
        (event.action === "create" ||
         event.action === "buy" ||
         event.action === "sell")
    ) {
        console.log(
            event.action,
            event.symbol,
            event.marketCapQuote
        );
    }
});