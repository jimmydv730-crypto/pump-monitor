require("dotenv").config();

const axios = require("axios");

const API_KEY = process.env.MORALIS_API_KEY;

const MINT =
"9bCAxofkmMmnrfT3xRqofncdV63fmPBmUa9tSHmVpump";

async function test() {

    try {

        const response = await axios.get(
            `https://solana-gateway.moralis.io/token/mainnet/${MINT}/holders`,
            {
                headers: {
                    "X-API-Key": API_KEY
                }
            }
        );

        console.log(
            JSON.stringify(
                response.data,
                null,
                2
            )
        );

    } catch (err) {

        console.error(
            err.response?.data ||
            err.message
        );

    }

}

test();