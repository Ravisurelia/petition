const express = require("express");
const app = express();
const cookiesession = require("cookie-session");
const csurf = require("csurf");

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

const { add, signed } = require("./data");

//middleware
app.use(
  cookiesession({
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

app.use(express.static(__dirname + "/public"));

app.use((req, res, next) => {
  console.log("--------------");
  console.log("GET is rounted  / with this");
  console.log("--------------");
  next();
});

app.use((req, res, next) => {
  res.setHeader("x-frame-option", "deny");
  res.locals.csrfToken = req.csrfToken(); //////for csurf
  next();
});

//routes
//route for the front page - GET req
app.get("/", (req, res) => {
  console.log("GET request to the root route");
  console.log("req.session: ", req.session);
  req.session.add = "Boom!Boom!";
  req.session.signed = true;
  console.log("req.session after the value set: ", req.session);
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
  add(req.body.firstname, req.body.lastname, req.body.signature)
    .then(() => {
      res.cookie("checked", true);
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
  res.render("thankyou", {
    layout: "main",
  });
});

//route for the signed page - GET req-to see who has signed the petition

app.listen(8080, () => {
  console.log("my express server running!!!!");
});
