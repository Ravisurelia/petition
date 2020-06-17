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
    maxAge: 1000 * 60 * 60 * 24 * 14,
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
  res.setHeader("x-frame-option", "deny");
  res.locals.csrfToken = req.csrfToken(); //////for csurf
  next();
});

//routes

app.get("/", (req, res) => {
  console.log("GET request to the root route");
  console.log("req.session: ", req.session);
  req.session.dill = "Boom!Boom!";
  req.session.permission = true;
  console.log("req.session after the value set: ", req.session);
  res.redirect("/petition");
  //res.end();
});

app.get("/petition", (req, res) => {
  const { dill, permission } = req.session;

  if (dill && permission) {
    res.render("petition");
  } else {
    res.send("<h1>ACCESS DENIED!!!!!!</h1>");
  }

  //res.end();
});

app.listen(8080, () => {
  console.log("my express server running!!!!");
});
