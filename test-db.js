const db = require("./db");

db.run(
  `INSERT OR IGNORE INTO coins (mint, creator)
   VALUES (?, ?)`,
  [
    "TEST_MINT",
    "TEST_CREATOR"
  ],
  function(err) {
    if (err) {
      console.error(err);
      return;
    }

    console.log("Inserted!");
  }
);

db.all("SELECT * FROM coins", [], (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }

  console.table(rows);
});