const WebSocket = require("ws");

const ws = new WebSocket(
    "wss://pumpportal.fun/api/data?api-key="
);

ws.on("open", () => {

    console.log("Connected");

    ws.send(
        JSON.stringify({
            method: "subscribeTokenTrade",
             keys: [
            "35yWb8uY6jQMn4iUUjBeAoPNy8g5C7af4k33pZfnpump"
        ]
        })
    );

});

ws.on("message", (data) => {

    console.log(
        data.toString()
    );

});

ws.on("error", (err) => {

    console.log(
        "ERROR:",
        err.message
    );

});

ws.on("close", () => {

    console.log(
        "CLOSED"
    );

});