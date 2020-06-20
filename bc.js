const bcrypt = require("bcryptjs");
let { genSalt, hash, compare } = bcrypt;
const { promisify } = require("util");

genSalt = promisify(genSalt);
hash = promisify(hash);
compare = promisify(compare);

exports.hash = (password) => genSalt().then((salt) => hash(password, salt));

exports.compare = compare;

////////DEMO OF BCRYPT FUNCTIONS////////////////
//this is the same stuff we did in line 9 and 10;

/* genSalt() //doesnt take any argmts
  .then((salt) => {
    console.log("this is my bcrypt salt: ", salt);
    //hash takes two arguments 1. clear text password, 2. a salt
    return hash("safePassword: ", salt);
  })
  .then((hashedPw) => {
    console.log("hashedPw: ", hashedPw);
    //compare takes 2 arguments 1. clear text password, 2. hash to comare it.
    return compare("safePassword: ", hashedPw);
  })
  .then((matchedValueToCompare) => {
    //compare returns to us whether or not the text pw and hash are indeed a match
    //meaning that the clear text generate the same hashed pw.
    console.log("compared value: ", matchedValueToCompare);
    console.log("is a password match?", matchedValueToCompare);
  }); */
