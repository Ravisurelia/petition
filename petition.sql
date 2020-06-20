DROP TABLE IF EXISTS users CASCADE;


CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  first VARCHAR NOT NULL CHECK (first != ''),
  last VARCHAR NOT NULL CHECK (last != ''),
  email VARCHAR NOT NULL UNIQUE,
  password VARCHAR NOT NULL
);


DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures(
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id),
  signature VARCHAR NOT NULL CHECK (signature != '')
);