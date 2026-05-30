const db = require("./db");

function saveCoin(mint, creator) {
    db.run(
        `INSERT OR IGNORE INTO coins (mint, creator)
         VALUES (?, ?)`,
        [mint, creator],
        function(err) {
            if (err) {
                console.error(err);
                return;
            }

            if (this.changes > 0) {
                console.log("New coin saved:", mint);
            }
        }
    );
}

module.exports = saveCoin;