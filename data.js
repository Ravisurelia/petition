const spicedPg = require("spiced-pg");

let db;
if (process.env.DATABASE_URL) {
  db = spicedPg(process.env.DATABASE_URL);
} else {
  const { dbUser, dbPass } = require("./secrets.json");
  //console.log(dbUser, dbPass);
  db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/petition`);
}

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
  return db.query("SELECT password, id FROM users WHERE email = $1", [email]);
};

//INSERTING DATA INTO user_profiles----------------------------------------------
exports.userProfileData = (age, city, url, id) => {
  return db.query(
    `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1,$2,$3,$4) RETURNING *`,
    [age, city, url, id]
  );
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

//JOINING for signers information----------------------------------------------
exports.getAllSigners = () => {
  return db.query(
    `SELECT first, last, age, city, url 
    FROM users 
    JOIN signatures 
    ON users.id = signatures.user_id
    LEFT JOIN user_profiles 
    ON users.id = user_profiles.user_id`
  );
};

//GETTING signers by the name of the city----------------------------------------------
exports.allSignersByCity = (city) => {
  return db.query(
    `SELECT first, last, age, url 
    FROM users 
    JOIN signatures 
    ON users.id = signatures.user_id 
    LEFT JOIN user_profiles
    ON users.id = user_profiles.user_id
    WHERE LOWER(city) = LOWER($1)`,
    [city]
  );
};

exports.deleteSignature = (id) => {
  return db.query(`DELETE FROM signatures WHERE user_id = $1`, [id]);
};

exports.editProfile = (id) => {
  return db.query(
    `SELECT users.id, users.first, users.last, users.email, user_profiles.age, user_profiles.city, user_profiles.url
  FROM users
  RIGHT JOIN user_profiles
  ON users.id = user_profiles.user_id
  WHERE users.id = $1`,
    [id]
  );
};

exports.profileWithPassword = (id, firstname, lastname, email, password) => {
  return db.query(
    `
  UPDATE users
  SET first = $2, last = $3, email = $4, password = $5
  WHERE users.id = $1 RETURNING *`,
    [id, firstname, lastname, email, password]
  );
};

exports.profileWithoutPassword = (id, firstname, lastname, email) => {
  return db.query(
    `
  UPDATE users
  SET first = $2, last = $3, email = $4
  WHERE users.id = $1 RETURNING *`,
    [id, firstname, lastname, email]
  );
};

exports.upsertingProfiles = (id, age, city, url) => {
  return db.query(
    `INSERT INTO user_profiles (age , city, url, user_id)
  VALUES ($2, $3, $4, $1)
  ON CONFLICT (user_id)
  DO UPDATE SET user_id = $1, age = $2, city = $3, url = $4 RETURNING * `,
    [id, age, city, url]
  );
};

/* db.query("SELECT * FROM cities")
  .then((results) => {
    console.log(results);
  })
  .catch((e) => console.log(e)); */

//-----------------------------
//part-5

/* INSERT INTO user_profiles (user_id, first)
VALUES (1, "funkyChicken");

UPDATE user_profiles
SET first = "discoDuck"
WHERE user_id = 1;

INSERT INTO user_profiles (user_id , first)
VALUES ($1, $2)
ON CONFLICT (user_id)
DO UPDATE user_profiles
SET first = $2;

DELETE FROM user_profiles WHERE user_id = $1; */
