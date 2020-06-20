const spicedPg = require("spiced-pg");

const { dbUser, dbPass } = require("./secrets.json");
//console.log(dbUser, dbPass);
const db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/petition`);

//user-table----------------------------------------------
exports.addUser = (firstname, lastname, email, password) => {
  //inserting user data first, last, email, password
  return db.query(
    `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id`,
    [firstname, lastname, email, password]
  );
};

//user-table----------------------------------------------
exports.gettingPassword = (email) => {
  //password and id to email
  return db.query("SELECT password FROM users WHERE email = $1", [email]);
};

//signature-table----------------------------------------------
exports.signedUserId = (userId) => {
  //selecting userid
  return db.query(`SELECT signature FROM signatures WHERE user_id = $1`, [
    userId,
  ]);
};

//signature-table----------------------------------------------
exports.signed = (signature, userId) => {
  //inserting signature here
  return db.query(
    `INSERT INTO signatures (signature, user_id) VALUES($1, $2) RETURNING id`,
    [signature, userId]
  );
};

//signature-table----------------------------------------------
exports.signedId = (id) => {
  //selecting id here
  return db.query(
    //add first and last if you want to show first and last name with the signature
    `SELECT signature FROM signatures WHERE id = $1`,
    [id]
  );
};

/* db.query("SELECT * FROM cities")
  .then((results) => {
    console.log(results);
  })
  .catch((e) => console.log(e)); */
