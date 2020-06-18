const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const csurf = require("csurf");

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

const { addUser, signed, signedId } = require("./data");
const { hash, compare } = require("./bc");
//middleware
app.use(
  cookieSession({
    secret: `Ì am always angry.`,
    maxAge: 1000 * 60 * 60 * 24 * 14, //to set the cookies-how long we want cookie to last
  })
);

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(csurf());

app.use((req, res, next) => {
  res.setHeader("x-frame-option", "deny");
  res.locals.csrfToken = req.csrfToken(); //////for csurf
  next();
});

app.use(express.static(__dirname + "/public"));

app.use((req, res, next) => {
  console.log("--------------");
  console.log("GET is rounted  / with this");
  console.log("--------------");
  next();
});

//routes
//route for the front page - GET req
app.get("/", (req, res) => {
  console.log("GET request to the root route");
  res.redirect("/petition");
  //res.end();
});

//route for the petition page - GET req
app.get("/petition", (req, res) => {
  res.render("petition", {
    layout: "main",
  });
  /* const { add, signed } = req.session;

  if (add && signed) {
    res.render("petition", {
      layout: "main",
    });
  } else {
    res.send("<h1>ACCESS DENIED!!!!!!</h1>");
  } */
});

//route for the front page - POST req for the petition page
app.post("/petition", (req, res) => {
  addUser(req.body.firstname, req.body.lastname, req.body.signature)
    .then((results) => {
      console.log("my petition POST results: ", results);

      console.log("req.session: ", req.session);
      req.session.userID = results.rows[0].id;
      req.session.permission = true;
      console.log("req.session after the value set: ", req.session);

      res.redirect("/thankyou");
    })
    .catch((err) => {
      console.log("my post petition error: ", err);
      res.render("petition", {
        error: true,
      });
    });
  //res.end();
});

//route for the thanks page - GET req
app.get("/thankyou", (req, res) => {
  if (req.session.userID) {
    signedId(req.session.userID)
      .then((results) => {
        console.log("this is my thankyou results: ", results);
        let firstName = results.rows[0].first;
        let lastName = results.rows[0].last;
        let signature = results.rows[0].signature;
        res.render("thankyou", {
          firstName,
          lastName,
          signature,
        });
      })
      .catch((err) => {
        console.log("my /thankyou error: ", err);
      });
  } else {
    res.redirect("/petition");
  }
});

//route for the signed page - GET req-to see who has signed the petition
app.get("/signed", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/petition");
  } else {
    let signedArray = [];
    signed()
      .then((results) => {
        for (let i = 0; i < results.rows.length; i++) {
          signedArray.push(`${results.rows[i].first} ${results.rows[i].last}`);
        }
        console.log("this is my signed array: ", signedArray);
        res.render("signed", {
          signedArray,
        });
      })
      .catch((err) => {
        console.log("my /signed error: ", err);
      });
  }
});

app.listen(8080, () => {
  console.log("my express server running!!!!");
});
//-------------------------------------------------------------------------------------------------------------------------------------------------------
///////////////////petition part-3
/* 
app.post("/register", (req, res) => {
  //you will get all sorts of info first last email and desired password in clear text all this infor will be in req.body
  //you will want to call hash, pass it to the user's pw (i.e req.boy.password) and salt&hash it before you store the user's infor in the the database
  //in class we are hardcoding the users pw input and do not do this when you write an actual code

  //if something goes wrong in our insert or user information render resgister with an error message
  //and if everything goes write then redirect them to the petition
  hash("userInput")
    .then((hashedPw) => {
      console.log("hashed unserInput/password: ", hashedPw);

      //this is where we will want to make an insert into our database with all this information
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log("error in Post/register: ", err);
      res.sendStatus(500);
      //you want to render this error message when something went wrong!!
    });
});

app.post("/login", (req, res) => {
  //this is where we want to use compares as we just compre if the password that user has typed is same what we have in our database
  //user info will be in rq.body we will recieve an email and password
  //with the help of the email adress we will identify the hash to check agaist the password provided.
  //in real we will reccive the info from the database
  const hashedUserPw =
    "$2a$10$szKdFm4J1VOLDuMtWjXYaezXbNaq5EkjI0GewKp/S4sMATgPH3M46"; //this is just an example
  //now we will compare it with what user has typed
  compare("userInput", hashedUserPw)
    .then((match) => {
      console.log("match: ", match);
      console.log("password correct?", match);
      //if  the match is true you want to store user is in the cookie
      //if the password dont match render login with the error message
      //of the compare is true
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log("error in post/login compare: ", err);
      //if the login is not correct the send statuscode
      res.sendStatus(500);
    });
}); */
