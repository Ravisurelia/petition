const spicedPg = require("spiced-pg");

const { dbUser, dbPass } = require("./secrets.json");
//console.log(dbUser, dbPass);
const db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/petition`);

exports.add = (firstname, lastname, signature) => {
  return db.query(
    `INSERT INTO petition (firstname, lastname, signature) VALUES ($1, $2, $3)`,
    [firstname, lastname, signature]
  );
};

exports.signed = () => {
  return db.query("SELECT firstname, lastname FROM petition");
};

exports.signedId = () => {
  return db.query(`SELECT signature FROM signed WHERE id = $1`, [id]);
};

/* db.query("SELECT * FROM cities")
  .then((results) => {
    console.log(results);
  })
  .catch((e) => console.log(e)); */
