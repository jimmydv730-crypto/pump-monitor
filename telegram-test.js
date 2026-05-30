require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(
  process.env.BOT_TOKEN,
  { polling: false }
);

async function test() {
  try {
    await bot.sendMessage(
      process.env.CHAT_ID,
      "🚀 Pump Monitor Connected!"
    );

    console.log("Telegram message sent!");
  } catch (err) {
    console.error(err);
  }
}

test();