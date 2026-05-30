const saveCoin = require("./saveCoin");
const sendAlert = require("./alert");

const mint = "TEST_MINT_" + Date.now();
const creator = "TEST_CREATOR";

saveCoin(mint, creator);

sendAlert(`
🚀 NEW COIN

Mint: ${mint}

Creator: ${creator}

Status: NEW
`);