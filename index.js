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
  deleteSignature,
  editProfile,
  profileWithPassword,
  profileWithoutPassword,
  upsertingProfiles,
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
//route for the front page - GET req-----------------1
app.get("/", (req, res) => {
  console.log("GET request to the root route");
  res.redirect("/register");
});

//route for the register page - GET req---------------------2
app.get("/register", (req, res) => {
  res.render("register", {
    layout: "main",
  });
});

//route for the front page - POST req for the register page-----------3
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

//route for the login page - GET req-----------------------4
app.get("/login", (req, res) => {
  res.render("login", {
    layout: "main",
  });
});

//route for the login page - POST req------------------------------5
app.post("/login", (req, res) => {
  console.log("this is my req.body in post login: ", req.body);
  console.log("this is my req.session in post login: ", req.session.userId);
  //here we are getting the password from the register page and matching it here to see if it is the same
  gettingPassword(req.body.email)
    .then((results) => {
      console.log("my login results: ", results);
      console.log("req.body.email in login : ", req.body.email);
      console.log("this is my 0 pass: ", results.rows[0].password);
      console.log("req.body.password in login: ", req.body.password);
      compare(req.body.password, results.rows[0].password)
        .then((match) => {
          if (match) {
            req.session.userId = results.rows[0].id;
            signedUserId(req.session.userId)
              .then((results) => {
                console.log("my login results 2: ", results);
                if (!results.rows[0]) {
                  res.redirect("/petition");
                } else {
                  res.redirect("/thankyou");
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

//route for the profile page - GET req------------------------------6
app.get("/profiles", (req, res) => {
  res.render("profiles", {
    layout: "main",
  });
});

//route for the profile page - POST req------------------------------7
app.post("/profiles", (req, res) => {
  console.log("getting req.body in profiles: ", req.body);
  console.log("req.body.url before: ", req.body.url);

  /*  if (
    !req.body.url.startsWith("https://") &&
    !req.body.url.startsWith("http://")
  ) {
    req.body.url = `https://${req.body.url}`;
  } */

  console.log("req.body.url after: ", req.body.url);

  userProfileData(req.body.age, req.body.city, req.body.url, req.session.userId)
    .then((results) => {
      console.log("This is my post profiles results: ", results);
      res.redirect("petition");
    })
    .catch((err) => {
      console.log("This is my post catch err: ", err);
      res.render("profile", {
        error: true,
      });
    });
});

//route for the petition page - GET req------------------------------8
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

//route for the petition page - POST req------------------------------9
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

//route for the thanks page - GET req------------------------------10
app.get("/thankyou", (req, res) => {
  console.log("this is my user id in thankyou: ", req.session.userId);
  if (req.session.userId) {
    signedUserId(req.session.userId)
      .then((results) => {
        console.log("this is my thankyou results: ", results);
        let signature = results.rows[0].signature;
        res.render("thankyou", {
          signature,
        });
      })
      .catch((err) => {
        console.log("my /thankyou error: ", err);
      });
  } else {
    res.redirect("/register");
  }
});

//route for the thankyou page - post req-to delete the sign----------------------11
app.post("/thankyou", (req, res) => {
  deleteSignature(req.session.userId).then((results) => {
    res.redirect("/petition");
  });
});

//route for the /profile/edit - GET req------------------------------12
app.get("/profile/edit", (req, res) => {
  if (req.session.userId) {
    editProfile(req.session.userId)
      .then((results) => {
        console.log("my /profile/edit results: ", results);

        let people = results.rows;
        res.render("editprofile", {
          layout: "main",
          people,
        });
      })
      .catch((err) => {
        console.log("my /profile/edit error: ", err);
      });
  } else {
    console.log("this is my log in get /profile/edit");
  }
});

//route for the /profile/edit - post req------------------------------13
app.post("/profile/edit", (req, res) => {
  if (req.session.userId) {
    if (req.body.password == "") {
      profileWithoutPassword(
        req.session.userId,
        req.body.firstname,
        req.body.lastname,
        req.body.email
      )
        .then((results) => {
          /* if (
            !req.body.url.startsWith("https://") &&
            !req.body.url.startsWith("http://")
          ) {
            req.body.url = `https://${req.body.url}`;
          } */

          upsertingProfiles(
            req.session.userId,
            req.body.age,
            req.body.city,
            req.body.url
          )
            .then((results) => {
              console.log(
                "upsertingprofiles profilewithoutpassword results--1: ",
                results
              );
              res.redirect("/thankyou");
            })
            .catch((err) => {
              console.log(
                "my post upsertingprofiles /profile/edit error 1: ",
                err
              );
            });
        })
        .catch((err) => {
          console.log("my post upsertingprofiles /profile/edit error 2: ", err);
        });
    } else {
      hash(req.body.password).then((hashedpassword) => {
        profileWithPassword(
          req.session.userId,
          req.body.firstname,
          req.body.lastname,
          req.body.email,
          hashedpassword
        )
          .then((results) => {
            if (
              !req.body.url.startsWith("https://") &&
              !req.body.url.startsWith("http://")
            ) {
              req.body.url = `https://${req.body.url}`;
            }

            upsertingProfiles(
              req.session.userId,
              req.body.age,
              req.body.city,
              req.body.url
            )
              .then((results) => {
                console.log(
                  "upsertingprofiles profilewithoutpassword results--2: ",
                  results
                );
                res.redirect("/thankyou");
              })
              .catch((err) => {
                console.log(
                  "my post upsertingprofiles /profile/edit error 3: ",
                  err
                );
              });
          })
          .catch((err) => {
            console.log(
              "my post upsertingprofiles /profile/edit error 4: ",
              err
            );
          });
      });
    }
  } else {
    res.render("editprofile");
  }
});

//route for the signed page - GET req-to see who has signed the petition----------------------14
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

//route for the signersbycity page - GET req-to see who has signed the petition has the same city----------------------15
app.get("/signed/:city", (req, res) => {
  console.log("This is my req.params: ", req.params);

  allSignersByCity(req.params.city)
    .then((results) => {
      console.log("This is my all signers check: ", results.rows);
      console.log("This is my all signers check results: ", results);

      let people = results.rows;
      let peopleWithSameCity = req.params.city;

      res.render("signerswithcity", {
        layout: "main",
        people,
        peopleWithSameCity,
      });
    })
    .catch((err) => {
      console.log("my /signed error in getting all signers with city : ", err);
    });
});

//route for the logout page---------------------------------------------------------16
app.get("/logout", (req, res) => {
  req.session.userId = null;
  res.redirect("/register");
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
