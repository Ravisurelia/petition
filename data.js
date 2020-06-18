const spicedPg = require("spiced-pg");

const { dbUser, dbPass } = require("./secrets.json");
//console.log(dbUser, dbPass);
const db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/petition`);

exports.addUser = (firstname, lastname, signature) => {
  return db.query(
    `INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) returning id`,
    [firstname, lastname, signature]
  );
};

exports.signed = () => {
  return db.query("SELECT first, last FROM signatures");
};

exports.signedId = (id) => {
  return db.query(
    `SELECT first, last, signature FROM signatures WHERE id = $1`,
    [id]
  );
};

/* db.query("SELECT * FROM cities")
  .then((results) => {
    console.log(results);
  })
  .catch((e) => console.log(e)); */
