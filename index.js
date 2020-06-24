const express = require("express");
const app = (exports.app = express());
const cookieSession = require("cookie-session");
const csurf = require("csurf");

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

const {
  addUser,
  gettingPassword,
  userProfileData,
  signedUserId,
  signed,
  signedId,
  getAllSigners,
  allSignersByCity,
} = require("./data");
const { hash, compare } = require("./bc.js");

//middleware--------------------------------------------------------------------
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
  console.log("GET is routed  / with this");
  console.log("--------------");
  next();
});

//routes----------------------------------------------------------------------------
//route for the front page - GET req-----------------
app.get("/", (req, res) => {
  console.log("GET request to the root route");
  res.redirect("/register");
});

//route for the register page - GET req---------------------
app.get("/register", (req, res) => {
  if (req.session.userId) {
    res.redirect("petition");
  } else {
    res.render("register", {
      layout: "main",
    });
  }
});

//route for the front page - POST req for the register page-----------
app.post("/register", (req, res) => {
  console.log("this is my req.body: ", req.body);
  console.log("this is my req.body.password: ", req.body.password);
  //here we are getting the details of the users and once they are registered, it will lead them to login page
  hash(req.body.password)
    .then((hashedpassword) => {
      console.log("my hashedpassword: ", hashedpassword);
      addUser(
        req.body.firstname,
        req.body.lastname,
        req.body.email,
        hashedpassword
      )
        .then((results) => {
          console.log("my register POST results: ", results);
          console.log("req.session: ", req.session);
          req.session.userId = results.rows[0].id;
          req.session.permission = true;
          console.log("req.session after the value set: ", req.session);
          res.redirect("profiles");
        })
        .catch((err) => {
          console.log("my post register error: ", err);
          res.render("register", {
            error: true,
          });
        });
    })
    .catch((err) => {
      console.log("my post register error 2: ", err);
      res.sendStatus(500);
    });

  //res.end();
});

//route for the login page - GET req-----------------------
app.get("/login", (req, res) => {
  if (req.session.userId) {
    res.redirect("petition");
  } else {
    res.render("login", {
      layout: "main",
    });
  }
});

//route for the login page - POST req------------------------------
app.post("/login", (req, res) => {
  console.log("this is my req.body in post login: ", req.body);

  //here we are getting the password from the register page and matching it here to see if it is the same
  gettingPassword(req.body.email)
    .then((results) => {
      console.log("my login results: ", results);
      console.log("req.body.email in login : ", req.body.email);
      console.log("req.body.password in login: ", req.body.password);
      compare(req.body.email, results.rows[0].password)
        .then((match) => {
          if (match) {
            req.session.userId = results.rows[0].id;
            signedUserId(req.session.userId)
              .then((results) => {
                console.log("my login results 2: ", results);
                if (results.rowCount == 0) {
                  res.redirect("petition");
                } else {
                  res.redirect("thankyou");
                }
              })
              .catch((err) => {
                console.log("my post register signedUserId error: ", err);
                res.redirect("/petition");
              });
          } else {
            console.log("it is not equal: ", equal);
            res.render("login", {
              error: true,
            });
          }
        })
        .catch((err) => {
          console.log("my post login error: ", err);
          res.render("login", {
            error: true,
          });
        });
    })
    .catch((err) => {
      console.log("my post login error 2: ", err);
      res.render("login", {
        error: true,
      });
    });

  //res.end();
});

//route for the profile page - GET req------------------------------
app.get("/profiles", (req, res) => {
  res.render("profiles", {
    layout: "main",
  });
});

//route for the profile page - POST req------------------------------
app.post("/profiles", (req, res) => {
  if (req.session.userId) {
    userProfileData(
      req.body.age,
      req.body.city,
      req.body.url,
      req.session.userId
    )
      .then((results) => {
        console.log("This is my post profiles results: ", results);
        res.redirect("petition");
      })
      .catch((err) => {
        console.log("This is my post catch err: ", err);
      });
  }
});

//route for the petition page - GET req------------------------------
app.get("/petition", (req, res) => {
  //here we are taking the user to sign the petition with the their signature after password and ids are matched
  if (req.session.userId) {
    signedUserId(req.session.userId)
      .then((results) => {
        if (results.rowCount == 0) {
          res.render("petition", {
            layout: "main",
          });
        } else {
          res.redirect("thankyou");
        }
      })
      .catch((err) => {
        console.log("my get signedUserId petition error: ", err);
      });
  } else {
    res.redirect("register");
  }
});

//route for the petition page - POST req------------------------------
app.post("/petition", (req, res) => {
  console.log("this is my signature thing: ", req.body);

  signed(req.body.signature, req.session.userId)
    .then((results) => {
      console.log("this is my post petition results: ", results);
      console.log((" results.rows[0].id: ", results.rows[0].id));
      results.rows[0].id = req.session.signatureId;
      console.log("req.session.signatureId: ", req.session.signatureId);
      res.redirect("thankyou");
    })
    .catch((err) => {
      console.log("my get post petition catch error: ", err);
      res.render("petition", {
        error: true,
      });
    });
});

//route for the thanks page - GET req------------------------------
app.get("/thankyou", (req, res) => {
  if (req.session.userId) {
    signedUserId(req.session.userId)
      .then((results) => {
        console.log("this is my thankyou results: ", results);
        /*  let firstName = results.rows[0].first;
        let lastName = results.rows[0].last; */
        let signature = results.rows[0].signature;
        res.render("thankyou", {
          signature,
        });
      })
      .catch((err) => {
        console.log("my /thankyou error: ", err);
      });
  } else {
    res.redirect("register");
  }
});

//route for the signed page - GET req-to see who has signed the petition----------------------
app.get("/signed", (req, res) => {
  if (req.session.userId) {
    signedUserId(req.session.userId).then((results) => {
      if (results.rowCount == 0) {
        res.redirect("/petition");
      } else {
        getAllSigners()
          .then((results) => {
            console.log("This is my all signers check: ", results.rows);
            let people = results.rows;
            res.render("signed", {
              people,
            });
          })
          .catch((err) => {
            console.log("my /signed error in getting all signers: ", err);
          });
      }
    });
    /*  res.redirect("/register");
  } else {
    let signedArray = [];
    signedId(req.session.userId)
      .then((results) => {
        for (let i = 0; i < results.rows.length; i++) {
          signedArray.push(
            `${results.rows[i].firstname} ${results.rows[i].lastname}`
          );
        }
        console.log("this is my signed array: ", signedArray);
        res.render("signed", {
          signedArray,
        });

      })
      .catch((err) => {
        console.log("my /signed error: ", err);
      }); */
  } else {
    res.redirect("/petition");
  }
});

//route for the signersbycity page - GET req-to see who has signed the petition has the same city----------------------
app.get("/signed/:city", (req, res) => {
  console.log("This is my req.params: ", req.params);

  allSignersByCity(req.params.city)
    .then((results) => {
      console.log("This is my all signers check: ", results.rows);
      console.log("This is my all signers check results: ", results);

      let people = results.rows;
      let peopleWithSameCity = req.params.city;

      res.render("signerswithcity", {
        people,
        peopleWithSameCity,
      });
    })
    .catch((err) => {
      console.log("my /signed error in getting all signers with city : ", err);
    });
});

if (require.main == module) {
  app.listen(process.env.PORT || 8080, () => {
    console.log("my express server running!!!!");
  });
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------
///////////////////petition part-3 reference learned in the class
/* 
app.post("/register", (req, res) => {
  //you will get all sorts of info first last email and desired password in clear text all this info will be in req.body
  //you will want to call hash, pass it to the user's pw (i.e req.boy.password) and salt&hash it before you store the user's infor in the the database
  //in class we are hard coding the users pw input and do not do this when you write an actual code

  //if something goes wrong in our insert or user information render register with an error message
  //and if everything goes write then redirect them to the petition
  hash("userInput")
    .then((hashedPw) => {
      console.log("hashed userInput/password: ", hashedPw);

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
  //this is where we want to use compares as we just compare if the password that user has typed is same what we have in our database
  //user info will be in rq.body we will receive an email and password
  //with the help of the email address we will identify the hash to check against the password provided.
  //in real we will receive the info from the database
  const hashedUserPw =
    "$2a$10$szKdFm4J1VOLDuMtWjXYaezXbNaq5EkjI0GewKp/S4sMATgPH3M46"; //this is just an example
  //now we will compare it with what user has typed
  compare("userInput", hashedUserPw)
    .then((match) => {
      console.log("match: ", match);
      console.log("password correct?", match);
      //if  the match is true you want to store user is in the cookie
      //if the password don't match render login with the error message
      //of the compare is true
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log("error in post/login compare: ", err);
      //if the login is not correct the send statuscode
      res.sendStatus(500);
    });
}); */
